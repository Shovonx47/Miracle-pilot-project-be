import { z } from 'zod';

const createNoticeZodSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }),
    date: z.string({
      required_error: 'Date is required',
    }),
    color: z.enum(['bg-blue-200', 'bg-red-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200'], {
      required_error: 'Color is required',
    }),
  }),
});

const updateNoticeZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    date: z.string().optional(),
    color: z.enum(['bg-blue-200', 'bg-red-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200']).optional(),
  }),
});

export const NoticeValidation = {
  createNoticeZodSchema,
  updateNoticeZodSchema,
};