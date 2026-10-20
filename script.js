(function () {
  // ---------- Aberto agora? (horário de Brasília) ----------
  var turnos = [[7 * 60 + 30, 11 * 60 + 30], [13 * 60, 18 * 60]]; // seg a sex
  var nomes = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  function agoraEmBotucatu() {
    var partes = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    var mapa = {};
    partes.forEach(function (p) { mapa[p.type] = p.value; });
    var dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(mapa.weekday);
    return { dia: dia, minutos: Number(mapa.hour) * 60 + Number(mapa.minute) };
  }
  function hora(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + 'h' + (m ? String(m).padStart(2, '0') : '');
  }
  function diaUtil(d) { return d >= 1 && d <= 5; }
  function proximaAbertura(agora) {
    if (diaUtil(agora.dia)) {
      for (var i = 0; i < turnos.length; i++) {
        if (agora.minutos < turnos[i][0]) return 'hoje às ' + hora(turnos[i][0]);
      }
    }
    var d = (agora.dia + 1) % 7;
    while (!diaUtil(d)) d = (d + 1) % 7;
    return (d === (agora.dia + 1) % 7 ? 'amanhã' : nomes[d]) + ' às ' + hora(turnos[0][0]);
  }
  function atualizarStatus() {
    var status = document.getElementById('status');
    if (!status) return;
    var agora = agoraEmBotucatu();
    var aberto = null;
    if (diaUtil(agora.dia)) {
      turnos.forEach(function (t) { if (agora.minutos >= t[0] && agora.minutos < t[1]) aberto = t; });
    }
    status.classList.toggle('is-aberto', !!aberto);
    status.querySelector('.status__texto').textContent = aberto
      ? 'Aberto agora, até ' + hora(aberto[1])
      : 'Fechado agora. Abre ' + proximaAbertura(agora);
    document.querySelectorAll('.horario tr').forEach(function (tr) {
      tr.classList.toggle('is-hoje', Number(tr.dataset.dia) === agora.dia);
    });
  }
  atualizarStatus();
  setInterval(atualizarStatus, 60 * 1000);

  // ---------- Painel: luzes de alerta ----------
  var luzes = {
    injecao: {
      nome: 'Luz da injeção eletrônica',
      texto: 'Pode ser um sensor, vela, bobina ou outro item do sistema de injeção. O diagnóstico eletrônico mostra a causa.',
      servico: 'Injeção eletrônica e diagnóstico',
      cor: 'var(--ambar)'
    },
    bateria: {
      nome: 'Luz da bateria',
      texto: 'Indica problema na carga do sistema elétrico: bateria, alternador ou fiação. Se o carro está demorando para pegar, vale testar logo.',
      servico: 'Baterias e alternadores',
      cor: 'var(--vermelha)'
    },
    oleo: {
      nome: 'Luz do óleo',
      texto: 'Indica pressão baixa do óleo do motor. Desligue o motor assim que for seguro e fale com a gente antes de seguir viagem.',
      servico: 'Troca de óleo e mecânica geral',
      cor: 'var(--vermelha)'
    },
    freio: {
      nome: 'Luz do freio',
      texto: 'Pode ser o freio de mão puxado, fluido baixo ou desgaste no sistema. Freio não é item para deixar para depois.',
      servico: 'Freios',
      cor: 'var(--vermelha)'
    },
    diesel: {
      nome: 'Luz da vela aquecedora (diesel)',
      texto: 'Em motores a diesel, pode indicar falha no pré-aquecimento ou no sistema de injeção, incluindo a bomba injetora.',
      servico: 'Bombas injetoras e diesel',
      cor: 'var(--ambar)'
    },
    cambio: {
      nome: 'Luz do câmbio automático',
      texto: 'Luz acesa, trancos ou demora para engatar pedem diagnóstico do câmbio antes que o problema aumente.',
      servico: 'Câmbio automático',
      cor: 'var(--ambar)'
    }
  };

  var botoes = document.querySelectorAll('.luz');
  var leitura = document.getElementById('leitura');
  var cta = document.getElementById('leitura-cta');

  function mostrar(chave) {
    var luz = luzes[chave];
    if (!luz) return;
    botoes.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.luz === chave)); });
    document.getElementById('leitura-luz').textContent = luz.nome;
    document.getElementById('leitura-texto').textContent = luz.texto;
    document.getElementById('leitura-servico').textContent = luz.servico;
    leitura.style.setProperty('--cor-leitura', luz.cor);
    var msg = 'Olá, AutoMais! A ' + luz.nome.charAt(0).toLowerCase() + luz.nome.slice(1) + ' acendeu no meu carro. Posso mandar uma foto do painel?';
    cta.href = 'https://wa.me/5514998207574?text=' + encodeURIComponent(msg);
    cta.dataset.cta = 'whatsapp-painel-' + chave;
  }
  botoes.forEach(function (b) {
    b.addEventListener('click', function () { mostrar(b.dataset.luz); });
  });
  mostrar('injecao');

  // ---------- Botão flutuante do WhatsApp ----------
  var zap = document.querySelector('.zap-fixo');
  function rolar() { zap.classList.toggle('is-visivel', window.scrollY > 700); }
  window.addEventListener('scroll', rolar, { passive: true });
  rolar();

  // ---------- Medição de cliques (só com GTM ou Plausible instalados) ----------
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-cta]');
    if (!link) return;
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'clique_cta', cta: link.dataset.cta });
    if (typeof window.plausible === 'function') window.plausible('Clique CTA', { props: { cta: link.dataset.cta } });
  });
})();
