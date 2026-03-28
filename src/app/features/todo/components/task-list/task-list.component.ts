import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TaskCardComponent, Task } from '../task-card/task-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-task-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaskCardComponent, EmptyStateComponent],
  template: `
    @if (tasks().length === 0) {
      <app-empty-state message="No tasks yet. Add one above!"></app-empty-state>
    } @else {
      <div class="task-list" role="list" aria-label="Task list">
        @for (task of tasks(); track task.id) {
          <div role="listitem">
            <app-task-card
              [task]="task"
              [showPriorityBadge]="showPriorityBadge()"
              (toggled)="taskToggled.emit($event)"
              (deleted)="taskDeleted.emit($event)"
            ></app-task-card>
          </div>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .task-list {
      display: flex;
      flex-direction: column;
    }
  `,
})
export class TaskListComponent {
  tasks = input<Task[]>([]);
  showPriorityBadge = input(false);

  taskToggled = output<string>();
  taskDeleted = output<string>();
}
