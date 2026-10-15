(async function () {
  'use strict';
  const S = window.Spinora, state = S.data, $ = selector => document.querySelector(selector), $$ = selector => [...document.querySelectorAll(selector)];
  await S.ready;
  if (!S.isAuthenticated()) {
    $('#spinner-login-form').addEventListener('submit', async event => { event.preventDefault(); const button=event.submitter; button.disabled=true; $('#spinner-login-error').textContent=''; try { await S.login($('#spinner-login-email').value,$('#spinner-login-password').value); location.reload(); } catch(error) { $('#spinner-login-error').textContent=error.message; button.disabled=false; } });
    $('#spinner-fill-demo').addEventListener('click',()=>{ $('#spinner-login-email').value='admin@spinora.local'; $('#spinner-login-password').value='spinora123'; $('#spinner-login-password').focus(); });
    return;
  }
  $('#spinner-login-view').hidden=true; $('#event-header').hidden=false; $('#event-main').hidden=false;
  const adminMirror = new URLSearchParams(location.search).get('mirror') === '1';
  const participantMode = () => state.spinnerMode === 'participant';
  const showParticipant = () => participantMode() && (state.participantControl === 'public' || adminMirror);
  const adminControlsParticipants = () => participantMode() && state.participantControl === 'admin' && !adminMirror;
  document.body.classList.toggle('participant-hidden', !showParticipant()); document.body.classList.toggle('participant-admin-control', adminControlsParticipants()); document.body.classList.toggle('general-spinner', !participantMode()); document.body.classList.toggle('admin-mirror', adminMirror);
  const palette = { aurora: ['#9b6cff', '#f36cbd', '#4ad9cf', '#ffb45f', '#718fff', '#cb72ed', '#ff7895', '#5fd09c'], candy: ['#ff4f9a', '#ffb340', '#34c9e8', '#7456e8', '#ff7657', '#50c878', '#e551d5', '#2b95ec'] };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rotation = 0, spinning = false, randomizing = false, page = 1, query = '', toastTimer, audioContext, pointerAnimation, mirrorSpinId = '', mirrorFrameId = 0;
  let mirrorPresentedId = adminMirror && state.spinEvent?.status === 'finished' ? state.spinEvent.id : '';
  const perPage = 8;
  const selected = () => state.participants.find(p => p.id === state.selectedParticipant);
  const waiting = () => S.activeParticipants().filter(p => !S.hasWon(p));
  const visibleProducts = () => S.activeProducts().filter(product => product.stock > 0);
  const initials = name => name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  const date = value => new Date(value).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  function randomIndex(length) { const array = new Uint32Array(1), max = Math.floor(0x100000000 / length) * length; do crypto.getRandomValues(array); while (array[0] >= max); return array[0] % length; }
  function applyTheme(theme, persist = true) {
    state.theme = theme; document.documentElement.dataset.theme = theme;
    $$('[data-theme-choice]').forEach(button => { const active = button.dataset.themeChoice === theme; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    if (persist) S.save(); drawWheel();
  }
  function render() {
    const live = state.spinnerLive !== false;
    const availableProducts = state.products.filter(p => p.stock > 0);
    $('#product-count').textContent = visibleProducts().length;
    $('#waiting-count').textContent = waiting().length;
    $('#sheet-history-count').textContent = state.history.length;
    let selectionChanged=false;
    if (participantMode() && !waiting().some(p => p.id === state.selectedParticipant)) {
      state.selectedParticipant = state.participantAdvance === 'auto' ? (waiting().find(p => S.eligible(p).length)?.id || waiting()[0]?.id || '') : '';
      selectionChanged=true;
    }
    const participant = participantMode() ? selected() : null, products = participantMode() ? S.eligible(participant) : visibleProducts(), wheelProducts = visibleProducts();
    $('#selected-participant').textContent = participant?.name || 'Belum ada peserta';
    $('#selected-avatar').textContent = participant ? initials(participant.name) : '?';
    $('#participant-placeholder').textContent = participant ? 'Peserta terpilih' : 'Klik untuk pilih peserta';
    $('#eligibility-note').innerHTML = !participant ? (showParticipant() ? 'Pilih peserta sebelum memutar roda.' : 'Menunggu admin memilih peserta berikutnya.') : products.length ? `<span>✓ Siap mengikuti undian</span> · Semoga beruntung, ${S.escape(participant.name)}!` : 'Peserta ini belum dapat mengikuti undian. Hubungi admin.';
    const enabled = live && !adminMirror && !spinning && !randomizing && !!products.length;
    $('#wheel-shell').setAttribute('aria-disabled', String(!enabled));
    $('#wheel-shell').tabIndex = enabled ? 0 : -1;
    $('#wheel-shell').classList.toggle('wheel-locked', !live || adminMirror);
    $('#center-spin strong').textContent = live ? (adminMirror ? 'LIVE' : 'SPIN') : 'OFF';
    $('#center-spin small').textContent = live ? (adminMirror ? 'MIRROR' : 'KLIK RODA') : 'MENUNGGU ADMIN';
    $('#sheet-random-participant').disabled = !participantMode() || spinning || randomizing || !waiting().some(person => S.eligible(person).length);
    $('#wheel-empty').hidden = !!wheelProducts.length;
    $('#stage-status').textContent = !live ? 'SPINNER OFF' : spinning ? 'FINDING YOUR LUCK…' : randomizing ? 'SHUFFLING NAMES…' : participantMode() && !participant ? 'PILIH PESERTA' : wheelProducts.length ? (adminMirror ? 'LIVE MIRROR' : 'READY TO SPIN') : 'WAITING FOR MAGIC';
    $('.draw-controls').classList.toggle('compact-sheet', !showParticipant()); $('.fair-note').textContent = participantMode() && !participant ? (showParticipant() ? 'Pilih atau acak peserta untuk membuka putaran' : 'Menunggu peserta dipilih dari dashboard admin') : showParticipant() ? 'Klik roda untuk mulai · Roda tidak berputar otomatis' : 'Klik roda untuk mulai';
    drawWheel(); if (selectionChanged && !adminMirror) S.save();
  }
  function drawWheel() {
    const products = visibleProducts(), canvas = $('#wheel'), context = canvas.getContext('2d'), size = canvas.width, center = size / 2;
    context.clearRect(0, 0, size, size); if (!products.length) return;
    const colors = palette[state.theme], slice = Math.PI * 2 / products.length;
    products.forEach((product, index) => {
      const start = index * slice - Math.PI / 2, end = start + slice;
      context.beginPath(); context.moveTo(center, center); context.arc(center, center, center - 2, start, end); context.closePath();
      const gradient = context.createRadialGradient(center, center, 80, center, center, center); gradient.addColorStop(0, colors[index % colors.length]); gradient.addColorStop(1, colors[(index + 2) % colors.length]);
      context.fillStyle = gradient; context.fill(); context.strokeStyle = '#ffffff42'; context.lineWidth = products.length > 60 ? 1 : 3; context.stroke();
      context.save(); context.translate(center, center); const angle = start + slice / 2; context.rotate(angle); context.translate(size * .34, 0); if (Math.cos(angle) < -.01) context.rotate(Math.PI);
      context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillStyle = '#fff'; context.shadowColor = '#110927aa'; context.shadowBlur = 8;
      const fontSize = products.length <= 12 ? 28 : products.length <= 24 ? 21 : products.length <= 40 ? 17 : products.length <= 60 ? 14 : products.length <= 80 ? 11.5 : 9.5;
      context.font = `800 ${fontSize}px Arial`; let label = product.name, maxWidth = products.length > 60 ? size * .27 : size * .25;
      while (context.measureText(label).width > maxWidth && label.length > 5) label = `${label.slice(0, -2)}…`;
      context.fillText(label, 0, products.length <= 12 ? 15 : 0); if (products.length <= 12) { context.font = '42px "Apple Color Emoji", sans-serif'; context.fillText(product.icon, 0, -38); }
      context.restore();
    });
    canvas.style.transform = `rotate(${rotation}deg)`;
  }
  function renderPicker() {
    const people = waiting().filter(p => p.name.toLocaleLowerCase('id').includes(query.toLocaleLowerCase('id'))), pages = Math.max(1, Math.ceil(people.length / perPage)); page = Math.min(page, pages);
    const items = people.slice((page - 1) * perPage, page * perPage);
    $('#picker-result-count').textContent = `${people.length} peserta ditemukan`;
    $('#participant-grid').innerHTML = items.map(person => `<button class="participant-card ${person.id === state.selectedParticipant ? 'selected' : ''}" data-participant="${S.escape(person.id)}"><span class="avatar">${S.escape(initials(person.name))}</span><span><strong>${S.escape(person.name)}</strong><small>Belum mendapat hadiah</small></span><i>${person.id === state.selectedParticipant ? '✓' : '→'}</i></button>`).join('') || '<div class="empty-list">Tidak ada peserta yang cocok.</div>';
    $('#page-info').textContent = `${page} / ${pages}`; $('#page-prev').disabled = page <= 1; $('#page-next').disabled = page >= pages;
  }
  function openPicker() { if (spinning || randomizing) return; query = ''; page = 1; $('#participant-search').value = ''; renderPicker(); $('#participant-dialog').showModal(); setTimeout(() => $('#participant-search').focus(), 50); }
  function openHistory() {
    if (spinning || randomizing) return;
    $('#spinner-history-list').innerHTML = state.history.length ? [...state.history].reverse().map((item, index) => `<article><span class="history-rank">${index + 1}</span><span class="history-gift">${S.escape(item.icon || '🎁')}</span><span><b>${showParticipant() ? S.escape(item.participantName || 'Peserta') : 'Pemenang'}</b><small>${S.escape(item.productName || item.prizeName)}</small></span><time>${S.escape(date(item.time))}</time></article>`).join('') : '<div class="empty-history"><span>✧</span><b>Belum ada pemenang</b><p>Riwayat akan muncul setelah putaran pertama selesai.</p></div>';
    $('#spinner-history-dialog').showModal();
  }
  async function chooseRandomParticipant(closePicker = false) {
    if (spinning || randomizing) return;
    const people = waiting().filter(person => S.eligible(person).length);
    if (!people.length) return toast('Belum ada peserta yang dapat mengikuti undian.');
    const alternatives = people.filter(person => person.id !== state.selectedParticipant), pool = alternatives.length ? alternatives : people;
    const winner = pool[randomIndex(pool.length)], trigger = $('.participant-trigger'), sheetButton = $('#sheet-random-participant'), pickerButton = $('#random-participant');
    randomizing = true; initAudio(); render(); document.body.classList.add('name-randomizing'); trigger.classList.add('randomizing');
    sheetButton.querySelector('b').textContent = 'Mengacak nama…'; sheetButton.disabled = true; pickerButton.disabled = true;
    if (closePicker && $('#participant-dialog').open) $('#participant-dialog').close();
    const cycles = reducedMotion ? 3 : 20;
    for (let index = 0; index < cycles; index++) {
      const preview = index === cycles - 1 ? winner : people[randomIndex(people.length)];
      $('#selected-participant').textContent = preview.name; $('#selected-avatar').textContent = initials(preview.name);
      tone(360 + index * 30, .055, .018, index % 2 ? 'triangle' : 'sine');
      await new Promise(resolve => setTimeout(resolve, reducedMotion ? 45 : 48 + index * 4));
    }
    state.selectedParticipant = winner.id; rotation = 0; randomizing = false; document.body.classList.remove('name-randomizing'); trigger.classList.remove('randomizing');
    sheetButton.querySelector('b').textContent = 'Acak peserta tersedia'; pickerButton.disabled = false; S.save(); render();
    tone(784, .2, .035, 'triangle'); tone(988, .28, .025, 'sine', .1); toast(`🎉 ${winner.name} terpilih secara acak!`);
  }
  function closeDialog(button) { button.closest('dialog').close(); }
  function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3000); }
  function initAudio() { if (!state.sound) return; try { audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); audioContext.resume().catch(() => {}); } catch {} }
  function tone(frequency, duration = .06, volume = .02, type = 'sine', delay = 0) {
    if (!state.sound || !audioContext) return;
    const start = audioContext.currentTime + delay, oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start); gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(volume, start + .015); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(start); oscillator.stop(start + duration + .02);
  }
  function playSpinLift() {
    if (!state.sound || !audioContext) return;
    const now = audioContext.currentTime, oscillator = audioContext.createOscillator(), gain = audioContext.createGain(), filter = audioContext.createBiquadFilter();
    oscillator.type = 'sawtooth'; oscillator.frequency.setValueAtTime(68, now); oscillator.frequency.exponentialRampToValueAtTime(470, now + 4.8); oscillator.frequency.exponentialRampToValueAtTime(210, now + 5.9);
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(420, now); filter.frequency.exponentialRampToValueAtTime(2600, now + 4.4); filter.frequency.exponentialRampToValueAtTime(900, now + 5.9);
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.017, now + .65); gain.gain.setValueAtTime(.017, now + 4.35); gain.gain.exponentialRampToValueAtTime(.0001, now + 5.95);
    oscillator.connect(filter); filter.connect(gain); gain.connect(audioContext.destination); oscillator.start(now); oscillator.stop(now + 6);
  }
  function drumHit(delay, volume = .11) {
    if (!state.sound || !audioContext) return;
    const start = audioContext.currentTime + delay, oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
    oscillator.frequency.setValueAtTime(135, start); oscillator.frequency.exponentialRampToValueAtTime(48, start + .18); gain.gain.setValueAtTime(volume, start); gain.gain.exponentialRampToValueAtTime(.0001, start + .22);
    oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(start); oscillator.stop(start + .23);
  }
  function applause() {
    if (!state.sound || !audioContext) return;
    const sampleRate = audioContext.sampleRate, length = Math.floor(sampleRate * .11), buffer = audioContext.createBuffer(1, length, sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 1.8);
    for (let i = 0; i < 34; i++) {
      const start = audioContext.currentTime + .15 + Math.random() * 2.65, source = audioContext.createBufferSource(), filter = audioContext.createBiquadFilter(), gain = audioContext.createGain();
      source.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = 900 + Math.random() * 1900; filter.Q.value = .5 + Math.random(); gain.gain.value = .025 + Math.random() * .045;
      source.connect(filter); filter.connect(gain); gain.connect(audioContext.destination); source.start(start);
    }
  }
  function playCelebrationSound() {
    if (!state.sound || !audioContext) return;
    drumHit(0, .15); drumHit(.34, .11); drumHit(.68, .16);
    const fanfare = [[523,0],[659,0],[784,0],[659,.22],[784,.22],[988,.22],[784,.48],[988,.48],[1175,.48],[1047,.82],[1319,.82],[1568,.82]];
    fanfare.forEach(([frequency, delay]) => { tone(frequency, .42, .035, 'sawtooth', delay); tone(frequency * 2, .28, .012, 'square', delay + .015); });
    applause();
  }
  function renderSound() { $('#sound-button').innerHTML = state.sound ? '♪' : '♪<small>×</small>'; $('#sound-button').setAttribute('aria-label', state.sound ? 'Matikan suara' : 'Aktifkan suara'); }
  function collapseSheet(collapsed) {
    const sheet = $('.draw-controls'), toggle = $('#toggle-draw-sheet');
    sheet.classList.toggle('sheet-collapsed', collapsed);
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'Buka panel kontrol' : 'Ciutkan panel kontrol');
  }
  function naturalSpinProgress(progress) {
    const accelerate = .16, cruise = .3, decelerate = .54, ramp = 2 / Math.PI, total = cruise + (accelerate + decelerate) * ramp;
    if (progress < accelerate) return (accelerate * ramp * (1 - Math.cos(Math.PI * progress / (2 * accelerate)))) / total;
    if (progress < accelerate + cruise) return (accelerate * ramp + progress - accelerate) / total;
    const elapsed = progress - accelerate - cruise;
    return (accelerate * ramp + cruise + decelerate * ramp * Math.sin(Math.PI * elapsed / (2 * decelerate))) / total;
  }
  function kickPointer(progress) {
    if (reducedMotion) return;
    pointerAnimation?.cancel();
    const pointer = $('.pointer'), strength = 17 - progress * 7, duration = 90 + progress * 75;
    pointerAnimation = pointer.animate([
      { transform:'translateX(-50%) rotate(0deg)', offset:0 },
      { transform:`translateX(-50%) rotate(-${strength}deg) scale(.96)`, offset:.34 },
      { transform:`translateX(-50%) rotate(${strength * .24}deg)`, offset:.7 },
      { transform:'translateX(-50%) rotate(0deg)', offset:1 }
    ], { duration, easing:'cubic-bezier(.22,.78,.3,1)' });
  }
  function spin() {
    if (adminMirror) return;
    if (state.spinnerLive === false) return toast('Spinner sedang OFF. Tunggu admin mengaktifkan LIVE.');
    const participant = participantMode() ? selected() : null, products = participantMode() ? S.eligible(participant) : visibleProducts(), wheelProducts = visibleProducts(); if (spinning || randomizing || (participantMode() && !participant) || !products.length || !wheelProducts.length) return;
    spinning = true; initAudio(); render(); $('.stage').classList.add('spinning'); collapseSheet(true); playSpinLift();
    $$('button, .admin-link, .theme-option').forEach(control => { if ('disabled' in control) control.disabled = true; });
    const product = products[randomIndex(products.length)], index = wheelProducts.findIndex(item => item.id === product.id), arc = 360 / wheelProducts.length, target = 360 - (index + .5) * arc, from = rotation, to = from + 360 * 6 + ((target - from % 360 + 360) % 360), duration = reducedMotion ? 160 : 6000, start = performance.now(); let lastTick = Math.floor(from / arc), lastKick = 0;
    const spinId = S.id(); state.spinEvent = { id:spinId, status:'spinning', productId:product.id, participantId:participant?.id || '', startedAt:Date.now(), duration, from, to }; S.save();
    function frame(now) {
      const progress = Math.min(1, (now - start) / duration), eased = naturalSpinProgress(progress); rotation = from + (to - from) * eased; $('#wheel').style.transform = `rotate(${rotation}deg)`;
      const tick = Math.floor(rotation / arc), kickGap = 54 + progress * 76;
      if (tick !== lastTick && now - lastKick >= kickGap) { kickPointer(progress); tone(430 + progress * 610, .032 + progress * .018, .011 + progress * .006, 'triangle'); lastKick = now; lastTick = tick; }
      if (progress < 1) requestAnimationFrame(frame); else { rotation = to; $('#wheel').style.transform = `rotate(${to}deg)`; pointerAnimation?.cancel(); pointerAnimation = null; finish(participant, product, spinId); }
    }
    requestAnimationFrame(frame);
  }
  function showWinner(participant, product) {
    const revealName=showParticipant() && participant; $('#winner-dialog h2').innerHTML=revealName ? `Selamat, <span id="winner-name">${S.escape(participant.name)}</span>!` : 'Selamat!'; $('#winner-prize').textContent = product.name; $('#winner-icon').textContent = product.icon; document.body.classList.add('celebrating'); $('#winner-dialog').showModal(); celebrate(); playCelebrationSound();
    $$('#winner-dialog button').forEach(button => button.disabled = false);
  }
  function finish(participant, product, spinId) {
    $('.stage').classList.remove('spinning');
    product.stock--; state.history.push({ id: S.id(), spinEventId:spinId, participantId: participant?.id || '', participantName: participant?.name || 'Undian Umum', productId: product.id, productName: product.name, icon: product.icon, time: new Date().toISOString() });
    if (participantMode() && state.participantAdvance === 'manual') state.selectedParticipant = '';
    if (state.spinEvent?.id === spinId) state.spinEvent = { ...state.spinEvent, status:'finished', finishedAt:Date.now() }; S.save();
    showWinner(participant, product);
  }
  function completeResult() { if (!spinning) return; spinning = false; rotation = 0; pointerAnimation?.cancel(); pointerAnimation = null; $('.stage').classList.remove('spinning'); document.body.classList.remove('celebrating'); $$('button, .theme-option').forEach(control => control.disabled = false); collapseSheet(false); render(); }
  function startMirrorSpin(event) {
    if (!adminMirror || !event || event.id === mirrorSpinId) return;
    mirrorSpinId = event.id; mirrorFrameId++; const frameId = mirrorFrameId; spinning = true; rotation = Number(event.from) || 0; render(); $('.stage').classList.add('spinning');
    const duration = Math.max(1, Number(event.duration) || 6000), from = Number(event.from) || 0, to = Number(event.to) || from;
    function frame() {
      if (frameId !== mirrorFrameId) return;
      const progress = Math.min(1, Math.max(0, (Date.now() - Number(event.startedAt)) / duration));
      rotation = from + (to - from) * naturalSpinProgress(progress); $('#wheel').style.transform = `rotate(${rotation}deg)`;
      if (progress < 1 && state.spinEvent?.id === event.id && state.spinEvent.status === 'spinning') requestAnimationFrame(frame);
      else $('.stage').classList.remove('spinning');
    }
    requestAnimationFrame(frame);
  }
  function presentMirrorResult(event) {
    if (!adminMirror || !event || event.id === mirrorPresentedId) return;
    const result = [...state.history].reverse().find(item => item.spinEventId === event.id); if (!result) return;
    mirrorPresentedId = event.id; mirrorFrameId++; spinning = true; rotation = Number(event.to) || rotation; $('#wheel').style.transform = `rotate(${rotation}deg)`; $('.stage').classList.remove('spinning');
    const participant = result.participantId ? { id:result.participantId, name:result.participantName } : null;
    showWinner(participant, { id:result.productId, name:result.productName, icon:result.icon || '🎁' });
  }
  function syncMirrorEvent() {
    if (!adminMirror) return; const event = state.spinEvent; if (!event) return;
    if (event.status === 'spinning') startMirrorSpin(event); else if (event.status === 'finished') presentMirrorResult(event);
  }
  function celebrate() {
    if (reducedMotion) return; const canvas = $('#confetti'), context = canvas.getContext('2d'); canvas.width = innerWidth; canvas.height = innerHeight;
    const colors = [...palette[state.theme], '#ffd43b', '#ffffff'], origins = [{x:innerWidth*.14,y:innerHeight*.82},{x:innerWidth*.5,y:innerHeight*.42},{x:innerWidth*.86,y:innerHeight*.82}];
    const particles = Array.from({ length: 300 }, (_, index) => { const origin = origins[index % origins.length], side = index % 3 - 1; return { x:origin.x, y:origin.y, vx:(Math.random()-.5)*22 + side*-5, vy:-Math.random()*20-5, color:colors[randomIndex(colors.length)], size:Math.random()*8+3, r:Math.random()*3, spin:(Math.random()-.5)*.22, shape:index%4 }; }), started=performance.now(); let last=started;
    function frame(now) { const dt=Math.min(2,(now-last)/16.67); last=now; context.clearRect(0,0,canvas.width,canvas.height); context.globalAlpha=Math.max(0,1-(now-started-2800)/1700); particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.24*dt;p.vx*=.997;p.r+=p.spin*dt;context.save();context.translate(p.x,p.y);context.rotate(p.r);context.fillStyle=p.color;if(p.shape===0){context.beginPath();context.arc(0,0,p.size*.55,0,Math.PI*2);context.fill();}else if(p.shape===1){context.beginPath();for(let i=0;i<10;i++){const radius=i%2?p.size*.35:p.size;const angle=-Math.PI/2+i*Math.PI/5;context.lineTo(Math.cos(angle)*radius,Math.sin(angle)*radius);}context.closePath();context.fill();}else context.fillRect(-p.size/2,-p.size/2,p.size,p.shape===2?p.size*.35:p.size*.7);context.restore();});if(now-started<4500)requestAnimationFrame(frame);else context.clearRect(0,0,canvas.width,canvas.height);}requestAnimationFrame(frame);
  }
  $$('[data-theme-choice]').forEach(button => button.addEventListener('click', () => applyTheme(button.dataset.themeChoice)));
  $('#open-participant-picker').addEventListener('click', openPicker); $('#participant-search').addEventListener('input', event => { query = event.target.value; page = 1; renderPicker(); });
  $('#participant-grid').addEventListener('click', event => { const card = event.target.closest('[data-participant]'); if (!card) return; state.selectedParticipant = card.dataset.participant; rotation = 0; S.save(); $('#participant-dialog').close(); render(); toast(`${selected().name}, semoga beruntung!`); });
  $('#random-participant').addEventListener('click', () => chooseRandomParticipant(true));
  $('#sheet-random-participant').addEventListener('click', () => chooseRandomParticipant(false));
  $('#open-spinner-history').addEventListener('click', openHistory);
  $('#page-prev').addEventListener('click', () => { page--; renderPicker(); }); $('#page-next').addEventListener('click', () => { page++; renderPicker(); });
  $$('.close-dialog').forEach(button => button.addEventListener('click', () => closeDialog(button))); $('#winner-dialog').addEventListener('close', completeResult);
  $('#wheel-shell').addEventListener('click', spin);
  $('#wheel-shell').addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); spin(); } });
  $('#sound-button').addEventListener('click', () => { state.sound = !state.sound; initAudio(); tone(620); renderSound(); S.save(); });
  $('#toggle-draw-sheet').addEventListener('click', () => collapseSheet(!$('.draw-controls').classList.contains('sheet-collapsed')));
  $('#fullscreen-button').addEventListener('click', async () => { try { document.fullscreenElement ? await document.exitFullscreen() : await document.documentElement.requestFullscreen(); } catch { toast('Mode layar penuh tidak didukung browser ini.'); } });
  document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (!$('#participant-dialog').open) openPicker(); } });
  window.addEventListener('spinora:remote-change', () => {
    document.body.classList.toggle('participant-hidden', !showParticipant()); document.body.classList.toggle('participant-admin-control', adminControlsParticipants()); document.body.classList.toggle('general-spinner', !participantMode());
    if (adminMirror) { syncMirrorEvent(); if (!spinning) render(); }
    else if (!spinning && !randomizing) render();
  });
  applyTheme(state.theme, false); renderSound(); render(); syncMirrorEvent();
})();
