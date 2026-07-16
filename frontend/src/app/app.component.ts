import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RestauranteAtivoService } from './core/services/restaurante-ativo.service';
import { ToastComponent } from './shared/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  protected restAtivo = inject(RestauranteAtivoService);
  protected theme = signal<'light' | 'dark'>('light');

  protected readonly abas = [
    { path: '/reservas', label: 'Reservas' },
    { path: '/disponibilidade', label: 'Disponibilidade' },
    { path: '/mesas', label: 'Mesas' },
    { path: '/clientes', label: 'Clientes' },
    { path: '/restaurantes', label: 'Restaurantes' },
  ];

  ngOnInit(): void {
    const prefereDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.theme.set(prefereDark ? 'dark' : 'light');
    this.restAtivo.carregar();
  }

  protected onRestauranteChange(value: string): void { this.restAtivo.setAtivo(Number(value)); }

  protected toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    document.documentElement.setAttribute('data-theme', next);
  }
}