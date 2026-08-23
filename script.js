// ====== MENU MOBILE ======
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');

menuToggle.addEventListener('click', () => {
  menu.classList.toggle('ativo');
  const expandido = menu.classList.contains('ativo');
  menuToggle.setAttribute('aria-expanded', expandido);
});

// Fecha menu ao clicar em link (mobile)
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) menu.classList.remove('ativo');
  });
});

// ====== ALTO CONTRASTE ======
document.getElementById('btnContraste').addEventListener('click', () => {
  document.body.classList.toggle('alto-contraste');
});

// ====== SELETOR DE CORES ======
const comportamentoCores = {
  Vermelho: '🔴 Vermelho: absorve parte da radiação, mas reflete a faixa vermelha. Potencial de aquecimento moderado.',
  Azul: '🔵 Azul: absorve parte da radiação, refletindo a faixa azul. Potencial de aquecimento moderado.',
  Verde: '🟢 Verde: absorve parte da radiação, refletindo a faixa verde. Potencial de aquecimento moderado.',
  Preto: '⚫ Preto: alta absorção da radiação → maior potencial de aquecimento. Observação: o desempenho real também depende do revestimento, material, geometria e condições de operação.',
  Branco: '⚪ Branco: alta reflexão da radiação → menor potencial de aquecimento.'
};

document.querySelectorAll('.botao-cor').forEach(btn => {
  btn.addEventListener('click', () => {
    const cor = btn.dataset.cor;
    document.getElementById('resultadoCor').textContent = comportamentoCores[cor];
  });
});

// ====== SIMULAÇÃO RÁPIDA (programação) ======
document.getElementById('btnSimularRapido').addEventListener('click', () => {
  const resultado = document.getElementById('resultadoRapido');
  resultado.innerHTML = `
    <p>🌡️ Temperatura: <strong>27 °C</strong></p>
    <p>🎯 Temperatura desejada: <strong>30 °C</strong></p>
    <p>☀️ Radiação solar: <strong>alta</strong></p>
    <p>Status: <strong style="color: var(--amarelo);">☀️ Aquecimento ativado</strong></p>
    <hr style="margin: 1rem 0; border-color: var(--azul);">
    <p>🌡️ Temperatura: <strong>30 °C</strong></p>
    <p>Status: <strong style="color: var(--verde);">✅ Temperatura atingida — bomba desligada</strong></p>
  `;
});

// ====== TEXT-TO-SPEECH (Acessibilidade) ======
const btnOuvir = document.getElementById('btnOuvir');
let falando = false;

btnOuvir.addEventListener('click', () => {
  if (!('speechSynthesis' in window)) {
    alert('Seu navegador não suporta síntese de voz.');
    return;
  }
  if (falando) {
    speechSynthesis.cancel();
    btnOuvir.textContent = '🔊 Ouvir esta seção';
    falando = false;
    return;
  }
  const texto = document.getElementById('texto-acessibilidade').textContent;
  const utter = new SpeechSynthesisUtterance(texto);
  utter.lang = 'pt-BR';
  utter.rate = 1;
  utter.onend = () => {
    btnOuvir.textContent = '🔊 Ouvir esta seção';
    falando = false;
  };
  speechSynthesis.speak(utter);
  btnOuvir.textContent = '⏹️ Parar leitura';
  falando = true;
});

// ====== SLIDERS DO LABORATÓRIO ======
const tempIni = document.getElementById('tempInicial');
const tempDes = document.getElementById('tempDesejada');
const area = document.getElementById('area');

tempIni.addEventListener('input', () => {
  document.getElementById('lblTempIni').textContent = tempIni.value;
});
tempDes.addEventListener('input', () => {
  document.getElementById('lblTempDes').textContent = tempDes.value;
});
area.addEventListener('input', () => {
  document.getElementById('lblArea').textContent = area.value;
});

