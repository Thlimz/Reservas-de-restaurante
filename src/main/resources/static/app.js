// ============================================================
// Cliente da API de Reservas de Restaurante
// ============================================================

const API = ''; // mesma origem do backend

// ---------- Utilidades ----------
async function api(metodo, caminho, corpo) {
    const opcoes = { method: metodo, headers: {} };
    if (corpo !== undefined) {
        opcoes.headers['Content-Type'] = 'application/json';
        opcoes.body = JSON.stringify(corpo);
    }
    const resp = await fetch(API + caminho, opcoes);
    const texto = await resp.text();
    const dados = texto ? JSON.parse(texto) : null;
    if (!resp.ok) {
        const msg = dados && dados.message ? dados.message : `Erro ${resp.status}`;
        throw new Error(msg);
    }
    return dados;
}

function toast(mensagem, tipo = 'ok') {
    const el = document.getElementById('toast');
    el.textContent = mensagem;
    el.className = `toast mostrar ${tipo}`;
    setTimeout(() => { el.className = 'toast'; }, 3200);
}

function formValores(form) {
    const dados = {};
    new FormData(form).forEach((v, k) => { dados[k] = v; });
    return dados;
}

function hoje() {
    return new Date().toISOString().slice(0, 10);
}

function restauranteSelecionado() {
    return document.getElementById('restauranteAtivo').value;
}

// ---------- Abas ----------
document.querySelectorAll('.aba').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.aba').forEach(b => b.classList.remove('ativa'));
        document.querySelectorAll('.painel').forEach(p => p.classList.remove('ativo'));
        btn.classList.add('ativa');
        document.getElementById(btn.dataset.aba).classList.add('ativo');
    });
});

// ============================================================
// RESTAURANTES
// ============================================================
async function carregarRestaurantes() {
    const lista = await api('GET', '/restaurantes');

    // Preenche o seletor do topo
    const picker = document.getElementById('restauranteAtivo');
    const anterior = picker.value;
    picker.innerHTML = lista.map(r => `<option value="${r.id}">${r.nome}</option>`).join('');
    if (anterior) picker.value = anterior;

    // Lista da aba
    const cont = document.getElementById('listaRestaurantes');
    cont.innerHTML = lista.length ? lista.map(r => `
        <div class="item">
            <div class="item-info">
                <strong>${r.nome}</strong>
                <small>${r.endereco || 'sem endereço'} · ${r.telefone || 'sem telefone'}</small>
            </div>
            <small>#${r.id}</small>
        </div>`).join('') : '<p class="vazio">Nenhum restaurante cadastrado.</p>';
}

document.getElementById('formRestaurante').addEventListener('submit', async e => {
    e.preventDefault();
    try {
        const dados = formValores(e.target);
        await api('POST', '/restaurantes', dados);
        e.target.reset();
        toast('Restaurante criado!');
        await carregarRestaurantes();
        await aoTrocarRestaurante();
    } catch (err) { toast(err.message, 'erro'); }
});

// ============================================================
// CLIENTES
// ============================================================
async function carregarClientes() {
    const lista = await api('GET', '/clientes');

    const select = document.getElementById('reservaCliente');
    const anterior = select.value;
    select.innerHTML = lista.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    if (anterior) select.value = anterior;

    const cont = document.getElementById('listaClientes');
    cont.innerHTML = lista.length ? lista.map(c => `
        <div class="item">
            <div class="item-info">
                <strong>${c.nome}</strong>
                <small>${c.telefone || 'sem telefone'} · ${c.email || 'sem e-mail'}</small>
            </div>
            <small>#${c.id}</small>
        </div>`).join('') : '<p class="vazio">Nenhum cliente cadastrado.</p>';
}

document.getElementById('formCliente').addEventListener('submit', async e => {
    e.preventDefault();
    try {
        await api('POST', '/clientes', formValores(e.target));
        e.target.reset();
        toast('Cliente cadastrado!');
        await carregarClientes();
    } catch (err) { toast(err.message, 'erro'); }
});

// ============================================================
// MESAS
// ============================================================
async function carregarMesas() {
    const id = restauranteSelecionado();
    if (!id) return;
    const mesas = await api('GET', `/restaurantes/${id}/mesas`);

    // Grade da aba Mesas
    const cont = document.getElementById('listaMesas');
    cont.innerHTML = mesas.length ? mesas.map(m => `
        <div class="mesa-card ${m.ativo ? '' : 'inativa'}">
            <div class="num">${m.numero}</div>
            <div class="cap">${m.capacidade} lugares</div>
            <div class="tag">${m.tipo}</div>
            ${m.ativo ? '' : '<div class="estado">inativa</div>'}
        </div>`).join('') : '<p class="vazio">Nenhuma mesa neste restaurante.</p>';

    // Seletor de mesa no formulário de reserva
    const select = document.getElementById('reservaMesa');
    const anterior = select.value;
    select.innerHTML = mesas
        .filter(m => m.ativo)
        .map(m => `<option value="${m.id}">Mesa ${m.numero} (${m.capacidade} lug. · ${m.tipo})</option>`)
        .join('');
    if (anterior) select.value = anterior;
}

