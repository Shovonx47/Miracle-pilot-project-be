import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { TAttendance } from './attendance.interface';
import mongoose from 'mongoose';
import { Student } from '../Student/student.model';
import { Teacher } from '../Teacher/teacher.model';
import { Staff } from '../Staff/staff.model';
import { AccountOfficer } from '../Account_officer/account_officer.model';
import { Attendance } from './attendance.model';
import { getCreatedIdForUser } from './attendance.utils';
import config from '../../config';
import moment from 'moment';

const createAttendanceIntoDB = async (payload: TAttendance[]) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let newDataFound = false;  // Flag to check if there is any new data

  try {
    for (const data of payload) {
      const { user, in_time, date } = data;

      // Skip if present and absent are both true or both false
      if (data.present === data.absent) {
        continue;
      }
     // Convert "18-03-2025" to a valid date format and extract day name
     const parsedDate = moment(date, "DD-MM-YYYY").toDate();
     const dayName = moment(parsedDate).format("dddd"); // Get full day name

      // Define office start times (Assume 24-hour format: HH:mm)
      const officeStartTimes: Record<string, string | undefined> = {
        student: config.student_class_time,
        teacher: config.teacher_office_time,
        staff: config.staff_office_time,
        accountant: config.accountant_office_time,
      };

      const officeStartTime = officeStartTimes[user.role];
      if (!officeStartTime) {
        throw new Error(`Invalid user role: ${user.role}`);
      }

      const attendanceTime = new Date(`1970-01-01T${in_time}:00`);
      const requiredTime = new Date(`1970-01-01T${officeStartTime}:00`);
      const lateStatus = attendanceTime > requiredTime;

      // Determine the correct model based on user.role
      let existingUser;
      switch (user.role) {
        case 'student':
          existingUser = await Student.findById(user.id).session(session);
          break;
        case 'teacher':
          existingUser = await Teacher.findById(user.id).session(session);
          break;
        case 'staff':
          existingUser = await Staff.findById(user.id).session(session);
          break;
        case 'accountant':
          existingUser = await AccountOfficer.findById(user.id).session(session);
          break;
        default:
          throw new Error(`Invalid user role: ${user.role}`);
      }

      if (!existingUser) {
        throw new Error(`User with role ${user.role} and ID ${user.id} not found.`);
      }

      // Check if attendance for the day already exists in the database
      const existingAttendance = await Attendance.findOne({
        'user.id': user.id,
        'user.providedId': user.providedId,
        date: data.date,
      }).session(session);

      if (!existingAttendance) {
        // At least one new record is found, set the flag to true
        newDataFound = true;

        // Create new attendance entry
        const attendance = new Attendance({
          ...data,
          day: dayName, // Assign the dynamically extracted day name
          late_status: lateStatus,
          user: {
            id: existingUser._id,
            role: user.role,
            providedId: getCreatedIdForUser(existingUser, user.role),
          },
        });

        // Save the new attendance record
        await attendance.save({ session });

        // Update the corresponding user model with the new attendance entry
        await existingUser.updateOne(
          { $push: { attendance: attendance._id } },
          { new: true, runValidators: true, session }
        );
      }
    }

    if (!newDataFound) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'All provided attendance records already exist.');
    }

    // Commit the transaction
    await session.commitTransaction();
    return 'Attendance records processed successfully.';
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getTodayAttendanceFromDB = async (
  role: string,
  page?: number,
  limit?: number,
  searchTerm?: string, // Search term (could be name, providedId, studentId, etc.)
  searchDate?: string,
): Promise<{ date: string; attendanceSummary: Record<string, any> }> => {
  // Step 1: Validate if the role is provided
  if (!role) {
    throw new Error('Role is required to fetch attendance data.');
  }

  // Step 2: Validate if the role is valid
  const validRoles = ['student', 'teacher', 'staff', 'accountant'];
  if (!validRoles.includes(role)) {
    throw new Error(
      `Invalid role: ${role}. Valid roles are ${validRoles.join(', ')}`,
    );
  }

  const parsedDate = searchDate
    ? new Date(searchDate.split('-').reverse().join('-'))
    : new Date();
  const day = parsedDate.getDate().toString().padStart(2, '0');
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
  const year = parsedDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  // Step 3: Build the search query
  let searchQuery: any = {
    date: formattedDate,
    'user.role': role, // Filter by the role passed from the frontend
  };

  if (searchTerm) {
    // Create an $or query to search by either 'providedId' or 'full_name'
    searchQuery['$or'] = [
      { 'user.providedId': { $regex: searchTerm, $options: 'i' } }, // Search by providedId
      { full_name: { $regex: searchTerm, $options: 'i' } }, // Search by full_name
    ];
  }

  // Step 4: Fetch today's attendance filtered by the specified role and search query
  const todayAttendance = await Attendance.find(searchQuery);

  // Step 5: Handle case where no data is found for the specified role
  if (!todayAttendance.length) {
    throw new Error(
      `No attendance data found for the role: ${role} on ${formattedDate}`,
    );
  }

  const calculatePercentage = (
    entries: number,
    total: number,
  ): number | string => {
    if (total === 0) return 0;
    const percentage = ((entries / total) * 100).toFixed(2);
    return percentage.endsWith('.00') ? parseInt(percentage) : percentage;
  };

  // Step 6: Group attendance by role (this is already filtered by role)
  const attendanceByRole = todayAttendance.reduce(
    (acc, attendance) => {
      const { role } = attendance.user || {}; // Ensure role exists in the user object

      // Skip attendance entry if role is undefined
      if (!role) return acc;

      const { present, absent, late_status } = attendance;

      // Initialize the role in accumulator if it doesn't exist
      if (!acc[role]) {
        acc[role] = { present: 0, absent: 0, late: 0, total: 0, details: [] };
      }

      // Update attendance counts based on status
      acc[role].total += 1;
      if (present) acc[role].present += 1;
      if (absent) acc[role].absent += 1;
      if (late_status) acc[role].late += 1;

      // Push the attendance entry to the role's details array
      acc[role].details.push(attendance);

      return acc;
    },
    {} as Record<string, any>,
  );

  // Step 7: Build the attendance summary for the requested role
  const attendanceSummary: Record<string, any> = Object.keys(
    attendanceByRole,
  ).reduce(
    (acc, role) => {
      const { present, absent, late, total, details } = attendanceByRole[role];

      let paginatedDetails = details;
      let totalPages;

      // Apply pagination only if page and limit are provided
      if (page !== undefined && limit !== undefined) {
        totalPages = Math.ceil(details.length / limit);
        const startIndex = (Math.max(page, 1) - 1) * Math.max(limit, 1);
        paginatedDetails = details.slice(startIndex, startIndex + limit);
      }

      acc[role] = {
        presentPercentage: calculatePercentage(present, total),
        presentEntries: present,
        absentPercentage: calculatePercentage(absent, total),
        absentEntries: absent,
        latePercentage: calculatePercentage(late, total),
        lateEntries: late,
        totalEntries: total,
        totalPages,
        currentPage: page,
        detailsPerPage: limit,
        details: paginatedDetails,
      };

      return acc;
    },
    {} as Record<string, any>,
  );

  return {
    date: formattedDate,
    attendanceSummary,
  };
};

