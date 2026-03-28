import { Injectable, inject, isDevMode, signal } from '@angular/core';
import {
  RemoteConfig,
  fetchAndActivate,
  getBoolean,
} from '@angular/fire/remote-config';

const FLAG_SHOW_PRIORITY_BADGES = 'todo_show_priority_badges';

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private readonly _showPriorityBadges = signal(false);

  readonly showPriorityBadges = this._showPriorityBadges.asReadonly();

  private remoteConfig: RemoteConfig | null = null;

  constructor() {
    try {
      this.remoteConfig = inject(RemoteConfig);
    } catch {
      // RemoteConfig not available (e.g. missing Firebase config, SSR)
      this.remoteConfig = null;
    }
  }

  async init(): Promise<void> {
    if (!this.remoteConfig) {
      return;
    }

    try {
      // Set minimum fetch interval: 0 in dev, 3600s in prod
      this.remoteConfig.settings = {
        ...this.remoteConfig.settings,
        minimumFetchIntervalMillis: isDevMode() ? 0 : 3600_000,
      };

      await fetchAndActivate(this.remoteConfig);

      const showBadges = getBoolean(this.remoteConfig, FLAG_SHOW_PRIORITY_BADGES);
      this._showPriorityBadges.set(showBadges);
    } catch {
      // Firebase unreachable or any error — keep default (false)
      // App MUST continue working normally
    }
  }
}
