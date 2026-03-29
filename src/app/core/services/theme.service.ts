import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
const THEME_KEY = 'app-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this._loadFromStorage());
  readonly theme = this._theme.asReadonly();

  toggle(): void {
    const next: Theme = this._theme() === 'light' ? 'dark' : 'light';
    this._theme.set(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Silently fail on quota errors or SSR environments
    }
  }

  private _loadFromStorage(): Theme {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
}
