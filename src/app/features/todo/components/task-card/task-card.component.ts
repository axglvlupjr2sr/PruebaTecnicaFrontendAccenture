import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonCheckbox, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  categoryId: string;
  categoryLabel?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-task-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonCheckbox, IonIcon],
  template: `
    <div class="task-card">
      <!-- Left: Checkbox -->
      <ion-checkbox
        class="task-card__checkbox"
        [checked]="task().completed"
        (ionChange)="onToggle()"
        [attr.aria-label]="'Mark ' + task().title + ' as ' + (task().completed ? 'incomplete' : 'complete')"
      ></ion-checkbox>

      <!-- Center: Title + Category -->
      <div class="task-card__content">
        <span
          class="task-card__title"
          [class.task-completed]="task().completed"
        >
          {{ task().title }}
        </span>

        @if (task().categoryLabel) {
          <span class="notion-badge task-card__category">
            {{ task().categoryLabel }}
          </span>
        }
      </div>

      <!-- Right: Priority badge + Delete -->
      <div class="task-card__actions">
        @if (showPriorityBadge() && task().priority) {
          <span
            class="notion-badge task-card__priority"
            [class.task-card__priority--high]="task().priority === 'high'"
            [class.task-card__priority--medium]="task().priority === 'medium'"
            [class.task-card__priority--low]="task().priority === 'low'"
            [attr.aria-label]="task().priority + ' priority'"
          >
            {{ task().priority }}
          </span>
        }

        <button
          class="task-card__delete"
          (click)="onDelete()"
          [attr.aria-label]="'Delete task: ' + task().title"
        >
          <ion-icon name="trash-outline" aria-hidden="true"></ion-icon>
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .task-card {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-2);
      border-bottom: var(--border-light);
      background: var(--color-bg);
      transition: background var(--transition-fast);
    }

    .task-card:hover {
      background: var(--color-bg-hover);
    }

    .task-card__checkbox {
      flex-shrink: 0;
    }

    .task-card__content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .task-card__title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-normal);
      color: var(--color-text);
      line-height: 1.4;
      word-break: break-word;
      transition: color var(--transition-fast), text-decoration var(--transition-fast);
    }

    .task-card__category {
      align-self: flex-start;
      color: var(--color-text-secondary);
      border-color: var(--color-border-light);
    }

    .task-card__actions {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .task-card__priority {
      font-size: var(--font-size-xs);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .task-card__priority--high {
      color: var(--color-badge-high);
      border-color: var(--color-badge-high);
    }

    .task-card__priority--medium {
      color: var(--color-badge-medium);
      border-color: var(--color-badge-medium);
    }

    .task-card__priority--low {
      color: var(--color-badge-low);
      border-color: var(--color-badge-low);
    }

    .task-card__delete {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-secondary);
      border-radius: var(--radius-sm);
      transition: color var(--transition-fast), background var(--transition-fast);
      padding: 0;
    }

    .task-card__delete:hover {
      color: var(--color-text);
      background: var(--color-bg-active);
    }

    .task-card__delete:focus-visible {
      outline: 2px solid var(--color-border);
      outline-offset: 2px;
    }

    .task-card__delete ion-icon {
      font-size: 1rem;
    }
  `,
})
export class TaskCardComponent {
  task = input.required<Task>();
  showPriorityBadge = input(false);

  toggled = output<string>();
  deleted = output<string>();

  constructor() {
    addIcons({ trashOutline });
  }

  onToggle(): void {
    this.toggled.emit(this.task().id);
  }

  onDelete(): void {
    this.deleted.emit(this.task().id);
  }
}
