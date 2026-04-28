import { Component, TemplateRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { UpNextBook, UpNextBookRequest } from '../core/models/book.model';
import { BooksService } from '../core/services/books.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-header">
      <div>
        <span class="eyebrow">Queue</span>
        <h2>Up Next</h2>
      </div>
      <button class="btn btn-primary" type="button" (click)="openCreate(bookModal)">Add Book</button>
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
              <div><dt>Pages</dt><dd>{{ book.num_pages || '-' }}</dd></div>
              <div><dt>ISBN</dt><dd>{{ book.isbn || '-' }}</dd></div>
              <div><dt>Published</dt><dd>{{ book.publish_date || '-' }}</dd></div>
              <div><dt>Added</dt><dd>{{ book.added_date || '-' }}</dd></div>
            </dl>
          </article>
        } @empty {
          <p class="empty-state">No up-next books yet.</p>
        }
      </div>
    }

    <ng-template #bookModal let-modal>
      <div class="modal-header">
        <h3 class="modal-title">Add Up Next Book</h3>
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
            Publish Date
            <input class="form-control" type="date" formControlName="publish_date">
          </label>
          <label>
            Added Date
            <input class="form-control" type="date" formControlName="added_date">
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
export class UpNextComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BooksService);
  private readonly modal = inject(NgbModal);

  readonly books = signal<UpNextBook[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    genre: [''],
    isbn: [''],
    num_pages: [null as number | null],
    publish_date: [''],
    added_date: [''],
  });

  constructor() {
    this.loadBooks();
  }

  openCreate(template: TemplateRef<unknown>): void {
    this.form.reset({
      title: '',
      author: '',
      genre: '',
      isbn: '',
      num_pages: null,
      publish_date: '',
      added_date: '',
    });
    this.modal.open(template, { centered: true, size: 'lg' });
  }

  save(activeModal: { close: () => void }): void {
    if (this.form.invalid) {
      return;
    }

    this.saving.set(true);
    this.service
      .createUpNextBook(this.formPayload())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (book) => {
          this.books.update((books) => [...books, book]);
          activeModal.close();
        },
        error: (err) => this.error.set(err.error?.detail || 'Unable to save book.'),
      });
  }

  private loadBooks(): void {
    this.service
      .getUpNextBooks()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (books) => this.books.set(books),
        error: (err) => this.error.set(err.error?.detail || 'Unable to load up-next books.'),
      });
  }

  private formPayload(): UpNextBookRequest {
    const value = this.form.getRawValue();
    return {
      title: value.title,
      author: value.author,
      genre: this.blankToNull(value.genre),
      isbn: this.blankToNull(value.isbn),
      num_pages: value.num_pages,
      publish_date: this.blankToNull(value.publish_date),
      added_date: this.blankToNull(value.added_date),
    };
  }

  private blankToNull(value: string): string | null {
    return value.trim() ? value : null;
  }
}
