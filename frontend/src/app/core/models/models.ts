export type TipoMesa = 'MESA' | 'SALA';
export type StatusReserva = 'AGENDADA' | 'CONFIRMADA' | 'FINALIZADA' | 'CANCELADA';

export interface Restaurante { id: number; nome: string; endereco: string; telefone: string; }
export interface RestauranteInput { nome: string; endereco: string; telefone: string; }

export interface Mesa { id: number; restauranteId: number; numero: number; capacidade: number; tipo: TipoMesa; ativo: boolean; }
export interface MesaInput { restauranteId: number; numero: number; capacidade: number; tipo: TipoMesa; ativo: boolean; }

export interface Cliente { id: number; nome: string; telefone: string; email: string; }
export interface ClienteInput { nome: string; telefone: string; email: string; }

export interface Disponibilidade { mesaId: number; numero: number; capacidade: number; tipo: TipoMesa; disponivel: boolean; }

export interface ReservaInput {
  clienteId: number; mesaId: number;
  dataReserva: string; horaInicio: string; horaFim: string;
  pessoas: number; observacao?: string;
}

export interface Reserva {
  id: number;
  cliente: { id: number; nome: string; telefone: string };
  mesa: { id: number; numero: number; capacidade: number };
  dataReserva: string; horaInicio: string; horaFim: string;
  pessoas: number; status: StatusReserva; observacao: string; criadoEm: string;
}

/** Formato de erro unificado da API, normalizado pelo interceptor. */
export interface ApiError {
  status: number;
  message: string;
  camposInvalidos: Record<string, string>;
}