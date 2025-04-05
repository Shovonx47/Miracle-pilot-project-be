import mongoose, { Schema, Error } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config';
import { TUserExtends, UserModel } from './auth.interface';

const authSchema: Schema<TUserExtends> = new Schema<TUserExtends>(
  {
    userId: {
      type: String,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'Email is required'],
    },
    password: {
      type: String,
      trim: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: [
        'user',
        'teacher',
        'student',
        'staff',
        'accountant',
        'admin',
        'super_admin',
      ],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'block'],
      default: 'active',
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    otp: {
      type: String,
    },
    otpExpireDate: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure the passwords match
authSchema.pre('save', function (next) {
  // Concatenate firstName and lastName into name
  this.name = `${this.firstName} ${this.lastName}`.trim();

  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
    (err: Error | undefined, hash: string) => {
      if (err) {
        return next(err);
      }
      this.password = hash;
      next();
    },
  );
});

authSchema.pre('find', function (next) {
  this.where({ status: { $ne: 'block' } });
  next();
});

authSchema.pre('findOne', function (next) {
  this.where({ status: { $ne: 'block' } });
  next();
});

authSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { status: { $ne: 'block' } } });
  next();
});

// Method to compare passwords
authSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  const check = await bcrypt.compare(password, this.password);

  return check;
};

authSchema.set('toJSON', {
  transform: function (_doc, ret) {
    delete ret.password;
    return ret;
  },
});

authSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await Auth.findOne({ email }).select('+password');
};

authSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const Auth: UserModel = mongoose.model<TUserExtends, UserModel>(
  'Auth',
  authSchema,
);