// ====== SIMULADOR COMPLETO ======
document.getElementById('btnSimular').addEventListener('click', () => {
  const tIni = parseFloat(tempIni.value);
  const tDes = parseFloat(tempDes.value);
  const intensidade = document.getElementById('intensidade').value;
  const areaVal = parseFloat(area.value);

  // Fator de aquecimento por minuto (estimativa didática)
  const fatores = { baixa: 0.05, media: 0.12, alta: 0.22 };
  const fator = fatores[intensidade] * (areaVal / 10);

  const resultado = document.getElementById('resultadoSimulador');
  resultado.innerHTML = `
    <div class="animacao-simulador">
      <div class="etapa-anim">☀️ Radiação solar (${intensidade})</div>
      <div class="etapa-anim">↓</div>
      <div class="etapa-anim">🔲 Coletor (${areaVal} m²)</div>
      <div class="etapa-anim">↓</div>
      <div class="etapa-anim">🔥 Energia térmica</div>
      <div class="etapa-anim">↓</div>
      <div class="etapa-anim">💧 Água aquecendo...</div>
      <div class="etapa-anim">↓</div>
      <div class="etapa-anim" id="tempFinal">🌡️ ... °C</div>
      <div class="etapa-anim" id="statusFinal">🏊 ...</div>
    </div>
  `;

  const etapas = resultado.querySelectorAll('.etapa-anim');
  etapas.forEach((etapa, i) => {
    setTimeout(() => etapa.classList.add('ativo'), i * 400);
  });

  // Simula evolução da temperatura
  let tempAtual = tIni;
  let tempo = 0;
  const intervalo = setInterval(() => {
    tempAtual += fator;
    tempo++;
    if (tempAtual >= tDes || tempo > 60) {
      clearInterval(intervalo);
      tempAtual = Math.min(tempAtual, tDes);
      document.getElementById('tempFinal').textContent = `🌡️ ${tempAtual.toFixed(1)} °C`;
      document.getElementById('statusFinal').textContent = tempAtual >= tDes
        ? '✅ Temperatura atingida — bomba desligada'
        : '⚠️ Tempo insuficiente para atingir a temperatura desejada';
      document.getElementById('tempFinal').classList.add('ativo');
      document.getElementById('statusFinal').classList.add('ativo');
      atualizarGrafico(tIni, fator, tDes);
    }
  }, 300);
});

// ====== GRÁFICO (canvas puro) ======
function atualizarGrafico(tIni, fator, tDes) {
  const canvas = document.getElementById('graficoTemp');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Fundo
  ctx.fillStyle = '#071A2B';
  ctx.fillRect(0, 0, w, h);

  // Eixos
  ctx.strokeStyle = '#00A8E8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 20);
  ctx.lineTo(50, h - 30);
  ctx.lineTo(w - 20, h - 30);
  ctx.stroke();

  // Labels eixo Y
  ctx.fillStyle = '#F5F7FA';
  ctx.font = '12px sans-serif';
  for (let t = 15; t <= 40; t += 5) {
    const y = h - 30 - ((t - 15) / 25) * (h - 60);
    ctx.fillText(t + '°C', 10, y + 4);
    ctx.strokeStyle = 'rgba(0,168,232,0.2)';
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();
  }

  // Dados simulados
  const pontos = [];
  let temp = tIni;
  for (let i = 0; i < 30; i++) {
    pontos.push(temp);
    if (temp < tDes) temp += fator;
    else temp = tDes;
  }

  // Linha da temperatura
  ctx.strokeStyle = '#FFC857';
  ctx.lineWidth = 3;
  ctx.beginPath();
  pontos.forEach((t, i) => {
    const x = 50 + (i / (pontos.length - 1)) * (w - 80);
    const y = h - 30 - ((t - 15) / 25) * (h - 60);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Linha da temperatura desejada
  ctx.strokeStyle = '#20C997';
  ctx.setLineDash([5, 5]);
  const yDes = h - 30 - ((tDes - 15) / 25) * (h - 60);
  ctx.beginPath();
  ctx.moveTo(50, yDes);
  ctx.lineTo(w - 20, yDes);
  ctx.stroke();
  ctx.setLineDash([]);

  // Legenda
  ctx.fillStyle = '#FFC857';
  ctx.fillText('— Temperatura real', 70, 40);
  ctx.fillStyle = '#20C997';
  ctx.fillText('--- Temperatura desejada', 70, 60);
  ctx.fillStyle = '#F5F7FA';
  ctx.fillText('Tempo (min) →', w - 120, h - 10);
}

// Desenha gráfico inicial
atualizarGrafico(24, 0.12, 30);

// ====== ANIMAÇÃO AO SCROLL (diagramas) ======
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.etapa').forEach((etapa, i) => {
        etapa.style.animationDelay = (i * 0.15) + 's';
      });
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.diagrama').forEach(d => observer.observe(d));

// ====== DISCO DE NEWTON ======
const disco = document.getElementById('discoNewton');
const btnGirar = document.getElementById('btnGirarDisco');
const statusDisco = document.getElementById('statusDisco');
let discoGirando = false;

btnGirar.addEventListener('click', () => {
  discoGirando = !discoGirando;
  
  if (discoGirando) {
    disco.classList.add('girando');
    btnGirar.textContent = '⏸️ Parar Disco';
    statusDisco.textContent = '🌀 Disco girando — as cores se misturam e formam o branco!';
    statusDisco.style.color = 'var(--amarelo)';
  } else {
    disco.classList.remove('girando');
    btnGirar.textContent = '▶️ Girar Disco';
    statusDisco.textContent = 'Disco parado — observe as 7 cores separadas';
    statusDisco.style.color = 'var(--verde)';
  }
});
