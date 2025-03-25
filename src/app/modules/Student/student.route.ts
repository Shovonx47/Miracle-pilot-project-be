import express from 'express';

import validateRequest from '../../middlewares/validateRequest';
import { studentController } from './student.controller';
import { studentValidation } from './student.validation';
import authorization from '../../middlewares/authorization';
import { USER_ROLE } from '../Auth/auth.const';

const router = express.Router();

router
  .route('/')
  .post(
    authorization(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.student),
    validateRequest(studentValidation.studentValidationSchema),
    studentController.createStudent,
  )
  .get(
    // authorization(USER_ROLE.super_admin), 
    studentController.getAllStudents);

router
  .route('/:id')
  .get(studentController.getSingleStudent)
  .put(
    // authorization(USER_ROLE.super_admin),
    validateRequest(studentValidation.updateStudentValidationSchema),
    studentController.updateStudent,
  )
  .patch(studentController.migrateClass)
  .delete(studentController.deleteStudent);

export const StudentRoutes = router;
