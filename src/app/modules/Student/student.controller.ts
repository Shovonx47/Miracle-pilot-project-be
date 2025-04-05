import { StatusCodes } from 'http-status-codes';

import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StudentServices } from './student.service';

const createStudent = catchAsync(async (req, res) => {
  console.log('Creating student with data:', JSON.stringify(req.body, null, 2));
  
  // Check for required fields and provide defaults if needed
  const requiredFields = [
    'userId', 'academicYear', 'admissionDate', 'status', 'category',
    'firstName', 'lastName', 'class', 'section', 'gender',
    'dateOfBirth', 'bloodGroup', 'religion', 'contactNumber',
    'email', 'board', 'motherTongue', 'presentAddress', 
    'permanentAddress', 'fatherName', 'fatherEmail',
    'fatherContactNumber', 'fatherOccupation', 'fatherNidNumber',
    'motherName', 'motherEmail', 'motherContactNumber',
    'motherOccupation', 'motherNidNumber'
  ];
  
  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    console.warn('Missing required fields:', missingFields);
  }
  
  try {
    // Convert null values to empty strings to pass validation
    const fileFields = ['profileImage', 'birthCertificate', 'transferCertificate'];
    fileFields.forEach(field => {
      if (req.body[field] === null || req.body[field] === undefined) {
        req.body[field] = ''; // Empty string instead of null
      }
    });
    
    console.log('Processed data ready for saving:', JSON.stringify(req.body, null, 2));
    
    const student = await StudentServices.createStudentIntoDB(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Student created successful!',
      data: student,
    });
  } catch (error) {
    console.error('Error creating student:', error);
    throw error; // This will be caught by the error handling middleware
  }
});

const getAllStudents = catchAsync(async (req, res) => {
  const result = await StudentServices.getAllStudentFromDB(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Students are retrieved successfully',
    data: result,
  });
});

const getSingleStudent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await StudentServices.getSingleStudentDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Student retrieved successful!',
    data: result,
  });
});

const updateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await StudentServices.updateStudentInDB(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Student update successful!',
    data: result,
  });
});
const migrateClass = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await StudentServices.migrateClassIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Class migration successful!',
    data: result,
  });
});
const deleteStudent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await StudentServices.deleteStudentFromDB(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Student deleted successful!',
    data: result,
  });
});

export const studentController = {
  createStudent,
  getAllStudents,
  getSingleStudent,
  updateStudent,
  migrateClass,
  deleteStudent,
};
