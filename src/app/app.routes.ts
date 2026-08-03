import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { TodoComponent } from './pages/todo/todo.component';
import { Register } from './pages/register/register';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'todo',
    component: TodoComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
