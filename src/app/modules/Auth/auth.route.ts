import express from 'express';

import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';
import { userAuthController } from './auth.controller';
import { updateFunc } from './auth.const';
import authorization from '../../middlewares/authorization';
import { USER_ROLE } from './auth.const';

const router = express.Router();

router
  .route('/register-user')
  .post(
    validateRequest(AuthValidation.userAuthValidationSchemaForCreateUser),
    userAuthController.registerUser,
  );

router
  .route('/login')
  .post(
    validateRequest(AuthValidation.userAuthValidationSchemaForLogin),
    userAuthController.loginUser,
  );

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  userAuthController.refreshToken,
);

// Super admin routes for user approval
router
  .route('/pending-users')
  .get(
    authorization(USER_ROLE.super_admin),
    userAuthController.getPendingUsers,
  );

router
  .route('/approve-user/:userId')
  .patch(
    authorization(USER_ROLE.super_admin),
    userAuthController.approveUser,
  );

router
  .route('/reject-user/:userId')
  .patch(
    authorization(USER_ROLE.super_admin),
    userAuthController.rejectUser,
  );

router
  .route('/update-approval-status/:userId')
  .patch(
    authorization(USER_ROLE.super_admin),
    userAuthController.updateUserApprovalStatus,
  );

router
  .route('/:action(send-verify-code|verify-otp|update-forgot-password)')
  .put(updateFunc);

router.post('/logout', userAuthController.logout);

router.get('/:userId', userAuthController.getSingleUser)

export const AuthRoutes = router;
