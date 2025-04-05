import httpStatus from 'http-status';
import { TPendingRequest, RequestStatus, RequestType } from './pendingRequest.interface';
import { PendingRequest } from './pendingRequest.model';
import { generateRequestId } from './pendingRequest.utils';
import AppError from '../../errors/AppError';
import { Student } from '../Student/student.model';
import { Teacher } from '../Teacher/teacher.model';
import { AccountOfficer } from '../Account_officer/account_officer.model';
import { Auth } from '../Auth/auth.model';
import mongoose from 'mongoose';

// Utility function to ensure all required fields are set for a teacher
const prepareTeacherData = async (teacherData: Record<string, any>) => {
  // Create auth reference
  const authId = new mongoose.Types.ObjectId();
  
  // Generate a teacher ID
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const teacherCount = await Teacher.countDocuments();
  const teacherId = `T-${year}-${String(teacherCount + 1).padStart(5, '0')}`;
  
  // Set default values for any missing required fields
  return {
    ...teacherData,
    teacherId,
    auth: authId,
    status: teacherData.status || 'Active',
    isDeleted: false,
    // Add default values for other potentially missing fields
    profileImage: teacherData.profileImage || '',
    joiningDate: teacherData.joiningDate || new Date().toISOString().split('T')[0],
    subject: teacherData.subject || 'General',
    maritalStatus: teacherData.maritalStatus || 'Single',
    educationalQualification: teacherData.educationalQualification || 'Graduate',
    resume: teacherData.resume || '',
    joiningLetter: teacherData.joiningLetter || '',
    previousSchool: typeof teacherData.previousSchool === 'boolean' ? teacherData.previousSchool : false,
    previousSchoolName: teacherData.previousSchoolName || '',
    previousSchoolPosition: teacherData.previousSchoolPosition || '',
    previousSchoolAddress: teacherData.previousSchoolAddress || '',
    basicSalary: teacherData.basicSalary || '0',
    workLocation: teacherData.workLocation || 'Main Campus',
    contractType: teacherData.contractType || 'Full-time',
    workShift: teacherData.workShift || 'Day',
    accountName: teacherData.accountName || teacherData.firstName + ' ' + teacherData.lastName,
    accountNumber: teacherData.accountNumber || '0000000000',
    bankName: teacherData.bankName || 'Default Bank',
    IFSCCode: teacherData.IFSCCode || '000000',
    branchName: teacherData.branchName || 'Main Branch',
  };
};

// Utility function to ensure all required fields are set for a student
const prepareStudentData = async (studentData: Record<string, any>) => {
  // Create auth reference
  const authId = new mongoose.Types.ObjectId();
  
  // Generate a student ID
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const studentCount = await Student.countDocuments();
  const studentId = `S-${year}-${String(studentCount + 1).padStart(5, '0')}`;
  
  // Set default values for any missing required fields
  return {
    ...studentData,
    studentId,
    auth: authId,
    roll: studentData.roll || String(studentCount + 1),
    status: studentData.status || 'Active',
    isDeleted: false,
    // Add default values for other potentially missing fields
    profileImage: studentData.profileImage || '',
    academicYear: studentData.academicYear || new Date().getFullYear().toString(),
    admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0],
    category: studentData.category || 'General',
    board: studentData.board || 'Default Board',
    birthCertificate: studentData.birthCertificate || '',
    transferCertificate: studentData.transferCertificate || '',
  };
};

// Utility function to ensure all required fields are set for an accountant
const prepareAccountantData = async (accountantData: Record<string, any>) => {
  // Create auth reference
  const authId = new mongoose.Types.ObjectId();
  
  // Generate an accountant ID
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const accountantCount = await AccountOfficer.countDocuments();
  const accountantId = `AC-${year}-${String(accountantCount + 1).padStart(5, '0')}`;
  
  // Set default values for any missing required fields
  return {
    ...accountantData,
    accountantId,
    auth: authId,
    status: accountantData.status || 'Active',
    isDeleted: false,
    // Add default values for other potentially missing fields
    profileImage: accountantData.profileImage || '',
    joiningDate: accountantData.joiningDate || new Date().toISOString().split('T')[0],
    category: accountantData.category || 'General',
    maritalStatus: accountantData.maritalStatus || 'Single',
    educationalQualification: accountantData.educationalQualification || 'Graduate',
    resume: accountantData.resume || '',
    joiningLetter: accountantData.joiningLetter || '',
    EPFNo: accountantData.EPFNo || '',
    basicSalary: accountantData.basicSalary || '0',
    workLocation: accountantData.workLocation || 'Main Campus',
    contractType: accountantData.contractType || 'Full-time',
    workShift: accountantData.workShift || 'Day',
    accountName: accountantData.accountName || accountantData.firstName + ' ' + accountantData.lastName,
    accountNumber: accountantData.accountNumber || '0000000000',
    bankName: accountantData.bankName || 'Default Bank',
    IFSCCode: accountantData.IFSCCode || '000000',
    branchName: accountantData.branchName || 'Main Branch',
  };
};

