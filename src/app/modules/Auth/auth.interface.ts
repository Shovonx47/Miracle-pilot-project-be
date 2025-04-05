import { Model } from 'mongoose';
import { USER_ROLE } from './auth.const';

export type TUser = {
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  password: string;
  passwordChangedAt?: Date;
  role:
  | 'user'
  | 'teacher'
  | 'student'
  | 'staff'
  | 'accountant'
  | 'admin'
  | 'super_admin';
  status: 'active' | 'block';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isDeleted: boolean;
  isCompleted: boolean;

  otp: string;
  otpExpireDate: Date;
};
export type TUserForLogin = {
  auth: string;
  password: string;
};

export type TUserExtends = Document &
  TUser & {
    comparePassword(candidatePassword: string): Promise<boolean>;
  };

export interface UserModel extends Model<TUserExtends> {
  isUserExistsByEmail(email: string): Promise<TUser | null>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

export type Action =
  | 'send-verify-code'
  | 'verify-otp'
  | 'update-forgot-password';

export type TUserRole = keyof typeof USER_ROLE;

export type UserPayload = Partial<Record<keyof TUser, TUser[keyof TUser]>>;
