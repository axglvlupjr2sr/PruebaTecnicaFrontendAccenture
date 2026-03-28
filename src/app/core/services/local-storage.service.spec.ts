import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { TodoState } from '../models/task.model';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let store: Record<string, string>;

  beforeEach(() => {
    // Use a plain object as in-memory localStorage substitute
    store = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] ?? null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => { store[key] = value; });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => { delete store[key]; });

    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  // --- load ---

  it('should return null when no data exists', () => {
    const result = service.load();
    expect(result).toBeNull();
  });

  it('should return null when data is corrupt JSON', () => {
    store['todo-app-state'] = '{not valid json}';
    const result = service.load();
    expect(result).toBeNull();
  });

  it('should return null when schema version is wrong', () => {
    const badSchema = JSON.stringify({ version: 999, state: { tasks: [], categories: [], activeFilter: 'all' } });
    store['todo-app-state'] = badSchema;
    const result = service.load();
    expect(result).toBeNull();
  });

  it('should return null when state.tasks is missing', () => {
    const badSchema = JSON.stringify({ version: 1, state: { categories: [], activeFilter: 'all' } });
    store['todo-app-state'] = badSchema;
    const result = service.load();
    expect(result).toBeNull();
  });

  it('should return valid state when data is correct', () => {
    const validState: TodoState = {
      tasks: [{ id: '1', title: 'Test', completed: false, categoryId: 'work', createdAt: '', updatedAt: '' }],
      categories: [{ id: 'work', label: 'Work' }],
      activeFilter: 'all',
    };
    const schema = JSON.stringify({ version: 1, state: validState });
    store['todo-app-state'] = schema;

    const result = service.load();
    expect(result).toBeTruthy();
    expect(result!.tasks.length).toBe(1);
    expect(result!.tasks[0].title).toBe('Test');
    expect(result!.activeFilter).toBe('all');
  });

  // --- save ---

  it('should save state with correct version', () => {
    const state: TodoState = {
      tasks: [],
      categories: [{ id: 'work', label: 'Work' }],
      activeFilter: 'all',
    };

    service.save(state);

    expect(localStorage.setItem).toHaveBeenCalled();
    const raw = store['todo-app-state'];
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.version).toBe(1);
    expect(parsed.state).toEqual(state);
  });

  it('should handle quota exceeded gracefully', () => {
    (localStorage.setItem as jasmine.Spy).and.throwError(new DOMException('QuotaExceededError'));
    const state: TodoState = { tasks: [], categories: [], activeFilter: 'all' };
    // Should NOT throw
    expect(() => service.save(state)).not.toThrow();
  });

  // --- reset ---

  it('should remove the storage key', () => {
    store['todo-app-state'] = 'some-data';
    service.reset();
    expect(localStorage.removeItem).toHaveBeenCalledWith('todo-app-state');
    expect(store['todo-app-state']).toBeUndefined();
  });
});
