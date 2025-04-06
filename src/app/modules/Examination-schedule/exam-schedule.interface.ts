export interface TExaminationSchedule {
  class: string; // Optional: Class name, e.g., "10th Grade"
  examName: string;
  examYear: string;
  examDate: string; // Optional: Name of the exam term, e.g., "Mid-Term"
  date: string; // Required: Date of the exam
  description: string;
  exams: Array<{
    courseName: string;
    courseCode: string;
    maxMark: string;
    startTime: string;
    endTime: string;
    durationMinutes: string;
  }>;
  isDeleted: boolean; // Optional: Flag for soft deletion (default: false)
}
