import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import { TaskFormComponent, TaskCreatedEvent, Category } from '../../components/task-form/task-form.component';
import { FilterBarComponent, FilterCategory } from '../../components/filter-bar/filter-bar.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { Task } from '../../components/task-card/task-card.component';

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
        [categories]="categories()"
        (taskCreated)="onTaskCreated($event)"
      ></app-task-form>

      <!-- Filter bar -->
      <app-filter-bar
        [categories]="categories()"
        [activeFilter]="activeFilter()"
        (filterChanged)="onFilterChanged($event)"
      ></app-filter-bar>

      <!-- Task list -->
      <app-task-list
        [tasks]="filteredTasks()"
        [showPriorityBadge]="showPriorityBadge()"
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
  // Feature flag — will be driven by RemoteConfigService in Phase 3
  readonly showPriorityBadge = signal(false);

  // Mock categories — will be replaced by CategoryService in Phase 3
  readonly categories = signal<Category[]>([
    { id: 'work', label: 'Work' },
    { id: 'personal', label: 'Personal' },
    { id: 'shopping', label: 'Shopping' },
  ]);

  // Active filter
  readonly activeFilter = signal<string>('all');

  // Mock tasks — will be replaced by TodoStore in Phase 3
  readonly tasks = signal<Task[]>([
    {
      id: '1',
      title: 'Set up Angular standalone architecture',
      completed: true,
      categoryId: 'work',
      categoryLabel: 'Work',
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Implement Notion-style design system',
      completed: false,
      categoryId: 'work',
      categoryLabel: 'Work',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Buy groceries',
      completed: false,
      categoryId: 'shopping',
      categoryLabel: 'Shopping',
      priority: 'low',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Derived: filtered tasks based on active filter
  filteredTasks(): Task[] {
    const filter = this.activeFilter();
    if (filter === 'all') {
      return this.tasks();
    }
    return this.tasks().filter(t => t.categoryId === filter);
  }

  onTaskCreated(event: TaskCreatedEvent): void {
    const category = this.categories().find(c => c.id === event.categoryId);
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: event.title,
      completed: false,
      categoryId: event.categoryId,
      categoryLabel: category?.label,
      priority: event.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.update(tasks => [...tasks, newTask]);
  }

  onFilterChanged(filterId: string): void {
    this.activeFilter.set(filterId);
  }

  onTaskToggled(taskId: string): void {
    this.tasks.update(tasks =>
      tasks.map(t =>
        t.id === taskId
          ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
          : t
      )
    );
  }

  onTaskDeleted(taskId: string): void {
    this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
  }

  clearCompleted(): void {
    this.tasks.update(tasks => tasks.filter(t => !t.completed));
  }
}
