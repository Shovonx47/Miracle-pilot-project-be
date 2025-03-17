import { model, Schema } from 'mongoose';
import { Type_of_Transaction } from '../TransactionType/transactionType.constant';
import { ITransaction } from './transaction.interface';

const transactionSchema = new Schema<ITransaction>(
  {
    studentId: { type: String },
    userId: { type: String },
    transactionCategory: {
      type: String,
      required: [true, 'Transaction category is required.'],
    },
    transactionSubCategory: {
      type: String,
    },
    amount: { type: Number, required: [true, 'Amount is required.'] },
    transactionType: {
      type: String,
      enum: Object.values(Type_of_Transaction),
      required: [true, 'Transaction type is required.'],
    },
    transactionSource: {
      type: String,
    },
    transactionDate: {
      type: String,
      required: [true, 'Transaction date is required.'],
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required.'],
    },
    note: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Transaction = model<ITransaction>(
  'Transaction',
  transactionSchema,
);