const getAllAttendanceByCurrentMonth = async (
  role: string,
  page?: number,
  limit?: number,
  searchTerm?: string, // Search term (could be name, providedId, studentId, etc.)
  month?: number, // Month (1-12)
  year?: number, // Year (e.g., 2025)
): Promise<{ date: string; attendanceSummary: Record<string, any> }> => {
  // Step 1: Validate if the role is provided
  if (!role) {
    throw new Error('Role is required to fetch attendance data.');
  }

  // Step 2: Validate if the role is valid
  const validRoles = ['student', 'teacher', 'staff', 'accountant'];
  if (!validRoles.includes(role)) {
    throw new Error(
      `Invalid role: ${role}. Valid roles are ${validRoles.join(', ')}`,
    );
  }

  // Step 3: If no month and year are provided, use the current date
  const now = new Date();
  const currentMonth = month || now.getMonth() + 1; // Default to current month if not provided
  const currentYear = year || now.getFullYear(); // Default to current year if not provided

  // Format month and year to match the date format in the database
  const formattedMonth = currentMonth.toString().padStart(2, '0');
  const formattedYear = currentYear.toString();

  // Create a date pattern to match the provided month and year
  const datePattern = new RegExp(`^\\d{2}-${formattedMonth}-${formattedYear}$`);

  // Step 4: Build the search query
  let searchQuery: any = {
    date: datePattern,
    'user.role': role, // Filter by the role passed from the frontend
  };

  if (searchTerm) {
    // Create an $or query to search by either 'providedId' or 'full_name'
    searchQuery['$or'] = [
      { 'user.providedId': { $regex: searchTerm, $options: 'i' } }, // Search by providedId
      { full_name: { $regex: searchTerm, $options: 'i' } }, // Search by full_name
    ];
  }

  // Step 5: Fetch attendance for the provided month and year
  const todayAttendance = await Attendance.find(searchQuery);

  // Step 6: Handle case where no data is found for the specified role
  if (!todayAttendance.length) {
    throw new Error(
      `No attendance data found for the role: ${role} on ${formattedMonth}-${formattedYear}`,
    );
  }

  // Helper function to calculate percentage
  const calculatePercentage = (
    entries: number,
    total: number,
  ): number | string => {
    if (total === 0) return 0;
    const percentage = ((entries / total) * 100).toFixed(2);
    return percentage.endsWith('.00') ? parseInt(percentage) : percentage;
  };

  // Step 7: Group attendance by role
  const attendanceByRole = todayAttendance.reduce(
    (acc, attendance) => {
      const { role } = attendance.user || {}; // Ensure role exists in the user object

      // Skip attendance entry if role is undefined
      if (!role) return acc;

      const { present, absent, late_status } = attendance;

      // Initialize the role in accumulator if it doesn't exist
      if (!acc[role]) {
        acc[role] = { present: 0, absent: 0, late: 0, total: 0, details: [] };
      }

      // Update attendance counts based on status
      acc[role].total += 1;
      if (present) acc[role].present += 1;
      if (absent) acc[role].absent += 1;
      if (late_status) acc[role].late += 1;

      // Push the attendance entry to the role's details array
      acc[role].details.push(attendance);

      return acc;
    },
    {} as Record<string, any>,
  );

  // Step 8: Build the attendance summary for the requested role
  const attendanceSummary: Record<string, any> = Object.keys(
    attendanceByRole,
  ).reduce(
    (acc, role) => {
      const { present, absent, late, total, details } = attendanceByRole[role];

      let paginatedDetails = details;
      let totalPages;

      // Apply pagination only if page and limit are provided
      if (page !== undefined && limit !== undefined) {
        totalPages = Math.ceil(details.length / limit);
        const startIndex = (Math.max(page, 1) - 1) * Math.max(limit, 1);
        paginatedDetails = details.slice(startIndex, startIndex + limit);
      }

      acc[role] = {
        presentPercentage: calculatePercentage(present, total),
        presentEntries: present,
        absentPercentage: calculatePercentage(absent, total),
        absentEntries: absent,
        latePercentage: calculatePercentage(late, total),
        lateEntries: late,
        totalEntries: total,
        totalPages,
        currentPage: page,
        detailsPerPage: limit,
        details: paginatedDetails,
      };

      return acc;
    },
    {} as Record<string, any>,
  );

  return {
    date: `${formattedYear}-${formattedMonth}`,
    attendanceSummary,
  };
};

