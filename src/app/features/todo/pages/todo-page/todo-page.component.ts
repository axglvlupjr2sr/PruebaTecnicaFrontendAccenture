import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sunnyOutline, moonOutline } from 'ionicons/icons';
import { TaskFormComponent, TaskCreatedEvent } from '../../components/task-form/task-form.component';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { TodoStore } from '../../store/todo.store';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-todo-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    TaskFormComponent,
    FilterBarComponent,
    TaskListComponent,
  ],
  template: `
    <ion-content>
      <div class="notion-page">
        <!-- Notion-style page header -->
        <header class="notion-page__header">
          <div class="notion-page__emoji">✅</div>
          <h1 class="notion-page__title">My Tasks</h1>
          <div class="notion-page__meta">
            <span class="notion-page__count">
              {{ store.completedCount() }}/{{ store.totalCount() }} done
            </span>
            @if (store.completedCount() > 0) {
              <button
                class="notion-page__clear-btn"
                (click)="clearCompleted()"
                aria-label="Clear completed tasks"
              >
                Clear done
              </button>
            }
            <button
              class="notion-page__theme-btn"
              (click)="themeService.toggle()"
              [attr.aria-label]="themeService.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <ion-icon
                [name]="themeService.theme() === 'dark' ? 'sunny-outline' : 'moon-outline'"
              ></ion-icon>
            </button>
          </div>
        </header>

        <!-- Divider -->
        <div class="notion-divider" role="separator"></div>

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
      </div>
    </ion-content>
  `,
  styles: `
    :host {
      display: block;
    }

    ion-content {
      --padding-start: 0;
      --padding-end: 0;
      --padding-top: 0;
      --padding-bottom: 0;
    }

    /* Notion page container — centred with max-width */
    .notion-page {
      max-width: 680px;
      margin: 0 auto;
      padding: var(--space-8) var(--space-6) var(--space-12);
    }

    /* Page header */
    .notion-page__header {
      padding-bottom: var(--space-4);
    }

    .notion-page__emoji {
      font-size: 2.5rem;
      line-height: 1;
      margin-bottom: var(--space-3);
      user-select: none;
    }

    .notion-page__title {
      font-family: var(--font-family-heading);
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-normal);
      color: var(--color-text);
      margin: 0 0 var(--space-3) 0;
      line-height: 1.2;
      letter-spacing: -0.01em;
    }

    .notion-page__meta {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .notion-page__count {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .notion-page__clear-btn {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      text-decoration: underline;
      text-decoration-color: var(--color-border-light);
      transition: color var(--transition-fast);
      font-family: var(--font-family);
    }

    .notion-page__clear-btn:hover {
      color: var(--color-text);
      text-decoration-color: var(--color-border);
    }

    .notion-page__clear-btn:focus-visible {
      outline: 2px solid var(--color-border);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    .notion-page__theme-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      padding: var(--space-1);
      cursor: pointer;
      color: var(--color-text-secondary);
      font-size: 1.125rem;
      transition: color var(--transition-fast);
      line-height: 1;
      margin-left: auto;
    }

    .notion-page__theme-btn:hover {
      color: var(--color-text);
    }

    .notion-page__theme-btn:focus-visible {
      outline: 2px solid var(--color-border);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }

    /* Notion-style thin divider */
    .notion-divider {
      height: 1px;
      background: var(--color-border-light);
      margin: 0 0 var(--space-4) 0;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .notion-page {
        padding: var(--space-6) var(--space-4) var(--space-8);
      }

      .notion-page__title {
        font-size: var(--font-size-xl);
      }

      .notion-page__emoji {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .notion-page {
        padding: var(--space-4) var(--space-3) var(--space-8);
      }

      .notion-page__title {
        font-size: 1.375rem;
      }
    }
  `,
})
export class TodoPageComponent {
  readonly store = inject(TodoStore);
  readonly themeService = inject(ThemeService);

  constructor() {
    addIcons({ sunnyOutline, moonOutline });
  }

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

