(function () {
  'use strict';
  const KEY = 'spinora-local-v2';
  const LEGACY_KEY = 'spinora-local-v1';
  const SEED_REVISION = 100;
  const PARTICIPANT_SEED_REVISION = 80;
  const seedProducts = () => [
    ['Sony WH-1000XM5', '🎧'], ['Voucher Belanja 500K', '🎟️'], ['Smartwatch', '⌚'], ['Coffee Date', '☕'], ['Mystery Box', '🎁'],
    ['Tumbler Eksklusif', '🥤'], ['Voucher Makan 250K', '🍜'], ['Weekend Staycation', '🌴'], ['iPad Mini', '📱'], ['Nintendo Switch', '🎮'],
    ['Kamera Instan', '📷'], ['Speaker Bluetooth', '🔊'], ['Earbuds Wireless', '🎧'], ['Power Bank Premium', '🔋'], ['Keyboard Mechanical', '⌨️'],
    ['Mouse Wireless', '🖱️'], ['Monitor 24 Inch', '🖥️'], ['Mini Projector', '📽️'], ['Smart Lamp', '💡'], ['Fitness Band', '⌚'],
    ['Voucher Belanja 1 Juta', '🛍️'], ['Voucher Belanja 250K', '🛍️'], ['Voucher Grocery 500K', '🛒'], ['Voucher Fashion 500K', '👕'], ['Voucher Elektronik 500K', '💳'],
    ['Voucher Bioskop', '🎬'], ['Voucher Streaming 1 Tahun', '📺'], ['Voucher Musik 1 Tahun', '🎵'], ['Voucher Buku 300K', '📚'], ['Voucher Transportasi 300K', '🚕'],
    ['Voucher Hotel 1 Juta', '🏨'], ['Voucher Penerbangan 1 Juta', '✈️'], ['Voucher Spa 500K', '💆'], ['Voucher Gym 3 Bulan', '🏋️'], ['Voucher Game 500K', '🎮'],
    ['Dinner for Two', '🍽️'], ['Brunch Akhir Pekan', '🥐'], ['Afternoon Tea', '🫖'], ['Paket BBQ Keluarga', '🍖'], ['Paket Sushi Premium', '🍣'],
    ['Pizza Party', '🍕'], ['Dessert Box', '🍰'], ['Coffee Beans Premium', '☕'], ['Teh Artisan Set', '🫖'], ['Snack Hamper', '🍿'],
    ['Air Fryer', '🍳'], ['Rice Cooker Digital', '🍚'], ['Blender Portable', '🥤'], ['Electric Kettle', '🫖'], ['Sandwich Maker', '🥪'],
    ['Diffuser Aromaterapi', '🪔'], ['Lilin Aromaterapi', '🕯️'], ['Bed Cover Premium', '🛏️'], ['Handuk Hotel Set', '🧖'], ['Tableware Set', '🍽️'],
    ['Tanaman Hias', '🪴'], ['Vacuum Cleaner Mini', '🧹'], ['Kotak Penyimpanan', '🧺'], ['Jam Meja Minimalis', '⏰'], ['Bantal Leher Premium', '🛏️'],
    ['Hoodie Eksklusif', '👕'], ['Kaos Limited Edition', '👕'], ['Tote Bag Premium', '👜'], ['Backpack Urban', '🎒'], ['Topi Eksklusif', '🧢'],
    ['Payung Otomatis', '☂️'], ['Notebook Premium', '📓'], ['Pulpen Eksklusif', '🖊️'], ['Desk Organizer', '🗂️'], ['Botol Minum Sport', '🧴'],
    ['Lunch Box Set', '🍱'], ['Travel Pouch', '🧳'], ['Koper Kabin', '🧳'], ['Sunglasses', '🕶️'], ['Jam Tangan Kasual', '⌚'],
    ['Sepatu Sneakers', '👟'], ['Jaket Windbreaker', '🧥'], ['Dompet Kulit', '👛'], ['Gift Card Premium', '💳'], ['Bouquet Bunga', '💐'],
    ['Tiket Konser', '🎫'], ['Tiket Theme Park', '🎡'], ['Tiket Waterpark', '🏊'], ['Escape Room Experience', '🔐'], ['Karaoke Night', '🎤'],
    ['Bowling Party', '🎳'], ['Kelas Memasak', '👩‍🍳'], ['Kelas Melukis', '🎨'], ['Kelas Fotografi', '📷'], ['Paket Glamping', '⛺'],
    ['City Tour', '🚌'], ['Sunset Cruise', '⛵'], ['Massage & Wellness', '💆'], ['Salon Makeover', '💇'], ['Personal Training', '🏃'],
    ['Sepeda Lipat', '🚲'], ['Skateboard', '🛹'], ['Yoga Mat Premium', '🧘'], ['Dumbbell Set', '🏋️'], ['Bola Olahraga', '⚽']
  ].map(([name, icon], index) => ({ id: `p${index + 1}`, name, stock: 1, icon }));
  const seedParticipants = () => [
    'Amanda Putri', 'Naufal Pratama', 'Rania Kusuma', 'Dimas Saputra', 'Citra Lestari', 'Bima Aditya', 'Farhan Ramadhan', 'Gita Maharani',
    'Hendra Wijaya', 'Intan Permata', 'Joko Santoso', 'Kirana Ayu', 'Luthfi Hakim', 'Maya Sari', 'Nadia Rahma', 'Oscar Gunawan',
    'Putri Amelia', 'Qori Azzahra', 'Rizky Maulana', 'Salsabila Nur', 'Taufik Hidayat', 'Ulfa Nabila', 'Vino Alfarizi', 'Wulan Anggraini',
    'Xavier Halim', 'Yasmin Zahra', 'Zaki Mubarak', 'Alya Safitri', 'Bagas Prakoso', 'Chelsea Anindya', 'Daffa Alamsyah', 'Eka Puspita',
    'Fajar Nugroho', 'Grace Natalia', 'Hafiz Firdaus', 'Indah Kartika', 'Kevin Susanto', 'Larasati Dewi', 'Miko Firmansyah', 'Nabila Salsabila',
    'Oki Setiawan', 'Prilly Maharani', 'Raka Mahendra', 'Shinta Melati', 'Tommy Kurniawan', 'Uli Rahmawati', 'Vania Aurelia', 'Wahyu Firmansyah',
    'Yuni Astuti', 'Zidan Akbar', 'Adelia Paramitha', 'Bayu Pranata', 'Clarissa Felicia', 'Denny Irawan', 'Elvina Monica', 'Fauzan Arifin',
    'Gina Oktavia', 'Harris Gunawan', 'Isyana Larasati', 'Jonathan Wijaya', 'Keyla Ramadhani', 'Leonard Hartono', 'Monica Salim', 'Nino Prasetyo',
    'Olivia Tan', 'Pandu Wicaksono', 'Queenara Putri', 'Reza Kurnia', 'Sabrina Aulia', 'Theo Mahardika', 'Umi Kalsum', 'Valerie Amanda',
    'William Alexander', 'Yola Febriani', 'Aditya Nugraha', 'Bella Maharani', 'Cahya Ramadhan', 'Dea Anjani', 'Erlangga Putra', 'Felicia Nathania'
  ].map((name, index) => {
    const number = index + 1;
    const rules = {
      2: { mode: 'exclude', productIds: ['p1'] },
      3: { mode: 'include', productIds: ['p2', 'p4', 'p7', 'p8'] },
      5: { mode: 'include', productIds: ['p1', 'p3', 'p5'] },
      6: { mode: 'exclude', productIds: ['p4', 'p8'] }
    }[number] || { mode: 'exclude', productIds: [] };
    return { id: `u${number}`, name, ...rules };
  });
  const defaults = () => ({
    version: 2,
    seedRevision: SEED_REVISION,
    participantSeedRevision: PARTICIPANT_SEED_REVISION,
    theme: 'aurora',
    products: seedProducts(),
    participants: seedParticipants(),
    history: [], selectedParticipant: '', sound: true, celebrationRevision: 1, participantAdvanceRevision: 2, productPreset: 'many', participantPreset: 'many', spinnerMode: 'participant', participantControl: 'public', participantAdvance: 'manual', spinnerLive: true, spinEvent: null
  });
  const text = value => typeof value === 'string' && value.length > 0 && value.length <= 300;
  function valid(data) {
    return data && data.version === 2 && ['aurora', 'candy'].includes(data.theme) && Array.isArray(data.products) && Array.isArray(data.participants) && Array.isArray(data.history)
      && data.products.every(item => text(item.id) && text(item.name) && Number.isInteger(item.stock) && item.stock >= 0 && item.stock <= 999 && text(item.icon))
      && data.participants.every(item => text(item.id) && text(item.name) && ['include', 'exclude'].includes(item.mode) && Array.isArray(item.productIds) && item.productIds.every(text));
  }
  function migrate(legacy) {
    if (!legacy || legacy.version !== 1) return null;
    const products = (legacy.prizes || []).map(p => ({ id: p.id, name: p.name, stock: p.stock, icon: p.emoji || '🎁' }));
    const categoryProducts = category => products.filter(product => (legacy.prizes || []).find(p => p.id === product.id)?.category === category).map(p => p.id);
    return { version: 2, theme: 'aurora', products, participants: (legacy.participants || []).map(p => ({ id: p.id, name: p.name, mode: p.mode, productIds: [...new Set((p.categories || []).flatMap(categoryProducts))] })), history: (legacy.history || []).map(h => ({ ...h, productId: h.prizeId, productName: h.prizeName })), selectedParticipant: legacy.selectedParticipant || '', sound: !!legacy.sound };
  }
  function applySeed(target) {
    let changed = false;
    if (target.seedRevision !== SEED_REVISION) {
      const existingProductIds = new Set(target.products.map(product => product.id));
      seedProducts().forEach(product => { if (!existingProductIds.has(product.id)) target.products.push(product); });
      target.seedRevision = SEED_REVISION;
      changed = true;
    }
    if (target.participantSeedRevision !== PARTICIPANT_SEED_REVISION) {
      const existingParticipantIds = new Set(target.participants.map(participant => participant.id));
      seedParticipants().forEach(participant => { if (!existingParticipantIds.has(participant.id)) target.participants.push(participant); });
      target.participantSeedRevision = PARTICIPANT_SEED_REVISION;
      changed = true;
    }
    if (target.celebrationRevision !== 1) {
      target.sound = true;
      target.celebrationRevision = 1;
      changed = true;
    }
    if (!['few', 'medium', 'many'].includes(target.productPreset)) { target.productPreset = 'many'; changed = true; }
    if (!['few', 'medium', 'many'].includes(target.participantPreset)) { target.participantPreset = 'many'; changed = true; }
    if (!['general', 'participant'].includes(target.spinnerMode)) { target.spinnerMode = 'participant'; changed = true; }
    if (!['public', 'admin'].includes(target.participantControl)) { target.participantControl = 'public'; changed = true; }
    if (!['auto', 'manual'].includes(target.participantAdvance)) { target.participantAdvance = 'manual'; changed = true; }
    if (target.participantAdvanceRevision !== 2) { if (target.participantAdvance === 'manual') target.selectedParticipant = ''; target.participantAdvanceRevision = 2; changed = true; }
    if (typeof target.spinnerLive !== 'boolean') { target.spinnerLive = true; changed = true; }
    if (!('spinEvent' in target)) { target.spinEvent = null; changed = true; }
    return changed;
  }
  let available = true;
  let data;
  let seeded = false;
  try {
    const saved = localStorage.getItem(KEY);
    data = saved ? JSON.parse(saved) : null;
    if (!valid(data)) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      data = legacy ? migrate(JSON.parse(legacy)) : defaults();
    }
    if (!valid(data)) data = defaults();
    seeded = applySeed(data);
  } catch { data = defaults(); available = false; }
  const TOKEN_KEY = 'spinora-session-token';
  const CONNECTION_MESSAGE = 'Server Spinora tidak terhubung. Jalankan "node server.js", lalu buka http://127.0.0.1:4173.';
  const token = () => sessionStorage.getItem(TOKEN_KEY) || '';
  let authenticated = false, company = null, remoteRevision = 0, saving = Promise.resolve(), polling = false;
  const replaceData = value => { Object.keys(data).forEach(key => delete data[key]); Object.assign(data, value); return applySeed(data); };
  const localSave = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); available = true; } catch { available = false; } return available; };
  async function remoteSave(snapshot) {
    if (!authenticated || !token()) return;
    try { const response=await fetch('/api/state',{ method:'PUT',headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token()}` },body:JSON.stringify({ state:snapshot }) }); if (response.ok) remoteRevision=(await response.json()).revision; }
    catch { available=false; }
  }
  const save = () => { localSave(); window.dispatchEvent(new CustomEvent('spinora:change')); if (authenticated) { const snapshot=JSON.parse(JSON.stringify(data)); saving=saving.then(()=>remoteSave(snapshot)); } return available; };
  if (seeded) localSave();
  async function fetchRemote() {
    if (!token() || location.protocol === 'file:') return;
    const response=await fetch('/api/state',{ headers:{ 'Authorization':`Bearer ${token()}` },cache:'no-store' });
    if (response.status===401) { sessionStorage.removeItem(TOKEN_KEY); return; }
    if (!response.ok) throw new Error('Gagal mengambil data company.');
    const payload=await response.json(); authenticated=true; company=payload.company; remoteRevision=payload.revision||0;
    if (payload.state) { const migrated=replaceData(payload.state); localSave(); if (migrated) await remoteSave(JSON.parse(JSON.stringify(data))); }
    else await remoteSave(JSON.parse(JSON.stringify(data)));
  }
  async function poll() {
    if (polling || !authenticated || !token()) return; polling=true;
    try { await saving; const response=await fetch('/api/state',{headers:{'Authorization':`Bearer ${token()}`},cache:'no-store'}); if (response.ok) { const payload=await response.json(); if (payload.revision>remoteRevision && payload.state) { remoteRevision=payload.revision; replaceData(payload.state); localSave(); window.dispatchEvent(new CustomEvent('spinora:remote-change')); } } } catch {} finally { polling=false; }
  }
  const ready=(async()=>{ try { await fetchRemote(); if (authenticated) setInterval(poll,1500); } catch { available=false; } })();
  async function authRequest(path, body, fallbackMessage) {
    if (location.protocol === 'file:') throw new Error(CONNECTION_MESSAGE);
    try {
      const response = await fetch(path, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || fallbackMessage);
      sessionStorage.setItem(TOKEN_KEY, payload.token);
      return payload;
    } catch (error) {
      if (error instanceof TypeError) throw new Error(CONNECTION_MESSAGE);
      throw error;
    }
  }
  async function login(email,password) { return authRequest('/api/login', { email, password }, 'Gagal masuk.'); }
  async function register(input) { const initial=defaults(); initial.spinnerMode=input.spinnerMode; initial.participantControl=input.participantControl; initial.participantAdvance=input.participantAdvance || 'manual'; if (initial.participantAdvance === 'manual') initial.selectedParticipant = ''; return authRequest('/api/register', {...input,state:initial}, 'Gagal membuat akun.'); }
  function logout() { sessionStorage.removeItem(TOKEN_KEY); location.reload(); }
  const id = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const hasWon = participant => data.history.some(h => h.participantId === participant.id);
  const presetLimit = (preset, medium) => preset === 'few' ? 12 : preset === 'medium' ? medium : Infinity;
  const activeProducts = () => data.products.slice(0, presetLimit(data.productPreset, 40));
  const activeParticipants = () => data.spinnerMode === 'general' ? [] : data.participants.slice(0, presetLimit(data.participantPreset, 40));
  const eligible = participant => participant && !hasWon(participant) ? activeProducts().filter(product => product.stock > 0 && (participant.mode === 'include' ? participant.productIds.includes(product.id) : !participant.productIds.includes(product.id))) : [];
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  window.Spinora = { data, save, id, hasWon, eligible, activeProducts, activeParticipants, escape, storageAvailable: () => available, key: KEY, ready, login, register, logout, isAuthenticated:()=>authenticated, company:()=>company, createDefaults:defaults };
})();
