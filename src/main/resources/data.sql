-- ============================================================
-- Dados iniciais (seed) para MySQL.
-- INSERT IGNORE + ids explicitos = idempotente: roda a cada boot
-- sem duplicar. Linhas criadas pelo app continuam a partir do maior id.
-- ============================================================

-- Restaurantes
INSERT IGNORE INTO restaurantes (id, nome, endereco, telefone) VALUES
  (1, 'Cantina da Nona', 'Rua das Oliveiras, 123', '(11) 3333-1000'),
  (2, 'Sushi Duranium', 'Av. Paulista, 900', '(11) 3333-2000');

-- Clientes (cada cliente pertence a um restaurante)
INSERT IGNORE INTO clientes (id, nome, telefone, email, restaurante_id) VALUES
  (1, 'Joao Silva', '(11) 99999-9999', 'joao.silva@email.com', 1),
  (2, 'Maria Souza', '(11) 98888-8888', 'maria.souza@email.com', 1),
  (3, 'Carlos Lima', '(11) 97777-7777', 'carlos.lima@email.com', 2);

-- Migra clientes antigos (criados antes do vinculo com restaurante)
UPDATE clientes SET restaurante_id = 1 WHERE restaurante_id IS NULL;

-- Mesas do restaurante 1 (Cantina da Nona)
INSERT IGNORE INTO mesas (id, restaurante_id, numero, capacidade, tipo, ativo) VALUES
  (1, 1, 1, 2, 'MESA', TRUE),
  (2, 1, 2, 4, 'MESA', TRUE),
  (3, 1, 3, 4, 'MESA', TRUE),
  (4, 1, 12, 6, 'MESA', TRUE),
  (5, 1, 20, 12, 'SALA', TRUE);

-- Mesas do restaurante 2 (Sushi Duranium)
INSERT IGNORE INTO mesas (id, restaurante_id, numero, capacidade, tipo, ativo) VALUES
  (6, 2, 1, 2, 'MESA', TRUE),
  (7, 2, 2, 8, 'SALA', TRUE);

-- Uma reserva de exemplo (mesa id 4 = numero 12, cliente id 1 = Joao)
INSERT IGNORE INTO reservas
  (id, cliente_id, mesa_id, data_reserva, hora_inicio, hora_fim, pessoas, status, observacao, criado_em)
VALUES
  (1, 1, 4, '2026-07-20', '19:30:00', '21:30:00', 4, 'CONFIRMADA', 'Aniversario', NOW());
