import {
  ChangeDetectionStrategy,
  Component,
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
import { FormsModule } from '@angular/forms';

export interface Category {
  id: string;
  label: string;
}

export interface TaskCreatedEvent {
  title: string;
  categoryId: string;
  priority?: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-task-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonInput, IonSelect, IonSelectOption, FormsModule],
  template: `
    <form class="task-form" (ngSubmit)="submitTask()">
      <ion-input
        class="task-form__input"
        [(ngModel)]="titleValue"
        name="title"
        placeholder="New task..."
        [clearInput]="true"
        aria-label="Task title"
      ></ion-input>

      <ion-select
        class="task-form__select"
        [(ngModel)]="categoryValue"
        name="category"
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
        [(ngModel)]="priorityValue"
        name="priority"
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
        type="submit"
        fill="solid"
        [disabled]="!canSubmit()"
        aria-label="Add task"
      >
        Add
      </ion-button>
    </form>
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
      padding: var(--space-3) 0;
      border-bottom: var(--border);
    }

    .task-form__input {
      flex: 1;
      min-width: 0;
      border: var(--border);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      --padding-top: var(--space-2);
      --padding-bottom: var(--space-2);
    }

    .task-form__select {
      border: var(--border);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      --padding-top: var(--space-2);
      --padding-bottom: var(--space-2);
      --padding-start: var(--space-3);
      --padding-end: var(--space-3);
      min-width: 100px;
    }

    .task-form__select--priority {
      min-width: 90px;
    }

    .task-form__btn {
      flex-shrink: 0;
      --padding-start: var(--space-4);
      --padding-end: var(--space-4);
      height: 36px;
      font-size: var(--font-size-sm);
    }

    @media (max-width: 480px) {
      .task-form {
        flex-wrap: wrap;
      }

      .task-form__input {
        flex-basis: 100%;
      }

      .task-form__select {
        flex: 1;
      }
    }
  `,
})
export class TaskFormComponent {
  categories = input<Category[]>([]);
  taskCreated = output<TaskCreatedEvent>();

  titleValue = '';
  categoryValue = '';
  priorityValue: 'low' | 'medium' | 'high' | '' = '';

  canSubmit(): boolean {
    return this.titleValue.trim().length > 0 && this.categoryValue.length > 0;
  }

  submitTask(): void {
    if (!this.canSubmit()) {
      return;
    }

    const event: TaskCreatedEvent = {
      title: this.titleValue.trim(),
      categoryId: this.categoryValue,
    };

    if (this.priorityValue) {
      event.priority = this.priorityValue;
    }

    this.taskCreated.emit(event);

    // Reset form
    this.titleValue = '';
    this.categoryValue = '';
    this.priorityValue = '';
  }
}
