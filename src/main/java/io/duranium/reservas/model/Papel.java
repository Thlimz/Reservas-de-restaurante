package io.duranium.reservas.model;

/**
 * Papel de acesso de um usuario.
 * ADMIN       -> desenvolvedor/administrador: acesso total, gerencia restaurantes.
 * RESTAURANTE -> operador de um restaurante: enxerga apenas os dados do proprio restaurante.
 */
public enum Papel {
    ADMIN,
    RESTAURANTE
}
