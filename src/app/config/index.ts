import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,

  SMTPHOST: process.env.SMTPHOST,
  SMTPPORT: process.env.SMTPPORT,
  SMTPUSER: process.env.SMTPUSER,
  SMTPPASS: process.env.SMTPPASS,
  SUPPORTEMAIL: process.env.SUPPORTEMAIL,


  student_class_time: process.env.STUDENT_CLASS_TIME,
  teacher_office_time: process.env.TEACHER_OFFICE_TIME,
  staff_office_time: process.env.STAFF_OFFICE_TIME,
  accountant_office_time: process.env.ACCOUNTANT_OFFICE_TIME,

  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_userId: process.env.SUPER_ADMIN_USERID

};
