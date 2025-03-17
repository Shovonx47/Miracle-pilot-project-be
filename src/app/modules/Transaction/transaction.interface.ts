import { Type_of_Transaction } from '../TransactionType/transactionType.constant';

export interface ITransaction {
  userId?: string;
  studentId?: string;
  amount: number;
  transactionType: Type_of_Transaction;
  transactionCategory: string;
  transactionSubCategory?: string;
  transactionSource?: string;
  transactionDate: string;
  transactionId: string;
  note?: string;
}
