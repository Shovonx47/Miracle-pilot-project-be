import mongoose, { Model, Schema } from 'mongoose';
import { TClassRoutine } from './class-routine.interface';
import { Days } from './class-routine.const';

const ClassRoutineSchema = new Schema<TClassRoutine>(
  {
    class: { type: String, required: [true, 'Class is required'] },
    section: { type: String, required: [false, 'Section is required'] },
    teacherName: { type: String, required: [true, 'Teacher name is required'] },
    subjectCode: { type: String, required: [true, 'Subject code is required'] },
    subjectName: { type: String, required: [true, 'Subject name is required'] },
    days: {
      type: [String],
      enum: Days,
      required: [true, 'At least one day is required'],
      validate: {
        validator: function(v: string[]) {
          return v.length > 0;
        },
        message: 'At least one day must be selected'
      }
    },
    startTime: { type: String, required: [true, 'Start time is required'] },
    endTime: { type: String, required: [true, 'End time is required'] },
    roomNumber: { type: String, required: [true, 'Room number is required'] },
    buildingName: { type: String },
    isOptional: {
      type: Boolean,
      required: [true, 'Optional field is required'],
    },
    createdBy: {
      type: String,
      required: [true, 'Created by field is required'],
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

ClassRoutineSchema.pre('find', function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

ClassRoutineSchema.pre('findOne', function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

ClassRoutineSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

export const ClassRoutine: Model<TClassRoutine> = mongoose.model<TClassRoutine>(
  'ClassRoutine',
  ClassRoutineSchema,
);
