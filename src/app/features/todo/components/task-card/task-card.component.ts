import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { AlertController, IonCheckbox, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { Task } from '../../../../core/models/task.model';

export type { Task };

@Component({
  selector: 'app-task-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonCheckbox, IonIcon],
  styleUrl: 'task-card.component.scss',
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
})
export class TaskCardComponent {
  private readonly alertCtrl = inject(AlertController);

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

  async onDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Delete task',
      message: `Are you sure you want to delete "${this.task().title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleted.emit(this.task().id),
        },
      ],
    });
    await alert.present();
  }
}
