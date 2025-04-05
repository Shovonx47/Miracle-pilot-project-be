import { RequestHandler } from 'express';
import { PendingRequestService } from './pendingRequest.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';

// Create a new pending request
const createPendingRequest: RequestHandler = catchAsync(async (req, res) => {
  const result = await PendingRequestService.createPendingRequest(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Pending request created successfully',
    data: result,
  });
});

// Get all pending requests
const getAllPendingRequests: RequestHandler = catchAsync(async (req, res) => {
  const result = await PendingRequestService.getAllPendingRequests(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pending requests retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

// Get a single pending request
const getSinglePendingRequest: RequestHandler = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const result = await PendingRequestService.getSinglePendingRequest(requestId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pending request retrieved successfully',
    data: result,
  });
});

// Process a pending request (accept or reject)
const processPendingRequest: RequestHandler = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const result = await PendingRequestService.processPendingRequest(
    requestId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Request ${req.body.requestStatus.toLowerCase()} successfully`,
    data: result,
  });
});

export const PendingRequestController = {
  createPendingRequest,
  getAllPendingRequests,
  getSinglePendingRequest,
  processPendingRequest,
}; 