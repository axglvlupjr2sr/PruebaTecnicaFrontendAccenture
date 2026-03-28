import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import { TaskFormComponent, TaskCreatedEvent } from '../../components/task-form/task-form.component';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { TodoStore } from '../../store/todo.store';

@Component({
  selector: 'app-todo-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    TaskFormComponent,
    FilterBarComponent,
    TaskListComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>To-Do</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="clearCompleted()" aria-label="Clear completed tasks">
            Clear done
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Task form -->
      <app-task-form
        [categories]="store.categories()"
        (taskCreated)="onTaskCreated($event)"
      ></app-task-form>

      <!-- Filter bar -->
      <app-filter-bar
        [categories]="store.categories()"
        [activeFilter]="store.activeFilter()"
        (filterChanged)="onFilterChanged($event)"
      ></app-filter-bar>

      <!-- Task list -->
      <app-task-list
        [tasks]="store.filteredTasks()"
        [showPriorityBadge]="store.showPriorityBadges()"
        (taskToggled)="onTaskToggled($event)"
        (taskDeleted)="onTaskDeleted($event)"
      ></app-task-list>
    </ion-content>
  `,
  styles: `
    :host {
      display: block;
    }

    ion-content {
      --padding-start: var(--space-4);
      --padding-end: var(--space-4);
      --padding-top: var(--space-4);
      --padding-bottom: var(--space-8);
    }
  `,
})
export class TodoPageComponent {
  readonly store = inject(TodoStore);

  onTaskCreated(event: TaskCreatedEvent): void {
    this.store.addTask(event.title, event.categoryId, event.priority);
  }

  onFilterChanged(filterId: string): void {
    this.store.setFilter(filterId);
  }

  onTaskToggled(taskId: string): void {
    this.store.toggleTask(taskId);
  }

  onTaskDeleted(taskId: string): void {
    this.store.deleteTask(taskId);
  }

  clearCompleted(): void {
    this.store.clearCompleted();
  }
}
