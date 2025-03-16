import mongoose, { Schema } from 'mongoose';
import { TAttendance } from './attendance.interface';

const attendanceSchema: Schema<TAttendance> = new Schema<TAttendance>(
  {
    user: {
      id: {
        type: Schema.Types.ObjectId,
        required: [true, 'User ID is required.'],
        refPath: 'user.role', // Dynamic reference based on role
      },
      role: {
        type: String,
        enum: ['student', 'teacher', 'staff', 'accountant'],
        required: [true, 'User role is required.'],
      },
      providedId: {
        type: String,
        required: [true, 'Provided Id is required.'],
      },
    },
    full_name: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
    },
    designation: {
      type: String,
      required: [false, 'Designation is required.'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required.'],
    },
    present: {
      type: Boolean,
      default: false,
    },
    absent: {
      type: Boolean,
      default: false,
    },
    office_time: {
      type: String,
       
    },
    in_time: {
      type: String,
    },
    out_time: {
      type: String,
      
    },
    late_status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);


attendanceSchema.pre('save', function (next) {
  if (this.in_time && this.out_time && this.in_time < this.out_time) {
    const err = new Error('In time must not be earlier than Out time.');
    next(err);
  } else {
    next();
  }
});
// Create and export the Attendance model
export const Attendance = mongoose.model<TAttendance>(
  'Attendance',
  attendanceSchema,
);
