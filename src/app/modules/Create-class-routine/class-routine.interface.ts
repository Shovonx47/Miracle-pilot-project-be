export type TDays =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface TClassRoutine {
  teacherName: string;
  subjectName: string;
  subjectCode: string;
  class: string;
  section: string;
  days: TDays[];
  startTime: string; // Format: "HH:mm" or "10:00 AM"
  endTime: string; // Format: "HH:mm" or "11:00 AM"
  roomNumber: string;
  buildingName?: string; // Optional field
  isOptional: boolean;
  createdBy: string; // Admin ID
  isDeleted: boolean;
}