const getSingleDateAttendance = async (date: string) => {
  const singleAttendance = await Attendance.find({ date });

  if (!singleAttendance) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No attendance found');
  }

  return singleAttendance;
};

const getSingleAttendance = async (
  role: string,
  providedId: string,
  searchDate?: string
) => {
  // Step 1: Validate inputs
  if (!role || !providedId) {
    throw new Error('Both role and providedId are required to fetch attendance.');
  }

  // Step 2: Define query type
  const query: Record<string, any> = {
    'user.role': role,
    'user.providedId': providedId,
  };

  // Step 3: If searchDate is provided, format and add it to the query
  if (searchDate) {
    const parsedDate = new Date(searchDate.split('-').reverse().join('-'));
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear();
    query.date = `${day}-${month}-${year}`;
  }

  // Step 4: Fetch attendance data
  const singleAttendance = await Attendance.find(query);

  // Step 5: Handle no data found
  if (!singleAttendance.length) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'No attendance found for the provided role, providedId, and date.',
    );
  }

  // Step 6: Calculate attendance statistics
  const totalEntries = singleAttendance.length;
  const presentEntries = singleAttendance.filter((entry) => entry.present).length;
  const absentEntries = singleAttendance.filter((entry) => entry.absent).length;
  const lateEntries = singleAttendance.filter((entry) => entry.late_status).length;

  const calculatePercentage = (entries: number, total: number): number | string => {
    if (total === 0) return 0;
    const percentage = ((entries / total) * 100).toFixed(2);
    return percentage.endsWith('.00') ? parseInt(percentage) : percentage;
  };

  // Step 7: Return formatted summary
  return {
    role,
    providedId,
    searchDate: searchDate || 'All Dates',
    totalEntries,
    presentPercentage: calculatePercentage(presentEntries, totalEntries),
    presentEntries,
    absentPercentage: calculatePercentage(absentEntries, totalEntries),
    absentEntries,
    latePercentage: calculatePercentage(lateEntries, totalEntries),
    lateEntries,
    attendanceDetails: singleAttendance,
  };
};


