import { PendingRequest } from './pendingRequest.model';

// Format: PR-yyyymmdd-000000 (PR: Pending Request)
export const generateRequestId = async () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Find the last request to determine the sequence
  const lastRequest = await PendingRequest.findOne({
    requestId: { $regex: `PR-${dateStr}-` },
  })
    .sort({ createdAt: -1 })
    .lean();

  let sequence = '000001';
  if (lastRequest) {
    const lastSequence = lastRequest.requestId.split('-')[2];
    const nextSequenceNumber = parseInt(lastSequence) + 1;
    sequence = String(nextSequenceNumber).padStart(6, '0');
  }

  return `PR-${dateStr}-${sequence}`;
}; 