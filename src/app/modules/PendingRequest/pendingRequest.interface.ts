import { Types } from 'mongoose';

export enum RequestType {
  TEACHER = 'teacher',
  STUDENT = 'student',
  ACCOUNTANT = 'accountant',
}

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export type TPendingRequest = {
  requestId: string;
  requestType: RequestType;
  requestData: Record<string, any>;
  requestStatus: RequestStatus;
  createdBy?: string;
  updatedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}; 