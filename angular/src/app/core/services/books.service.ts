import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { current_books_url, up_next_url } from '../../api-urls';
import {
  CurrentBook,
  CurrentBookRequest,
  UpNextBook,
  UpNextBookRequest,
} from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BooksService {
  private readonly http = inject(HttpClient);

  getCurrentBooks() {
    return this.http.get<CurrentBook[]>(current_books_url);
  }

  createCurrentBook(book: CurrentBookRequest) {
    return this.http.post<CurrentBook>(current_books_url, book);
  }

  updateCurrentBook(id: string, book: CurrentBookRequest) {
    return this.http.put<CurrentBook>(`${current_books_url}/${id}`, book);
  }

  deleteCurrentBook(id: string) {
    return this.http.delete<{ message: string }>(`${current_books_url}/${id}`);
  }

  currentBooksDownloadUrl(): string {
    return `${current_books_url}/download`;
  }

  getUpNextBooks() {
    return this.http.get<UpNextBook[]>(up_next_url);
  }

  createUpNextBook(book: UpNextBookRequest) {
    return this.http.post<UpNextBook>(up_next_url, book);
  }
}
