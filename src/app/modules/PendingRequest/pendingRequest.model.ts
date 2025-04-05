import mongoose, { Model, Schema } from 'mongoose';
import { TPendingRequest, RequestStatus, RequestType } from './pendingRequest.interface';

const PendingRequestSchema = new Schema<TPendingRequest>(
  {
    requestId: {
      type: String,
      required: [true, 'Request ID is required'],
      unique: true,
    },
    requestType: {
      type: String,
      enum: Object.values(RequestType),
      required: [true, 'Request type is required'],
    },
    requestData: {
      type: Schema.Types.Mixed,
      required: [true, 'Request data is required'],
    },
    requestStatus: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.PENDING,
      required: [true, 'Request status is required'],
    },
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const PendingRequest: Model<TPendingRequest> = mongoose.model<TPendingRequest>(
  'PendingRequest',
  PendingRequestSchema,
); 