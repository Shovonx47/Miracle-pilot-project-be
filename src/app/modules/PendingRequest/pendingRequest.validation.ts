import { z } from 'zod';
import { RequestStatus, RequestType } from './pendingRequest.interface';

const createPendingRequestValidationSchema = z.object({
  body: z.object({
    requestType: z.enum([
      RequestType.STUDENT, 
      RequestType.TEACHER,
      RequestType.ACCOUNTANT
    ] as [string, ...string[]]),
    requestData: z.record(z.any()),
    createdBy: z.string().optional(),
  }),
});

const updatePendingRequestValidationSchema = z.object({
  body: z.object({
    requestStatus: z.enum([
      RequestStatus.ACCEPTED, 
      RequestStatus.REJECTED
    ] as [string, ...string[]]),
    updatedBy: z.string().optional(),
    rejectionReason: z.string().optional(),
  }),
});

export const PendingRequestValidation = {
  createPendingRequestValidationSchema,
  updatePendingRequestValidationSchema,
}; 