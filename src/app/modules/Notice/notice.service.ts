import { SortOrder } from 'mongoose';
import { INotice, INoticeFilters } from './notice.interface';
import { Notice } from './notice.model';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';

const createNotice = async (payload: INotice): Promise<INotice> => {
  const result = await Notice.create(payload);
  return result;
};

const getAllNotices = async (filters: INoticeFilters) => {
  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: ['title'].map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Notice.find(whereConditions).sort({ createdAt: -1 });

  return {
    data: result,
  };
};

const getSingleNotice = async (id: string): Promise<INotice | null> => {
  const result = await Notice.findById(id);
  return result;
};

const updateNotice = async (
  id: string,
  payload: Partial<INotice>
): Promise<INotice | null> => {
  const result = await Notice.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

const deleteNotice = async (id: string): Promise<INotice | null> => {
  const result = await Notice.findByIdAndDelete(id);
  return result;
};

export const NoticeService = {
  createNotice,
  getAllNotices,
  getSingleNotice,
  updateNotice,
  deleteNotice,
};