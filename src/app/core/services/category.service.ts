import { Injectable, signal } from '@angular/core';
import { Category } from '../models/task.model';

const SEED_CATEGORIES: Category[] = [
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'health', label: 'Health' },
  { id: 'learning', label: 'Learning' },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly _categories = signal<Category[]>(SEED_CATEGORIES);

  readonly categories = this._categories.asReadonly();

  getCategories(): Category[] {
    return this._categories();
  }
}
