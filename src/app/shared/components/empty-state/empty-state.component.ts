import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkboxOutline } from 'ionicons/icons';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon],
  template: `
    <div class="empty-state">
      <ion-icon name="checkbox-outline" class="empty-state__icon"></ion-icon>
      <p class="empty-state__message">{{ message() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12) var(--space-4);
      gap: var(--space-3);
    }

    .empty-state__icon {
      font-size: 2rem;
      color: var(--color-text-placeholder);
    }

    .empty-state__message {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      text-align: center;
    }
  `,
})
export class EmptyStateComponent {
  message = input('No tasks yet');

  constructor() {
    addIcons({ checkboxOutline });
  }
}
