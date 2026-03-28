import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TodoStore } from './todo.store';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { RemoteConfigService } from '../../../core/services/remote-config.service';
import { CategoryService } from '../../../core/services/category.service';
import { TodoState } from '../../../core/models/task.model';
import { signal } from '@angular/core';

// -----------------------------------------------------------------------
// Minimal mocks
// -----------------------------------------------------------------------

class MockLocalStorageService {
  private _stored: TodoState | null = null;

  load(): TodoState | null {
    return this._stored;
  }

  save(state: TodoState): void {
    this._stored = { ...state };
  }

  reset(): void {
    this._stored = null;
  }

  // Helper for tests to seed initial state
  seed(state: TodoState): void {
    this._stored = { ...state };
  }
}

class MockRemoteConfigService {
  private readonly _showPriorityBadges = signal(false);
  readonly showPriorityBadges = this._showPriorityBadges.asReadonly();

  async init(): Promise<void> {
    // No-op
  }
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function buildStore(): { store: TodoStore; storage: MockLocalStorageService } {
  const storage = new MockLocalStorageService();

  TestBed.configureTestingModule({
    providers: [
      TodoStore,
      CategoryService,
      { provide: LocalStorageService, useValue: storage },
      { provide: RemoteConfigService, useClass: MockRemoteConfigService },
    ],
  });

  const store = TestBed.inject(TodoStore);
  return { store, storage };
}

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe('TodoStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ---- addTask --------------------------------------------------------

  describe('addTask', () => {
    it('should add a task with valid title', () => {
      const { store } = buildStore();
      store.addTask('Buy milk', 'shopping');
      expect(store.tasks().length).toBe(1);
      expect(store.tasks()[0].title).toBe('Buy milk');
    });

    it('should not add a task with empty title', () => {
      const { store } = buildStore();
      store.addTask('', 'work');
      expect(store.tasks().length).toBe(0);
    });

    it('should not add a task with blank/whitespace-only title', () => {
      const { store } = buildStore();
      store.addTask('   ', 'work');
      expect(store.tasks().length).toBe(0);
    });

    it('should assign correct category label when adding', () => {
      const { store } = buildStore();
      store.addTask('Read a book', 'learning');
      const task = store.tasks()[0];
      expect(task.categoryLabel).toBe('Learning');
    });

    it('should generate unique ids for each task', () => {
      const { store } = buildStore();
      store.addTask('Task A', 'work');
      store.addTask('Task B', 'personal');
      const ids = store.tasks().map((t) => t.id);
      expect(new Set(ids).size).toBe(2);
    });

    it('should set completed to false by default', () => {
      const { store } = buildStore();
      store.addTask('New task', 'health');
      expect(store.tasks()[0].completed).toBeFalse();
    });

    it('should assign priority when provided', () => {
      const { store } = buildStore();
      store.addTask('Urgent task', 'work', 'high');
      expect(store.tasks()[0].priority).toBe('high');
    });
  });

  // ---- toggleTask -----------------------------------------------------

  describe('toggleTask', () => {
    it('should toggle task completed status from false to true', () => {
      const { store } = buildStore();
      store.addTask('Task', 'work');
      const id = store.tasks()[0].id;
      store.toggleTask(id);
      expect(store.tasks()[0].completed).toBeTrue();
    });

    it('should toggle task completed status from true to false', () => {
      const { store } = buildStore();
      store.addTask('Task', 'work');
      const id = store.tasks()[0].id;
      store.toggleTask(id); // → true
      store.toggleTask(id); // → false
      expect(store.tasks()[0].completed).toBeFalse();
    });

    it('should update updatedAt when toggling', () => {
      const { store } = buildStore();
      store.addTask('Task', 'work');
      const taskBefore = store.tasks()[0];
      const id = taskBefore.id;

      // Spy on Date.prototype.toISOString to return a future timestamp
      const futureDate = '2099-01-01T00:00:00.000Z';
      spyOn(Date.prototype, 'toISOString').and.returnValue(futureDate);

      store.toggleTask(id);

      const after = store.tasks()[0].updatedAt;
      expect(after).toBe(futureDate);
    });

    it('should not affect other tasks', () => {
      const { store } = buildStore();
      store.addTask('Task A', 'work');
      store.addTask('Task B', 'personal');
      const idA = store.tasks()[0].id;
      store.toggleTask(idA);
      expect(store.tasks()[1].completed).toBeFalse();
    });
  });

  // ---- deleteTask -----------------------------------------------------

  describe('deleteTask', () => {
    it('should remove the task from the list', () => {
      const { store } = buildStore();
      store.addTask('Task to delete', 'work');
      const id = store.tasks()[0].id;
      store.deleteTask(id);
      expect(store.tasks().length).toBe(0);
    });

    it('should not affect other tasks when deleting', () => {
      const { store } = buildStore();
      store.addTask('Keep me', 'work');
      store.addTask('Delete me', 'personal');
      const deleteId = store.tasks()[1].id;
      store.deleteTask(deleteId);
      expect(store.tasks().length).toBe(1);
      expect(store.tasks()[0].title).toBe('Keep me');
    });
  });

  // ---- setFilter ------------------------------------------------------

  describe('setFilter', () => {
    it('should update the activeFilter signal', () => {
      const { store } = buildStore();
      store.setFilter('work');
      expect(store.activeFilter()).toBe('work');
    });

    it('should filter tasks by category', () => {
      const { store } = buildStore();
      store.addTask('Work task', 'work');
      store.addTask('Personal task', 'personal');
      store.setFilter('work');
      const filtered = store.filteredTasks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].categoryId).toBe('work');
    });

    it('should show all tasks when filter is "all"', () => {
      const { store } = buildStore();
      store.addTask('Work task', 'work');
      store.addTask('Personal task', 'personal');
      store.setFilter('work');
      store.setFilter('all');
      expect(store.filteredTasks().length).toBe(2);
    });
  });

  // ---- clearCompleted -------------------------------------------------

  describe('clearCompleted', () => {
    it('should remove all completed tasks', () => {
      const { store } = buildStore();
      store.addTask('Task A', 'work');
      store.addTask('Task B', 'personal');
      const idA = store.tasks()[0].id;
      store.toggleTask(idA);
      store.clearCompleted();
      expect(store.tasks().every((t) => !t.completed)).toBeTrue();
    });

    it('should keep incomplete tasks', () => {
      const { store } = buildStore();
      store.addTask('Keep', 'work');
      store.addTask('Remove', 'personal');
      const removeId = store.tasks()[1].id;
      store.toggleTask(removeId);
      store.clearCompleted();
      expect(store.tasks().length).toBe(1);
      expect(store.tasks()[0].title).toBe('Keep');
    });
  });

  // ---- filteredTasks computed -----------------------------------------

  describe('filteredTasks', () => {
    it('should return all tasks when filter is "all"', () => {
      const { store } = buildStore();
      store.addTask('Task A', 'work');
      store.addTask('Task B', 'shopping');
      expect(store.filteredTasks().length).toBe(2);
    });

    it('should return only matching category tasks', () => {
      const { store } = buildStore();
      store.addTask('Work 1', 'work');
      store.addTask('Work 2', 'work');
      store.addTask('Shop 1', 'shopping');
      store.setFilter('work');
      expect(store.filteredTasks().length).toBe(2);
      expect(store.filteredTasks().every((t) => t.categoryId === 'work')).toBeTrue();
    });

    it('should return empty array when no tasks match filter', () => {
      const { store } = buildStore();
      store.addTask('Work task', 'work');
      store.setFilter('shopping');
      expect(store.filteredTasks().length).toBe(0);
    });
  });

  // ---- persistence ----------------------------------------------------

  describe('persistence', () => {
    it('should hydrate state from localStorage on init', () => {
      // Seed storage BEFORE store is instantiated
      const mockStorage = new MockLocalStorageService();
      mockStorage.seed({
        tasks: [{
          id: 'abc-123',
          title: 'Hydrated task',
          completed: true,
          categoryId: 'work',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }],
        categories: [{ id: 'work', label: 'Work' }],
        activeFilter: 'work',
      });

      TestBed.configureTestingModule({
        providers: [
          TodoStore,
          CategoryService,
          { provide: LocalStorageService, useValue: mockStorage },
          { provide: RemoteConfigService, useClass: MockRemoteConfigService },
        ],
      });

      const store = TestBed.inject(TodoStore);

      expect(store.tasks().length).toBe(1);
      expect(store.tasks()[0].title).toBe('Hydrated task');
      expect(store.activeFilter()).toBe('work');
    });

    it('should save state to localStorage when tasks change', fakeAsync(() => {
      const { store, storage } = buildStore();
      store.addTask('Persisted task', 'health');
      tick(); // allow effects to flush
      const saved = storage.load();
      expect(saved).not.toBeNull();
      expect(saved!.tasks.length).toBe(1);
      expect(saved!.tasks[0].title).toBe('Persisted task');
    }));
  });

  // ---- counts ---------------------------------------------------------

  describe('counts', () => {
    it('should calculate completedCount correctly', () => {
      const { store } = buildStore();
      store.addTask('T1', 'work');
      store.addTask('T2', 'work');
      store.addTask('T3', 'work');
      store.toggleTask(store.tasks()[0].id);
      store.toggleTask(store.tasks()[1].id);
      expect(store.completedCount()).toBe(2);
    });

    it('should calculate totalCount correctly', () => {
      const { store } = buildStore();
      store.addTask('T1', 'work');
      store.addTask('T2', 'personal');
      expect(store.totalCount()).toBe(2);
    });

    it('should return 0 completedCount when no tasks are complete', () => {
      const { store } = buildStore();
      store.addTask('T1', 'work');
      expect(store.completedCount()).toBe(0);
    });

    it('should return 0 totalCount when there are no tasks', () => {
      const { store } = buildStore();
      expect(store.totalCount()).toBe(0);
    });
  });

  // ---- showPriorityBadges ---------------------------------------------

  describe('showPriorityBadges', () => {
    it('should be false by default (from mock remote config)', () => {
      const { store } = buildStore();
      expect(store.showPriorityBadges()).toBeFalse();
    });
  });
});
