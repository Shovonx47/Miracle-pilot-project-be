import { Router } from 'express';
import { AccountOfficerRoutes } from '../modules/Account_officer/account_officer.route';
import { AdminRoutes } from '../modules/Admin/admin.route';
import { AttendanceRoutes } from '../modules/Attendance/attendance.route';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { ClassRoutineRoutes } from '../modules/Create-class-routine/class-routine.route';
import { ExamSettingRoutes } from '../modules/Exam-setting/exam-setting.route';
import { ExaminationScheduleRoutes } from '../modules/Examination-schedule/exam-schedule.route';
import { OffDaySetupRoutes } from '../modules/Off-day-setup/off-day.route';
import { PendingRequestRoutes } from '../modules/PendingRequest/pendingRequest.route';
import { SalaryRoutes } from '../modules/Salary/salary.route';
import { StaffRoutes } from '../modules/Staff/staff.route';
import { StudentRoutes } from '../modules/Student/student.route';
import { TeacherRoutes } from '../modules/Teacher/teacher.route';
import { TransactionRoutes } from '../modules/Transaction/transaction.route';
import { TransactionTypeRoutes } from '../modules/TransactionType/transactionType.route';
import { NoticeRoutes } from '../modules/Notice/notice.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/students',
    route: StudentRoutes,
  },
  {
    path: '/teachers',
    route: TeacherRoutes,
  },
  {
    path: '/staff',
    route: StaffRoutes,
  },
  {
    path: '/account-officer',
    route: AccountOfficerRoutes,
  },
  {
    path: '/class-routine',
    route: ClassRoutineRoutes,
  },
  {
    path: '/exam-schedule',
    route: ExaminationScheduleRoutes,
  },
  {
    path: '/off-day-setup',
    route: OffDaySetupRoutes,
  },
  {
    path: '/exam-setting',
    route: ExamSettingRoutes,
  },
  {
    path: '/attendance',
    route: AttendanceRoutes,
  },
  {
    path: '/salary',
    route: SalaryRoutes,
  },
  {
    path: '/transaction',
    route: TransactionRoutes,
  },
  {
    path: '/attendance',
    route: AttendanceRoutes,
  },
  {
    path: '/transaction-type',
    route: TransactionTypeRoutes,
  },
  {
    path: '/pending-requests',
    route: PendingRequestRoutes,
  },
  {
    path: '/notice',
    route: NoticeRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
