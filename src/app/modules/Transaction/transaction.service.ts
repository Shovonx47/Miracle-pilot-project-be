import QueryBuilder from '../../builder/QueryBuilder';
import { transactionSearchableFields } from './transaction.constant';
import { ITransaction } from './transaction.interface';
import { Transaction } from './transaction.model';

// Create Transaction
const createTransactionIntoDB = async (payload: ITransaction) => {
  const transaction = await Transaction.create(payload);
  return transaction;
};

// Get All Transaction From DB
const getAllTransactionFromDB = async (query: Record<string, unknown>) => {
  const transactionQuery = new QueryBuilder(Transaction.find(), query)
    .sort()
    .paginate()
    .search(transactionSearchableFields)
    .filter();

  const meta = await transactionQuery.countTotal();
  const data = await transactionQuery.modelQuery;
  return { meta, data };
};

// Get Single Transaction From DB
const getSingleTransactionFromDB = async (transactionId: string) => {
  const transaction = await Transaction.findById(transactionId);
  return transaction;
};

// Update Transaction
const updateTransactionIntoDB = async (
  transactionId: string,
  payload: ITransaction,
) => {
  const transaction = await Transaction.findByIdAndUpdate(
    transactionId,
    payload,
    {
      new: true,
    },
  );
  return transaction;
};

// Delete Transaction
const deleteTransactionFromDB = async (transactionId: string) => {
  const transaction = await Transaction.findByIdAndDelete(transactionId);
  return transaction;
};

// Get All transaction from Start Date to End Date
const getAllTransactionFromStartDateToEndDate = async (
  startDate: string,
  endDate: string,
) => {
  const transaction = await Transaction.find({
    transactionDate: {
      $gte: startDate,
      $lte: endDate,
    },
  });
  return transaction;
};

export const TransactionServices = {
  createTransactionIntoDB,
  getAllTransactionFromDB,
  getSingleTransactionFromDB,
  updateTransactionIntoDB,
  deleteTransactionFromDB,
  getAllTransactionFromStartDateToEndDate,
};
