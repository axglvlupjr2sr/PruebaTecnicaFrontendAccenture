import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCardComponent } from './task-card.component';
import { Task } from '../../../../core/models/task.model';
import { AlertController } from '@ionic/angular/standalone';
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
  let mockAlertCtrl: jasmine.SpyObj<AlertController>;
  let lastDestructiveHandler: (() => void) | undefined;

  beforeEach(async () => {
    lastDestructiveHandler = undefined;

    mockAlertCtrl = jasmine.createSpyObj('AlertController', ['create']);
    mockAlertCtrl.create.and.callFake(async (opts: any) => {
      const btn = opts?.buttons?.find((b: any) => b.role === 'destructive');
      lastDestructiveHandler = btn?.handler;
      return { present: async () => {} } as any;
    });

    await TestBed.configureTestingModule({
      imports: [TaskCardComponent, IonicModule.forRoot()],
      providers: [{ provide: AlertController, useValue: mockAlertCtrl }],
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

  it('should present confirmation alert on delete', async () => {
    await component.onDelete();

    expect(mockAlertCtrl.create).toHaveBeenCalledTimes(1);
    const opts = mockAlertCtrl.create.calls.mostRecent().args[0] as any;
    expect(opts.header).toBe('Delete task');
    expect(opts.buttons.length).toBe(2);
  });

  it('should emit deleted with task id when delete is confirmed', async () => {
    const emitted: string[] = [];
    component.deleted.subscribe((id: string) => emitted.push(id));

    await component.onDelete();

    expect(lastDestructiveHandler).toBeDefined();
    lastDestructiveHandler!();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toBe('task-1');
  });

  it('should NOT emit deleted when delete is cancelled', async () => {
    const emitted: string[] = [];
    component.deleted.subscribe((id: string) => emitted.push(id));

    await component.onDelete();

    // Don't call the destructive handler — simulate cancel
    expect(emitted.length).toBe(0);
  });

  it('should display category label', () => {
    const el: HTMLElement = fixture.nativeElement;
    const badge = el.querySelector('.task-card__category');
    expect(badge?.textContent?.trim()).toBe('Work');
  });
});
