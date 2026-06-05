// === Configuração do Supabase (chave publishable = pública/segura no navegador) ===
const SUPABASE_URL = 'https://nnbspcykhvcxpdywpbtb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4UVKa8FSan1KJNYDqydBQQ_I40e39bS';
const BUCKET = 'equipe';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

if (window.lucide) lucide.createIcons();
document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('equipeForm');
const msg = document.getElementById('formMsg');
const submitBtn = document.getElementById('submitBtn');
const fotoInput = document.getElementById('foto');
const preview = document.getElementById('fotoPreview');
const previewImg = document.getElementById('fotoPreviewImg');
const bio = document.getElementById('bio');
const bioCount = document.getElementById('bioCount');
const MAX_MB = 5;

bio.addEventListener('input', () => { bioCount.textContent = bio.value.length; });

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

// Transforma textarea "um item por linha" em lista
const toList = (val) => val.split('\n').map(s => s.trim()).filter(Boolean);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMsg('', '');
  if (document.getElementById('website').value) return; // honeypot

  const nome = document.getElementById('nome').value.trim();
  const sobrenome = document.getElementById('sobrenome').value.trim();
  const profissao = document.getElementById('profissao').value.trim();
  const conselho = document.getElementById('conselho').value.trim();
  const experiencia = document.getElementById('experiencia').value.trim();
  const publico = [...document.querySelectorAll('input[name="publico"]:checked')].map(c => c.value);
  const formacoes = toList(document.getElementById('formacoes').value);
  const especializacoes = toList(document.getElementById('especializacoes').value);
  const bioTxt = bio.value.trim();
  const mensagem = document.getElementById('mensagem').value.trim();
  const email = document.getElementById('email').value.trim();
  const autorizacao = document.getElementById('autorizacao').checked;
  const file = fotoInput.files[0];

  // Validações
  if (!nome) return setMsg('Por favor, preencha seu nome.', 'erro');
  if (!sobrenome) return setMsg('Por favor, preencha seu sobrenome.', 'erro');
  if (!profissao) return setMsg('Por favor, informe sua profissão/especialidade.', 'erro');
  if (!file) return setMsg('Por favor, anexe sua foto.', 'erro');
  if (!file.type.startsWith('image/')) return setMsg('O arquivo precisa ser uma imagem (JPG ou PNG).', 'erro');
  if (file.size > MAX_MB * 1024 * 1024) return setMsg(`A foto é muito grande (máx. ${MAX_MB} MB).`, 'erro');
  if (publico.length === 0) return setMsg('Selecione ao menos um público atendido.', 'erro');
  if (formacoes.length === 0) return setMsg('Informe ao menos uma formação acadêmica.', 'erro');
  if (!bioTxt) return setMsg('Escreva uma mini bio de apresentação.', 'erro');
  if (!autorizacao) return setMsg('É preciso marcar a autorização para publicarmos seus dados.', 'erro');

  submitBtn.disabled = true;
  setMsg('Enviando...', 'info');

  try {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) throw upErr;

    const { error: insErr } = await sb.from('equipe').insert({
      nome,
      sobrenome,
      profissao,
      conselho: conselho || null,
      experiencia: experiencia || null,
      publico,
      formacoes,
      especializacoes,
      bio: bioTxt,
      mensagem: mensagem || null,
      email: email || null,
      foto_path: path,
      autorizacao: true,
    });
    if (insErr) throw insErr;

    form.hidden = true;
    document.getElementById('formSuccess').hidden = false;
    if (window.lucide) lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error(err);
    setMsg('Ops, algo deu errado ao enviar. Tente novamente em instantes ou avise a clínica.', 'erro');
    submitBtn.disabled = false;
  }
});
