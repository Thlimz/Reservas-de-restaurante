import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiError, Cliente, Mesa, Reserva, StatusReserva } from '../../core/models/models';
import { ReservaService } from '../../core/services/reserva.service';
import { ClienteService } from '../../core/services/cliente.service';
import { MesaService } from '../../core/services/mesa.service';
import { RestauranteAtivoService } from '../../core/services/restaurante-ativo.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { SpinnerComponent } from '../../shared/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { formatDateBr, isoToday, dentroJanelaCancelamento } from '../../core/util/format';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [ReactiveFormsModule, StatusBadgeComponent, SpinnerComponent, EmptyStateComponent],
  templateUrl: './reservas.component.html',
})
export class ReservasComponent {
  private reservaSrv = inject(ReservaService);
  private clienteSrv = inject(ClienteService);
  private mesaSrv = inject(MesaService);
  private restAtivo = inject(RestauranteAtivoService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  protected reservas = signal<Reserva[]>([]);
  protected clientes = signal<Cliente[]>([]);
  protected mesas = signal<Mesa[]>([]);
  protected loading = signal(true);
  protected saving = signal(false);
  protected filtroData = signal('');
  protected filtroStatus = signal<StatusReserva | ''>('');
  protected readonly formatDateBr = formatDateBr;

  protected form = this.fb.nonNullable.group(
    {
      clienteId: this.fb.control<number | null>(null, Validators.required),
      mesaId: this.fb.control<number | null>(null, Validators.required),
      dataReserva: [isoToday(), Validators.required],
      pessoas: [2, [Validators.required, Validators.min(1)]],
      horaInicio: ['19:00', Validators.required],
      horaFim: ['21:00', Validators.required],
      observacao: [''],
    },
    { validators: (g) => (g.get('horaFim')!.value <= g.get('horaInicio')!.value ? { horaFim: true } : null) },
  );

  constructor() {
    // recarrega lista + mesas quando o restaurante ativo muda
    effect(() => {
      const id = this.restAtivo.ativoId();
      if (id != null) { this.mesaSrv.listar(id).subscribe((m) => this.mesas.set(m)); }
      this.carregar();
    });
    this.clienteSrv.listar().subscribe((c) => this.clientes.set(c));
    // pré-preenchimento vindo da tela de Disponibilidade
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((q) => {
      if (q.get('mesaId')) {
        this.form.patchValue({
          mesaId: Number(q.get('mesaId')),
          dataReserva: q.get('data') ?? this.form.controls.dataReserva.value,
          horaInicio: q.get('inicio') ?? this.form.controls.horaInicio.value,
          horaFim: q.get('fim') ?? this.form.controls.horaFim.value,
          pessoas: q.get('pessoas') ? Number(q.get('pessoas')) : this.form.controls.pessoas.value,
        });
      }
    });
  }

  protected carregar(): void {
    this.loading.set(true);
    this.reservaSrv
      .listar({ data: this.filtroData(), status: this.filtroStatus() })
      .subscribe({
        next: (list) => { this.reservas.set(this.doRestauranteAtivo(list)); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  private doRestauranteAtivo(list: Reserva[]): Reserva[] {
    const ids = new Set(this.mesas().map((m) => m.id));
    const filtradas = ids.size ? list.filter((r) => ids.has(r.mesa.id)) : list;
    return [...filtradas].sort((a, b) =>
      (a.dataReserva + a.horaInicio).localeCompare(b.dataReserva + b.horaInicio),
    );
  }

  protected aplicarFiltroData(v: string): void { this.filtroData.set(v); this.carregar(); }
  protected aplicarFiltroStatus(v: string): void { this.filtroStatus.set(v as StatusReserva | ''); this.carregar(); }
  protected limparFiltros(): void { this.filtroData.set(''); this.filtroStatus.set(''); this.carregar(); }
  protected temFiltro(): boolean { return !!(this.filtroData() || this.filtroStatus()); }

  // ---- ações de status ----
  protected podeConfirmar(r: Reserva): boolean { return r.status === 'AGENDADA'; }
  protected podeFinalizar(r: Reserva): boolean { return r.status === 'CONFIRMADA'; }
  protected podeCancelar(r: Reserva): boolean {
    return (r.status === 'AGENDADA' || r.status === 'CONFIRMADA') && dentroJanelaCancelamento(r.dataReserva, r.horaInicio);
  }
  protected foraDaJanela(r: Reserva): boolean {
    return (r.status === 'AGENDADA' || r.status === 'CONFIRMADA') && !dentroJanelaCancelamento(r.dataReserva, r.horaInicio);
  }
  protected terminal(r: Reserva): boolean { return r.status === 'CANCELADA' || r.status === 'FINALIZADA'; }

  protected mudarStatus(r: Reserva, status: StatusReserva, verbo: string): void {
    this.reservaSrv.atualizarStatus(r.id, status).subscribe((atual) => {
      this.reservas.update((list) => list.map((x) => (x.id === atual.id ? atual : x)));
      this.toast.success('Reserva de ' + r.cliente.nome + ' \u00b7 ' + verbo + '.');
    });
  }

  // ---- criar reserva ----
  protected criar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Revise os campos destacados.');
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.reservaSrv
      .criar({
        clienteId: v.clienteId!, mesaId: v.mesaId!,
        dataReserva: v.dataReserva, horaInicio: v.horaInicio, horaFim: v.horaFim,
        pessoas: v.pessoas, observacao: v.observacao || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.form.patchValue({ observacao: '' });
          this.toast.success('Reserva criada com sucesso.');
          this.carregar();
        },
        error: (e: ApiError) => {
          this.saving.set(false);
          // 400: marca os campos invalidos vindos do back
          for (const campo of Object.keys(e.camposInvalidos)) {
            this.form.get(campo)?.setErrors({ servidor: e.camposInvalidos[campo] });
          }
          // 422 ja foi exibido como toast pelo interceptor
        },
      });
  }

  protected erroServidor(campo: string): string | null {
    const c = this.form.get(campo);
    return c && c.errors?.['servidor'] ? (c.errors['servidor'] as string) : null;
  }
  protected invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.touched || c.dirty);
  }
}