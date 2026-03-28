import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Category } from '../../../../core/models/task.model';

export type FilterCategory = Category;
export type { Category };

@Component({
  selector: 'app-filter-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="filter-bar" role="navigation" aria-label="Filter tasks by category">
      <button
        class="filter-bar__item"
        [class.filter-bar__item--active]="activeFilter() === 'all'"
        (click)="selectFilter('all')"
        aria-label="Show all tasks"
        [attr.aria-current]="activeFilter() === 'all' ? 'page' : null"
      >
        All
      </button>

      @for (cat of categories(); track cat.id) {
        <button
          class="filter-bar__item"
          [class.filter-bar__item--active]="activeFilter() === cat.id"
          (click)="selectFilter(cat.id)"
          [attr.aria-label]="'Show ' + cat.label + ' tasks'"
          [attr.aria-current]="activeFilter() === cat.id ? 'page' : null"
        >
          {{ cat.label }}
        </button>
      }
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }

    .filter-bar {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0;
      padding: var(--space-2) 0;
      border-bottom: var(--border-light);
      overflow-x: auto;
      scrollbar-width: none;
    }

    .filter-bar::-webkit-scrollbar {
      display: none;
    }

    .filter-bar__item {
      display: inline-flex;
      align-items: center;
      padding: var(--space-2) var(--space-3);
      min-height: 44px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1.5px;
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-normal);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: color var(--transition-fast), border-color var(--transition-fast);
      white-space: nowrap;
      border-radius: 0;
      outline: none;
    }

    .filter-bar__item:hover {
      color: var(--color-text);
      background: var(--color-bg-hover);
    }

    .filter-bar__item:focus-visible {
      outline: 2px solid var(--color-border);
      outline-offset: -2px;
    }

    .filter-bar__item--active {
      font-weight: var(--font-weight-bold);
      color: var(--color-text);
      border-bottom-color: var(--color-border);
    }
  `,
})
export class FilterBarComponent {
  categories = input<FilterCategory[]>([]);
  activeFilter = input<string>('all');
  filterChanged = output<string>();

  selectFilter(filterId: string): void {
    this.filterChanged.emit(filterId);
  }
}
