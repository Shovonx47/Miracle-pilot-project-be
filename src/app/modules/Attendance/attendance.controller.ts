import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AttendanceServices } from './attendance.service';

const createAttendance = catchAsync(async (req, res) => {
  const result = await AttendanceServices.createAttendanceIntoDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Attendance created successful!',
    data: result,
  });
});

const getTodayAttendance = catchAsync(async (req, res) => {
  const role = req.query.role as string;
  const page = parseInt(req.query.page as string);
  const limit = parseInt(req.query.limit as string);
  const searchTerm = req.query.searchTerm as string;
  const searchDate = req.query.searchDate as string;

  const result = await AttendanceServices.getTodayAttendanceFromDB(
    role,
    page,
    limit,
    searchTerm,
    searchDate,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Today attendance retrieved successful!',
    data: result,
  });
});
const getAllAttendanceByCurrentMonth = catchAsync(async (req, res) => {
  const role = req.query.role as string;
  const page = parseInt(req.query.page as string);
  const limit = parseInt(req.query.limit as string);
  const searchTerm = req.query.searchTerm as string;
  const month = parseInt(req.query.month as string);
  const year = parseInt(req.query.year as string);

  const result = await AttendanceServices.getAllAttendanceByCurrentMonth(
    role,
    page,
    limit,
    searchTerm,
    month,
    year,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Current month attendance retrieved successful!',
    data: result,
  });
});

const getSingleDateAttendance = catchAsync(async (req, res) => {
  const { date } = req.params;

  const result = await AttendanceServices.getSingleDateAttendance(date);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Attendance retrieved successful!',
    data: result,
  });
});

const getSingleAttendance = catchAsync(async (req, res) => {
  const { role, providedId } = req.params;

  const { searchDate } = req.query

  const result = await AttendanceServices.getSingleAttendance(role, providedId, searchDate as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Attendance retrieved successful!',
    data: result,
  });
});

const updateAttendance = catchAsync(async (req, res) => {
  const { date: id } = req.params;
  const result = await AttendanceServices.updateAttendanceInDB(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Attendance update successful!',
    data: result,
  });
});

const deleteAttendance = catchAsync(async (req, res) => {
  const result = await AttendanceServices.deleteAttendanceFromDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Attendance deleted successful!',
    data: result,
  });
});

export const attendanceController = {
  createAttendance,
  getTodayAttendance,
  getAllAttendanceByCurrentMonth,
  getSingleDateAttendance,
  getSingleAttendance,
  updateAttendance,
  deleteAttendance,
};
