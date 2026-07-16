import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { RestauranteAtivoService } from './core/services/restaurante-ativo.service';
import { ToastComponent } from './shared/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  protected auth = inject(AuthService);
  protected restAtivo = inject(RestauranteAtivoService);
  protected theme = signal<'light' | 'dark'>('light');

  /** A aba Restaurantes e exclusiva do ADMIN. */
  protected readonly abas = computed(() => {
    const base = [
      { path: '/reservas', label: 'Reservas' },
      { path: '/disponibilidade', label: 'Disponibilidade' },
      { path: '/mesas', label: 'Mesas' },
      { path: '/clientes', label: 'Clientes' },
    ];
    return this.auth.isAdmin() ? [...base, { path: '/restaurantes', label: 'Restaurantes' }] : base;
  });

  constructor() {
    // Sincroniza o contexto de restaurante com a sessao:
    // ADMIN carrega a lista (seletor); RESTAURANTE fica travado no proprio.
    effect(() => {
      const sessao = this.auth.sessao();
      untracked(() => {
        if (!sessao) { this.restAtivo.limpar(); return; }
        if (sessao.papel === 'ADMIN') {
          this.restAtivo.carregar();
        } else if (sessao.restauranteId != null) {
          this.restAtivo.definirFixo(sessao.restauranteId, sessao.restauranteNome ?? 'Meu restaurante');
        }
      });
    });
  }

  ngOnInit(): void {
    const prefereDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.theme.set(prefereDark ? 'dark' : 'light');
  }

  protected onRestauranteChange(value: string): void { this.restAtivo.setAtivo(Number(value)); }

  protected sair(): void { this.auth.logout(); }

  protected toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    document.documentElement.setAttribute('data-theme', next);
  }
}
