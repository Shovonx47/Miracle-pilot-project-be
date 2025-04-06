import express from 'express';
import authorization from '../../middlewares/authorization';
import { USER_ROLE } from '../Auth/auth.const';
import { attendanceController } from './attendance.controller';

const router = express.Router();

router
  .route('/')
  .post(
    authorization(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.teacher),
    attendanceController.createAttendance)
  .get(
    authorization(
      USER_ROLE.super_admin,
      USER_ROLE.admin,
      USER_ROLE.teacher,
      USER_ROLE.student,
      USER_ROLE.staff,
      USER_ROLE.accountant
    ),
    attendanceController.getAllAttendanceByCurrentMonth
  );

router.route('/today').get(attendanceController.getTodayAttendance);

router
  .route('/:date')
  .get(attendanceController.getSingleDateAttendance)
  .put(attendanceController.updateAttendance);
router
  .route('/:role/:providedId')
  .get(attendanceController.getSingleAttendance);

router.route('/remove').put(attendanceController.deleteAttendance);
export const AttendanceRoutes = router;
