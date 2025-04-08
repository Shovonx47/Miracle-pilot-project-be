import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NoticeService } from './notice.service';
import { INotice } from './notice.interface';
import AppError from '../../errors/AppError';

const createNotice = catchAsync(async (req: Request, res: Response) => {
  const result = await NoticeService.createNotice(req.body);

  sendResponse<INotice>(res, {
    statusCode: 201,
    success: true,
    message: 'Notice created successfully',
    data: result,
  });
});

const getAllNotices = catchAsync(async (req: Request, res: Response) => {
  const result = await NoticeService.getAllNotices(req.query);

  sendResponse<INotice[]>(res, {
    statusCode: 200,
    success: true,
    message: 'Notices retrieved successfully',
    data: result.data,
  });
});

const getSingleNotice = catchAsync(async (req: Request, res: Response) => {
  const result = await NoticeService.getSingleNotice(req.params.id);
  
  if (!result) {
    throw new AppError(404, 'Notice not found');
  }

  sendResponse<INotice>(res, {
    statusCode: 200,
    success: true,
    message: 'Notice retrieved successfully',
    data: result,
  });
});

const updateNotice = catchAsync(async (req: Request, res: Response) => {
  const result = await NoticeService.updateNotice(req.params.id, req.body);

  if (!result) {
    throw new AppError(404, 'Notice not found');
  }

  sendResponse<INotice>(res, {
    statusCode: 200,
    success: true,
    message: 'Notice updated successfully',
    data: result,
  });
});

const deleteNotice = catchAsync(async (req: Request, res: Response) => {
  const result = await NoticeService.deleteNotice(req.params.id);

  if (!result) {
    throw new AppError(404, 'Notice not found');
  }

  sendResponse<INotice>(res, {
    statusCode: 200,
    success: true,
    message: 'Notice deleted successfully',
    data: result,
  });
});

export const NoticeController = {
  createNotice,
  getAllNotices,
  getSingleNotice,
  updateNotice,
  deleteNotice,
};