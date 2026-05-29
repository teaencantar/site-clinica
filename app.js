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
