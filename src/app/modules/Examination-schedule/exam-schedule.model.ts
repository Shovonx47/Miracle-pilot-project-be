import mongoose, { Model, Schema } from 'mongoose';
import { TExaminationSchedule } from './exam-schedule.interface';

const ExaminationScheduleSchema = new Schema<TExaminationSchedule>(
  {
    class: {
      type: String,
      required: [true, 'Class is required'],
      validate: {
        validator: function(v: string) {
          // Remove 'Class ' prefix if present and trim whitespace
          const classValue = v.replace(/^Class\s+/i, '').trim();
          
          // Convert Roman numeral to number if it's a Roman numeral
          const romanNumerals: { [key: string]: number } = {
            'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
            'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10
          };
          
          // Check if it's a Roman numeral
          if (romanNumerals[classValue.toUpperCase()]) {
            return true;
          }
          
          // If not Roman numeral, try parsing as number
          const classNumber = parseInt(classValue);
          return classNumber >= 1 && classNumber <= 10;
        },
        message: 'Class must be between 1 and 10 (as number or Roman numeral)'
      }
    },
    examName: {
      type: String,
      required: [true, 'Exam name is required'],
    },
    examYear: {
      type: String,
      required: [true, 'Exam year is required'],
    },
    examDate: {
      type: String,
      required: [true, 'Date is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    exams: [
      {
        courseName: {
          type: String,
          required: [true, 'Subject name is required'],
        },
        courseCode: {
          type: String,
          required: [true, 'Subject code is required'],
        },
        maxMark: {
          type: String,
          required: [true, 'Maximum mark is required'],
        },
        startTime: {
          type: String,
          required: [true, 'Start time is required'],
        },
        endTime: {
          type: String,
          required: [true, 'End time is required'],
        },
        durationMinutes: {
          type: String,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

ExaminationScheduleSchema.pre('find', function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

ExaminationScheduleSchema.pre('findOne', function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

ExaminationScheduleSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

export const ExaminationSchedule: Model<TExaminationSchedule> =
  mongoose.model<TExaminationSchedule>(
    'ExaminationSchedule',
    ExaminationScheduleSchema,
  );
