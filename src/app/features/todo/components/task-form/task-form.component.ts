import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { Category, TaskCreatedEvent, TaskPriority } from '../../../../core/models/task.model';

export type { Category, TaskCreatedEvent };

@Component({
  selector: 'app-task-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonInput, IonSelect, IonSelectOption],
  template: `
    <div class="task-form" role="form">
      <ion-input
        class="task-form__input"
        [value]="titleValue()"
        (ionInput)="onTitleInput($event)"
        (keyup.enter)="submitTask()"
        placeholder="Type a task..."
        [clearInput]="true"
        aria-label="Task title"
      ></ion-input>

      <ion-select
        class="task-form__select"
        [value]="categoryValue()"
        (ionChange)="onCategoryChange($event)"
        placeholder="Category"
        aria-label="Task category"
        interface="popover"
      >
        @for (cat of categories(); track cat.id) {
          <ion-select-option [value]="cat.id">{{ cat.label }}</ion-select-option>
        }
      </ion-select>

      <ion-select
        class="task-form__select task-form__select--priority"
        [value]="priorityValue()"
        (ionChange)="onPriorityChange($event)"
        placeholder="Priority"
        aria-label="Task priority"
        interface="popover"
      >
        <ion-select-option value="low">Low</ion-select-option>
        <ion-select-option value="medium">Medium</ion-select-option>
        <ion-select-option value="high">High</ion-select-option>
      </ion-select>

      <ion-button
        class="task-form__btn"
        fill="solid"
        [disabled]="!canSubmit()"
        (click)="submitTask()"
        aria-label="Add task"
      >
        Add
      </ion-button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .task-form {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-4) 0;
      border-bottom: var(--border-light);
      margin-bottom: var(--space-2);
    }

    .task-form__input {
      flex: 1 1 0%;
      min-width: 180px;
      border: var(--border-light);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-base);
      --placeholder-color: var(--color-text-placeholder);
      --padding-top: var(--space-2);
      --padding-bottom: var(--space-2);
      transition: border-color var(--transition-fast);
    }

    .task-form__input:focus-within {
      border-color: var(--color-border);
    }

    .task-form__select {
      flex: 0 1 auto;
      border: var(--border-light);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      --padding-top: var(--space-2);
      --padding-bottom: var(--space-2);
      --padding-start: var(--space-2);
      --padding-end: var(--space-2);
      min-width: 100px;
      max-width: 140px;
      transition: border-color var(--transition-fast);
    }

    .task-form__select:focus-within {
      border-color: var(--color-border);
    }

    .task-form__select--priority {
      min-width: 90px;
      max-width: 120px;
    }

    .task-form__btn {
      flex-shrink: 0;
      --padding-start: var(--space-4);
      --padding-end: var(--space-4);
      min-height: 44px;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      letter-spacing: 0;
    }

    @media (max-width: 480px) {
      .task-form {
        flex-wrap: wrap;
      }

      .task-form__input {
        flex-basis: 100%;
        min-width: 0;
        order: 0;
      }

      .task-form__select {
        flex: 1;
        order: 1;
        min-width: 80px;
        max-width: none;
      }

      .task-form__select--priority {
        min-width: 70px;
        max-width: none;
      }

      .task-form__btn {
        order: 2;
        width: 100%;
      }
    }

    @media (max-width: 360px) {
      .task-form__input,
      .task-form__select,
      .task-form__select--priority,
      .task-form__btn {
        width: 100%;
        min-width: 0;
        max-width: none;
        flex-basis: 100%;
        flex: 1 1 100%;
      }
    }
  `,
})
export class TaskFormComponent {
  categories = input<Category[]>([]);
  taskCreated = output<TaskCreatedEvent>();

  // Signal-based form state — works correctly with OnPush
  readonly titleValue = signal('');
  readonly categoryValue = signal('');
  readonly priorityValue = signal<TaskPriority | ''>('');

  readonly canSubmit = computed(
    () => this.titleValue().trim().length > 0 && this.categoryValue().length > 0
  );

  onTitleInput(event: Event): void {
    const value = (event as CustomEvent<{ value: string }>).detail.value ?? '';
    this.titleValue.set(value);
  }

  onCategoryChange(event: Event): void {
    const value = (event as CustomEvent<{ value: string }>).detail.value ?? '';
    this.categoryValue.set(value);
  }

  onPriorityChange(event: Event): void {
    const value = ((event as CustomEvent<{ value: string }>).detail.value ?? '') as TaskPriority | '';
    this.priorityValue.set(value);
  }

  submitTask(): void {
    if (!this.canSubmit()) {
      return;
    }

    const event: TaskCreatedEvent = {
      title: this.titleValue().trim(),
      categoryId: this.categoryValue(),
    };

    const pv = this.priorityValue();
    if (pv) {
      event.priority = pv;
    }

    this.taskCreated.emit(event);

    // Reset form
    this.titleValue.set('');
    this.categoryValue.set('');
    this.priorityValue.set('');
  }
}
