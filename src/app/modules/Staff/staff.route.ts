import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { staffValidation } from './staff.validation';
import { StaffController } from './staff.controller';
import authorization from '../../middlewares/authorization';
import { USER_ROLE } from '../Auth/auth.const';

const router = express.Router();

router
  .route('/')
  .post(
    authorization(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.staff),
    validateRequest(staffValidation.staffValidationSchema),
    StaffController.createStaff,
  )
  .get(StaffController.getAllStaff);

router
  .route('/:id')
  .get(StaffController.getSingleStaff)
  .put(
    // authorization(USER_ROLE.super_admin),
    validateRequest(staffValidation.updateStaffValidationSchema),
    StaffController.updateStaff,
  )
  .delete(StaffController.deleteStaff);

export const StaffRoutes = router;
