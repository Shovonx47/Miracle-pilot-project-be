import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { teacherValidation } from './teacher.validation';
import { teacherController } from './teacher.controller';
import { USER_ROLE } from '../Auth/auth.const';
import authorization from '../../middlewares/authorization';

const router = express.Router();

router
  .route('/')
  .post(
    authorization(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.teacher),
    validateRequest(teacherValidation.teacherValidationSchema),
    teacherController.createTeacher,
  )
  .get(teacherController.getAllTeacher);

router
  .route('/:id')
  .get(teacherController.getSingleTeacher)
  .put(
    // authorization(USER_ROLE.super_admin),
    validateRequest(teacherValidation.updateTeacherValidationSchema),
    teacherController.updateTeacher,
  )
  .delete(teacherController.deleteTeacher);

export const TeacherRoutes = router;
