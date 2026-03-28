import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterBarComponent } from './filter-bar.component';
import { Category } from '../../../../core/models/task.model';

const CATEGORIES: Category[] = [
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal' },
  { id: 'shopping', label: 'Shopping' },
];

describe('FilterBarComponent', () => {
  let fixture: ComponentFixture<FilterBarComponent>;
  let component: FilterBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterBarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categories', CATEGORIES);
    fixture.componentRef.setInput('activeFilter', 'all');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the "All" button', () => {
    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll('.filter-bar__item');
    const allButton = Array.from(buttons).find(
      (btn) => btn.textContent?.trim() === 'All'
    );
    expect(allButton).toBeTruthy();
  });

  it('should render All button plus category buttons', () => {
    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll('.filter-bar__item');
    // 1 "All" + 3 categories = 4
    expect(buttons.length).toBe(4);
  });

  it('should render category labels', () => {
    const el: HTMLElement = fixture.nativeElement;
    const labels = Array.from(el.querySelectorAll('.filter-bar__item')).map(
      (btn) => btn.textContent?.trim()
    );
    expect(labels).toContain('Work');
    expect(labels).toContain('Personal');
    expect(labels).toContain('Shopping');
  });

  it('should emit filterChanged with "all" when All button is clicked', () => {
    const emitted: string[] = [];
    component.filterChanged.subscribe((val: string) => emitted.push(val));

    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll<HTMLButtonElement>('.filter-bar__item');
    buttons[0].click(); // "All" is the first button

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toBe('all');
  });

  it('should emit filterChanged with category id when category button clicked', () => {
    const emitted: string[] = [];
    component.filterChanged.subscribe((val: string) => emitted.push(val));

    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll<HTMLButtonElement>('.filter-bar__item');
    // buttons[1] is the first category (work)
    buttons[1].click();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toBe('work');
  });

  it('should highlight active filter "all"', () => {
    fixture.componentRef.setInput('activeFilter', 'all');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll('.filter-bar__item');
    expect(buttons[0].classList.contains('filter-bar__item--active')).toBeTrue();
    expect(buttons[1].classList.contains('filter-bar__item--active')).toBeFalse();
  });

  it('should highlight active filter for a category', () => {
    fixture.componentRef.setInput('activeFilter', 'work');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll('.filter-bar__item');
    // "All" should NOT be active
    expect(buttons[0].classList.contains('filter-bar__item--active')).toBeFalse();
    // "Work" (buttons[1]) should be active
    expect(buttons[1].classList.contains('filter-bar__item--active')).toBeTrue();
  });

  it('should use selectFilter method', () => {
    const emitted: string[] = [];
    component.filterChanged.subscribe((val: string) => emitted.push(val));

    component.selectFilter('personal');

    expect(emitted[0]).toBe('personal');
  });
});
