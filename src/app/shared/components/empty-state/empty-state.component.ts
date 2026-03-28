import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkboxOutline } from 'ionicons/icons';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon],
  template: `
    <div class="empty-state" role="status" aria-live="polite">
      <div class="empty-state__icon-wrap" aria-hidden="true">
        <ion-icon name="checkbox-outline" class="empty-state__icon"></ion-icon>
      </div>
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
      padding: var(--space-12) var(--space-4) var(--space-8);
      gap: var(--space-2);
    }

    .empty-state__icon-wrap {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-2);
    }

    .empty-state__icon {
      font-size: 1.25rem;
      color: var(--color-text-placeholder);
    }

    .empty-state__message {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      text-align: center;
      line-height: 1.5;
    }
  `,
})
export class EmptyStateComponent {
  message = input('No tasks yet');

  constructor() {
    addIcons({ checkboxOutline });
  }
}
