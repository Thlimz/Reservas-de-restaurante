import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'reservas' },
  { path: 'reservas', loadComponent: () => import('./features/reservas/reservas.component').then((m) => m.ReservasComponent) },
  { path: 'disponibilidade', loadComponent: () => import('./features/disponibilidade/disponibilidade.component').then((m) => m.DisponibilidadeComponent) },
  { path: 'mesas', loadComponent: () => import('./features/mesas/mesas.component').then((m) => m.MesasComponent) },
  { path: 'clientes', loadComponent: () => import('./features/clientes/clientes.component').then((m) => m.ClientesComponent) },
  { path: 'restaurantes', loadComponent: () => import('./features/restaurantes/restaurantes.component').then((m) => m.RestaurantesComponent) },
  { path: '**', redirectTo: 'reservas' },
];