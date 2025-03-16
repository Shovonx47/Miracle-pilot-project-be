import { AccountOfficer } from './account_officer.model';

const findLastAccountantIdForYear = async (year: string) => {
  const lastAccountant = await AccountOfficer.findOne({
    accountantId: new RegExp(`AO-${year}`), // Match IDs starting with T-YY
  })
    .sort({ createdAt: -1 }) // Get the most recent Staff for the year
    .select('accountantId')
    .lean();

  return lastAccountant?.accountantId
    ? lastAccountant.accountantId.substring(5)
    : undefined;
};

export const generateAccountantId = async (joiningDate: string) => {
  const year = new Date(joiningDate)
  .getFullYear()
  .toString()
  .slice(-2); // Extract last two digits of the year

  let currentId = await findLastAccountantIdForYear(year);

  if (!currentId) {
    // If no Staff exists for the given year, start from '0001'
    currentId = '0000';
  }

  const incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  return `AO-${year}${incrementId}`;
};
