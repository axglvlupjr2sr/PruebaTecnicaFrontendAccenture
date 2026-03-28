import { Injectable } from '@angular/core';
import { StorageSchema, TodoState } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private readonly STORAGE_KEY = 'todo-app-state';
  private readonly CURRENT_VERSION = 1;

  load(): TodoState | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const data: unknown = JSON.parse(raw);
      if (!this.validate(data)) {
        return null;
      }
      return data.state;
    } catch {
      return null;
    }
  }

  save(state: TodoState): void {
    try {
      const schema: StorageSchema = {
        version: this.CURRENT_VERSION,
        state,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schema));
    } catch {
      // Silently fail on quota errors or SSR environments
    }
  }

  reset(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // Silently fail
    }
  }

  private validate(data: unknown): data is StorageSchema {
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    const obj = data as Record<string, unknown>;
    if (typeof obj['version'] !== 'number') {
      return false;
    }
    if (obj['version'] !== this.CURRENT_VERSION) {
      return false;
    }
    if (typeof obj['state'] !== 'object' || obj['state'] === null) {
      return false;
    }
    const state = obj['state'] as Record<string, unknown>;
    if (!Array.isArray(state['tasks'])) {
      return false;
    }
    if (!Array.isArray(state['categories'])) {
      return false;
    }
    return true;
  }
}
