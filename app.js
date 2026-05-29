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

// Modal de terapias (clica no card -> abre conteúdo)
const terapiaModal = document.getElementById('terapiaModal');
const terapiaOverlay = document.getElementById('terapiaOverlay');
const terapiaBody = document.getElementById('terapiaBody');
const terapiaClose = document.getElementById('terapiaClose');
let ultimoFoco = null;

function abrirTerapia(id) {
  const fonte = document.querySelector(`#terapias-conteudo [data-terapia="${id}"]`);
  if (!fonte || !terapiaModal) return;
  terapiaBody.innerHTML = fonte.innerHTML;
  ultimoFoco = document.activeElement;
  terapiaModal.classList.add('open');
  terapiaOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  terapiaBody.scrollTop = 0;
  if (terapiaClose) terapiaClose.focus();
}
function fecharTerapia() {
  if (!terapiaModal) return;
  terapiaModal.classList.remove('open');
  terapiaOverlay.classList.remove('open');
  document.body.style.overflow = '';
  if (ultimoFoco) ultimoFoco.focus();
}

document.querySelectorAll('.card[data-terapia]').forEach(card =>
  card.addEventListener('click', () => abrirTerapia(card.dataset.terapia))
);
if (terapiaClose) terapiaClose.addEventListener('click', fecharTerapia);
if (terapiaOverlay) terapiaOverlay.addEventListener('click', fecharTerapia);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && terapiaModal && terapiaModal.classList.contains('open')) fecharTerapia();
});
