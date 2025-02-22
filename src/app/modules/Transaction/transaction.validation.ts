import { z } from 'zod';
import { TransactionType } from './transaction.constant';

const createTransactionValidationSchema = z.object({
  userId: z.string({ required_error: 'User ID is required.' }),
  amount: z.number({ required_error: 'Amount is required.' }),
  transactionType: z.nativeEnum(TransactionType, {
    required_error: 'Transaction type is required.',
  }),
  transactionSource: z.string({
    required_error: 'Transaction source is required.',
  }),
  transactionDate: z.string({
    required_error: 'Transaction date is required.',
  }),
  transactionId: z.string({ required_error: 'Transaction ID is required.' }),
  note: z.string().optional(),
});

export const TransactionValidation = {
  createTransactionValidationSchema,
};
