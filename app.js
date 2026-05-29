// Ícones vetoriais (Lucide)
if (window.lucide) lucide.createIcons();

// Ano no rodapé
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Menu mobile
const toggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('nav--open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      nav.classList.remove('nav--open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
}

// Revelação suave ao rolar (respeita prefers-reduced-motion)
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('.reveal');
if (prefersReduced || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('is-visible'));
} else {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => io.observe(el));
}

// Terapias: painel inline que abre no card clicado e fecha ao clicar em outro
const terapiasGrid = document.querySelector('#servicos .cards');
const terapiasConteudo = document.getElementById('terapias-conteudo');
let terapiaPainel = null;
let terapiaAtiva = null;

function criarPainelTerapia() {
  const el = document.createElement('div');
  el.className = 'terapia-painel';
  el.setAttribute('role', 'region');
  el.innerHTML = '<div class="terapia-painel__body"></div>';
  return el;
}
function ultimoDaLinha(card) {
  let last = card;
  terapiasGrid.querySelectorAll('.card[data-terapia]').forEach((c) => {
    if (Math.abs(c.offsetTop - card.offsetTop) < 4) last = c;
  });
  return last;
}
function abrirTerapia(card) {
  if (!terapiasGrid || !terapiasConteudo) return;
  if (!terapiaPainel) terapiaPainel = criarPainelTerapia();
  const fonte = terapiasConteudo.querySelector(`[data-terapia="${card.dataset.terapia}"]`);
  terapiaPainel.querySelector('.terapia-painel__body').innerHTML = fonte ? fonte.innerHTML : '';
  ultimoDaLinha(card).after(terapiaPainel);
  void terapiaPainel.offsetHeight; // reflow p/ animar
  terapiaPainel.classList.add('open');
  terapiasGrid.querySelectorAll('.card[data-terapia]').forEach((c) => {
    const ativo = c === card;
    c.classList.toggle('card--ativo', ativo);
    c.setAttribute('aria-expanded', ativo ? 'true' : 'false');
  });
  terapiaAtiva = card;
}
function fecharTerapia() {
  if (terapiaPainel) terapiaPainel.classList.remove('open');
  if (terapiaAtiva) {
    terapiaAtiva.classList.remove('card--ativo');
    terapiaAtiva.setAttribute('aria-expanded', 'false');
  }
  terapiaAtiva = null;
}
document.querySelectorAll('.card[data-terapia]').forEach((card) => {
  card.setAttribute('aria-expanded', 'false');
  card.addEventListener('click', () => {
    if (terapiaAtiva === card) fecharTerapia();
    else abrirTerapia(card);
  });
});
window.addEventListener('resize', () => {
  if (terapiaAtiva && terapiaPainel) ultimoDaLinha(terapiaAtiva).after(terapiaPainel);
});

// Diretório da equipe (busca + filtro + perfil deslizante)
const eqGrid = document.getElementById('equipeGrid');
if (eqGrid && window.EQUIPE) {
  const EQUIPE = window.EQUIPE;
  const eqBusca = document.getElementById('equipeBusca');
  const eqFiltros = document.getElementById('equipeFiltros');
  const eqContagem = document.getElementById('equipeContagem');
  const eqVazio = document.getElementById('equipeVazio');
  const perfil = document.getElementById('perfil');
  const perfilOverlay = document.getElementById('perfilOverlay');
  const perfilBody = document.getElementById('perfilBody');
  const perfilPrev = document.getElementById('perfilPrev');
  const perfilNext = document.getElementById('perfilNext');
  let filtro = { texto: '', pub: 'Todos' };
  let lista = [];
  let perfilI = -1;

  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function aplicar() {
    const t = filtro.texto.trim().toLowerCase();
    lista = EQUIPE.filter((p) => {
      const okT = !t || (p.nome + ' ' + (p.cargo || '')).toLowerCase().includes(t);
      const okP = filtro.pub === 'Todos' || (p.publico || []).includes(filtro.pub);
      return okT && okP;
    });
    renderGrid();
  }

  function renderGrid() {
    eqGrid.innerHTML = lista.map((p, i) => `
      <button type="button" class="mini" data-i="${i}">
        <span class="mini__foto"><img src="${esc(p.foto)}" alt="Foto de ${esc(p.nome)}" loading="lazy" /></span>
        <span class="mini__nome">${esc(p.nome)}</span>
        <span class="mini__cargo">${esc(p.cargo)}</span>
      </button>`).join('');
    eqVazio.hidden = lista.length > 0;
    eqContagem.textContent = lista.length === EQUIPE.length
      ? `${EQUIPE.length} profissionais`
      : `${lista.length} de ${EQUIPE.length} profissionais`;
  }

  function abrirPerfil(i) {
    if (i < 0 || i >= lista.length) return;
    perfilI = i;
    const p = lista[i];
    const tags = (p.publico || []).map((x) => `<span>${esc(x)}</span>`).join('');
    const form = (p.formacao || []).map((f) => `<li>${esc(f)}</li>`).join('');
    perfilBody.innerHTML = `
      <div class="perfil__lado">
        <div class="perfil__foto"><img src="${esc(p.foto)}" alt="Foto de ${esc(p.nome)}" /></div>
        <div class="perfil__id">
          <h3>${esc(p.nome)}</h3>
          <p class="perfil__cargo">${esc(p.cargo)}${p.registro ? ' · ' + esc(p.registro) : ''}</p>
        </div>
      </div>
      <div class="perfil__main">
        ${p.experiencia ? `<p class="perfil__exp">${esc(p.experiencia)} de experiência</p>` : ''}
        ${tags ? `<div class="perfil__tags">${tags}</div>` : ''}
        ${p.bio ? `<p class="perfil__bio">${esc(p.bio)}</p>` : ''}
        ${p.mensagem ? `<p class="perfil__msg">"${esc(p.mensagem)}"</p>` : ''}
        ${form ? `<h4>Formação e cursos</h4><ul class="perfil__form">${form}</ul>` : ''}
      </div>`;
    perfilPrev.disabled = i === 0;
    perfilNext.disabled = i === lista.length - 1;
    perfil.classList.add('open');
    perfilOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    perfilBody.scrollTop = 0;
    if (window.lucide) lucide.createIcons();
  }

  function fecharPerfil() {
    perfil.classList.remove('open');
    perfilOverlay.classList.remove('open');
    document.body.style.overflow = '';
    perfilI = -1;
  }

  eqGrid.addEventListener('click', (e) => { const b = e.target.closest('.mini'); if (b) abrirPerfil(+b.dataset.i); });
  eqBusca.addEventListener('input', () => { filtro.texto = eqBusca.value; aplicar(); });
  eqFiltros.addEventListener('click', (e) => {
    const b = e.target.closest('.filtro');
    if (!b) return;
    eqFiltros.querySelectorAll('.filtro').forEach((f) => f.classList.toggle('is-on', f === b));
    filtro.pub = b.dataset.pub;
    aplicar();
  });
  document.getElementById('perfilClose').addEventListener('click', fecharPerfil);
  perfilOverlay.addEventListener('click', fecharPerfil);
  perfilPrev.addEventListener('click', () => abrirPerfil(perfilI - 1));
  perfilNext.addEventListener('click', () => abrirPerfil(perfilI + 1));
  document.addEventListener('keydown', (e) => {
    if (!perfil.classList.contains('open')) return;
    if (e.key === 'Escape') fecharPerfil();
    else if (e.key === 'ArrowLeft') abrirPerfil(perfilI - 1);
    else if (e.key === 'ArrowRight') abrirPerfil(perfilI + 1);
  });

  aplicar();
}
