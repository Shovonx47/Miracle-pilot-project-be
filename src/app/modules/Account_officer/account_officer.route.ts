import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { accountOfficerValidation } from './account_officer.validation';
import { accountOfficerController } from './account_officer.controller';
import authorization from '../../middlewares/authorization';
import { USER_ROLE } from '../Auth/auth.const';

const router = express.Router();

router
  .route('/')
  .post(
    authorization(USER_ROLE.super_admin, USER_ROLE.admin, USER_ROLE.accountant),
    validateRequest(accountOfficerValidation.accountOfficerValidationSchema),
    accountOfficerController.createAccountOfficer,
  )
  .get(accountOfficerController.getAllAccountOfficer);

router
  .route('/:id')
  .get(accountOfficerController.getSingleAccountOfficer)
  .put(
    // authorization(USER_ROLE.super_admin),
    validateRequest(
      accountOfficerValidation.updateAccountOfficerValidationSchema,
    ),
    accountOfficerController.updateAccountOfficer,
  )
  .delete(accountOfficerController.deleteAccountOfficer);

export const AccountOfficerRoutes = router;
