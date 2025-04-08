import express from 'express';
import { NoticeController } from './notice.controller';
import validateRequest from '../../middlewares/validateRequest';
import { NoticeValidation } from './notice.validation';

const router = express.Router();

router.get('/', NoticeController.getAllNotices);

router.post(
  '/',
  validateRequest(NoticeValidation.createNoticeZodSchema),
  NoticeController.createNotice
);

router.get('/:id', NoticeController.getSingleNotice);

router.patch(
  '/:id',
  validateRequest(NoticeValidation.updateNoticeZodSchema),
  NoticeController.updateNotice
);

router.delete('/:id', NoticeController.deleteNotice);

export const NoticeRoutes = router;