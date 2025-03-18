import mongoose, { Model, Schema } from 'mongoose';
import { TAccountOfficer, TExperiences } from './account_officer.interface';

const ExperiencesSchema = new Schema<TExperiences>(
  {
    organizationName: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    designation: { type: String },
    address: { type: String },
  },
  {
    _id: false,
  },
);

const AccountOfficerSchema = new Schema<TAccountOfficer>(
  {
    auth: { type: Schema.Types.ObjectId, ref: 'Auth' },
    attendance: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Attendance',
      },
    ],
    userId: { type: String, required: [true, 'User ID is required.'] },
    accountantId: {
      type: String,
      required: [true, 'Accountant ID is required.'],
    },
    profileImage: {
      type: String,
      required: [true, 'Profile image is required.'],
    },
    firstName: { type: String, required: [true, 'First name is required.'] },
    lastName: { type: String, required: [true, 'Last name is required.'] },
    category: { type: String, required: [true, 'Category is required.'] },
    joiningDate: {
      type: String,
      required: [true, 'Joining date is required.'],
    },
    gender: { type: String, required: [true, 'Gender is required.'] },
    dateOfBirth: {
      type: String,
      required: [true, 'Date of birth is required.'],
    },
    bloodGroup: { type: String, required: [true, 'Blood group is required.'] },
    maritalStatus: {
      type: String,
      required: [true, 'Marital status is required.'],
    },
    religion: { type: String, required: [true, 'Religion is required.'] },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required.'],
    },
    alternativeContactNumber: { type: String },
    email: { type: String, required: [true, 'Email is required.'], unique: true },
    nidNumber: { type: String, required: [true, 'NID number is required.'] },
    educationalQualification: {
      type: String,
      required: [true, 'Educational qualification is required.'],
    },
    motherTongue: {
      type: String,
      required: [true, 'Mother tongue is required.'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      required: [true, 'Status is required.'],
    },

    EPFNo: { type: String },
    basicSalary: {
      type: String,
      required: [true, 'Basic salary is required.'],
    },
    workLocation: {
      type: String,
      required: [true, 'Work location is required.'],
    },
    contractType: {
      type: String,
      required: [true, 'Contract type is required.'],
    },
    workShift: { type: String, required: [true, 'Work shift is required.'] },

    fatherName: {
      type: String,
      required: [true, "Father's name is required."],
    },
    fatherEmail: {
      type: String,
      required: [true, "Father's email is required."],
    },
    fatherContactNumber: {
      type: String,
      required: [true, "Father's contact number is required."],
    },
    fatherOccupation: {
      type: String,
      required: [true, "Father's occupation is required."],
    },
    fatherNidNumber: {
      type: String,
      required: [true, "Father's NID number is required."],
    },

    motherName: {
      type: String,
      required: [true, "Mother's name is required."],
    },
    motherEmail: {
      type: String,
      required: [true, "Mother's email is required."],
    },
    motherContactNumber: {
      type: String,
      required: [true, "Mother's contact number is required."],
    },
    motherOccupation: {
      type: String,
      required: [true, "Mother's occupation is required."],
    },
    motherNidNumber: {
      type: String,
      required: [true, "Mother's NID number is required."],
    },

    presentAddress: {
      type: String,
      required: [true, 'Present address is required.'],
    },
    permanentAddress: {
      type: String,
      required: [true, 'Permanent address is required.'],
    },

    accountName: {
      type: String,
      required: [true, 'Account name is required.'],
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required.'],
    },
    bankName: { type: String, required: [true, 'Bank name is required.'] },
    IFSCCode: { type: String, required: [true, 'IFSC code is required.'] },
    branchName: { type: String, required: [true, 'Branch name is required.'] },

    route: { type: String },
    vehicleNumber: { type: String },
    pickupPoint: { type: String },

    hostelName: { type: String },
    roomNumber: { type: String },

    hasExperience: {
      type: Boolean,
      required: [true, 'Experience status is required.'],
    },
    experiences: { type: [ExperiencesSchema], required: false },

    resume: { type: String, required: [true, 'Resume is required.'] },
    joiningLetter: {
      type: String,
      required: [true, 'Joining letter is required.'],
    },

    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

AccountOfficerSchema.pre('find', function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

AccountOfficerSchema.pre('findOne', function (next) {
  this.where({ isDeleted: { $ne: true }, status: 'Active' });
  next();
});

AccountOfficerSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { isDeleted: { $ne: true }, status: 'Active' },
  });
  next();
});

export const AccountOfficer: Model<TAccountOfficer> =
  mongoose.model<TAccountOfficer>('AccountOfficer', AccountOfficerSchema);
