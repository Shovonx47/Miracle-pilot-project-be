import { StatusCodes } from 'http-status-codes';

import AppError from '../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { Auth } from '../Auth/auth.model';
import config from '../../config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { TStaff } from './staff.interface';
import { generateStaffId } from './staff.utils';
import { Staff } from './staff.model';
import { staffSearchableFields } from './staff.const';

const createStaffIntoDB = async (payload: TStaff) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate `userId`
    if (!payload.userId) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Please provide your ID.');
    }

    // Check if staff already exists
    const existingStaff = await Staff.findOne({
      userId: payload.userId,
    }).session(session);
    if (existingStaff) {
      throw new AppError(
        StatusCodes.CONFLICT,
        `Staff already exists with ID ${payload.userId}`,
      );
    }

    // Generate staff ID
    const staffId = await generateStaffId(payload.joiningDate);

    // Verify if the user exists in Auth
    const userAuth = await Auth.findOne({ userId: payload.userId }).session(
      session,
    );
    if (!userAuth) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'User is not registered.');
    }

    // If no password is set, update the user's credentials
    if (!userAuth.password && userAuth.userId) {
      const hashedPassword = await bcrypt.hash(
        staffId,
        Number(config.bcrypt_salt_rounds),
      );
      await Auth.findOneAndUpdate(
        { userId: payload.userId },
        {
          $set: {
            isCompleted: true,
            role: 'staff',
            password: hashedPassword,
            userId: '',
          },
        },
        { session, new: true },
      );
    }
    if (userAuth.password && userAuth.userId) {
      await Auth.findOneAndUpdate(
        { userId: payload.userId },
        {
          $set: {
            isCompleted: true,
            role: 'staff',
            userId: '',
          },
        },
        { session, new: true },
      );
    }

    // Sanitize and prepare the staff payload
    const sanitizedPayload = sanitizePayload(payload);
    const staffData = new Staff({
      ...sanitizedPayload,
      staffId,
      auth: userAuth._id,
    });

    // Save the staff data
    const savedStaff = await staffData.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    return savedStaff;
  } catch (error) {
    // Rollback on error
    await session.abortTransaction();
    throw error;
  } finally {
    // Ensure the session is always ended
    session.endSession();
  }
};

const getAllStaffFromDB = async (query: Record<string, unknown>) => {
  const staffQuery = new QueryBuilder(Staff.find(), query)
    .sort()
    .paginate()
    .search(staffSearchableFields)
    .filter();

  const meta = await staffQuery.countTotal();
  const data = await staffQuery.modelQuery;

  return {
    meta,
    data,
  };
};

const getSingleStaffDetails = async (id: string) => {
  const singleStaff = await Staff.findById(id);

  if (!singleStaff) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No staff found');
  }

  return singleStaff;
};

const updateStaffInDB = async (id: string, payload: TStaff) => {
  const sanitizeData = sanitizePayload(payload);

  const updatedStaff = await Staff.findByIdAndUpdate(id, sanitizeData, {
    new: true,
    runValidators: true,
  });

  if (!updatedStaff) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Staff not found.');
  }

  return updatedStaff;
};

const deleteStaffFromDB = async (id: string) => {
  // Find the Staff by ID
  const staff = await Staff.findById(id);

  // Check if Staff exists
  if (!staff) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Staff not found.');
  }

  // Mark the Staff as deleted
  staff.isDeleted = true;

  // Save changes to the database
  await staff.save();

  return staff;
};

export const StaffServices = {
  createStaffIntoDB,
  getAllStaffFromDB,
  getSingleStaffDetails,
  updateStaffInDB,
  deleteStaffFromDB,
};
