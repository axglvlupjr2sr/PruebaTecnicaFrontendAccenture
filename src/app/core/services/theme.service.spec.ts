import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    // In-memory localStorage substitute, shared across all tests in this describe
    store = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] ?? null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => { store[key] = value; });
  });

  function buildService(): ThemeService {
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // --- FR-01: initial state ---

  it('should default to "light" when no stored preference (FR-01)', () => {
    // store is empty — no 'app-theme' key
    const service = buildService();
    expect(service.theme()).toBe('light');
  });

  it('should initialize to "dark" when localStorage has app-theme="dark" (FR-01)', () => {
    store['app-theme'] = 'dark';
    const service = buildService();
    expect(service.theme()).toBe('dark');
  });

  // --- FR-02: toggle switches theme ---

  it('should switch from "light" to "dark" on toggle() (FR-02)', () => {
    const service = buildService();
    expect(service.theme()).toBe('light');
    service.toggle();
    expect(service.theme()).toBe('dark');
  });

  it('should switch from "dark" to "light" on toggle() (FR-02)', () => {
    store['app-theme'] = 'dark';
    const service = buildService();
    expect(service.theme()).toBe('dark');
    service.toggle();
    expect(service.theme()).toBe('light');
  });

  // --- FR-03: toggle persists to localStorage ---

  it('should write new theme to localStorage after toggle() (FR-03)', () => {
    const service = buildService();
    service.toggle(); // light → dark
    expect(store['app-theme']).toBe('dark');

    service.toggle(); // dark → light
    expect(store['app-theme']).toBe('light');
  });

  // --- FR-04: defaults to 'light' on invalid stored value ---

  it('should default to "light" when stored value is invalid (FR-04)', () => {
    store['app-theme'] = 'system';
    const service = buildService();
    expect(service.theme()).toBe('light');
  });
});