// Create a new pending request
const createPendingRequest = async (payload: Partial<TPendingRequest>) => {
  const requestId = await generateRequestId();
  const result = await PendingRequest.create({
    ...payload,
    requestId,
    requestStatus: RequestStatus.PENDING,
  });
  return result;
};

// Get all pending requests
const getAllPendingRequests = async (
  query: Record<string, unknown>,
) => {
  const { page = 1, limit = 10, status, requestType, sortBy, sortOrder } = query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const filter: Record<string, unknown> = {};
  
  if (status) {
    filter.requestStatus = status;
  }
  
  if (requestType) {
    filter.requestType = requestType;
  }
  
  const sortOptions: { [key: string]: 1 | -1 } = {};
  
  if (sortBy && sortOrder) {
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
  } else {
    sortOptions.createdAt = -1; // Default sort by createdAt DESC
  }
  
  const result = await PendingRequest.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit));
    
  const total = await PendingRequest.countDocuments(filter);
  
  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: result,
  };
};

// Get a single pending request by ID
const getSinglePendingRequest = async (requestId: string) => {
  const result = await PendingRequest.findOne({ requestId });
  
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pending request not found');
  }
  
  return result;
};

// Process a pending request (accept or reject)
const processPendingRequest = async (
  requestId: string,
  payload: {
    requestStatus: RequestStatus;
    updatedBy?: string;
    rejectionReason?: string;
  },
) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Find the pending request
    const pendingRequest = await PendingRequest.findOne({ requestId });
    
    if (!pendingRequest) {
      throw new AppError(httpStatus.NOT_FOUND, 'Pending request not found');
    }
    
    if (pendingRequest.requestStatus !== RequestStatus.PENDING) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `This request has already been ${pendingRequest.requestStatus.toLowerCase()}`,
      );
    }
    
    // If rejecting, update both request and auth status
    if (payload.requestStatus === RequestStatus.REJECTED) {
      // Update request status
      const result = await PendingRequest.findOneAndUpdate(
        { requestId },
        {
          requestStatus: RequestStatus.REJECTED,
          updatedBy: payload.updatedBy,
          rejectionReason: payload.rejectionReason,
        },
        { new: true, session },
      );

      // Update auth status
      await Auth.findOneAndUpdate(
        { userId: pendingRequest.createdBy },
        { approvalStatus: 'rejected' },
        { session }
      );
      
      await session.commitTransaction();
      return result;
    }
    
    // If accepting, create the actual record based on request type
    if (payload.requestStatus === RequestStatus.ACCEPTED) {
      let createdData = null;
      
      if (pendingRequest.requestType === RequestType.STUDENT) {
        // Check if a student with this email already exists
        const existingStudent = await Student.findOne({ email: pendingRequest.requestData.email });
        if (existingStudent) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `A student with this email (${pendingRequest.requestData.email}) already exists`,
          );
        }
        
        // Prepare student data with all required fields
        const studentData = await prepareStudentData(pendingRequest.requestData);
        
        // Create the student
        createdData = await Student.create([studentData], { session });
      } else if (pendingRequest.requestType === RequestType.TEACHER) {
        // Check if a teacher with this email already exists
        const existingTeacher = await Teacher.findOne({ email: pendingRequest.requestData.email });
        if (existingTeacher) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `A teacher with this email (${pendingRequest.requestData.email}) already exists`,
          );
        }
        
        // Prepare teacher data with all required fields
        const teacherData = await prepareTeacherData(pendingRequest.requestData);
        
        // Create the teacher
        createdData = await Teacher.create([teacherData], { session });
      } else if (pendingRequest.requestType === RequestType.ACCOUNTANT) {
        // Check if an accountant with this email already exists
        const existingAccountant = await AccountOfficer.findOne({ email: pendingRequest.requestData.email });
        if (existingAccountant) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `An accountant with this email (${pendingRequest.requestData.email}) already exists`,
          );
        }
        
        // Prepare accountant data with all required fields
        const accountantData = await prepareAccountantData(pendingRequest.requestData);
        
        // Create the accountant
        createdData = await AccountOfficer.create([accountantData], { session });
      }
      
      // Update the pending request status
      const result = await PendingRequest.findOneAndUpdate(
        { requestId },
        {
          requestStatus: RequestStatus.ACCEPTED,
          updatedBy: payload.updatedBy,
        },
        { new: true, session },
      );

      // Update auth status to approved
      await Auth.findOneAndUpdate(
        { userId: pendingRequest.createdBy },
        { 
          approvalStatus: 'approved',
          status: 'active'
        },
        { session }
      );
      
      await session.commitTransaction();
      return {
        pendingRequest: result,
        createdData: createdData?.[0],
      };
    }
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const PendingRequestService = {
  createPendingRequest,
  getAllPendingRequests,
  getSinglePendingRequest,
  processPendingRequest,
}; 