document.getElementById('formMesa').addEventListener('submit', async e => {
    e.preventDefault();
    const id = restauranteSelecionado();
    if (!id) { toast('Cadastre/selecione um restaurante primeiro.', 'erro'); return; }
    try {
        const v = formValores(e.target);
        await api('POST', '/mesas', {
            restauranteId: Number(id),
            numero: Number(v.numero),
            capacidade: Number(v.capacidade),
            tipo: v.tipo,
            ativo: e.target.ativo.checked
        });
        e.target.reset();
        toast('Mesa cadastrada!');
        await carregarMesas();
    } catch (err) { toast(err.message, 'erro'); }
});

// ============================================================
// RESERVAS
// ============================================================
async function carregarReservas() {
    const data = document.getElementById('filtroData').value;
    const status = document.getElementById('filtroStatus').value;
    const params = new URLSearchParams();
    if (data) params.set('data', data);
    if (status) params.set('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';

    const reservas = await api('GET', `/reservas${query}`);
    const cont = document.getElementById('listaReservas');

    if (!reservas.length) {
        cont.innerHTML = '<p class="vazio">Nenhuma reserva encontrada.</p>';
        return;
    }

    cont.innerHTML = reservas.map(r => `
        <div class="item">
            <div class="item-info">
                <strong>${r.cliente.nome} · Mesa ${r.mesa.numero}</strong>
                <small>${formatarData(r.dataReserva)} · ${r.horaInicio}–${r.horaFim} · ${r.pessoas} pessoa(s)</small>
                ${r.observacao ? `<small>📝 ${r.observacao}</small>` : ''}
            </div>
            <div class="item-acoes">
                <span class="badge ${r.status}">${r.status}</span>
                ${botoesStatus(r)}
            </div>
        </div>`).join('');
}

function botoesStatus(r) {
    if (r.status === 'CANCELADA' || r.status === 'FINALIZADA') return '';
    let botoes = '';
    if (r.status === 'AGENDADA') {
        botoes += `<button class="acao confirmar" onclick="mudarStatus(${r.id}, 'CONFIRMADA')">Confirmar</button>`;
    }
    if (r.status === 'CONFIRMADA') {
        botoes += `<button class="acao finalizar" onclick="mudarStatus(${r.id}, 'FINALIZADA')">Finalizar</button>`;
    }
    botoes += `<button class="acao cancelar" onclick="mudarStatus(${r.id}, 'CANCELADA')">Cancelar</button>`;
    return botoes;
}

async function mudarStatus(id, status) {
    try {
        await api('PATCH', `/reservas/${id}`, { status });
        toast(`Reserva ${status.toLowerCase()}.`);
        await carregarReservas();
    } catch (err) { toast(err.message, 'erro'); }
}

document.getElementById('formReserva').addEventListener('submit', async e => {
    e.preventDefault();
    try {
        const v = formValores(e.target);
        await api('POST', '/reservas', {
            clienteId: Number(v.clienteId),
            mesaId: Number(v.mesaId),
            dataReserva: v.dataReserva,
            horaInicio: v.horaInicio,
            horaFim: v.horaFim,
            pessoas: Number(v.pessoas),
            observacao: v.observacao || null
        });
        toast('Reserva criada com status AGENDADA!');
        await carregarReservas();
    } catch (err) { toast(err.message, 'erro'); }
});

document.getElementById('btnFiltrar').addEventListener('click', carregarReservas);
document.getElementById('btnLimparFiltro').addEventListener('click', () => {
    document.getElementById('filtroData').value = '';
    document.getElementById('filtroStatus').value = '';
    carregarReservas();
});

function formatarData(iso) {
    if (!iso) return '';
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a}`;
}

// ============================================================
// DISPONIBILIDADE
// ============================================================
document.getElementById('formDisponibilidade').addEventListener('submit', async e => {
    e.preventDefault();
    const id = restauranteSelecionado();
    if (!id) { toast('Selecione um restaurante.', 'erro'); return; }
    try {
        const v = formValores(e.target);
        const params = new URLSearchParams({ data: v.data, inicio: v.inicio, fim: v.fim });
        const mesas = await api('GET', `/restaurantes/${id}/disponibilidade?${params.toString()}`);
        const cont = document.getElementById('listaDisponibilidade');
        cont.innerHTML = mesas.length ? mesas.map(m => `
            <div class="mesa-card ${m.disponivel ? 'livre' : 'ocupada'}">
                <div class="num">${m.numero}</div>
                <div class="cap">${m.capacidade} lugares</div>
                <div class="tag">${m.tipo}</div>
                <div class="estado">${m.disponivel ? 'LIVRE' : 'OCUPADA'}</div>
            </div>`).join('') : '<p class="vazio">Nenhuma mesa ativa neste restaurante.</p>';
    } catch (err) { toast(err.message, 'erro'); }
});

// ============================================================
// Inicialização
// ============================================================
async function aoTrocarRestaurante() {
    await carregarMesas();
}

document.getElementById('restauranteAtivo').addEventListener('change', aoTrocarRestaurante);

async function iniciar() {
    // Datas padrão = hoje
    document.querySelector('#formReserva [name="dataReserva"]').value = hoje();
    document.querySelector('#formDisponibilidade [name="data"]').value = hoje();

    try {
        await carregarRestaurantes();
        await carregarClientes();
        await carregarMesas();
        await carregarReservas();
    } catch (err) {
        toast('Falha ao conectar na API: ' + err.message, 'erro');
    }
}

iniciar();
