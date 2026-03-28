import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCardComponent } from './task-card.component';
import { Task } from '../../../../core/models/task.model';
import { IonicModule } from '@ionic/angular';

const TASK_STUB: Task = {
  id: 'task-1',
  title: 'Test Task',
  completed: false,
  categoryId: 'work',
  categoryLabel: 'Work',
  priority: 'high',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const COMPLETED_TASK_STUB: Task = {
  ...TASK_STUB,
  id: 'task-2',
  completed: true,
};

describe('TaskCardComponent', () => {
  let fixture: ComponentFixture<TaskCardComponent>;
  let component: TaskCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', TASK_STUB);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display task title', () => {
    const el: HTMLElement = fixture.nativeElement;
    const titleEl = el.querySelector('.task-card__title');
    expect(titleEl?.textContent?.trim()).toBe('Test Task');
  });

  it('should NOT show strikethrough when task is not completed', () => {
    const el: HTMLElement = fixture.nativeElement;
    const titleEl = el.querySelector('.task-card__title');
    expect(titleEl?.classList.contains('task-completed')).toBeFalse();
  });

  it('should show strikethrough when completed', () => {
    fixture.componentRef.setInput('task', COMPLETED_TASK_STUB);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const titleEl = el.querySelector('.task-card__title');
    expect(titleEl?.classList.contains('task-completed')).toBeTrue();
  });

  it('should show priority badge only when showPriorityBadge is true', () => {
    // Default: showPriorityBadge = false — no badge
    const el: HTMLElement = fixture.nativeElement;
    const badgeBefore = el.querySelector('.task-card__priority');
    expect(badgeBefore).toBeNull();

    // Enable the badge
    fixture.componentRef.setInput('showPriorityBadge', true);
    fixture.detectChanges();
    const badgeAfter = el.querySelector('.task-card__priority');
    expect(badgeAfter).toBeTruthy();
  });

  it('should NOT show priority badge when showPriorityBadge is false', () => {
    fixture.componentRef.setInput('showPriorityBadge', false);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.task-card__priority')).toBeNull();
  });

  it('should emit toggled with task id when checkbox changes', () => {
    const emitted: string[] = [];
    component.toggled.subscribe((id: string) => emitted.push(id));

    component.onToggle();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toBe('task-1');
  });

  it('should emit deleted with task id when delete button clicked', () => {
    const emitted: string[] = [];
    component.deleted.subscribe((id: string) => emitted.push(id));

    component.onDelete();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toBe('task-1');
  });

  it('should display category label', () => {
    const el: HTMLElement = fixture.nativeElement;
    const badge = el.querySelector('.task-card__category');
    expect(badge?.textContent?.trim()).toBe('Work');
  });
});
