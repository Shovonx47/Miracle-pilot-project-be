import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import sanitizePayload from '../../middlewares/updateDataValidation';
import { Auth } from '../Auth/auth.model';
import config from '../../config';

import { TAccountOfficer } from './account_officer.interface';
import { AccountOfficer } from './account_officer.model';
import { generateAccountantId } from './account_officer.utils';
import { accountantSearchableFields } from './account_officer.const';

const createAccountOfficerIntoDB = async (payload: TAccountOfficer) => {
  // Start a new session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate `userId`
    if (!payload.userId) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Please provide your ID.');
    }

    // Check if staff already exists
    const existingStaff = await AccountOfficer.findOne({
      userId: payload.userId,
    }).session(session);
    if (existingStaff) {
      throw new AppError(
        StatusCodes.CONFLICT,
        `Accountant already exists with ID ${payload.userId}`,
      );
    }

    // Generate AccountOfficer ID
    const accountantId = await generateAccountantId(payload.joiningDate);

    // Check if the user is registered in Auth
    const checkUserAuth = await Auth.findOne({
      userId: payload.userId,
    }).session(session);

    if (!checkUserAuth) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not registered.');
    }

    // Update the Auth document

    if (!checkUserAuth.password && checkUserAuth.userId) {
      const hashedPassword = await bcrypt.hash(
        accountantId,
        Number(config.bcrypt_salt_rounds),
      );
      await Auth.findOneAndUpdate(
        { userId: payload.userId }, // Query filter
        {
          $set: {
            isCompleted: true,
            role: 'accountant',
            password: hashedPassword,
            userId: '',
          },
        },
        { session, new: true }, // Use the session and return the updated document
      );
    }
    if (checkUserAuth.password && checkUserAuth.userId) {
      await Auth.findOneAndUpdate(
        { userId: payload.userId }, // Query filter
        {
          $set: {
            isCompleted: true,
            role: 'accountant',
            userId: '',
          },
        },
        { session, new: true }, // Use the session and return the updated document
      );
    }

    // Sanitize the payload
    const sanitizeData = sanitizePayload(payload);

    // Create and save the AccountOfficer
    const AccountOfficerData = new AccountOfficer({
      ...sanitizeData,
      accountantId,
      auth: checkUserAuth._id,
    });

    const savedAccountOfficer = await AccountOfficerData.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return savedAccountOfficer;
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllAccountOfficerFromDB = async (query: Record<string, unknown>) => {
  const accountOfficerQuery = new QueryBuilder(AccountOfficer.find(), query)
    .sort()
    .paginate()
    .search(accountantSearchableFields)
    .filter();

  const meta = await accountOfficerQuery.countTotal();
  const data = await accountOfficerQuery.modelQuery;

  return {
    meta,
    data,
  };
};

const getSingleAccountOfficerDetails = async (id: string) => {
  const singleAccountOfficer = await AccountOfficer.findById(id);

  if (!singleAccountOfficer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No accountant found');
  }

  return singleAccountOfficer;
};

const updateAccountOfficerInDB = async (
  id: string,
  payload: TAccountOfficer,
) => {
  const sanitizeData = sanitizePayload(payload);

  const updatedAccountOfficer = await AccountOfficer.findByIdAndUpdate(
    id,
    sanitizeData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedAccountOfficer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Accountant not found.');
  }

  return updatedAccountOfficer;
};

const deleteAccountOfficerFromDB = async (id: string) => {
  // Find the account officer by ID
  const accountOfficer = await AccountOfficer.findById(id);

  // Check if account officer exists
  if (!accountOfficer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Accountant not found.');
  }

  // Mark the account officer as deleted
  accountOfficer.isDeleted = true;

  // Save changes to the database
  await accountOfficer.save();

  return accountOfficer;
};

export const AccountOfficerServices = {
  createAccountOfficerIntoDB,
  getAllAccountOfficerFromDB,
  getSingleAccountOfficerDetails,
  updateAccountOfficerInDB,
  deleteAccountOfficerFromDB,
};
