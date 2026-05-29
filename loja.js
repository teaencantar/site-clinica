// === Loja TEA Encantar — carrinho (client-side) ===
const WPP = "5521994835421";
const STORAGE_KEY = "tea_cart";
const produtos = window.PRODUTOS || [];
const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

let cart = {};
try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (e) { cart = {}; }

const $ = (id) => document.getElementById(id);
const grid = $("produtos");
const badge = $("cartBadge");
const cartItems = $("cartItems");
const cartTotalEl = $("cartTotal");
const drawer = $("cartDrawer");
const overlay = $("cartOverlay");

document.getElementById("year").textContent = new Date().getFullYear();

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
function produtoPorId(id) { return produtos.find((p) => p.id === id); }
function totalItens() { return Object.values(cart).reduce((a, b) => a + b, 0); }
function totalValor() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = produtoPorId(id);
    return p ? sum + p.preco * qty : sum;
  }, 0);
}

// Renderiza a vitrine
function renderProdutos() {
  grid.innerHTML = produtos.map((p) => `
    <article class="produto">
      <div class="produto__img">${p.img
        ? `<img src="${p.img}" alt="${p.nome}" loading="lazy" />`
        : `<span class="produto__ph"><i data-lucide="${p.icon || "gift"}"></i></span>`}</div>
      <div class="produto__info">
        <span class="produto__cat">${p.categoria || ""}</span>
        <h3 class="produto__nome">${p.nome}</h3>
        <p class="produto__desc">${p.descricao || ""}</p>
        <div class="produto__rodape">
          <span class="produto__preco">${fmt(p.preco)}</span>
          <button class="btn btn--small produto__add" data-id="${p.id}">
            <i data-lucide="plus" aria-hidden="true"></i> Adicionar
          </button>
        </div>
      </div>
    </article>`).join("");
  if (window.lucide) lucide.createIcons();
}

// Renderiza o carrinho
function renderCart() {
  const ids = Object.keys(cart);
  if (ids.length === 0) {
    cartItems.innerHTML = `<div class="cart-empty"><i data-lucide="shopping-bag" aria-hidden="true"></i><p>Seu carrinho está vazio.</p></div>`;
  } else {
    cartItems.innerHTML = ids.map((id) => {
      const p = produtoPorId(id);
      if (!p) return "";
      const qty = cart[id];
      return `
        <div class="cart-item">
          <div class="cart-item__ph"><i data-lucide="${p.icon || "gift"}" aria-hidden="true"></i></div>
          <div class="cart-item__info">
            <strong>${p.nome}</strong>
            <span>${fmt(p.preco)}</span>
          </div>
          <div class="qty">
            <button data-act="dec" data-id="${id}" aria-label="Diminuir">−</button>
            <span>${qty}</span>
            <button data-act="inc" data-id="${id}" aria-label="Aumentar">+</button>
          </div>
          <button class="cart-item__rm" data-act="rm" data-id="${id}" aria-label="Remover"><i data-lucide="trash-2" aria-hidden="true"></i></button>
        </div>`;
    }).join("");
  }
  cartTotalEl.textContent = fmt(totalValor());
  badge.textContent = totalItens();
  badge.style.display = totalItens() > 0 ? "grid" : "none";
  $("checkoutBtn").disabled = totalItens() === 0;
  if (window.lucide) lucide.createIcons();
}

function addItem(id) {
  cart[id] = (cart[id] || 0) + 1;
  save(); renderCart(); openCart();
}
function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  save(); renderCart();
}
function removeItem(id) { delete cart[id]; save(); renderCart(); }

function openCart() { drawer.classList.add("open"); overlay.classList.add("open"); }
function closeCart() { drawer.classList.remove("open"); overlay.classList.remove("open"); }

// Finaliza pelo WhatsApp
function checkout() {
  if (totalItens() === 0) return;
  let msg = "Olá! Gostaria de fazer um pedido na loja TEA Encantar:\n\n";
  Object.entries(cart).forEach(([id, qty]) => {
    const p = produtoPorId(id);
    if (p) msg += `• ${qty}x ${p.nome} — ${fmt(p.preco * qty)}\n`;
  });
  msg += `\nTotal: ${fmt(totalValor())}`;
  window.open(`https://wa.me/${WPP}?text=${encodeURIComponent(msg)}`, "_blank");
}

// Eventos
grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".produto__add");
  if (btn) addItem(btn.dataset.id);
});
cartItems.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const { act, id } = btn.dataset;
  if (act === "inc") changeQty(id, 1);
  else if (act === "dec") changeQty(id, -1);
  else if (act === "rm") removeItem(id);
});
$("cartBtn").addEventListener("click", openCart);
$("cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
$("checkoutBtn").addEventListener("click", checkout);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

if (window.lucide) lucide.createIcons();
renderProdutos();
renderCart();
