export interface INotice {
  title: string;
  date: string;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INoticeFilters {
  searchTerm?: string;
  date?: string;
}