const updateAttendanceInDB = async (id: string, payload: TAttendance[]) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const data of payload) {
      const { user, in_time } = data;

      // Define office start times (Assume 24-hour format: HH:mm)
      const officeStartTimes: Record<string, string | undefined> = {
        student: config.student_class_time, // Example: "08:00"
        teacher: config.teacher_office_time,
        staff: config.staff_office_time,
        accountant: config.accountant_office_time,
      };

      // Get office start time based on role
      const officeStartTime = officeStartTimes[user.role];
      if (!officeStartTime) {
        throw new Error(`Invalid user role: ${user.role}`);
      }

      // Convert times to comparable Date objects
      const attendanceTime = new Date(`1970-01-01T${in_time}:00`);
      const requiredTime = new Date(`1970-01-01T${officeStartTime}:00`);

      // Determine if late
      const lateStatus = attendanceTime > requiredTime;


      // Determine the correct model based on user.role
      let existingUser;
      switch (user.role) {
        case 'student':
          existingUser = await Student.findById(user.id).session(session);
          break;
        case 'teacher':
          existingUser = await Teacher.findById(user.id).session(session);
          break;
        case 'staff':
          existingUser = await Staff.findById(user.id).session(session);
          break;
        case 'accountant':
          existingUser = await AccountOfficer.findById(user.id).session(
            session,
          );
          break;
        default:
          throw new Error(`Invalid user role: ${user.role}`);
      }

      if (!existingUser) {
        throw new Error(
          `User with role ${user.role} and ID ${user.id} not found.`,
        );
      }

      // Check if attendance for the day already exists (by using the ID, not user.id)
      const checkExistingAttendance = await Attendance.findOne({
        _id: id, // Use _id to check for the specific attendance entry
        'user.id': user.id,
        date: data.date, // Ensure the date matches as well
      }).session(session);

      if (checkExistingAttendance) {
        // If attendance exists, update it with the new data
        checkExistingAttendance.full_name = data.full_name;
        checkExistingAttendance.date = data.date;
        checkExistingAttendance.in_time = data.in_time;
        checkExistingAttendance.out_time = data.out_time;
        checkExistingAttendance.present = data.present;
        checkExistingAttendance.absent = data.absent;
        checkExistingAttendance.late_status = lateStatus;

        // Update the attendance in the database
        await checkExistingAttendance.save({ session });

        // We don't need to manually update the user's attendance list
        // The user model is already referencing the correct attendance entry
      } else {
        throw new Error(
          `Attendance record not found for user ID ${user.id} on ${data.date}`,
        );
      }
    }

    // Commit the transaction if all updates are successful
    await session.commitTransaction();
  } catch (error) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    throw error;
  } finally {
    // End the session
    session.endSession();
  }

  return null;
};

const deleteAttendanceFromDB = async (
  payload: { date: string; userId: string }[],
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const data of payload) {
      const { date, userId } = data;

      // Find the corresponding attendance entry for the given date and userId
      const existingAttendance = await Attendance.findOne({
        'user.id': userId,
        date: date,
      }).session(session);

      if (!existingAttendance) {
        throw new Error(`No attendance found for user ID ${userId} on ${date}`);
      }

      // Find the user based on the role and userId
      let existingUser;
      switch (existingAttendance.user.role) {
        case 'student':
          existingUser = await Student.findById(
            existingAttendance.user.id,
          ).session(session);
          break;
        case 'teacher':
          existingUser = await Teacher.findById(
            existingAttendance.user.id,
          ).session(session);
          break;
        case 'staff':
          existingUser = await Staff.findById(
            existingAttendance.user.id,
          ).session(session);
          break;
        case 'accountant':
          existingUser = await AccountOfficer.findById(
            existingAttendance.user.id,
          ).session(session);
          break;
        default:
          throw new Error(`Invalid user role: ${existingAttendance.user.role}`);
      }

      if (!existingUser) {
        throw new Error(
          `User with role ${existingAttendance.user.role} and ID ${existingAttendance.user.id} not found.`,
        );
      }

      // Remove attendance from the user's attendance list
      await existingUser.updateOne(
        { $pull: { attendance: existingAttendance._id } },
        { session },
      );

      // Delete the attendance entry from the Attendance collection
      await Attendance.findByIdAndDelete(existingAttendance._id).session(
        session,
      );
    }

    // Commit the transaction if all deletions are successful
    await session.commitTransaction();
  } catch (error) {
    // If any error occurs, abort the transaction
    await session.abortTransaction();
    throw error;
  } finally {
    // End the session
    session.endSession();
  }

  return null;
};

export const AttendanceServices = {
  createAttendanceIntoDB,
  getTodayAttendanceFromDB,
  getAllAttendanceByCurrentMonth,
  getSingleDateAttendance,
  getSingleAttendance,
  updateAttendanceInDB,
  deleteAttendanceFromDB,
};
