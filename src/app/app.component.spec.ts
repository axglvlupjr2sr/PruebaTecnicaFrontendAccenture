import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { ThemeService, Theme } from './core/services/theme.service';

describe('AppComponent', () => {
  let themeSignal: ReturnType<typeof signal<Theme>>;

  function createMockThemeService() {
    themeSignal = signal<Theme>('light');
    return {
      theme: themeSignal.asReadonly(),
      toggle: jasmine.createSpy('toggle').and.callFake(() => {
        themeSignal.set(themeSignal() === 'light' ? 'dark' : 'light');
      }),
    };
  }

  beforeEach(async () => {
    // Ensure clean body state before each test
    document.body.classList.remove('dark');

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: ThemeService, useValue: createMockThemeService() },
        provideRouter([]),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  afterEach(() => {
    document.body.classList.remove('dark');
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should NOT add .dark class when theme is "light" (FR-05)', () => {
    themeSignal.set('light');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(document.body.classList.contains('dark')).toBeFalse();
  });

  it('should add .dark class to document.body when theme changes to "dark" (FR-05)', () => {
    themeSignal.set('light');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    TestBed.flushEffects();

    // Now flip to dark
    themeSignal.set('dark');
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(document.body.classList.contains('dark')).toBeTrue();
  });

  it('should remove .dark class from document.body when theme changes to "light" (FR-05)', () => {
    themeSignal.set('dark');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(document.body.classList.contains('dark')).toBeTrue();

    // Now flip to light
    themeSignal.set('light');
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(document.body.classList.contains('dark')).toBeFalse();
  });
});
