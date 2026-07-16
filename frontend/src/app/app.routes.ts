import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'reservas' },
  { path: 'reservas', canActivate: [authGuard], loadComponent: () => import('./features/reservas/reservas.component').then((m) => m.ReservasComponent) },
  { path: 'disponibilidade', canActivate: [authGuard], loadComponent: () => import('./features/disponibilidade/disponibilidade.component').then((m) => m.DisponibilidadeComponent) },
  { path: 'mesas', canActivate: [authGuard], loadComponent: () => import('./features/mesas/mesas.component').then((m) => m.MesasComponent) },
  { path: 'clientes', canActivate: [authGuard], loadComponent: () => import('./features/clientes/clientes.component').then((m) => m.ClientesComponent) },
  { path: 'restaurantes', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/restaurantes/restaurantes.component').then((m) => m.RestaurantesComponent) },
  { path: '**', redirectTo: 'reservas' },
];
