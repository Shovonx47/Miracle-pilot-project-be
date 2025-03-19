import { Router } from 'express';
import { TransactionTypeController } from './transactionType.controller';

const router = Router();

router
  .route('/')
  .post(TransactionTypeController.createTransactionType)
  .get(TransactionTypeController.getAllTransactionTypes);

router
  .route('/:id')
  .get(TransactionTypeController.getSingleTransactionType)
  .put(TransactionTypeController.updateTransactionType)
  .delete(TransactionTypeController.deleteTransactionType);

export const TransactionTypeRoutes = router;
