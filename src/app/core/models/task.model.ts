export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  categoryId: string;
  categoryLabel?: string;
  priority?: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  label: string;
}

export interface TaskCreatedEvent {
  title: string;
  categoryId: string;
  priority?: TaskPriority;
}

export interface TodoState {
  tasks: Task[];
  categories: Category[];
  activeFilter: string;
}

export interface StorageSchema {
  version: number;
  state: TodoState;
}
