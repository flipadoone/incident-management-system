import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';

/**
 * Rotas principais da aplicação.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login,
    title: 'Login | Via Appia'
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    title: 'Demandas | Via Appia'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];