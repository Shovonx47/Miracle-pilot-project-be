import express from 'express';
import { PendingRequestController } from './pendingRequest.controller';
import validateRequest from '../../middlewares/validateRequest';
import { PendingRequestValidation } from './pendingRequest.validation';

const router = express.Router();

// Create a new pending request
router.post(
  '/',
  validateRequest(PendingRequestValidation.createPendingRequestValidationSchema),
  PendingRequestController.createPendingRequest,
);

// Get all pending requests
router.get('/', PendingRequestController.getAllPendingRequests);

// Get a single pending request
router.get('/:requestId', PendingRequestController.getSinglePendingRequest);

// Process a pending request
router.patch(
  '/:requestId',
  validateRequest(PendingRequestValidation.updatePendingRequestValidationSchema),
  PendingRequestController.processPendingRequest,
);

export const PendingRequestRoutes = router; 