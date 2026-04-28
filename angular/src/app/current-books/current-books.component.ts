import { Component, TemplateRef, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { Book, CurrentBook, CurrentBookRequest } from '../core/models/book.model';
import { BooksService } from '../core/services/books.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-header">
      <div>
        <span class="eyebrow">Shelf</span>
        <h2>Current Books</h2>
      </div>
      <div class="actions">
        <a class="btn btn-outline-secondary" [href]="downloadUrl">Download</a>
        <button class="btn btn-primary" type="button" (click)="openCreate(bookModal)">Add Book</button>
      </div>
    </section>

    @if (error()) {
      <div class="alert alert-danger">{{ error() }}</div>
    }

    @if (loading()) {
      <div class="loading-row"><span class="spinner-border text-primary" aria-hidden="true"></span></div>
    } @else {
      <div class="book-grid">
        @for (book of books(); track book._id || book.id || book.title) {
          <article class="book-card">
            <div class="book-card-header">
              <h3>{{ book.title }}</h3>
              <span class="badge text-bg-light">{{ book.genre || 'Uncategorized' }}</span>
            </div>
            <dl>
              <div><dt>Author</dt><dd>{{ book.author }}</dd></div>
              <div><dt>Pages</dt><dd>{{ book.current_page || 0 }} / {{ book.num_pages || '-' }}</dd></div>
              <div><dt>ISBN</dt><dd>{{ book.isbn || '-' }}</dd></div>
              <div><dt>Published</dt><dd>{{ book.publish_date || '-' }}</dd></div>
              <div><dt>Started</dt><dd>{{ book.startDate }}</dd></div>
            </dl>
            <div class="card-actions">
              <button class="btn btn-outline-primary btn-sm" type="button" (click)="openEdit(bookModal, book)">
                Edit
              </button>
              <button class="btn btn-outline-danger btn-sm" type="button" (click)="deleteBook(book)">
                Delete
              </button>
            </div>
          </article>
        } @empty {
          <p class="empty-state">No current books yet.</p>
        }
      </div>
    }

    <ng-template #bookModal let-modal>
      <div class="modal-header">
        <h3 class="modal-title">{{ editingId() ? 'Edit Book' : 'Add Book' }}</h3>
        <button type="button" class="btn-close" aria-label="Close" (click)="modal.dismiss()"></button>
      </div>
      <form [formGroup]="form" (ngSubmit)="save(modal)">
        <div class="modal-body form-grid">
          <label>
            Title
            <input class="form-control" formControlName="title">
          </label>
          <label>
            Author
            <input class="form-control" formControlName="author">
          </label>
          <label>
            Genre
            <input class="form-control" formControlName="genre">
          </label>
          <label>
            ISBN
            <input class="form-control" formControlName="isbn">
          </label>
          <label>
            Number of Pages
            <input class="form-control" type="number" formControlName="num_pages">
          </label>
          <label>
            Current Page
            <input class="form-control" type="number" formControlName="current_page">
          </label>
          <label>
            Publish Date
            <input class="form-control" type="date" formControlName="publish_date">
          </label>
          <label>
            Start Date
            <input class="form-control" type="date" formControlName="startDate">
          </label>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" (click)="modal.dismiss()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
            @if (saving()) {
              <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            }
            Save
          </button>
        </div>
      </form>
    </ng-template>
  `,
})
export class CurrentBooksComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BooksService);
  private readonly modal = inject(NgbModal);

  readonly books = signal<CurrentBook[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly editingId = signal<string | null>(null);
  readonly downloadUrl = this.service.currentBooksDownloadUrl();

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    genre: [''],
    isbn: [''],
    num_pages: [null as number | null],
    publish_date: [''],
    startDate: ['', Validators.required],
    current_page: [null as number | null],
  });

  constructor() {
    this.loadBooks();
  }

  openCreate(template: TemplateRef<unknown>): void {
    this.editingId.set(null);
    this.form.reset({
      title: '',
      author: '',
      genre: '',
      isbn: '',
      num_pages: null,
      publish_date: '',
      startDate: '',
      current_page: null,
    });
    this.modal.open(template, { centered: true, size: 'lg' });
  }

  openEdit(template: TemplateRef<unknown>, book: CurrentBook): void {
    this.editingId.set(book._id || book.id || null);
    this.form.reset({
      title: book.title,
      author: book.author,
      genre: book.genre || '',
      isbn: book.isbn || '',
      num_pages: book.num_pages,
      publish_date: book.publish_date || '',
      startDate: book.startDate,
      current_page: book.current_page,
    });
    this.modal.open(template, { centered: true, size: 'lg' });
  }

  save(activeModal: { close: () => void }): void {
    if (this.form.invalid) {
      return;
    }

    const payload = this.formPayload();
    const id = this.editingId();
    const request = id
      ? this.service.updateCurrentBook(id, payload)
      : this.service.createCurrentBook(payload);

    this.saving.set(true);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (book) => {
        this.books.update((books) =>
          id ? books.map((item) => (this.bookId(item) === id ? book : item)) : [...books, book],
        );
        activeModal.close();
      },
      error: (err) => this.error.set(err.error?.detail || 'Unable to save book.'),
    });
  }

  deleteBook(book: CurrentBook): void {
    const id = this.bookId(book);
    if (!id || !confirm(`Delete "${book.title}"?`)) {
      return;
    }

    this.service.deleteCurrentBook(id).subscribe({
      next: () => this.books.update((books) => books.filter((item) => this.bookId(item) !== id)),
      error: (err) => this.error.set(err.error?.detail || 'Unable to delete book.'),
    });
  }

  private loadBooks(): void {
    this.service
      .getCurrentBooks()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (books) => this.books.set(books),
        error: (err) => this.error.set(err.error?.detail || 'Unable to load current books.'),
      });
  }

  private formPayload(): CurrentBookRequest {
    const value = this.form.getRawValue();
    return {
      title: value.title,
      author: value.author,
      genre: this.blankToNull(value.genre),
      isbn: this.blankToNull(value.isbn),
      num_pages: value.num_pages,
      publish_date: this.blankToNull(value.publish_date),
      startDate: value.startDate,
      current_page: value.current_page,
    };
  }

  private bookId(book: Book): string | null {
    return book._id || book.id || null;
  }

  private blankToNull(value: string): string | null {
    return value.trim() ? value : null;
  }
}
