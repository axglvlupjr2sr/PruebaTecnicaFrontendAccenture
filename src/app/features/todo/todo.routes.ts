import { Routes } from '@angular/router';

export const TODO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/todo-page/todo-page.component').then(
        m => m.TodoPageComponent
      ),
  },
];
