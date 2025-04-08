import { Schema, model } from 'mongoose';
import { INotice } from './notice.interface';

const noticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Notice date is required'],
    },
    color: {
      type: String,
      required: [true, 'Notice color is required'],
      enum: ['bg-blue-200', 'bg-red-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Notice = model<INotice>('Notice', noticeSchema);