import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <section class="page-header">
      <div>
        <span class="eyebrow">Shelf</span>
        <h2>Finished Books</h2>
      </div>
    </section>

    <section class="placeholder-panel">
      <p>No finished books have been added yet.</p>
    </section>
  `,
})
export class FinishedBooksComponent {}

@Component({
  standalone: true,
  template: `
    <section class="page-header">
      <div>
        <span class="eyebrow">Shelf</span>
        <h2>Favorite Books</h2>
      </div>
    </section>

    <section class="placeholder-panel">
      <p>No favorite books have been added yet.</p>
    </section>
  `,
})
export class FavoriteBooksComponent {}
