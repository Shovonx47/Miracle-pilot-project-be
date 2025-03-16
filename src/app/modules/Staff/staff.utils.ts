import { Staff } from './staff.model';

const findLastStaffIdForYear = async (year: string) => {
  const lastStaff = await Staff.findOne({
    staffId: new RegExp(`ST-${year}`), // Match IDs starting with T-YY
  })
    .sort({ createdAt: -1 }) // Get the most recent Staff for the year
    .select('staffId')
    .lean();

  return lastStaff?.staffId ? lastStaff.staffId.substring(5) : undefined;
};

export const generateStaffId = async (joiningDate: string) => {
  const year = new Date(joiningDate)
    .getFullYear()
    .toString()
    .slice(-2);  // Extract last two digits of the year

  let currentId = await findLastStaffIdForYear(year);

  if (!currentId) {
    // If no Staff exists for the given year, start from '0001'
    currentId = '0000';
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  return `ST-${year}${incrementId}`;
};
