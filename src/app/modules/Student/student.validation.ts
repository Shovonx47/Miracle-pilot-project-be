import { z } from 'zod';

const siblingSchema = z.object({
  siblingName: z.string().optional(),
  class: z.string().optional(),
  section: z.string().optional(),
  gender: z.string().optional(),
  roll: z.string().optional(),
  motherTongue: z.string().optional(),
});

const studentValidationSchema = z.object({
  body: z.object({
    userId: z.string({ required_error: 'User ID is required' }),
    profileImage: z.union([z.string(), z.null()]).optional(),
    academicYear: z.string({ required_error: 'Academic year is required' }),
    admissionDate: z.string({ required_error: 'Admission date is required' }),
    status: z.enum(['Active', 'Inactive'], {
      required_error: 'Status is required',
      invalid_type_error: 'Invalid status selected',
    }),
    category: z.string({ required_error: 'Category is required' }),
    firstName: z.string({ required_error: 'First name is required' }),
    lastName: z.string({ required_error: 'Last name is required' }),
    class: z.string({ required_error: 'Class is required' }),
    section: z.string({ required_error: 'Section is required' }),
    gender: z.string({ required_error: 'Gender is required' }),
    dateOfBirth: z.string({ required_error: 'Date of birth is required' }),
    bloodGroup: z.string({ required_error: 'Blood group is required' }),
    religion: z.string({ required_error: 'Religion is required' }),
    contactNumber: z.string({ required_error: 'Contact number is required' }),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address'),
    board: z.string({ required_error: 'Board is required' }),
    motherTongue: z.string({ required_error: 'Mother tongue is required' }),

    presentAddress: z.string({ required_error: 'Present address is required' }),
    permanentAddress: z.string({
      required_error: 'Permanent address is required',
    }),

    previousSchoolName: z.string().optional(),
    previousClassName: z.string().optional(),
    previousSchoolAddress: z.string().optional(),
    previousClassGpa: z.string().optional(),
    siblings: z.array(siblingSchema).optional(),

    fatherName: z.string({ required_error: "Father's name is required" }),
    fatherEmail: z
      .string({ required_error: "Father's email is required" })
      .email(),
    fatherContactNumber: z.string({
      required_error: "Father's contact number is required",
    }),
    fatherOccupation: z.string({
      required_error: "Father's occupation is required",
    }),
    fatherNidNumber: z.string({
      required_error: "Father's NID number is required",
    }),

    motherName: z.string({ required_error: "Mother's name is required" }),
    motherEmail: z
      .string({ required_error: "Mother's email is required" })
      .email(),
    motherContactNumber: z.string({
      required_error: "Mother's contact number is required",
    }),
    motherOccupation: z.string({
      required_error: "Mother's occupation is required",
    }),
    motherNidNumber: z.string({
      required_error: "Mother's NID number is required",
    }),

    localGuardianName: z.string().optional(),
    relationshipWithLocalGuardian: z.string().optional(),
    localGuardianEmail: z.string().email().optional(),
    localGuardianContactNumber: z.string().optional(),
    localGuardianOccupation: z.string().optional(),
    localGuardianNidNumber: z.string().optional(),

    route: z.string().optional(),
    vehicleNumber: z.string().optional(),
    pickupPoint: z.string().optional(),

    hostelName: z.string().optional(),
    roomNumber: z.string().optional(),

    transferCertificate: z.union([z.string(), z.null()]).optional(),
    birthCertificate: z.union([z.string(), z.null()]).optional(),
  }),
});

const updateStudentValidationSchema = studentValidationSchema.deepPartial();

export const studentValidation = {
  studentValidationSchema,
  updateStudentValidationSchema,
};
