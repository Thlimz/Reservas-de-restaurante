import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiError } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  protected username = '';
  protected senha = '';
  protected carregando = signal(false);
  protected erro = signal<string | null>(null);

  constructor() {
    // ja logado? vai direto para o app
    if (this.auth.logado()) { this.router.navigate(['/']); }
  }

  protected entrar(): void {
    if (!this.username.trim() || !this.senha) {
      this.erro.set('Informe usuário e senha.');
      return;
    }
    this.erro.set(null);
    this.carregando.set(true);
    this.auth.login(this.username.trim(), this.senha).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/']);
      },
      error: (e: ApiError) => {
        this.carregando.set(false);
        this.erro.set(e?.message ?? 'Não foi possível entrar. Tente novamente.');
      },
    });
  }
}
