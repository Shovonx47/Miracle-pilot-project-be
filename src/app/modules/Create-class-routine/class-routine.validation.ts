import { z } from 'zod';
import { Days } from './class-routine.const';

const timeStringSchema = z.string().refine(
  (time) => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // 00-09 10-19 20-23
    return regex.test(time);
  },
  {
    message: 'Invalid time format , expected "HH:MM" in 24 hours format',
  },
);

const classRoutineValidationSchema = z.object({
  body: z
    .object({
      class: z.string({ required_error: 'Class is required' }),

      section: z.string({ required_error: 'Section is required' }),

      teacherName: z.string({ required_error: 'Teacher name is required' }),
      subjectCode: z.string({ required_error: 'Subject code is required' }),
      subjectName: z.string({ required_error: 'Subject name is required' }),
      days: z.array(z.enum([...Days] as [string, ...string[]], {
        invalid_type_error: 'Invalid day',
      })).min(1, 'At least one day must be selected'),
      startTime: timeStringSchema,
      endTime: timeStringSchema,
      roomNumber: z.string({ required_error: 'Room number is required' }),
      buildingName: z.string().optional(),
      isOptional: z.boolean({ required_error: 'Optional field is required' }),
      createdBy: z.string({ required_error: 'Created by field is required' }),
      isDeleted: z.boolean().default(false),
    })
    .refine(
      (body) => {
        // startTime : 10:30  => 1970-01-01T10:30
        //endTime : 12:30  =>  1970-01-01T12:30

        const start = new Date(`1970-01-01T${body.startTime}:00`);
        const end = new Date(`1970-01-01T${body.endTime}:00`);

        return end > start;
      },
      {
        message: 'Start time must be earlier than end time.',
      },
    ),
});
const updateClassRoutineValidationSchema = z.object({
  body: z
    .object({
      class: z.string({ required_error: 'Class is required' }).optional(),

      section: z.string({ required_error: 'Section is required' }).optional(),

      teacherName: z
        .string({ required_error: 'Teacher name is required' })
        .optional(),
      subjectCode: z
        .string({ required_error: 'Subject code is required' })
        .optional(),
      subjectName: z
        .string({ required_error: 'Subject name is required' })
        .optional(),
      days: z
        .array(z.enum([...Days] as [string, ...string[]], {
          invalid_type_error: 'Invalid day',
        }))
        .min(1, 'At least one day must be selected')
        .optional(),
      startTime: timeStringSchema.optional(),
      endTime: timeStringSchema.optional(),
      roomNumber: z
        .string({ required_error: 'Room number is required' })
        .optional(),
      buildingName: z.string().optional(),
      isOptional: z
        .boolean({ required_error: 'Optional field is required' })
        .optional(),
      createdBy: z
        .string({ required_error: 'Created by field is required' })
        .optional(),
    })
    .refine(
      (body) => {
        // startTime : 10:30  => 1970-01-01T10:30
        //endTime : 12:30  =>  1970-01-01T12:30

        const start = new Date(`1970-01-01T${body.startTime}:00`);
        const end = new Date(`1970-01-01T${body.endTime}:00`);

        return end > start;
      },
      {
        message: 'Start time must be earlier than end time.',
      },
    )
    .optional(),
});

export const classRoutineValidation = {
  classRoutineValidationSchema,
  updateClassRoutineValidationSchema,
};
