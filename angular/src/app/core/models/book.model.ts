export interface Book {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  num_pages: number | null;
  genre: string | null;
  isbn: string | null;
  publish_date: string | null;
}

export interface CurrentBook extends Book {
  startDate: string;
  current_page: number | null;
}

export interface UpNextBook extends Book {
  added_date: string | null;
}

export type CurrentBookRequest = Omit<CurrentBook, '_id' | 'id'>;
export type UpNextBookRequest = Omit<UpNextBook, '_id' | 'id'>;
