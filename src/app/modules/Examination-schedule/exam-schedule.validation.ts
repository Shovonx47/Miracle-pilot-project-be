import { z } from 'zod';

const timeStringSchema = z.string().refine(
  (time) => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM format
    return regex.test(time);
  },
  {
    message: 'Invalid time format, expected "HH:MM" in 24-hour format',
  },
);

const examSchema = z
  .object({
    courseName: z.string({ required_error: 'Subject name is required' }),
    courseCode: z.string({ required_error: 'Subject code is required' }),
    maxMark: z.string({ required_error: 'Maximum mark is required' }),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
  })
  .refine(
    (exam) => {
      const start = new Date(`1970-01-01T${exam.startTime}:00`);
      const end = new Date(`1970-01-01T${exam.endTime}:00`);
      return end > start;
    },
    {
      message: 'End time must be after start time.',
      path: ['endTime'], // Highlight the issue specifically in `endTime`
    },
  );

const romanToNumber = (roman: string) => {
  // Remove 'Class ' prefix if present and trim whitespace
  const cleanedRoman = roman.replace(/^Class\s+/i, '').trim();
  const romanValues: { [key: string]: number } = {
    'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
    'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10
  };
  return romanValues[cleanedRoman.toUpperCase()];
};

const examScheduleValidationSchema = z.object({
  body: z.object({
    class: z.string({ required_error: 'Class is required' }).refine(
      (value) => {
        // Handle both numeric and Roman numeral values
        const numericValue = /^\d+$/.test(value) ? parseInt(value) : romanToNumber(value);
        return numericValue && numericValue >= 1 && numericValue <= 10;
      },
      { message: 'Class must be between 1 and 10 (or I to X)' }
    ),
    examName: z.string({ required_error: 'Exam name is required' }),
    examYear: z.string({ required_error: 'Exam year is required' }),
    examDate: z.string({ required_error: 'Date is required' }).refine(
      (value) => {
        // Validate date format (DD-MM-YYYY or YYYY-MM-DD)
        const dateRegex = /^(\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2})$/;
        if (!dateRegex.test(value)) return false;
        const date = new Date(value.split('-').reverse().join('-'));
        return !isNaN(date.getTime());
      },
      { message: 'Invalid date format. Use DD-MM-YYYY or YYYY-MM-DD' }
    ),
    description: z.string({ required_error: 'Description is required' }),
    exams: z.array(examSchema),
    isDeleted: z.boolean().default(false),
  }),
});

const updateExamScheduleValidationSchema = z.object({
  body: z.object({
    class: z.string({ required_error: 'Class is required' })
      .refine(
        (value) => {
          const numericValue = /^\d+$/.test(value) ? parseInt(value) : romanToNumber(value);
          return numericValue && numericValue >= 1 && numericValue <= 10;
        },
        { message: 'Class must be between 1 and 10 (or I to X)' }
      )
      .optional(),
    examName: z.string({ required_error: 'Exam name is required' }).optional(),
    examYear: z.string({ required_error: 'Exam year is required' }).optional(),
    examDate: z.string({ required_error: 'Date is required' }).optional(),
    description: z.string({ required_error: 'Description is required' }).optional(),
    exams: z.array(examSchema).optional(),
  }),
});

export const examScheduleValidation = {
  examScheduleValidationSchema,
  updateExamScheduleValidationSchema,
};
