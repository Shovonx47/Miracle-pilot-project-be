import { Types } from 'mongoose';

export interface TAttendance {
  user: {
    id: Types.ObjectId;
    role: 'student' | 'teacher' | 'staff' | 'accountant';
    providedId: string;
  };
  designation?: string;
  full_name: string;
  date: string;
  day: string;

  present: boolean;
  absent: boolean;
  late_status: boolean;
}
