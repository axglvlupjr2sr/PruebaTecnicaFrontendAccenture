import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Task, TaskPriority } from '../../../core/models/task.model';
import { CategoryService } from '../../../core/services/category.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { RemoteConfigService } from '../../../core/services/remote-config.service';

@Injectable({ providedIn: 'root' })
export class TodoStore {
  private readonly storageService = inject(LocalStorageService);
  private readonly categoryService = inject(CategoryService);
  private readonly remoteConfigService = inject(RemoteConfigService);

  // --- Private writable state ---
  private readonly _tasks = signal<Task[]>([]);
  private readonly _activeFilter = signal<string>('all');

  // --- Public readonly signals ---
  readonly tasks = this._tasks.asReadonly();
  readonly activeFilter = this._activeFilter.asReadonly();

  // --- Computed selectors ---
  readonly categories = computed(() => this.categoryService.getCategories());

  readonly showPriorityBadges = computed(() =>
    this.remoteConfigService.showPriorityBadges()
  );

  readonly filteredTasks = computed(() => {
    const filter = this._activeFilter();
    const tasks = this._tasks();
    if (filter === 'all') {
      return tasks;
    }
    return tasks.filter((t) => t.categoryId === filter);
  });

  readonly completedCount = computed(
    () => this._tasks().filter((t) => t.completed).length
  );

  readonly totalCount = computed(() => this._tasks().length);

  // --- Persistence side-effect ---
  private readonly persistEffect = effect(() => {
    const tasks = this._tasks();
    const categories = this.categoryService.getCategories();
    const activeFilter = this._activeFilter();
    this.storageService.save({ tasks, categories, activeFilter });
  });

  constructor() {
    // Hydrate from localStorage
    const saved = this.storageService.load();
    if (saved) {
      this._tasks.set(saved.tasks);
      this._activeFilter.set(saved.activeFilter);
    }

    // Initialize Remote Config — fire and forget, MUST NOT crash app
    this.remoteConfigService.init().catch(() => {
      // Already handled inside init(), this is a belt-and-suspenders guard
    });
  }

  // --- Commands ---

  addTask(title: string, categoryId: string, priority?: TaskPriority): void {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    const category = this.categoryService.getCategories().find(
      (c) => c.id === categoryId
    );

    const now = new Date().toISOString();
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmed,
      completed: false,
      categoryId,
      categoryLabel: category?.label,
      priority,
      createdAt: now,
      updatedAt: now,
    };

    this._tasks.update((tasks) => [...tasks, newTask]);
  }

  toggleTask(taskId: string): void {
    const now = new Date().toISOString();
    this._tasks.update((tasks) =>
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed: !t.completed, updatedAt: now }
          : t
      )
    );
  }

  deleteTask(taskId: string): void {
    this._tasks.update((tasks) => tasks.filter((t) => t.id !== taskId));
  }

  setFilter(filterId: string): void {
    this._activeFilter.set(filterId);
  }

  clearCompleted(): void {
    this._tasks.update((tasks) => tasks.filter((t) => !t.completed));
  }
}
