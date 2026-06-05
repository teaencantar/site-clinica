// === Configuração do Supabase (chave publishable = pública/segura no navegador) ===
const SUPABASE_URL = 'https://nnbspcykhvcxpdywpbtb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4UVKa8FSan1KJNYDqydBQQ_I40e39bS';
const BUCKET = 'depoimentos';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

if (window.lucide) lucide.createIcons();
document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('depoForm');
const msg = document.getElementById('formMsg');
const submitBtn = document.getElementById('submitBtn');
const fotoInput = document.getElementById('foto');
const preview = document.getElementById('fotoPreview');
const previewImg = document.getElementById('fotoPreviewImg');
const comentario = document.getElementById('comentario');
const charcount = document.getElementById('charcount');
const MAX_MB = 5;

// Contador de caracteres
comentario.addEventListener('input', () => { charcount.textContent = comentario.value.length; });

// Pré-visualização da foto
fotoInput.addEventListener('change', () => {
  const file = fotoInput.files[0];
  if (file && file.type.startsWith('image/')) {
    previewImg.src = URL.createObjectURL(file);
    preview.hidden = false;
  } else {
    preview.hidden = true;
  }
});

function setMsg(text, type) {
  msg.textContent = text;
  msg.className = 'form-msg' + (type ? ' form-msg--' + type : '');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMsg('', '');

  // Honeypot anti-spam: se preenchido, ignora silenciosamente
  if (document.getElementById('website').value) return;

  const nome = document.getElementById('nome').value.trim();
  const sobrenome = document.getElementById('sobrenome').value.trim();
  const texto = comentario.value.trim();
  const autorizacao = document.getElementById('autorizacao').checked;
  const file = fotoInput.files[0];

  // Validações
  if (!nome) return setMsg('Por favor, preencha seu nome.', 'erro');
  if (!texto) return setMsg('Por favor, escreva seu depoimento.', 'erro');
  if (!file) return setMsg('Por favor, anexe uma foto.', 'erro');
  if (!file.type.startsWith('image/')) return setMsg('O arquivo precisa ser uma imagem (JPG ou PNG).', 'erro');
  if (file.size > MAX_MB * 1024 * 1024) return setMsg(`A foto é muito grande (máx. ${MAX_MB} MB).`, 'erro');
  if (!autorizacao) return setMsg('É preciso marcar a autorização para publicarmos seu depoimento.', 'erro');

  submitBtn.disabled = true;
  setMsg('Enviando...', 'info');

  try {
    // 1) Upload da foto para o armazenamento privado
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await sb.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (upErr) throw upErr;

    // 2) Insere o depoimento na tabela
    const { error: insErr } = await sb.from('depoimentos').insert({
      nome,
      sobrenome: sobrenome || null,
      comentario: texto,
      foto_path: path,
      autorizacao: true,
    });
    if (insErr) throw insErr;

    // Sucesso
    form.hidden = true;
    document.getElementById('formSuccess').hidden = false;
    if (window.lucide) lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error(err);
    setMsg('Ops, algo deu errado ao enviar. Tente novamente em instantes ou nos chame no WhatsApp.', 'erro');
    submitBtn.disabled = false;
  }
});
