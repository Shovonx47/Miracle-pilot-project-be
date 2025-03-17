import { StatusCodes } from 'http-status-codes';

import AppError from '../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { TTeacher } from './teacher.interface';
import { Teacher } from './teacher.model';
import { generateTeacherId } from './teacher.utils';
import { Auth } from '../Auth/auth.model';
import config from '../../config';
import bcrypt from 'bcrypt';
import mongoose, { Types } from 'mongoose';
import { teacherSearchableFields } from './teacher.const';

const createTeacherIntoDB = async (payload: TTeacher) => {
  // Start a new session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate `userId`
    if (!payload.userId) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Please provide your ID.');
    }

    // Check if staff already exists
    const existingStaff = await Teacher.findOne({
      userId: payload.userId,
    }).session(session);
    if (existingStaff) {
      throw new AppError(
        StatusCodes.CONFLICT,
        `Teacher already exists with ID ${payload.userId}`,
      );
    }

    // Generate teacher ID
    const teacherId = await generateTeacherId(payload.joiningDate);

    // Check if the user is registered in Auth
    const checkUserAuth = await Auth.findOne({
      userId: payload.userId,
    }).session(session);

    if (!checkUserAuth) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not registered.');
    }

    if (!checkUserAuth.password && checkUserAuth.userId) {
      const hashedPassword = await bcrypt.hash(
        teacherId,
        Number(config.bcrypt_salt_rounds),
      );
      await Auth.findOneAndUpdate(
        { userId: payload.userId }, // Query filter
        {
          $set: {
            isCompleted: true,
            role: 'teacher',
            password: hashedPassword,
            userId: '',
          },
        },
        { session, new: true }, // Use the session and return the updated document
      );
    }
    if (checkUserAuth.password && checkUserAuth.userId) {
      await Auth.findOneAndUpdate(
        { userId: payload.userId }, // Query filter
        {
          $set: {
            isCompleted: true,
            role: 'teacher',
            userId: '',
          },
        },
        { session, new: true }, // Use the session and return the updated document
      );
    }

    // Sanitize the payload
    const sanitizeData = sanitizePayload(payload);

    // Create and save the teacher
    const teacherData = new Teacher({
      ...sanitizeData,
      teacherId,
      auth: checkUserAuth._id,
    });

    const savedTeacher = await teacherData.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return savedTeacher;
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllTeacherFromDB = async (query: Record<string, unknown>) => {
  const teacherQuery = new QueryBuilder(Teacher.find(), query)
    .sort()
    .paginate()
    .search(teacherSearchableFields)
    .filter();

  const meta = await teacherQuery.countTotal();
  const data = await teacherQuery.modelQuery;

  return {
    meta,
    data,
  };
};

const getSingleTeacherDetails = async (identifier: string) => {
  let query = {};
  if (Types.ObjectId.isValid(identifier)) {
    query = { _id: identifier };
  } else {
    query = { email: identifier }; // If it's not a valid ObjectId, search by email
  }
  const singleTeacher = await Teacher.findOne(query).populate('attendance');

  if (!singleTeacher) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No teacher found');
  }

  return singleTeacher;
};

const updateTeacherInDB = async (id: string, payload: TTeacher) => {
  const sanitizeData = sanitizePayload(payload);

  const updatedTeacher = await Teacher.findByIdAndUpdate(id, sanitizeData, {
    new: true,
    runValidators: true,
  });

  if (!updatedTeacher) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Teacher not found.');
  }

  return updatedTeacher;
};

const deleteTeacherFromDB = async (id: string) => {
  // Find the student by ID
  const teacher = await Teacher.findById(id);

  // Check if student exists
  if (!teacher) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Teacher not found.');
  }

  // Mark the student as deleted
  teacher.isDeleted = true;

  // Save changes to the database
  await teacher.save();

  // Return the updated student document
  return teacher;
};

export const TeacherServices = {
  createTeacherIntoDB,
  getAllTeacherFromDB,
  getSingleTeacherDetails,
  updateTeacherInDB,
  deleteTeacherFromDB,
};
