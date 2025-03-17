import { Teacher } from './teacher.model';

const findLastTeacherIdForYear = async (year: string) => {
  const lastTeacher = await Teacher.findOne({
    teacherId: new RegExp(`T-${year}`), // Match IDs starting with T-YY
  })
    .sort({ createdAt: -1 }) // Get the most recent teacher for the year
    .select('teacherId')
    .lean();

  return lastTeacher?.teacherId
    ? lastTeacher.teacherId.substring(4)
    : undefined;
};

export const generateTeacherId = async (joiningDate: string) => {

  const year = new Date(joiningDate)
    .getFullYear()
    .toString()
    .slice(-2); // Extract last two digits of the year

  let currentId = await findLastTeacherIdForYear(year);

  if (!currentId) {
    // If no teacher exists for the given year, start from '0001'
    currentId = '0000';
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  return `T-${year}${incrementId}`;
};
