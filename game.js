(() => {
  'use strict';

  const SAVE_KEY = 'maite-rumbo-al-salar-save-v1';
  const $ = (id) => document.getElementById(id);
  const defaultState = () => ({
    version: 1, chapter: 1, location: 'camp', x: 53, y: 76,
    nancyBriefed: false, jaimeChecked: false, supportChosen: false, joseEncounterDone: false,
    tomasBriefed: false, spillSecured: false, yardPuzzleSolved: false, stepDone: false,
    snackTaken: false, hintToken: false, hintUsed: false,
    bulletinSeen: false, puzzleSolved: false, secretFound: false, secretHintShown: false,
    soundOn: false, clues: [], inventory: [], evidence: [],
    values: { leadership: 0, care: 0, rigor: 0, support: 0 },
    timelineAssignments: Array(5).fill(''),
    yardPieces: null, yardWon: false, yardMoves: 0, yardPuzzleVersion: 2,
    stationBriefed: false, waterRotations: [0, 3, 0], waterPuzzleSolved: false,
    waterTraceAssignments: { A: '', B: '', C: '', D: '' },
    waterTraceHintLevel: 0, waterNotesFound: [], allocationHintLevel: 0,
    waterAllocation: Array(8).fill(-1), allocationPuzzleSolved: false,
    benjaminBriefed: false, elianaBriefed: false, waterChapterDone: false
  });
  let state = loadState();
  delete state._target; delete state._path; delete state._pathIndex;
  let dialogOpen = false;
  let activePanel = '';
  let navigationDebugVisible = false;
  let movement = { x: 0, y: 0 };
  let heldKeys = new Set();
  let lastFrame = 0;
  let selectedHotspot = null;
  let toastTimer = 0;
  let bulletinTimer = 0;
  let bulletinStarted = 0;
  const audioRoot = './assets/audio/music/';
  const musicTracks = {
    chapter1: new Audio(`${audioRoot}capitulo-1-campamento.wav`),
    chapter2: new Audio(`${audioRoot}capitulo-2-ruta-del-agua.wav`),
    puzzle: new Audio(`${audioRoot}puzzle-core-lively.wav`)
  };
  Object.values(musicTracks).forEach(track => { track.loop = true; track.preload = 'auto'; track.volume = 0; });
  const audioCues = new Set();
  let activeMusic = null;
  let audioMode = 'world';
  let loopStarted = false;
  let lastSaveAt = 0;
  let lastNpcRepathAt = 0;
  function fadeTrack(track, target, duration = 900) {
    clearInterval(track._fadeTimer);
    if (target > 0 && track.paused) track.play().catch(() => {});
    const start = track.volume, began = performance.now();
    track._fadeTimer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - began) / duration);
      track.volume = start + (target - start) * progress;
      if (progress >= 1) {
        clearInterval(track._fadeTimer);
        if (target === 0) { track.pause(); track.currentTime = 0; }
      }
    }, 40);
  }
  function syncMusic() {
    if (!state.soundOn) { Object.values(musicTracks).forEach(track => fadeTrack(track, 0, 250)); activeMusic = null; return; }
    const key = audioMode === 'puzzle' ? 'puzzle' : state.chapter === 2 ? 'chapter2' : 'chapter1';
    const next = musicTracks[key];
    if (activeMusic === next && !next.paused) return;
    activeMusic = next;
    Object.values(musicTracks).forEach(track => fadeTrack(track, track === next ? 0.22 : 0, track === next ? 1000 : 850));
  }
  function playAudioCue(file, volume = 0.3) {
    if (!state.soundOn) return;
    const cue = new Audio(`${audioRoot}${file}`); cue.preload = 'auto'; cue.volume = volume;
    audioCues.add(cue); cue.addEventListener('ended', () => audioCues.delete(cue), { once: true });
    cue.play().catch(() => audioCues.delete(cue));
  }
  function enterPuzzleAudio() {
    audioMode = 'puzzle'; playAudioCue('cue-entrar-modo-puzle.wav', 0.22); syncMusic();
  }
  function leavePuzzleAudio(solved = false) {
    audioMode = 'world'; if (solved) playAudioCue('cue-resolver-puzle.wav', 0.3); syncMusic();
  }
  const npcPatrols = {
    nancy: { x: 34, y: 40, range: 3.1, pace: 0.00065, phase: 0.0 },
    jose: { x: 71, y: 40, range: 1.2, pace: 0.00048, phase: 2.2 },
    jaime: { x: 51, y: 66, range: 3.7, pace: 0.00052, phase: 1.6 },
    tomas: { x: 61, y: 53, range: 3.4, pace: 0.00061, phase: 3.2 },
    diego: { x: 43, y: 66, range: 3.5, pace: 0.00056, phase: 4.7 },
    constanza: { x: 34, y: 57, range: 2.2, pace: 0.0005, phase: 0.7 },
    benjamin: { x: 46, y: 55, range: 1.6, pace: 0.00046, phase: 2.4 },
    eliana: { x: 66, y: 78, range: 2.6, pace: 0.00052, phase: 4.1 }
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      const restored = saved && saved.version === 1 ? { ...defaultState(), ...saved, values: { ...defaultState().values, ...saved.values } } : defaultState();
      if (!Array.isArray(restored.timelineAssignments) || restored.timelineAssignments.length !== 5 || new Set(restored.timelineAssignments.filter(Boolean)).size !== restored.timelineAssignments.filter(Boolean).length) {
        restored.timelineAssignments = Array(5).fill('');
      }
      if (saved && saved.yardPuzzleVersion !== 2 && !restored.yardPuzzleSolved) {
        restored.yardPieces = null;
        restored.yardWon = false;
        restored.yardMoves = 0;
      }
      if (!Array.isArray(restored.waterNotesFound)) restored.waterNotesFound = [];
      if (!Array.isArray(restored.waterAllocation) || restored.waterAllocation.length !== 8) restored.waterAllocation = Array(8).fill(-1);
      if (!restored.waterTraceAssignments || typeof restored.waterTraceAssignments !== 'object' || Array.isArray(restored.waterTraceAssignments)) restored.waterTraceAssignments = {};
      const traceDefaults = defaultState().waterTraceAssignments;
      restored.waterTraceAssignments = Object.fromEntries(Object.keys(traceDefaults).map(id => {
        const previous = restored.waterTraceAssignments?.[id];
        const route = typeof previous === 'string' ? previous : previous?.route;
        return [id, ['land', 'sea'].includes(route) ? route : ''];
      }));
      restored.waterAllocation = restored.waterAllocation.map(value => [-1, 0, 1, 2].includes(value) ? value : -1);
      restored.waterNotesFound = [...new Set(restored.waterNotesFound.filter(value => ['balance', 'reserve'].includes(value)))];
      restored.waterTraceHintLevel = Math.max(0, Math.min(3, Number(restored.waterTraceHintLevel) || 0));
      restored.allocationHintLevel = Math.max(0, Math.min(3, Number(restored.allocationHintLevel) || 0));
      restored.yardPuzzleVersion = 2;
      return restored;
    } catch (_) { return defaultState(); }
  }
  function save() {
    const { _target, _path, _pathIndex, ...persistentState } = state;
    localStorage.setItem(SAVE_KEY, JSON.stringify(persistentState));
  }
  function flash(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
  }
  function navigationClearance() { return Math.max(10, $('player').offsetWidth * .24); }
  function actorDepth(y) { return Math.round(100 + Number(y) * 8); }
  function setActorDepth(actor, y, marker = null) {
    const depth = actorDepth(y);
    actor.style.zIndex = String(depth);
    if (marker) marker.style.zIndex = String(depth + 1);
  }
  function npcCollisionRadius(actor) {
    return Math.max(16, ($('player').offsetWidth + actor.offsetWidth) * .28 + 4);
  }
  function npcObstacles() {
    return [...document.querySelectorAll('.actor-npc')].map(actor => ({
      x: Number.parseFloat(actor.style.left),
      y: Number.parseFloat(actor.style.top),
      radiusPx: npcCollisionRadius(actor)
    })).filter(obstacle => Number.isFinite(obstacle.x) && Number.isFinite(obstacle.y));
  }
  function npcBlocksMove(x, y, rect, obstacles = npcObstacles()) {
    const nextX = x / 100 * rect.width, nextY = y / 100 * rect.height;
    const currentX = state.x / 100 * rect.width, currentY = state.y / 100 * rect.height;
    return obstacles.some(obstacle => {
      const centerX = obstacle.x / 100 * rect.width, centerY = obstacle.y / 100 * rect.height;
      const nextDistance = Math.hypot(nextX - centerX, nextY - centerY);
      const currentDistance = Math.hypot(currentX - centerX, currentY - centerY);
      return nextDistance < obstacle.radiusPx && nextDistance >= currentDistance - .05;
    });
  }
  function npcInteractionRangePct(actorId, rect = sceneRect()) {
    const actor = document.querySelector(`.actor-npc[data-actor-id="${actorId}"]`);
    if (!actor || !rect.width || !rect.height) return 7;
    return (npcCollisionRadius(actor) + 8) / Math.min(rect.width, rect.height) * 100;
  }
  function repathAroundNpcs(rect, clearance, obstacles) {
    if (!state._target || heldKeys.size) return false;
    const target = state._target;
    const route = GameNavigation.findPath(state.location, { x: state.x, y: state.y }, target, rect, {
      clearancePx: clearance,
      interactionRangePct: target.interactionRangePct,
      dynamicObstacles: obstacles
    });
    if (!route) return false;
    state._path = route.points;
    state._pathIndex = 0;
    return true;
  }
  function sceneRect() {
    const rect = $('scene').getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }
  function renderNavigationOverlay() {
    const overlay = $('navigation-overlay');
    if (!overlay || !window.GameNavigation) return;
    overlay.classList.toggle('hidden', !navigationDebugVisible);
    $('navigation-legend').classList.toggle('hidden', !navigationDebugVisible);
    if (navigationDebugVisible) GameNavigation.renderOverlay(overlay, state.location, sceneRect());
  }
  function ensurePlayerWalkable() {
    const rect = sceneRect();
    if (!rect.width || !rect.height || !window.GameNavigation) return;
    const clearance = navigationClearance();
    if (!GameNavigation.isBlocked(state.location, state.x, state.y, rect, clearance)) return;
    const nearest = GameNavigation.findNearestWalkable(state.location, { x: state.x, y: state.y }, rect, clearance);
    if (!nearest) return;
    state.x = nearest.x; state.y = nearest.y;
    delete state._target; delete state._path; delete state._pathIndex;
    flash('Maite quedó en el punto transitable más cercano.');
  }
  function toggleNavigationDebug() {
    navigationDebugVisible = !navigationDebugVisible;
    renderNavigationOverlay();
    flash(navigationDebugVisible ? 'Verde: transitable · Rojo: bloqueado.' : 'Mapa de tránsito oculto.');
  }
  function objectiveText() {
    if (state.chapter === 2) {
      if (!state.stationBriefed) return 'Habla con Constanza y Benjamín; revisa el registro H-17';
      if (!state.waterPuzzleSolved) return 'Separa cuatro registros entre la faena y el mar';
      if (!state.waterNotesFound.includes('balance') || !state.waterNotesFound.includes('reserve')) return 'Encuentra las notas de balance y de resguardo';
      if (!state.allocationPuzzleSolved) return 'Reparte las ocho fichas según las notas encontradas';
      if (!state.benjaminBriefed || !state.elianaBriefed) return 'Resguarda el testimonio de Benjamín y registra la observación de Eliana';
      if (!state.waterChapterDone) return 'Vuelve con Constanza para dejar el acuerdo registrado';
      return 'Capítulo 2 listo · Fin de esta ruta jugable';
    }
    if (state.stepDone) return 'Capítulo 1 listo · Fin de esta ruta jugable';
    if (!state.nancyBriefed) return 'Habla con la Señora Nancy';
    if (!state.jaimeChecked) return 'Averigua cómo está Don Jaime para conducir';
    if (!state.puzzleSolved) return 'Confirma las horas del relevo en la oficina';
    if (!state.tomasBriefed) return 'Habla con Tomás y acuerda cómo proteger su aviso';
    if (!state.spillSecured) return 'Aísla la mancha del patio con apoyo de Diego';
    if (!state.yardPuzzleSolved) return 'Despeja el paso seguro del patio';
    return 'Vuelve con la Señora Nancy y registra los acuerdos';
  }
  function stepNumber() {
    if (state.chapter === 2) return state.waterChapterDone ? '3/3' : state.allocationPuzzleSolved ? '3/3' : state.waterPuzzleSolved ? '2/3' : '1/3';
    if (state.stepDone) return '4/4';
    if (!state.nancyBriefed) return '1/4';
    if (!state.puzzleSolved) return '1/4';
    if (!state.tomasBriefed) return '2/4';
    if (!state.spillSecured) return '3/4';
    return '4/4';
  }
  function updateHud() {
    $('objective').textContent = objectiveText();
    $('step-label').textContent = stepNumber();
    $('place-name').textContent = state.location === 'camp' ? 'Campamento Horizonte' : state.location === 'office' ? 'Oficina de Operaciones' : 'Estación Vega Norte';
    document.querySelector('.chapter-label').innerHTML = `CAPÍTULO ${state.chapter} DE 5 · PASO <b id="step-label">${stepNumber()}</b>`;
    $('scene').classList.toggle('scene-camp', state.location === 'camp');
    $('scene').classList.toggle('scene-office', state.location === 'office');
    $('scene').classList.toggle('scene-station', state.location === 'station');
    $('scene').setAttribute('aria-label', state.location === 'camp' ? 'Explora el Campamento Horizonte' : state.location === 'office' ? 'Explora la Oficina de Operaciones' : 'Explora la Estación Vega Norte');
    $('player').style.left = `${state.x}%`;
    $('player').style.top = `${state.y}%`;
    $('sound-button').classList.toggle('sound-off', !state.soundOn);
    $('sound-button').setAttribute('aria-label', state.soundOn ? 'Silenciar sonido, V' : 'Activar sonido, V');
    renderHotspots();
    setActorDepth($('player'), state.y);
    renderNavigationOverlay();
  }

  const scenes = {
    camp: [
      { id: 'nancy', label: 'Señora Nancy', x: 34, y: 40, actor: 'nancy', approach: 4, visible: () => true },
      { id: 'jose', label: 'José Ignacio', x: 71, y: 40, actor: 'jose', approach: 4, visible: () => true },
      { id: 'jaime', label: 'Don Jaime', x: 51, y: 66, actor: 'jaime', approach: 4, visible: () => true },
      { id: 'tomas', label: 'Tomás', x: 61, y: 53, actor: 'tomas', approach: 5.5, visible: () => state.puzzleSolved },
      { id: 'diego', label: 'Diego', x: 43, y: 66, actor: 'diego', approach: 4, visible: () => state.tomasBriefed },
      { id: 'spill', label: state.spillSecured ? 'Zona aislada ✓' : 'Mancha en el patio', x: 47, y: 78, actor: '', approach: 4, visible: () => state.tomasBriefed },
      { id: 'snack', label: state.snackTaken ? 'Mesa de colación' : 'Colación', x: 29, y: 77, actor: '', approach: 3.5, visible: () => true },
      { id: 'bulletin', label: state.bulletinSeen ? 'Noticiero visto' : 'Noticiero · 31 s', x: 65, y: 67, actor: '', approach: 4, visible: () => true },
      { id: 'office', label: 'Entrar a la oficina', x: 31, y: 47, actor: '', approach: 3.5, visible: () => true },
      { id: 'station', label: 'Viajar a Estación Vega Norte', x: 75, y: 61, actor: '', approach: 4, visible: () => state.stepDone && state.chapter === 1 },
      { id: 'resume-station', label: 'Volver a Estación Vega Norte', x: 75, y: 61, actor: '', approach: 4, visible: () => state.chapter === 2 }
    ],
    office: [
      { id: 'desk', label: state.spillSecured ? 'Despejar acceso del patio' : state.puzzleSolved ? 'Registro del relevo ✓' : 'Revisar registro', x: 42, y: 62, actor: '', approach: 5.5, visible: () => true },
      { id: 'exit', label: 'Volver al campamento', x: 86, y: 80, actor: '', approach: 4, visible: () => true },
      { id: 'secret', label: state.secretFound ? 'Detalle 23 ✓' : '?', x: 69, y: 60, actor: '', approach: 7, visible: () => true }
    ],
    station: [
      { id: 'constanza', label: 'Constanza · técnica de terreno', x: 34, y: 57, actor: 'constanza', approach: 5, visible: () => true },
      { id: 'benjamin', label: state.benjaminBriefed ? 'Benjamín · testimonio resguardado' : 'Benjamín · técnico de desalinización', x: 46, y: 55, actor: 'benjamin', approach: 5, visible: () => true },
      { id: 'eliana', label: state.elianaBriefed ? 'Eliana · observación registrada' : 'Eliana · cuidadora de la vega', x: 66, y: 78, actor: 'eliana', approach: 5, visible: () => true },
      { id: 'monitor', label: 'Registro de descarga H-17', x: 70, y: 48, actor: '', approach: 5, visible: () => true },
      { id: 'water-note-balance', label: state.waterNotesFound.includes('balance') ? 'Notas de balance ✓' : 'Notas de balance', x: 48, y: 66, actor: '', approach: 5, visible: () => true },
      { id: 'water-note-reserve', label: state.waterNotesFound.includes('reserve') ? 'Nota de resguardo ✓' : 'Nota de resguardo', x: 78, y: 74, actor: '', approach: 5, visible: () => true },
      { id: 'water-network', label: state.waterPuzzleSolved ? 'Tablero de trazabilidad ✓' : 'Tablero de trazabilidad', x: 55, y: 70, actor: '', approach: 5, visible: () => state.stationBriefed },
      { id: 'water-allocation', label: state.allocationPuzzleSolved ? 'Balance de maqueta ✓' : 'Balance de maqueta', x: 82, y: 69, actor: '', approach: 5, visible: () => state.waterPuzzleSolved },
      { id: 'return-camp', label: 'Regresar al campamento', x: 50, y: 86, actor: '', approach: 5, visible: () => true }
    ]
  };

  function renderHotspots() {
    const root = $('hotspots');
    root.replaceChildren();
    document.querySelectorAll('.actor-npc').forEach(el => el.remove());
    const list = scenes[state.location];
    list.forEach((spot) => {
      if (!spot.visible()) return;
      let labelText = spot.label;
      if (spot.id === 'snack') labelText = state.snackTaken ? 'Mesa vacía' : 'Colación';
      if (spot.id === 'bulletin') labelText = state.bulletinSeen ? 'Noticiero visto' : 'Noticiero · 31 s';
      if (spot.id === 'spill') labelText = state.spillSecured ? 'Zona aislada ✓' : 'Mancha en el patio';
      if (spot.id === 'desk') labelText = state.spillSecured ? 'Despejar acceso del patio' : state.puzzleSolved ? 'Registro del relevo ✓' : 'Revisar registro';
      if (spot.id === 'secret') labelText = state.secretFound ? 'Detalle 23 ✓' : '?';
      if (spot.id === 'water-note-balance') labelText = state.waterNotesFound.includes('balance') ? 'Notas de balance ✓' : 'Notas de balance';
      if (spot.id === 'water-note-reserve') labelText = state.waterNotesFound.includes('reserve') ? 'Nota de resguardo ✓' : 'Nota de resguardo';
      if (spot.id === 'water-network') labelText = state.waterPuzzleSolved ? 'Tablero de trazabilidad ✓' : 'Tablero de trazabilidad';
      if (spot.id === 'water-allocation') labelText = state.allocationPuzzleSolved ? 'Balance de maqueta ✓' : 'Balance de maqueta';
      if (spot.actor) {
        const actor = document.createElement('button');
        actor.type = 'button';
        actor.className = `actor actor-npc actor-interactive ${spot.actor}`;
        actor.style.left = `${spot.x}%`;
        actor.style.top = `${spot.y}%`;
        actor.style.backgroundPosition = '0 0';
        setActorDepth(actor, spot.y);
        actor.dataset.actorId = spot.id;
        actor.setAttribute('aria-label', `Hablar con ${spot.label}`);
        actor.title = `Hablar con ${spot.label}`;
        actor.addEventListener('click', () => walkToAndUse(spot));
        root.appendChild(actor);

        const name = document.createElement('span');
        name.className = 'npc-label';
        name.textContent = labelText;
        name.style.left = `${spot.x}%`;
        name.style.top = `${spot.y}%`;
        name.style.zIndex = String(actorDepth(spot.y) + 1);
        name.dataset.actorId = spot.id;
        root.appendChild(name);
        return;
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `hotspot${(spot.id === 'snack' && state.snackTaken) || (spot.id === 'bulletin' && state.bulletinSeen) || (spot.id === 'desk' && state.puzzleSolved) || (spot.id === 'secret' && state.secretFound) ? ' done' : ''}`;
      if (spot.id === 'snack') button.classList.add('food-spot');
      if (spot.id === 'secret' && !state.secretFound) button.classList.add('secret-hidden');
      button.style.left = `${spot.x}%`;
      button.style.top = `${spot.y}%`;
      if (spot.actor) button.dataset.actorId = spot.id;
      const label = document.createElement('span'); label.textContent = spot.id === 'secret' && !state.secretFound ? '' : labelText || 'Inspeccionar';
      button.appendChild(label);
      const imagePaths = { snack: './assets/drafts/extras/completo-italiano-v1.png', secret: './assets/drafts/extras/placa-23-secreta-v1.png' };
      if (imagePaths[spot.id] && (spot.id !== 'secret' || !state.secretFound)) {
        const image = document.createElement('img'); image.className = 'hotspot-image'; image.src = imagePaths[spot.id]; image.alt = spot.id === 'snack' ? 'Completo italiano' : 'Placa metálica pequeña con el número 23'; button.prepend(image);
      }
      button.setAttribute('aria-label', spot.id === 'secret' && !state.secretFound ? 'Examinar detalle oculto en el borde del escritorio' : labelText || 'Inspeccionar detalle');
      button.addEventListener('click', () => walkToAndUse(spot));
      root.appendChild(button);
    });
  }
  function requestWalk(x, y, id = '', label = '', interactionRangePct = 0) {
    const rect = sceneRect();
    const target = { x, y, id, label, interactionRangePct };
    const route = GameNavigation.findPath(state.location, { x: state.x, y: state.y }, { x, y }, rect, {
      clearancePx: navigationClearance(), interactionRangePct, dynamicObstacles: npcObstacles()
    });
    if (!route) {
      flash(id ? `No hay un paso libre hasta ${label || 'ese punto'}.` : 'Ese punto está bloqueado; elige una zona verde.');
      return false;
    }
    if (!route.points.length) {
      if (id) interact(id);
      return true;
    }
    state._target = target;
    state._path = route.points;
    state._pathIndex = 0;
    movement = { x: 0, y: 0 };
    if (label) flash(`Maite se acerca a ${label}…`);
    return true;
  }
  function walkToAndUse(spot) {
    selectedHotspot = spot;
    let x = spot.x, y = spot.y;
    if (spot.actor) {
      const marker = document.querySelector(`.npc-label[data-actor-id="${spot.id}"]`);
      if (marker) { x = Number.parseFloat(marker.style.left) || x; y = Number.parseFloat(marker.style.top) || y; }
    }
    if (Math.hypot(x - state.x, y - state.y) < 3) { interact(spot.id); return; }
    const approach = spot.actor ? npcInteractionRangePct(spot.id) : spot.approach ?? 3.5;
    requestWalk(x, y, spot.id, spot.label, approach);
  }
  function loop(time) {
    const dt = Math.min((time - lastFrame) / 1000 || 0, 0.04);
    lastFrame = time;
    if ($('play-screen').classList.contains('hidden')) {
      requestAnimationFrame(loop); return;
    }
    animateNpcs(time);
    if (dialogOpen || activePanel || !$('puzzle').classList.contains('hidden') || !$('yard-puzzle').classList.contains('hidden') || !$('water-puzzle').classList.contains('hidden') || !$('allocation-puzzle').classList.contains('hidden') || !$('bulletin').classList.contains('hidden') || !$('ending').classList.contains('hidden')) {
      requestAnimationFrame(loop); return;
    }
    let vx = movement.x, vy = movement.y;
    if (!heldKeys.size && state._target && state._path) {
      while (state._pathIndex < state._path.length && Math.hypot(state._path[state._pathIndex].x - state.x, state._path[state._pathIndex].y - state.y) < 1.25) state._pathIndex++;
      if (state._pathIndex >= state._path.length) {
        const arrived = state._target;
        delete state._target; delete state._path; delete state._pathIndex;
        movement = { x: 0, y: 0 };
        if (arrived.id) interact(arrived.id);
        requestAnimationFrame(loop); return;
      }
      const waypoint = state._path[state._pathIndex];
      vx = Math.abs(waypoint.x - state.x) < .15 ? 0 : Math.sign(waypoint.x - state.x);
      vy = Math.abs(waypoint.y - state.y) < .15 ? 0 : Math.sign(waypoint.y - state.y);
    }
    if (heldKeys.has('ArrowLeft') || heldKeys.has('a')) vx = -1;
    if (heldKeys.has('ArrowRight') || heldKeys.has('d')) vx = 1;
    if (heldKeys.has('ArrowUp') || heldKeys.has('w')) vy = -1;
    if (heldKeys.has('ArrowDown') || heldKeys.has('s')) vy = 1;
    if (vx || vy) {
      const length = Math.hypot(vx, vy) || 1;
      const speed = 20 * dt;
      const oldX = state.x, oldY = state.y;
      const nextX = Math.max(GameNavigation.bounds.minX, Math.min(GameNavigation.bounds.maxX, state.x + vx / length * speed));
      const nextY = Math.max(GameNavigation.bounds.minY, Math.min(GameNavigation.bounds.maxY, state.y + vy / length * speed));
      const rect = sceneRect(), clearance = navigationClearance(), obstacles = npcObstacles();
      const canMoveTo = (x, y) => !GameNavigation.isBlocked(state.location, x, y, rect, clearance)
        && !npcBlocksMove(x, y, rect, obstacles);
      const npcBlocked = npcBlocksMove(nextX, nextY, rect, obstacles);
      if (canMoveTo(nextX, nextY)) { state.x = nextX; state.y = nextY; }
      else {
        if (nextX !== state.x && canMoveTo(nextX, state.y)) state.x = nextX;
        if (nextY !== state.y && canMoveTo(state.x, nextY)) state.y = nextY;
      }
      if (npcBlocked && state._target && !heldKeys.size && time - lastNpcRepathAt > 250) {
        repathAroundNpcs(rect, clearance, obstacles);
        lastNpcRepathAt = time;
      }
      const moved = state.x !== oldX || state.y !== oldY;
      const dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 2 : 3) : (vy < 0 ? 1 : 0);
      const frame = Math.floor(time / 145) % 5;
      $('player').style.backgroundPosition = moved ? `${frame * 25}% ${dir * (100 / 3)}%` : '0 0';
      $('player').style.left = `${state.x}%`;
      $('player').style.top = `${state.y}%`;
      setActorDepth($('player'), state.y);
      if (moved && time - lastSaveAt > 1200) { save(); lastSaveAt = time; }
    } else {
      movement = { x: 0, y: 0 };
      $('player').style.backgroundPosition = '0 0';
    }
    requestAnimationFrame(loop);
  }
  function animateNpcs(time) {
    document.querySelectorAll('.actor-npc').forEach(actor => {
      const config = npcPatrols[actor.dataset.actorId];
      if (!config) return;
      const phase = time * config.pace + config.phase;
      const wave = Math.sin(phase);
      let x = config.x + wave * config.range;
      let y = config.y + Math.sin(phase * 2) * .55;
      const rect = sceneRect();
      const previousX = Number.parseFloat(actor.style.left) || config.x;
      const previousY = Number.parseFloat(actor.style.top) || config.y;
      const playerX = state.x / 100 * rect.width, playerY = state.y / 100 * rect.height;
      const nextDistance = Math.hypot(x / 100 * rect.width - playerX, y / 100 * rect.height - playerY);
      const currentDistance = Math.hypot(previousX / 100 * rect.width - playerX, previousY / 100 * rect.height - playerY);
      if (nextDistance < npcCollisionRadius(actor) && nextDistance <= currentDistance) { x = previousX; y = previousY; }
      const facing = Math.cos(phase) >= 0 ? 3 : 2;
      const frame = Math.floor(time / 170 + config.phase * 3) % 5;
      const left = `${x}%`, top = `${y}%`;
      actor.style.left = left;
      actor.style.top = top;
      actor.style.backgroundPosition = `${frame * 25}% ${facing * (100 / 3)}%`;
      const marker = document.querySelector(`.npc-label[data-actor-id="${actor.dataset.actorId}"]`);
      setActorDepth(actor, y, marker);
      if (marker) { marker.style.left = left; marker.style.top = top; }
    });
  }

  function showDialog({ name, role, text, choices = [], portrait = 'M', onClose = null }) {
    dialogOpen = true;
    $('dialogue-name').textContent = name;
    $('dialogue-role').textContent = role;
    $('dialogue-text').textContent = text;
    setDialoguePortrait(name, portrait);
    $('dialogue-choices').replaceChildren();
    $('dialogue-next').classList.toggle('hidden', choices.length > 0);
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'choice-button';
      button.textContent = `${index + 1}. ${choice.label}`;
      button.addEventListener('click', () => { closeDialog(); choice.run(); });
      $('dialogue-choices').appendChild(button);
    });
    $('dialogue').classList.remove('hidden');
    $('dialogue').dataset.close = onClose ? 'yes' : '';
    $('dialogue')._onClose = onClose;
    $('dialogue-next').focus();
  }
  function setDialoguePortrait(name, fallback) {
    const portrait = $('dialogue-portrait');
    const portraits = {
      'Maite': './assets/drafts/portraits/maite-v1.png',
      'Señora Nancy': './assets/drafts/portraits/senora-nancy-v1.png',
      'José Ignacio': './assets/drafts/portraits/jose-ignacio-v1.png',
      'Don Jaime': './assets/drafts/portraits/don-jaime-v1.png',
      'Tomás': './assets/drafts/portraits/tomas-v1.png',
      'Diego': './assets/drafts/portraits/diego-v1.png',
      'Constanza': './assets/drafts/portraits/constanza-v1.png',
      'Benjamín': './assets/drafts/portraits/benjamin-v1.png',
      'Eliana': './assets/drafts/portraits/eliana-v1.png'
    };
    portrait.classList.remove('has-portrait', 'food-portrait', 'reporter-portrait');
    portrait.style.backgroundImage = '';
    portrait.textContent = fallback;
    if (portraits[name]) {
      portrait.textContent = '';
      portrait.style.backgroundImage = `url("${portraits[name]}")`;
      portrait.classList.add('has-portrait');
    } else if (name === 'Colación') {
      portrait.textContent = '';
      portrait.style.backgroundImage = 'url("./assets/drafts/extras/completo-italiano-v1.png")';
      portrait.classList.add('food-portrait');
    } else if (name === 'Guante de Turno') {
      portrait.textContent = '';
      portrait.style.backgroundImage = 'url("./assets/drafts/extras/reportero-guante-turno-v1.png")';
      portrait.classList.add('reporter-portrait');
    }
  }
  function closeDialog() {
    if (!dialogOpen) return;
    dialogOpen = false;
    $('dialogue').classList.add('hidden');
    const action = $('dialogue')._onClose; $('dialogue')._onClose = null;
    if (action) action();
  }
  $('dialogue-next').addEventListener('click', closeDialog);

  function interact(id) {
    selectedHotspot = null;
    switch (id) {
      case 'nancy': interactNancy(); break;
      case 'jose': interactJose(); break;
      case 'jaime': interactJaime(); break;
      case 'tomas': interactTomas(); break;
      case 'diego': interactDiego(); break;
      case 'spill': inspectSpill(); break;
      case 'snack': interactSnack(); break;
      case 'bulletin': openBulletin(); break;
      case 'office':
        changeScene('office');
        if (!state.secretFound && !state.secretHintShown) {
          state.secretHintShown = true; save();
          showDialog({ name: 'Maite', role: 'Ingeniera civil en minas', text: 'Voy a revisar el registro del turno antes de acordar el relevo. Al entrar me pareció ver un destello pequeño junto al escritorio; después miro con calma.', portrait: 'M' });
        } else showDialog({ name: 'Maite', role: 'Ingeniera civil en minas', text: 'Voy a revisar el registro del turno antes de acordar el relevo.', portrait: 'M' });
        break;
      case 'station': enterWaterChapter(); break;
      case 'resume-station': changeScene('station'); break;
      case 'desk': openPuzzle(); break;
      case 'exit': changeScene('camp'); break;
      case 'secret': if (!state.secretFound) discoverSecret(); else flash('La nota «23» ya está guardada en tu diario.'); break;
      case 'constanza': interactConstanza(); break;
      case 'benjamin': interactBenjamin(); break;
      case 'eliana': interactEliana(); break;
      case 'monitor': inspectWaterMonitor(); break;
      case 'water-note-balance': collectWaterNote('balance'); break;
      case 'water-note-reserve': collectWaterNote('reserve'); break;
      case 'water-network': openWaterPuzzle(); break;
      case 'water-allocation': openAllocationPuzzle(); break;
      case 'return-camp': changeScene('camp'); break;
    }
  }
  function interactNancy() {
    if (!state.nancyBriefed) {
      showDialog({ name: 'Señora Nancy', role: 'Secretaria de la faena', portrait: 'N', text: 'Qué bueno que llegaste, Maite. Ya dejé tu credencial lista; tu casco está en portería. La planilla de turnos tiene cambios sin hora ni confirmación, y Don Jaime está por salir a conducir después de dormir poco. ¿Partimos revisando cómo está para conducir?', choices: [
        { label: 'Primero hablaré con Don Jaime y después reviso las horas.', run: () => { state.nancyBriefed = true; addEvidence('Lista de relevo', 'Registro sin firma; requiere confirmar aviso y regreso del bus.', 'nancy'); save(); updateHud(); flash('Nueva evidencia: lista de relevo.'); } },
        { label: '¿Dónde encuentro la copia vigente de la lista?', run: () => { state.nancyBriefed = true; addEvidence('Lista de relevo', 'Registro sin firma; requiere confirmar aviso y regreso del bus.', 'nancy'); save(); updateHud(); flash('Dejé una copia en la oficina; primero confirma con Don Jaime cómo está para conducir.'); } }
      ]});
    } else if (state.puzzleSolved && state.tomasBriefed && state.spillSecured && state.yardPuzzleSolved && !state.stepDone) {
      showDialog({ name: 'Señora Nancy', role: 'Secretaria de la faena', portrait: 'N', text: 'Quedó anotado el aviso, la salida, el regreso y quién revisará el sector aislado. El acuerdo está claro para el equipo entrante.', choices: [
        { label: 'Dejar el acuerdo guardado.', run: () => { state.stepDone = true; state.values.rigor += 1; addEvidence('Acuerdo del primer turno', 'Relevo, aviso de horas extendidas y sector de combustible registrados.', 'nancy'); save(); updateHud(); $('ending-stamp').classList.add('hidden'); $('ending-title').textContent = 'Un primer turno más seguro'; $('ending').querySelector('.eyebrow').textContent = 'Capítulo 1 · Paso 4 de 4'; $('ending').querySelector('.modal-card > p:not(.eyebrow)').textContent = 'El relevo queda registrado, el aviso de Tomás se resguarda y la mancha permanece aislada para su revisión. Maite deja responsables claros antes del turno entrante.'; $('ending-return').textContent = 'Continuar a Estación Vega Norte'; $('ending').classList.remove('hidden'); } }
      ]});
    } else {
      let msg = !state.jaimeChecked ? 'Habla con Don Jaime con calma y después revisa la bitácora del relevo.' : 'La bitácora está en el escritorio de la oficina. Cuando quede clara, volvemos a registrar el acuerdo.';
      if (state.puzzleSolved && !state.tomasBriefed) msg = 'Tomás necesita decidir cómo compartir el aviso de jornada extendida. Registra solo lo necesario para proteger su privacidad.';
      else if (state.tomasBriefed && !state.spillSecured) msg = 'Diego avisó de una mancha junto a un bidón. Delimiten el área y registren hora y ubicación.';
      else if (state.spillSecured && !state.yardPuzzleSolved) msg = 'Antes de cerrar, deja despejado el paso del patio para un traslado seguro.';
      else if (state.yardPuzzleSolved) msg = 'Ya están listos los respaldos para registrar los acuerdos del primer turno.';
      showDialog({ name: 'Señora Nancy', role: 'Secretaria de la faena', portrait: 'N', text: msg });
    }
  }
  function interactJose() {
    if (state.joseEncounterDone) {
      showDialog({ name: 'José Ignacio', role: 'Operador de maquinaria pesada', portrait: 'J', text: 'Dejé el tema personal. Revisemos la orden y el estado del equipo antes de moverlo.' });
      return;
    }
    showDialog({ name: 'José Ignacio', role: 'Operador de maquinaria pesada', portrait: 'J', text: 'Ah, llegó la ingeniera nueva. Con esa sonrisa hasta dan ganas de que me supervises el camión. Tranquila, yo te explico cómo funciona esto.', choices: [
      { label: 'No opines sobre mi apariencia. Dime si el equipo está inspeccionado y quién confirmó la salida.', run: () => resolveJoseEncounter() },
      { label: 'Ese comentario no corresponde. Mantengamos esto profesional: ¿qué revisión del equipo falta?', run: () => resolveJoseEncounter() }
    ]});
  }
  function resolveJoseEncounter() {
    if (state.joseEncounterDone) return;
    state.joseEncounterDone = true;
    state.values.leadership += 1;
    state.values.support += 1;
    save(); updateHud();
    flash('Pusiste un límite y devolviste la conversación a la seguridad del turno.');
    showDialog({ name: 'Don Jaime', role: 'Operador de mina', portrait: 'J', text: 'Bien dicho, Maite. Revisemos el equipo y dejemos clara la orden antes de la salida.' });
  }
  function interactJaime() {
    if (!state.nancyBriefed) { showDialog({ name: 'Don Jaime', role: 'Operador de mina', portrait: 'J', text: 'Hola, Maite. Nancy tiene la lista del relevo; mejor partamos por ahí para que todo quede anotado.' }); return; }
    if (!state.jaimeChecked) {
      showDialog({ name: 'Don Jaime', role: 'Operador de mina', portrait: 'J', text: 'Dormí como tres horas nomás. No quiero hacerme el valiente: antes de manejar, necesito que revisemos el relevo.', choices: [
        { label: 'Pidamos el relevo y la pausa; conducir con sueño no es seguro.', run: () => { state.jaimeChecked = true; state.supportChosen = true; state.values.leadership += 1; state.values.care += 1; state.values.support += 1; addEvidence('Aviso de cansancio', 'Don Jaime informa descanso insuficiente y solicita relevo antes de conducir.', 'jaime'); save(); updateHud(); flash('Acuerdo de pausa registrado.'); } },
        { label: 'Gracias por decirlo. Revisemos las horas antes de decidir.', run: () => { state.jaimeChecked = true; state.values.care += 1; addEvidence('Aviso de cansancio', 'Don Jaime informa descanso insuficiente; se revisan horas de relevo.', 'jaime'); save(); updateHud(); flash('Aviso de cansancio agregado a evidencias.'); } }
      ]});
    } else {
      showDialog({ name: 'Don Jaime', role: 'Operador de mina', portrait: 'J', text: 'Estoy esperando el relevo. Gracias por preguntar sin apurarme; así podemos dejar el turno bien hecho.' });
    }
  }
  function interactTomas() {
    if (!state.tomasBriefed) {
      showDialog({ name: 'Tomás', role: 'Operador de turno', portrait: 'T', text: 'Me llamaron después de marcar la salida. No quiero que circule mi horario completo, pero sí que quede claro que el aviso ocurrió y que hubo horas extra.', choices: [
        { label: 'Anotemos hora y aviso sin compartir el resto de tus datos.', run: () => { state.tomasBriefed = true; state.values.care += 1; state.values.rigor += 1; addEvidence('Aviso de jornada extendida', 'Registro acotado: llamada posterior a la salida marcada. El horario personal completo queda con acceso restringido.', 'tomas'); save(); updateHud(); flash('Aviso registrado con acceso limitado.'); } },
        { label: 'Tú decides qué compartir; dejaré constancia mínima del aviso.', run: () => { state.tomasBriefed = true; state.values.leadership += 1; state.values.support += 1; addEvidence('Aviso de jornada extendida', 'Registro acotado y anonimizado, autorizado por Tomás.', 'tomas'); save(); updateHud(); flash('Tomás conserva control sobre su información.'); } }
      ]});
    } else showDialog({ name: 'Tomás', role: 'Operador de turno', portrait: 'T', text: 'Gracias por dejar el aviso acotado. La llamada del jueves la puedo atender desde el punto autorizado con señal, sin exponer mis datos del turno.' });
  }
  function interactDiego() {
    showDialog({ name: 'Diego', role: 'Operador de patio', portrait: 'D', text: state.spillSecured ? 'La zona sigue delimitada. Dejé el registro del lugar y la hora para que el equipo de ambiente revise las plantas.' : 'Vi una mancha al lado de un bidón, cerca de las plantas del patio. No sé de qué es; primero hay que aislar el área y dejar constancia del lugar y la hora.', choices: state.spillSecured ? [] : [
      { label: 'Delimitemos el paso; yo registro dónde y cuándo lo viste.', run: () => secureSpill() },
      { label: 'Aislemos el sector y avisemos al equipo responsable.', run: () => { state.values.support += 1; secureSpill(); } }
    ]});
  }
  function inspectSpill() {
    if (state.spillSecured) { showDialog({ name: 'Maite', role: 'Registro de terreno', portrait: 'M', text: 'El área sigue aislada. La hora, el punto y la presencia de plantas cercanas quedaron anotados; no voy a identificar una sustancia sin revisión.' }); return; }
    showDialog({ name: 'Maite', role: 'Ingeniera civil en minas', portrait: 'M', text: 'No tocaré la mancha ni moveré el envase. Primero se necesita delimitar el paso y avisar al equipo responsable.', choices: [{ label: 'Pedirle apoyo a Diego para aislar y registrar.', run: () => secureSpill() }] });
  }
  function secureSpill() {
    state.spillSecured = true; state.values.care += 1; addEvidence('Aviso de mancha en patio', 'Sector aislado. Hora y ubicación registradas; posible proximidad a plantas, composición por verificar.', 'diego'); save(); updateHud(); renderHotspots(); flash('Área delimitada y aviso registrado.');
  }
  function interactSnack() {
    if (state.snackTaken) { showDialog({ name: 'Colación', role: 'Mesa del campamento', portrait: '🍽', text: 'La mesa ya quedó vacía. La ficha de pista está en tu mochila.' }); return; }
    showDialog({ name: 'Colación', role: 'Mesa del campamento', portrait: '🍽', text: 'Queda una pura. Hay un completo italiano con tomate, palta y mayo. Una pausa corta también ayuda a ordenar las ideas.', choices: [
      { label: 'Tomar el completo italiano.', run: () => {
        state.snackTaken = true; state.hintToken = true; state.inventory.push('Completo italiano');
        save(); renderHotspots(); updateHud(); flash('Comiste el completo. Obtienes una ficha de pista.');
        showDialog({ name: 'Voz desde la carpa', role: 'Colación del turno', portrait: '…', text: 'Oye… ¿quién se sacó mi tocomple?', onClose: () => showDialog({ name: 'Maite', role: 'Ingeniera civil en minas', portrait: 'M', text: 'Te aviso luego si estaba envenenado, jeje…' }) });
      } },
      { label: 'Dejarlo para el equipo.', run: () => flash('Dejaste la colación para otra persona del turno.') }
    ]});
  }
  function openBulletin() {
    if (state.bulletinSeen) { showDialog({ name: 'Guante de Turno', role: 'Noticiero del Salar', portrait: '31', text: 'Repetición de la cápsula: la hoja sin firma fue vista por última vez en la oficina. Seguiremos informando.' }); return; }
    $('bulletin').classList.remove('hidden');
    bulletinStarted = Date.now();
    updateBulletin();
    clearInterval(bulletinTimer);
    bulletinTimer = setInterval(updateBulletin, 250);
  }
  function updateBulletin() {
    const elapsed = (Date.now() - bulletinStarted) / 1000;
    const remaining = Math.max(0, 31 - elapsed);
    $('bulletin-time').textContent = `${Math.ceil(remaining)} segundo${Math.ceil(remaining) === 1 ? '' : 's'}`;
    $('bulletin-progress').style.width = `${Math.min(100, elapsed / 31 * 100)}%`;
    if (remaining <= 0) closeBulletin();
  }
  function closeBulletin() {
    clearInterval(bulletinTimer);
    $('bulletin').classList.add('hidden');
    if (!state.bulletinSeen) { state.bulletinSeen = true; save(); renderHotspots(); flash('La pista del noticiero apunta a la oficina.'); }
  }
  $('bulletin-skip').addEventListener('click', closeBulletin);
  function changeScene(name) {
    state.location = name; state.x = name === 'camp' ? 73 : name === 'station' ? 50 : 84; state.y = name === 'camp' ? 73 : name === 'station' ? 82 : 76;
    delete state._target; delete state._path; delete state._pathIndex;
    updateHud(); ensurePlayerWalkable(); updateHud(); save(); syncMusic();
  }
  function enterWaterChapter() {
    state.chapter = 2; state.location = 'station'; state.x = 50; state.y = 82;
    delete state._target; delete state._path; delete state._pathIndex;
    $('ending').classList.add('hidden'); updateHud(); ensurePlayerWalkable(); updateHud(); save();
    playAudioCue('transicion-folk-01-02.wav', 0.28); syncMusic();
    showDialog({ name: 'Maite', role: 'Estación Vega Norte', portrait: 'M', text: 'El relevo del campamento quedó anotado. En la estación revisaremos la descarga H-17 con los registros originales y cuidaremos que la vega conserve su reserva.' });
  }
  function interactConstanza() {
    if (!state.stationBriefed) {
      showDialog({ name: 'Constanza', role: 'Prevencionista de terreno', portrait: 'C', text: 'El panel verde muestra un promedio, pero la bitácora original marca cambios breves en H-17. Primero registramos la fuente y consultamos el punto y la hora antes de sacar conclusiones.', choices: [
        { label: 'Registrar la alerta y revisar las fuentes originales.', run: () => { state.stationBriefed = true; addEvidence('Alerta H-17 · fuente original', 'La bitácora registra una alerta breve que requiere cotejar hora, punto y mediciones originales. No atribuye causa.', 'Constanza · bitácora de terreno'); save(); renderHotspots(); updateHud(); flash('Alerta registrada para revisión.'); } }
      ]});
    } else if (state.waterChapterDone) {
      showDialog({ name: 'Constanza', role: 'Prevencionista de terreno', portrait: 'C', text: 'Quedaron registradas las fuentes, el testimonio con acceso limitado y la observación de Eliana. H-17 y el seguimiento de la vega continúan pendientes de verificación con sus registros originales.' });
    } else if (state.allocationPuzzleSolved) {
      if (!state.benjaminBriefed || !state.elianaBriefed) {
        showDialog({ name: 'Constanza', role: 'Prevencionista de terreno', portrait: 'C', text: 'La maqueta quedó resuelta. Antes de cerrar el acuerdo, registra el aviso de Benjamín con acceso limitado y la observación de Eliana con su seguimiento pendiente.' });
        return;
      }
      showDialog({ name: 'Constanza', role: 'Prevencionista de terreno', portrait: 'C', text: 'El balance de la maqueta cuadra con las notas. Mantengamos separadas las preguntas del tramo terrestre y del emisario; la observación de la vega no demuestra por sí sola una causa.', choices: [
        { label: 'Registrar el acuerdo y solicitar verificaciones por separado.', run: () => { state.waterChapterDone = true; addEvidence('Acuerdo de agua y vega', 'El balance se registra como ejercicio didáctico. H-17, el emisario y la observación de la vega quedan con fuentes y seguimientos separados; no se atribuye causa.', 'Equipo de Estación Vega Norte'); save(); updateHud(); $('ending-stamp').classList.remove('hidden'); $('ending-title').textContent = 'Fuentes separadas, seguimiento abierto'; $('ending').querySelector('.eyebrow').textContent = 'Capítulo 2 · Fin del episodio'; $('ending').querySelector('.modal-card > p:not(.eyebrow)').textContent = 'El acuerdo queda registrado. H-17 y el seguimiento costero siguen abiertos, mientras el equipo reúne las verificaciones pendientes. La ruta de Maite continúa…'; $('ending-return').textContent = 'Volver a la estación'; $('ending').classList.remove('hidden'); } }
      ]});
    } else showDialog({ name: 'Constanza', role: 'Prevencionista de terreno', portrait: 'C', text: state.waterPuzzleSolved ? 'El tablero de trazabilidad quedó registrado. Encuentra las dos notas de la estación antes de abrir el balance de la maqueta.' : 'Separa cuatro registros: la tubería que llega a la faena, cerca de la vega, y el emisario que devuelve salmuera al mar.' });
  }
  function interactBenjamin() {
    if (state.benjaminBriefed) {
      showDialog({ name: 'Benjamín', role: 'Técnico de desalinización', portrait: 'B', text: 'Gracias por mantener mi identidad fuera del registro abierto. El aviso original de H-17 sigue disponible para cotejar hora y punto con los datos de control.' });
      return;
    }
    showDialog({ name: 'Benjamín', role: 'Técnico de desalinización', portrait: 'B', text: 'El promedio diario quedó dentro del rango, pero el aviso H-17 registró dos caídas breves de presión durante el relevo. Quiero que revisen el original; mantén mi identidad con acceso limitado mientras se verifica.', choices: [
      { label: 'Registrar la fuente original y resguardar su identidad.', run: () => { state.benjaminBriefed = true; state.values.support += 1; addEvidence('Aviso H-17 · testimonio técnico reservado', 'Benjamín informó dos caídas breves de presión durante el relevo. Resguardar su identidad y cotejar hora, punto y serie original; el aviso no establece causa.', 'Benjamín · acceso limitado'); save(); renderHotspots(); updateHud(); flash('Testimonio registrado con acceso limitado.'); } }
    ]});
  }
  function interactEliana() {
    if (state.elianaBriefed) {
      showDialog({ name: 'Eliana', role: 'Cuidadora de la vega', portrait: 'E', text: 'La observación quedó con su ubicación y seguimiento pendiente. Comparemos las fechas y puntos de la serie antes de atribuirle una causa.' });
      return;
    }
    showDialog({ name: 'Eliana', role: 'Cuidadora de la vega', portrait: 'E', text: 'Vi humedad y un cambio en la vegetación cerca del trazado terrestre. Registremos el punto y busquemos la serie de seguimiento; mi observación por sí sola no prueba qué lo causó.', choices: [
      { label: 'Registrar el punto como observación y dejar la causa pendiente.', run: () => { state.elianaBriefed = true; state.values.care += 1; addEvidence('Observación de la vega · seguimiento pendiente', 'Eliana reporta humedad y un cambio de vegetación junto al trazado terrestre. Falta comparar fechas, puntos y la serie de seguimiento; no demuestra causalidad.', 'Eliana · observación de terreno'); save(); renderHotspots(); updateHud(); flash('Observación registrada para seguimiento.'); } }
    ]});
  }
  function collectWaterNote(noteId) {
    if (!state.waterNotesFound.includes(noteId)) state.waterNotesFound.push(noteId);
    if (noteId === 'balance') {
      addEvidence('Nota de turno · balance de maqueta', 'Las ocho fichas deben repartirse entre las tres bandejas; ninguna queda fuera del balance.', 'Pizarra de reparto · estación');
      addEvidence('Nota de distribución · Planta y Prueba', 'La Planta recibe el doble de fichas que Prueba.', 'Pizarra de reparto · estación');
      showDialog({ name: 'Notas de la maqueta', role: 'Pizarra de reparto', portrait: '🗒️', text: 'Nota de turno: usa las ocho fichas, ninguna queda fuera del balance. Nota de distribución: Planta recibe el doble que Prueba. Son relaciones didácticas, no caudales reales.' });
    } else {
      addEvidence('Nota de resguardo · reserva', 'La Reserva recibe la misma cantidad de fichas que Prueba. La relación pertenece solo a la maqueta didáctica.', 'Tarjeta de resguardo · borde de la vega');
      showDialog({ name: 'Nota de resguardo', role: 'Tarjeta junto a la vega', portrait: '🌿', text: 'La Reserva recibe la misma cantidad que Prueba. La nota sirve para completar la maqueta; no describe una operación ni un caudal real.' });
    }
    save(); renderHotspots(); updateHud();
  }
  function inspectWaterMonitor() {
    showDialog({ name: 'Bitácora H-17', role: 'Registro de descarga', portrait: '📋', text: 'Resumen: el promedio diario quedó dentro del rango de referencia. Bitácora original: dos caídas breves de presión en H-17, con hora y punto que deben cotejarse en el registro. El resumen no sustituye la serie original ni identifica una causa.' });
    addEvidence('Resumen y bitácora H-17', 'El promedio y las caídas breves son registros distintos. Cotejar hora, punto y serie original antes de interpretar.', 'Monitor · resumen diario y bitácora original'); save();
  }
  const waterTraceCards = [
    { id: 'A', source: 'Lectura de presión · H-17', point: 'Punto: tubería que lleva agua a la faena', text: 'La bitácora registra dos caídas breves de presión durante el relevo.', expected: { route: 'land' } },
    { id: 'B', source: 'Inspección de terreno', point: 'Punto: unión de la tubería', text: 'Se observó humedad junto a la unión. Su origen aún no está determinado.', expected: { route: 'land' } },
    { id: 'C', source: 'Observación de la vega', point: 'Punto: junto al trazado terrestre', text: 'Se observó un cambio en la vegetación; requiere seguimiento y no prueba una causa.', expected: { route: 'land' } },
    { id: 'D', source: 'Registro del emisario costero', point: 'Punto: descarga al mar', text: 'El seguimiento de la salmuera se revisa por separado del circuito terrestre.', expected: { route: 'sea' } }
  ];
  const waterTraceRoutes = [['land', 'Hacia la faena · agua desalinizada'], ['sea', 'Hacia el mar · salmuera']];
  const waterTraceHints = [
    'H-17 está en la tubería que lleva agua a la faena. El emisario termina en el mar.',
    'La vega está junto al trazado terrestre; su observación requiere seguimiento.',
    'A, B y C van hacia la faena. D va hacia el mar.'
  ];
  const allocationNotes = [
    { id: 'balance', title: 'Nota de turno', text: 'Se usan las ocho fichas; ninguna queda fuera del balance.', source: 'Punto de notas · pizarra de reparto' },
    { id: 'balance', title: 'Nota de distribución', text: 'Planta recibe el doble de fichas que Prueba.', source: 'Punto de notas · pizarra de reparto' },
    { id: 'reserve', title: 'Nota de resguardo', text: 'Reserva recibe la misma cantidad de fichas que Prueba.', source: 'Punto de resguardo · borde de la vega' }
  ];
  const allocationHints = [
    'Prueba y Reserva reciben la misma cantidad.',
    'Si Prueba tiene x, Planta tiene 2x y Reserva x. En total son ocho fichas.',
    'Prueba 2; Reserva 2; Planta 4. Es un balance abstracto, no un caudal.'
  ];
  const puzzleClocks = {
    trace: { mode: 'timed', remaining: 60, running: false, expired: false, lastTick: 0, interval: 0, warned30: false, warned10: false },
    allocation: { mode: 'timed', remaining: 60, running: false, expired: false, lastTick: 0, interval: 0, warned30: false, warned10: false }
  };
  let activePuzzleClock = '';
  let selectedWaterToken = -1;

  function puzzleClockElements(name) {
    return name === 'trace'
      ? { timer: 'water-timer', status: 'water-timer-status', pause: 'water-pause', play: 'water-play', expired: 'water-expired' }
      : { timer: 'allocation-timer', status: 'allocation-timer-status', pause: 'allocation-pause', play: 'allocation-play', expired: 'allocation-expired' };
  }
  function renderPuzzleClock(name, statusText = '') {
    const clock = puzzleClocks[name], ui = puzzleClockElements(name);
    if (clock.mode === 'untimed') $(ui.timer).textContent = 'Sin reloj';
    else { const seconds = Math.ceil(clock.remaining); $(ui.timer).textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
    if (statusText) $(ui.status).textContent = statusText;
    const pause = $(ui.pause);
    pause.textContent = clock.mode === 'untimed' ? 'Sin cronómetro' : clock.running ? 'Pausar reloj' : 'Continuar reloj';
    pause.disabled = clock.mode === 'untimed' || clock.expired;
  }
  function expirePuzzleClock(name) {
    const clock = puzzleClocks[name], ui = puzzleClockElements(name);
    if (clock.interval) clearInterval(clock.interval);
    clock.interval = 0; clock.running = false; clock.remaining = 0; clock.expired = true; activePuzzleClock = name;
    $(ui.play).classList.add('hidden'); $(ui.expired).classList.remove('hidden');
    renderPuzzleClock(name, 'Ronda terminada. No se descuenta progreso ni atributos.');
  }
  function syncPuzzleClock(name) {
    const clock = puzzleClocks[name];
    if (!clock.running) return !clock.expired;
    const now = performance.now();
    clock.remaining = Math.max(0, clock.remaining - (now - clock.lastTick) / 1000);
    clock.lastTick = now;
    if (clock.remaining <= 0) { expirePuzzleClock(name); return false; }
    if (clock.remaining <= 30 && !clock.warned30) { clock.warned30 = true; renderPuzzleClock(name, 'Quedan 30 segundos.'); }
    else if (clock.remaining <= 10 && !clock.warned10) { clock.warned10 = true; renderPuzzleClock(name, 'Quedan 10 segundos.'); }
    else renderPuzzleClock(name);
    return true;
  }
  function startPuzzleClock(name, mode, reset = true) {
    const clock = puzzleClocks[name], ui = puzzleClockElements(name);
    if (clock.interval) clearInterval(clock.interval);
    clock.interval = 0;
    if (reset) { clock.remaining = 60; clock.expired = false; clock.warned30 = false; clock.warned10 = false; }
    clock.mode = mode; clock.running = false; activePuzzleClock = name;
    $(ui.expired).classList.add('hidden'); $(ui.play).classList.remove('hidden');
    if (mode === 'untimed') { renderPuzzleClock(name, 'Modo sin cronómetro. Las reglas, pistas y progreso son los mismos.'); return; }
    if (document.visibilityState === 'hidden') { renderPuzzleClock(name, 'Reloj pausado al cambiar de pestaña. Pulsa Continuar cuando vuelvas.'); return; }
    clock.running = true; clock.lastTick = performance.now();
    renderPuzzleClock(name, 'Tienes 60 segundos. El reloj está en marcha.');
    clock.interval = setInterval(() => syncPuzzleClock(name), 250);
  }
  function preparePuzzleClock(name) {
    const clock = puzzleClocks[name], ui = puzzleClockElements(name);
    if (clock.interval) clearInterval(clock.interval);
    Object.assign(clock, { mode: 'timed', remaining: 60, running: false, expired: false, lastTick: 0, interval: 0, warned30: false, warned10: false });
    if (activePuzzleClock === name) activePuzzleClock = '';
    $(ui.expired).classList.add('hidden');
    renderPuzzleClock(name, 'El cronómetro comienza al iniciar.');
  }
  function pausePuzzleClock(name, statusText = 'Reloj pausado. El tiempo restante se conserva.') {
    const clock = puzzleClocks[name];
    if (!clock || clock.mode === 'untimed' || clock.expired || !clock.running) return;
    if (!syncPuzzleClock(name)) return;
    clock.running = false;
    if (clock.interval) clearInterval(clock.interval);
    clock.interval = 0;
    renderPuzzleClock(name, statusText);
  }
  function closePuzzleClock(name) {
    const clock = puzzleClocks[name];
    if (!clock) return;
    if (clock.running) pausePuzzleClock(name, 'Reloj detenido al salir a explorar.');
    if (clock.interval) clearInterval(clock.interval);
    clock.interval = 0; clock.running = false;
    if (activePuzzleClock === name) activePuzzleClock = '';
  }
  function revealPuzzleClue(name) {
    pausePuzzleClock(name, 'Reloj pausado para leer las fuentes.');
    const drawerId = name === 'trace' ? 'water-clue-drawer' : 'allocation-clue-drawer';
    $(drawerId).classList.remove('hidden');
  }
  function closePuzzleClue(name) {
    const drawerId = name === 'trace' ? 'water-clue-drawer' : 'allocation-clue-drawer';
    const expiredId = name === 'trace' ? 'water-expired' : 'allocation-expired';
    const playId = name === 'trace' ? 'water-play' : 'allocation-play';
    $(drawerId).classList.add('hidden');
    if (puzzleClocks[name].expired) $(expiredId).classList.remove('hidden');
    else $(playId).classList.remove('hidden');
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && activePuzzleClock && puzzleClocks[activePuzzleClock]?.running) {
      pausePuzzleClock(activePuzzleClock, 'Reloj pausado al cambiar de pestaña. Pulsa Continuar cuando vuelvas.');
    }
  });

  function renderWaterTraceBoard() {
    const root = $('water-trace-cards'); root.replaceChildren();
    waterTraceCards.forEach(card => {
      const article = document.createElement('article'); article.className = 'trace-card';
      const header = document.createElement('header'); const id = document.createElement('strong'); id.textContent = `Tarjeta ${card.id}`;
      const source = document.createElement('small'); source.textContent = card.source; header.append(id, source);
      const point = document.createElement('small'); point.textContent = card.point;
      const summary = document.createElement('p'); summary.textContent = card.text;
      const choices = document.createElement('div'); choices.className = 'trace-route-choices'; choices.setAttribute('role', 'group'); choices.setAttribute('aria-label', `Destino de tarjeta ${card.id}`);
      waterTraceRoutes.forEach(([route, label]) => {
        const button = document.createElement('button'); button.type = 'button';
        button.className = `trace-route-button ${route === 'land' ? 'land-choice' : 'sea-choice'}${state.waterTraceAssignments[card.id] === route ? ' selected' : ''}`;
        button.textContent = route === 'land' ? '💧 Hacia la faena' : '🌊 Hacia el mar';
        button.setAttribute('aria-label', `Tarjeta ${card.id}: ${label}`);
        button.setAttribute('aria-pressed', String(state.waterTraceAssignments[card.id] === route));
        button.addEventListener('click', () => {
          if (puzzleClocks.trace.expired) return;
          state.waterTraceAssignments[card.id] = route;
          $('water-feedback').textContent = `${card.source}: ${route === 'land' ? 'Hacia la faena' : 'Hacia el mar'}.`;
          renderWaterTraceBoard(); save();
          root.querySelector(`[data-trace-card="${card.id}"] .trace-route-button[aria-pressed="true"]`)?.focus();
        });
        choices.appendChild(button);
      });
      article.dataset.traceCard = card.id;
      article.append(header, point, summary, choices); root.appendChild(article);
    });
  }
  function renderAllocationNotes(targetId) {
    const root = $(targetId); root.replaceChildren();
    allocationNotes.forEach(note => {
      const article = document.createElement('article');
      const title = document.createElement('b'); title.textContent = `${note.title} · ${state.waterNotesFound.includes(note.id) ? 'encontrada' : 'pendiente'}`;
      const text = document.createElement('span'); text.textContent = note.text;
      const source = document.createElement('small'); source.textContent = note.source;
      article.append(title, text, source); root.appendChild(article);
    });
  }
  function renderTraceHint() {
    const level = state.waterTraceHintLevel;
    $('water-hint').textContent = level < 3 ? `Ver pista ${level + 1}` : 'Releer pista 3';
    $('water-hint-text').textContent = level > 0 ? waterTraceHints[level - 1] : 'Las pistas no consumen objetos ni progreso.';
  }
  function renderAllocationHint() {
    const level = state.allocationHintLevel;
    $('allocation-hint').textContent = level < 3 ? `Ver pista ${level + 1}` : 'Releer pista 3';
    $('allocation-hint-text').textContent = level > 0 ? allocationHints[level - 1] : 'Las pistas no consumen objetos ni progreso.';
  }
  function openWaterPuzzle() {
    if (state.waterPuzzleSolved) { flash('La ruta de los cuatro registros quedó documentada.'); return; }
    $('water-feedback').textContent = ''; $('water-ready').classList.remove('hidden'); $('water-play').classList.add('hidden'); $('water-expired').classList.add('hidden'); $('water-clue-drawer').classList.add('hidden');
    renderWaterTraceBoard(); renderTraceHint(); preparePuzzleClock('trace');
    $('water-puzzle').classList.remove('hidden'); enterPuzzleAudio();
  }
  $('water-start').addEventListener('click', () => { const mode = document.querySelector('input[name="water-clock"]:checked')?.value || 'timed'; $('water-ready').classList.add('hidden'); $('water-play').classList.remove('hidden'); startPuzzleClock('trace', mode); });
  $('water-pause').addEventListener('click', () => { const clock = puzzleClocks.trace; if (clock.running) pausePuzzleClock('trace'); else startPuzzleClock('trace', clock.mode, false); });
  $('water-clue-open').addEventListener('click', () => revealPuzzleClue('trace'));
  $('water-clue-close').addEventListener('click', () => closePuzzleClue('trace'));
  $('water-review-expired').addEventListener('click', () => { $('water-expired').classList.add('hidden'); revealPuzzleClue('trace'); });
  $('water-hint').addEventListener('click', () => { pausePuzzleClock('trace', 'Reloj pausado mientras lees la pista.'); const level = Math.min(3, state.waterTraceHintLevel + 1); state.waterTraceHintLevel = level; renderTraceHint(); save(); });
  $('water-close').addEventListener('click', () => closeWaterPuzzle());
  $('water-explore').addEventListener('click', () => closeWaterPuzzle());
  function resetWaterTraceBoard() {
    Object.keys(state.waterTraceAssignments).forEach(id => { state.waterTraceAssignments[id] = ''; });
    $('water-feedback').textContent = 'Tarjetas devueltas a la bandeja. No hay penalización.'; renderWaterTraceBoard(); save();
  }
  $('water-reset').addEventListener('click', resetWaterTraceBoard);
  $('water-retry').addEventListener('click', () => { resetWaterTraceBoard(); $('water-expired').classList.add('hidden'); $('water-ready').classList.add('hidden'); $('water-clue-drawer').classList.add('hidden'); $('water-play').classList.remove('hidden'); const mode = puzzleClocks.trace.mode; startPuzzleClock('trace', mode); });
  $('water-exit-expired').addEventListener('click', () => closeWaterPuzzle());
  $('water-check').addEventListener('click', () => {
    if (state.waterPuzzleSolved || !syncPuzzleClock('trace')) return;
    for (const card of waterTraceCards) {
      const answer = state.waterTraceAssignments[card.id];
      if (!answer) { $('water-feedback').textContent = `Elige una ruta para la tarjeta ${card.id}.`; return; }
      if (answer !== card.expected.route) { $('water-feedback').textContent = card.id === 'D' ? 'La campaña del emisario se revisa en el circuito que devuelve salmuera al mar.' : card.id === 'C' ? 'La vega está junto a la tubería terrestre; registra la observación con ese recorrido y conserva el seguimiento pendiente.' : 'H-17 y la unión húmeda pertenecen a la tubería que lleva agua a la faena.'; return; }
    }
    state.waterPuzzleSolved = true; state.values.rigor += 1;
    addEvidence('Trazabilidad de circuitos · H-17', 'Se asignaron H-17, la unión y la observación de la vega al recorrido terrestre; el emisario quedó separado en el recorrido marino. La causa sigue sin atribuir.', 'Tablero de trazabilidad · Estación Vega Norte');
    save(); renderHotspots(); updateHud(); $('water-feedback').textContent = '¡Correcto! Tres registros pertenecen a la ruta terrestre y el registro del emisario va hacia el mar. La observación de la vega aún requiere seguimiento.';
    closePuzzleClock('trace'); leavePuzzleAudio(true); setTimeout(() => { $('water-puzzle').classList.add('hidden'); $('water-expired').classList.add('hidden'); }, 850);
  });

  function openAllocationPuzzle() {
    if (state.allocationPuzzleSolved) { flash('El balance de la maqueta quedó registrado.'); return; }
    if (!state.waterPuzzleSolved) { flash('Primero completa el tablero de trazabilidad.'); return; }
    if (!state.waterNotesFound.includes('balance') || !state.waterNotesFound.includes('reserve')) { flash('Encuentra las notas de balance y de resguardo señaladas en la estación.'); return; }
    selectedWaterToken = -1; renderAllocationNotes('allocation-ready-notes'); renderAllocationNotes('allocation-notes'); renderAllocationNotes('allocation-clue-list'); renderAllocation(); renderAllocationHint(); $('allocation-feedback').textContent = '';
    $('allocation-ready').classList.remove('hidden'); $('allocation-play').classList.add('hidden'); $('allocation-expired').classList.add('hidden'); $('allocation-clue-drawer').classList.add('hidden');
    preparePuzzleClock('allocation');
    $('allocation-puzzle').classList.remove('hidden'); enterPuzzleAudio();
  }
  $('allocation-start').addEventListener('click', () => { const mode = document.querySelector('input[name="allocation-clock"]:checked')?.value || 'timed'; $('allocation-ready').classList.add('hidden'); $('allocation-play').classList.remove('hidden'); startPuzzleClock('allocation', mode); });
  $('allocation-pause').addEventListener('click', () => { const clock = puzzleClocks.allocation; if (clock.running) pausePuzzleClock('allocation'); else startPuzzleClock('allocation', clock.mode, false); });
  $('allocation-clue-open').addEventListener('click', () => revealPuzzleClue('allocation'));
  $('allocation-clue-close').addEventListener('click', () => closePuzzleClue('allocation'));
  $('allocation-review-expired').addEventListener('click', () => { $('allocation-expired').classList.add('hidden'); revealPuzzleClue('allocation'); });
  $('allocation-hint').addEventListener('click', () => { pausePuzzleClock('allocation', 'Reloj pausado mientras lees la pista.'); state.allocationHintLevel = Math.min(3, state.allocationHintLevel + 1); renderAllocationHint(); save(); });
  $('allocation-close').addEventListener('click', () => closeAllocationPuzzle());
  $('allocation-explore').addEventListener('click', () => closeAllocationPuzzle());
  $('allocation-return-token').addEventListener('click', () => {
    if (selectedWaterToken < 0 || puzzleClocks.allocation.expired) return;
    const returned = selectedWaterToken; state.waterAllocation[returned] = -1; selectedWaterToken = -1; $('allocation-feedback').textContent = `Ficha ${returned + 1} devuelta a la mesa.`; renderAllocation(returned); save();
  });
    $('allocation-reset').addEventListener('click', () => { state.waterAllocation = Array(8).fill(-1); selectedWaterToken = -1; renderAllocation(); $('allocation-feedback').textContent = 'Las ocho fichas volvieron a la mesa. No hay penalización.'; save(); });
  document.querySelectorAll('[data-water-bin]').forEach(button => button.addEventListener('click', () => {
    if (puzzleClocks.allocation.expired) return;
    if (selectedWaterToken < 0) { $('allocation-feedback').textContent = 'Selecciona primero una ficha numerada.'; return; }
    const token = selectedWaterToken; state.waterAllocation[token] = Number(button.dataset.waterBin); selectedWaterToken = -1; $('allocation-feedback').textContent = `Ficha ${token + 1} asignada a ${button.querySelector('span').textContent}.`; renderAllocation(token); save();
  }));
  $('allocation-retry').addEventListener('click', () => { state.waterAllocation = Array(8).fill(-1); selectedWaterToken = -1; renderAllocation(); $('allocation-expired').classList.add('hidden'); $('allocation-ready').classList.add('hidden'); $('allocation-clue-drawer').classList.add('hidden'); $('allocation-play').classList.remove('hidden'); $('allocation-feedback').textContent = ''; const mode = puzzleClocks.allocation.mode; startPuzzleClock('allocation', mode); save(); });
  $('allocation-exit-expired').addEventListener('click', () => closeAllocationPuzzle());
  $('allocation-check').addEventListener('click', () => {
    if (state.allocationPuzzleSolved || !syncPuzzleClock('allocation')) return;
    if (state.waterAllocation.some(item => item < 0)) { $('allocation-feedback').textContent = 'Asigna las ocho fichas antes de comprobar el balance.'; return; }
    const [plant, reserve, test] = [0, 1, 2].map(value => state.waterAllocation.filter(item => item === value).length);
    if (plant + reserve + test !== 8) { $('allocation-feedback').textContent = 'El total no suma ocho fichas; revisa que no haya ninguna fuera de las tres bandejas.'; return; }
    if (plant !== test * 2) { $('allocation-feedback').textContent = 'La nota de distribución indica que Planta debe recibir el doble de fichas que Prueba.'; return; }
    if (reserve !== test) { $('allocation-feedback').textContent = 'La nota de resguardo indica que Reserva y Prueba deben tener la misma cantidad.'; return; }
    state.allocationPuzzleSolved = true; state.values.rigor += 1;
    addEvidence('Balance de la maqueta · distribución', 'Planta 4, Reserva 2 y Prueba 2 fichas satisfacen las tres notas. Es un ejercicio abstracto, no un caudal ni una instrucción de operación.', 'Maqueta de reparto y notas encontradas');
    save(); renderHotspots(); updateHud(); $('allocation-feedback').textContent = 'Balance correcto: Planta 4, Reserva 2 y Prueba 2. Esta es una distribución didáctica, no una instrucción operativa.';
    closePuzzleClock('allocation'); leavePuzzleAudio(true); setTimeout(() => { $('allocation-puzzle').classList.add('hidden'); $('allocation-expired').classList.add('hidden'); }, 850);
  });
  function renderAllocation(focusIndex = -1) {
    const tokens = $('water-tokens'); tokens.replaceChildren();
    for (let i = 0; i < 8; i++) {
      const assignedTo = state.waterAllocation[i]; const button = document.createElement('button');
      button.type = 'button'; button.className = `water-token${assignedTo >= 0 ? ' assigned' : ''}${selectedWaterToken === i ? ' selected' : ''}`; button.dataset.tokenIndex = String(i); button.textContent = String(i + 1);
      const destinations = ['Planta', 'Reserva', 'Prueba'];
      button.setAttribute('aria-label', assignedTo >= 0 ? `Ficha ${i + 1}, asignada a ${destinations[assignedTo]}. Selecciona para cambiarla o devolverla.` : `Ficha ${i + 1}, sin asignar. Seleccionar ficha.`);
      button.setAttribute('aria-pressed', String(selectedWaterToken === i));
      button.addEventListener('click', () => { if (puzzleClocks.allocation.expired) return; selectedWaterToken = i; $('allocation-selection').textContent = assignedTo >= 0 ? `Ficha ${i + 1} está en ${destinations[assignedTo]}; elige otra bandeja o devuélvela.` : `Ficha ${i + 1} seleccionada; elige una bandeja.`; renderAllocation(i); });
      tokens.appendChild(button);
    }
    ['plant', 'reserve', 'test'].forEach((key, index) => { const count = state.waterAllocation.filter(value => value === index).length; $(`water-count-${key}`).textContent = `${count} / 8`; $(`water-bin-${key}`).classList.toggle('selected', selectedWaterToken >= 0); });
    $('allocation-return-token').disabled = selectedWaterToken < 0 || state.waterAllocation[selectedWaterToken] < 0 || puzzleClocks.allocation.expired;
    if (focusIndex >= 0) tokens.querySelector(`[data-token-index="${focusIndex}"]`)?.focus();
  }
  function closeWaterPuzzle() { closePuzzleClock('trace'); $('water-puzzle').classList.add('hidden'); $('water-expired').classList.add('hidden'); $('water-clue-drawer').classList.add('hidden'); leavePuzzleAudio(); }
  function closeAllocationPuzzle() { closePuzzleClock('allocation'); $('allocation-puzzle').classList.add('hidden'); $('allocation-expired').classList.add('hidden'); $('allocation-clue-drawer').classList.add('hidden'); leavePuzzleAudio(); }
  const timelineEvents = [
    { id: 'departure', label: 'Salida anotada', source: 'Planilla', icon: '📝' },
    { id: 'call', label: 'Llamada a Tomás', source: 'Testimonio', icon: '📞' },
    { id: 'lunch', label: 'Pausa de colación', source: 'Colación', icon: '🥪' },
    { id: 'radio', label: 'Aviso de radio', source: 'Radio', icon: '📻' },
    { id: 'bus', label: 'Regreso del bus', source: 'Despacho', icon: '🚌' }
  ];
  const timelineTimes = ['20:00', '20:30', '21:10', '21:50', '22:40'];
  let selectedTimelineEvent = '';
  const snackHint = 'Pista de colación: las dos primeras horas corresponden a la salida anotada y a la llamada. Tomás recibió la llamada media hora después de marcar la salida.';

  function renderTimeline(focusSlotIndex = null) {
    const tray = $('timeline-events');
    tray.replaceChildren();
    timelineEvents.forEach(event => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.timelineEvent = event.id;
      button.className = `timeline-event${selectedTimelineEvent === event.id ? ' selected' : ''}${state.timelineAssignments.includes(event.id) ? ' assigned' : ''}`;
      button.setAttribute('aria-pressed', String(selectedTimelineEvent === event.id));
      const icon = document.createElement('span'); icon.className = 'timeline-event-icon'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = event.icon;
      const title = document.createElement('strong'); title.textContent = event.label;
      const source = document.createElement('small'); source.textContent = event.source;
      const status = document.createElement('small'); status.className = 'timeline-event-status'; status.textContent = state.timelineAssignments.includes(event.id) ? 'En la línea' : 'Sin ubicar';
      button.append(icon, title, source, status);
      button.addEventListener('click', () => {
        selectedTimelineEvent = selectedTimelineEvent === event.id ? '' : event.id;
        $('timeline-selection').textContent = selectedTimelineEvent ? `${event.label} seleccionada. Elige una hora.` : 'Elige una tarjeta y asígnala a una hora.';
        renderTimeline();
      });
      tray.appendChild(button);
    });
    document.querySelectorAll('.timeline-slot').forEach(slot => {
      const index = Number(slot.dataset.slot);
      const event = timelineEvents.find(item => item.id === state.timelineAssignments[index]);
      const label = slot.querySelector('span');
      label.textContent = event ? `${event.icon} ${event.label}` : 'Coloca aquí un evento';
      slot.classList.toggle('filled', Boolean(event));
      slot.setAttribute('aria-label', `${timelineTimes[index]}, ${event ? event.label : 'espacio vacío'}. ${selectedTimelineEvent ? 'Activa para colocar la tarjeta seleccionada.' : 'Activa para retirar el evento.'}`);
      slot.onclick = () => {
        if (selectedTimelineEvent) placeTimelineEvent(index, selectedTimelineEvent);
        else if (state.timelineAssignments[index]) {
          const removed = timelineEvents.find(item => item.id === state.timelineAssignments[index]);
          state.timelineAssignments[index] = '';
          $('timeline-selection').textContent = `${removed.label} volvió a las tarjetas disponibles.`;
          $('puzzle-feedback').textContent = '';
          save(); renderTimeline(index);
        }
      };
    });
    if (focusSlotIndex !== null) document.querySelector(`.timeline-slot[data-slot="${focusSlotIndex}"]`)?.focus();
    else if (selectedTimelineEvent) tray.querySelector(`[data-timeline-event="${selectedTimelineEvent}"]`)?.focus();
  }

  function placeTimelineEvent(slotIndex, eventId) {
    const assignments = [...state.timelineAssignments];
    const previousIndex = assignments.indexOf(eventId);
    const displaced = assignments[slotIndex];
    if (previousIndex === slotIndex) {
      selectedTimelineEvent = '';
      $('timeline-selection').textContent = 'La tarjeta ya está en ese horario.';
      renderTimeline();
      return;
    }
    if (previousIndex >= 0) assignments[previousIndex] = displaced || '';
    assignments[slotIndex] = eventId;
    state.timelineAssignments = assignments;
    selectedTimelineEvent = '';
    $('timeline-selection').textContent = `${timelineEvents.find(item => item.id === eventId).label} ubicada a las ${timelineTimes[slotIndex]}.`;
    $('puzzle-feedback').textContent = '';
    save();
    renderTimeline(slotIndex);
  }

  function openPuzzle() {
    if (state.puzzleSolved && state.spillSecured) { openYardPuzzle(); return; }
    if (!state.jaimeChecked) { flash('Primero conversa con Don Jaime sobre el relevo.'); return; }
    if (state.puzzleSolved) { showDialog({ name: 'Maite', role: 'Registro del relevo', portrait: 'M', text: 'La secuencia quedó respaldada: salida anotada 20:00, llamada a Tomás 20:30, colación 21:10, aviso de radio 21:50 y regreso del bus 22:40.' }); return; }
    $('puzzle-feedback').textContent = '';
    $('puzzle').classList.remove('hidden');
    enterPuzzleAudio();
    $('hint-count').textContent = state.hintToken && !state.hintUsed ? '· disponible' : '· agotada';
    $('use-hint').disabled = !state.hintToken || state.hintUsed;
    $('puzzle-hint').textContent = state.hintUsed ? snackHint : '';
    selectedTimelineEvent = '';
    renderTimeline();
    $('timeline-events').querySelector('button')?.focus();
  }
  $('puzzle-close').addEventListener('click', () => { $('puzzle').classList.add('hidden'); leavePuzzleAudio(); });
  $('reset-puzzle').addEventListener('click', () => {
    state.timelineAssignments = Array(5).fill('');
    selectedTimelineEvent = '';
    $('timeline-selection').textContent = 'El registro quedó en blanco para volver a intentarlo.';
    $('puzzle-feedback').textContent = '';
    save(); renderTimeline(); $('timeline-events').querySelector('button')?.focus();
  });
  $('use-hint').addEventListener('click', () => {
    if (!state.hintToken || state.hintUsed) return;
    state.hintToken = false; state.hintUsed = true;
    $('hint-count').textContent = '· usada'; $('use-hint').disabled = true;
    $('puzzle-hint').textContent = snackHint;
    save(); flash('La ficha del completo te ayuda a relacionar dos registros.');
  });
  $('check-puzzle').addEventListener('click', () => {
    const answer = state.timelineAssignments;
    if (answer.some(item => !item)) { $('puzzle-feedback').textContent = 'Ubica los cinco eventos antes de comprobar el turno.'; return; }
    if (new Set(answer).size !== timelineEvents.length) { $('puzzle-feedback').textContent = 'Cada evento se usa una sola vez; revisa las tarjetas repetidas.'; return; }
    const positions = Object.fromEntries(answer.map((event, index) => [event, index]));
    if (positions.bus !== 4) { $('puzzle-feedback').textContent = 'Revisa el despacho: el regreso del bus está anotado a las 22:40.'; return; }
    if (positions.radio !== 3) { $('puzzle-feedback').textContent = 'El aviso radial ocurrió 50 minutos antes del regreso del bus.'; return; }
    if (positions.lunch !== 2) { $('puzzle-feedback').textContent = 'La planilla ubica la pausa de colación a las 21:10.'; return; }
    if (positions.departure !== 0 || positions.call !== 1) { $('puzzle-feedback').textContent = 'Revisa la declaración de Tomás: recibió la llamada media hora después de marcar la salida.'; return; }
    if (state.puzzleSolved) return;
    state.puzzleSolved = true; state.values.rigor += 1;
    addEvidence('Horas de relevo verificadas', 'Secuencia contrastada: salida 20:00, llamada a Tomás 20:30, colación 21:10, aviso radial 21:50 y regreso del bus 22:40.', 'planilla, testimonio y registros de despacho/radio');
    save(); updateHud(); $('puzzle-feedback').textContent = '¡Secuencia confirmada! Los registros coinciden; el aviso de Tomás queda acotado y resguardado.';
    leavePuzzleAudio(true);
    setTimeout(() => { $('puzzle').classList.add('hidden'); flash('Puzle resuelto. Vuelve con la Señora Nancy.'); }, 900);
  });

  const initialYardPieces = () => ({
    truck: { row: 2, col: 0, length: 2, axis: 'h', label: 'Camioneta' },
    boxes: { row: 1, col: 2, length: 2, axis: 'v', label: 'Cajas' },
    load: { row: 2, col: 3, length: 2, axis: 'v', label: 'Carro de carga' },
    fence: { row: 1, col: 4, length: 2, axis: 'v', label: 'Vallas' },
    toolCart: { row: 0, col: 1, length: 2, axis: 'h', label: 'Carro de herramientas' },
    pallet: { row: 4, col: 2, length: 2, axis: 'h', label: 'Pallet' }
  });
  const yardFixedCells = [{ row: 0, col: 3, label: 'Gabinete fijo' }];
  const yardRestrictedCells = [{ row: 4, col: 4, label: 'Zona aislada' }];
  let selectedYardPiece = '';
  let yardAnimatingExit = false;
  function openYardPuzzle() {
    if (state.yardPuzzleSolved) { showDialog({ name: 'Maite', role: 'Acceso del patio', portrait: 'M', text: 'El carril ya está despejado. La camioneta puede salir sin cruzar el sector aislado.' }); return; }
    state.yardPieces ||= initialYardPieces();
    selectedYardPiece = '';
    $('yard-feedback').textContent = '';
    $('yard-finish').classList.toggle('hidden', !state.yardWon);
    $('yard-move-count').textContent = `Movimientos: ${state.yardMoves || 0}`;
    renderYardPuzzle();
    $('yard-puzzle').classList.remove('hidden');
    enterPuzzleAudio();
  }
  function renderYardPuzzle() {
    const grid = $('yard-grid'); grid.replaceChildren();
    for (let i = 0; i < 25; i++) {
      const row = Math.floor(i / 5), col = i % 5;
      const cell = document.createElement('div');
      cell.className = `yard-cell${row === 2 ? ' safe-lane' : ''}`;
      cell.setAttribute('role','gridcell');
      const fixed = yardFixedCells.find(item => item.row === row && item.col === col);
      const restricted = yardRestrictedCells.find(item => item.row === row && item.col === col);
      if (fixed) { cell.classList.add('fixed-cell'); cell.textContent = '🗄'; cell.setAttribute('aria-label', fixed.label); }
      else if (restricted) { cell.classList.add('restricted-cell'); cell.textContent = '⚠'; cell.setAttribute('aria-label', `${restricted.label}, no ingresar`); }
      else cell.setAttribute('aria-label', `Casilla ${row + 1}, ${col + 1}`);
      grid.appendChild(cell);
    }
    const exit = document.createElement('div'); exit.className = 'yard-exit'; exit.setAttribute('aria-hidden','true'); exit.textContent = '➜'; grid.appendChild(exit);
    Object.entries(state.yardPieces).forEach(([id, piece]) => {
      if (id === 'truck' && state.yardWon && !yardAnimatingExit) return;
      const button = document.createElement('button'); button.type = 'button';
      button.className = `yard-piece ${piece.axis === 'v' ? 'vertical' : ''} ${id === 'truck' ? 'truck' : ''} ${id === 'fence' ? 'fence-piece' : ''} ${id === 'pallet' ? 'pallet-piece' : ''} ${id === 'toolCart' ? 'toolcart-piece' : ''} ${id === selectedYardPiece ? 'selected' : ''}`;
      button.dataset.yardPiece = id;
      button.style.left = `${piece.col * 20}%`; button.style.top = `${piece.row * 20}%`;
      button.style.width = `${(piece.axis === 'h' ? piece.length : 1) * 20}%`; button.style.height = `${(piece.axis === 'v' ? piece.length : 1) * 20}%`;
      const icon = document.createElement('span'); icon.className = 'yard-piece-icon'; icon.setAttribute('aria-hidden','true');
      icon.textContent = ({ truck: '🚚', boxes: '📦', load: '🛒', fence: '🚧', toolCart: '🧰', pallet: '🪵' })[id] || '▰';
      const label = document.createElement('span'); label.className = 'yard-piece-label'; label.textContent = piece.label;
      button.append(icon, label); button.setAttribute('aria-label', `${piece.label}, ${piece.axis === 'h' ? 'se mueve horizontalmente' : 'se mueve verticalmente'}; seleccionar`);
      button.setAttribute('aria-pressed', String(id === selectedYardPiece));
      button.addEventListener('click', () => {
        selectedYardPiece = id;
        $('yard-selection').textContent = `${piece.label} seleccionada · usa las flechas para moverla ${piece.axis === 'h' ? 'a los lados' : 'arriba o abajo'}.`;
        renderYardPuzzle();
        grid.querySelector(`[data-yard-piece="${id}"]`)?.focus();
      });
      grid.appendChild(button);
    });
    if (!selectedYardPiece) $('yard-selection').textContent = 'Selecciona una pieza; luego usa las flechas.';
    else grid.querySelector(`[data-yard-piece="${selectedYardPiece}"]`)?.focus();
  }
  function yardCellBlock(row, col, movingId) {
    const fixed = yardFixedCells.find(cell => cell.row === row && cell.col === col);
    if (fixed) return fixed.label;
    const restricted = yardRestrictedCells.find(cell => cell.row === row && cell.col === col);
    if (restricted) return 'zona aislada';
    for (const [id, other] of Object.entries(state.yardPieces)) {
      if (id === movingId) continue;
      const r0 = other.row, c0 = other.col;
      const r1 = r0 + (other.axis === 'v' ? other.length : 1);
      const c1 = c0 + (other.axis === 'h' ? other.length : 1);
      if (row >= r0 && row < r1 && col >= c0 && col < c1) return other.label;
    }
    return '';
  }
  function animateYardMove(id, fromRect) {
    if (!fromRect) return;
    const button = $('yard-grid').querySelector(`[data-yard-piece="${id}"]`);
    if (!button || typeof button.animate !== 'function') return;
    const toRect = button.getBoundingClientRect();
    button.animate([
      { transform: `translate(${fromRect.left - toRect.left}px, ${fromRect.top - toRect.top}px)` },
      { transform: 'translate(0, 0)' }
    ], { duration: 170, easing: 'ease-out' });
  }
  function moveYardPiece(direction) {
    const piece = state.yardPieces?.[selectedYardPiece];
    if (!piece) { $('yard-feedback').textContent = 'Selecciona primero una pieza.'; return; }
    const horizontal = direction === 'left' || direction === 'right';
    if (horizontal !== (piece.axis === 'h')) { $('yard-feedback').textContent = `${piece.label} solo puede moverse ${piece.axis === 'h' ? 'a los lados' : 'hacia arriba o abajo'}.`; return; }
    const delta = direction === 'left' || direction === 'up' ? -1 : 1;
    const nextRow = piece.row + (piece.axis === 'v' ? delta : 0);
    const nextCol = piece.col + (piece.axis === 'h' ? delta : 0);
    if (selectedYardPiece === 'truck' && direction === 'right' && nextCol + piece.length > 5) {
      for (let col = piece.col + piece.length - 1; col < 5; col++) {
        const blocker = yardCellBlock(piece.row, col, selectedYardPiece);
        if (blocker) { $('yard-feedback').textContent = `La salida sigue bloqueada por ${blocker}.`; return; }
      }
      const oldButton = $('yard-grid').querySelector(`[data-yard-piece="${selectedYardPiece}"]`);
      const oldRect = oldButton?.getBoundingClientRect();
      piece.col = 4; state.yardWon = true; state.yardMoves = (state.yardMoves || 0) + 1; yardAnimatingExit = true;
      $('yard-feedback').textContent = '¡La camioneta salió por el carril despejado!';
      $('yard-move-count').textContent = `Movimientos: ${state.yardMoves}`;
      $('yard-finish').classList.remove('hidden'); save(); renderYardPuzzle();
      const exitingTruck = $('yard-grid').querySelector('[data-yard-piece="truck"]');
      if (exitingTruck && typeof exitingTruck.animate === 'function') {
        const toRect = exitingTruck.getBoundingClientRect();
        const animation = exitingTruck.animate([{ transform: `translate(${oldRect.left - toRect.left}px, ${oldRect.top - toRect.top}px)` }, { transform: 'translate(115%, 0)' }], { duration: 420, easing: 'ease-in' });
        animation.onfinish = () => { yardAnimatingExit = false; renderYardPuzzle(); };
      } else { yardAnimatingExit = false; renderYardPuzzle(); }
      return;
    }
    const endRow = nextRow + (piece.axis === 'v' ? piece.length : 1);
    const endCol = nextCol + (piece.axis === 'h' ? piece.length : 1);
    if (nextRow < 0 || nextCol < 0 || endRow > 5 || endCol > 5) { $('yard-feedback').textContent = 'Esa pieza no cabe en esa dirección.'; return; }
    for (let row = nextRow; row < endRow; row++) for (let col = nextCol; col < endCol; col++) {
      const blocker = yardCellBlock(row, col, selectedYardPiece);
      if (blocker) {
        $('yard-feedback').textContent = blocker === 'zona aislada' ? 'Ese tramo está aislado; ninguna pieza debe entrar en la zona roja.' : `Movimiento bloqueado por ${blocker}.`;
        return;
      }
    }
    const oldButton = $('yard-grid').querySelector(`[data-yard-piece="${selectedYardPiece}"]`);
    const oldRect = oldButton?.getBoundingClientRect();
    piece.row = nextRow; piece.col = nextCol; state.yardMoves = (state.yardMoves || 0) + 1;
    $('yard-feedback').textContent = `${piece.label} se movió una casilla.`;
    $('yard-move-count').textContent = `Movimientos: ${state.yardMoves}`;
    save(); renderYardPuzzle(); animateYardMove(selectedYardPiece, oldRect);
  }
  document.querySelectorAll('.yard-arrows button').forEach(button => button.addEventListener('click', () => moveYardPiece(button.dataset.move)));
  $('yard-close').addEventListener('click', () => { $('yard-puzzle').classList.add('hidden'); leavePuzzleAudio(); });
  $('yard-reset').addEventListener('click', () => { state.yardPieces = initialYardPieces(); state.yardPuzzleSolved = false; state.yardWon = false; state.yardMoves = 0; selectedYardPiece = ''; $('yard-finish').classList.add('hidden'); $('yard-feedback').textContent = 'Tablero reiniciado.'; $('yard-move-count').textContent = 'Movimientos: 0'; save(); renderYardPuzzle(); });
  $('yard-finish').addEventListener('click', () => {
    $('yard-puzzle').classList.add('hidden');
    if (!state.yardPuzzleSolved) {
      state.yardPuzzleSolved = true; state.yardWon = false;
      addEvidence('Acceso seguro del patio', 'Camioneta trasladada por el carril despejado sin ingresar a la zona aislada de la mancha.', 'maite');
      state.values.leadership += 1; state.values.rigor += 1;
    }
    save(); updateHud(); flash('Ruta segura documentada. Regresa con la Señora Nancy.'); leavePuzzleAudio(true);
  });

  function discoverSecret() {
    state.secretFound = true; state.clues.push('Placa marcada con 23'); save(); renderHotspots();
    showDialog({ name: 'Maite', role: 'Diario de terreno', portrait: 'M', text: 'Hay una pequeña placa con el número 23 detrás del escritorio. No parece parte del registro; la anoto como curiosidad, sin usarla como evidencia.' });
  }
  function addEvidence(name, note, source) {
    if (!state.evidence.some(item => item.name === name)) state.evidence.push({ name, note, source });
  }
  function showPanel(type) {
    if (activePanel === type) { closePanel(); return; }
    activePanel = type;
    const titles = { bag: 'Mochila', evidence: 'Carpeta de Evidencias', journal: 'Diario de Misiones', stats: 'Atributos de Maite', menu: 'Menú de pausa', credits: 'Créditos y recursos' };
    $('panel-title').textContent = titles[type];
    const content = $('panel-content'); content.replaceChildren();
    const add = (title, text, small = '') => { const entry = document.createElement('div'); entry.className = 'panel-entry'; entry.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span>${small ? `<br><small>${escapeHtml(small)}</small>` : ''}`; content.appendChild(entry); };
    if (type === 'bag') {
      if (!state.inventory.length) add('La mochila está vacía', 'Explora el campamento para encontrar objetos útiles.');
      state.inventory.forEach(item => add(item, 'Consumido', state.hintUsed ? 'La ficha de pista se usó en el relevo.' : 'La ficha de pista puede ayudar con un puzle.'));
      if (state.hintToken && !state.hintUsed) add('Ficha de pista', 'Disponible para un único puzle.');
    } else if (type === 'evidence') {
      if (!state.evidence.length) add('Sin evidencias todavía', 'Habla con el equipo y revisa registros.');
      state.evidence.forEach(item => typeof item === 'string' ? add(item, 'Registro de lógica completado.') : add(item.name, item.note, `Origen: ${item.source}`));
    } else if (type === 'journal') {
      add('Objetivo actual', objectiveText(), `Capítulo 1 · Paso ${stepNumber()}`);
      add('Acuerdo de turno', state.supportChosen ? 'Se pidió pausa y relevo seguro.' : state.jaimeChecked ? 'Se escuchó el aviso; falta cerrar el acuerdo.' : 'Pendiente de conversar con Don Jaime.');
      add('Extras descubiertos', `${state.snackTaken ? 'Completo · ' : ''}${state.bulletinSeen ? 'Noticiero · ' : ''}${state.secretFound ? '23 · ' : ''}`.replace(/ · $/, '') || 'Aún puedes encontrarlos.');
      state.clues.forEach(clue => add('Curiosidad', clue));
    } else if (type === 'stats') {
      add('Liderazgo', `${state.values.leadership}`, 'Se expresa al pedir una acción segura.');
      add('Conciencia socioambiental', `${state.values.care}`, 'Escuchar también es parte del cuidado.');
      add('Rigor legal', `${state.values.rigor}`, 'Las horas y fuentes deben quedar verificables.');
      add('Respaldo profesional', `${state.values.support}`, 'Acuerdos documentados con el equipo.');
    } else if (type === 'menu') {
      add('Progreso guardado', 'La partida se guarda automáticamente en este navegador.');
      const reset = document.createElement('button'); reset.className = 'button button-quiet'; reset.textContent = 'Volver al título'; reset.addEventListener('click', () => { closePanel(); $('play-screen').classList.add('hidden'); $('title-screen').classList.remove('hidden'); syncTitleButtons(); }); content.appendChild(reset);
    } else {
      add('Desarrollo', 'Maite: Rumbo al Salar · prototipo de hackatón');
      add('Música original', 'Temas de los capítulos 1 y 2, música de puzle y transición 1→2. Se activa con el botón ♫.');
      add('Logo Codex', 'PNG recibido en la carpeta del proyecto y copiado sin cambios.');
      add('Assets generados', 'Ilustraciones de borrador creadas para este proyecto; revisión final pendiente.');
      add('Serie inspiradora', 'Guiño original al formato de noticiero de títeres chileno; no se usan personajes, textos, música ni logotipos de 31 Minutos.');
      const back = document.createElement('button'); back.className = 'button button-quiet'; back.textContent = 'Volver al título'; back.addEventListener('click', () => { closePanel(); $('play-screen').classList.add('hidden'); $('title-screen').classList.remove('hidden'); }); content.appendChild(back);
    }
    $('panel').classList.remove('hidden');
  }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function closePanel() { activePanel = ''; $('panel').classList.add('hidden'); }
  $('panel-close').addEventListener('click', closePanel);
  document.querySelectorAll('.hud-button[data-panel]').forEach(button => button.addEventListener('click', () => showPanel(button.dataset.panel)));
  $('menu-button').addEventListener('click', () => showPanel('menu'));
  $('credits-button').addEventListener('click', () => { $('title-screen').classList.add('hidden'); $('play-screen').classList.remove('hidden'); showPanel('credits'); });

  function startGame(fresh = false) {
    if (fresh) state = defaultState();
    $('title-screen').classList.add('hidden'); $('play-screen').classList.remove('hidden');
    updateHud(); ensurePlayerWalkable(); updateHud(); save(); syncMusic();
    if (!state.nancyBriefed && !state.stepDone) {
      interactNancy();
    }
    if (!loopStarted) { loopStarted = true; requestAnimationFrame(loop); }
  }
  function syncTitleButtons() {
    const hasSave = Boolean(localStorage.getItem(SAVE_KEY));
    $('play-button').textContent = hasSave ? 'Continuar' : 'Jugar';
    $('new-game-button').classList.toggle('hidden', !hasSave);
  }
  $('play-button').addEventListener('click', () => startGame(false));
  $('new-game-button').addEventListener('click', () => $('confirm-new').classList.remove('hidden'));
  $('cancel-new').addEventListener('click', () => $('confirm-new').classList.add('hidden'));
  $('confirm-new-button').addEventListener('click', () => { $('confirm-new').classList.add('hidden'); startGame(true); });
  $('ending-return').addEventListener('click', () => { if (state.chapter === 1 && state.stepDone) enterWaterChapter(); else { $('ending').classList.add('hidden'); changeScene('station'); } });
  syncTitleButtons(); updateHud();

  async function toggleSound() {
    state.soundOn = !state.soundOn;
    if (state.soundOn) syncMusic();
    else {
      Object.values(musicTracks).forEach(track => fadeTrack(track, 0, 250));
      audioCues.forEach(cue => { cue.pause(); cue.currentTime = 0; }); audioCues.clear(); activeMusic = null;
    }
    save(); updateHud();
  }
  $('sound-button').addEventListener('click', toggleSound);

  function targetNearest() {
    const list = scenes[state.location];
    let best = null, distance = 12;
    list.forEach(spot => {
      if (!spot.visible()) return;
      const d = Math.hypot(spot.x - state.x, spot.y - state.y);
      if (d < distance) { best = spot; distance = d; }
    });
    if (best) interact(best.id); else flash('No hay nada cerca para interactuar.');
  }
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const typing = ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
    if (typing) return;
    if (dialogOpen) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); closeDialog(); } if (/^[1-9]$/.test(key)) $('dialogue-choices').children[Number(key) - 1]?.click(); return; }
    const puzzleOpen = !$('puzzle').classList.contains('hidden') || !$('yard-puzzle').classList.contains('hidden') || !$('water-puzzle').classList.contains('hidden') || !$('allocation-puzzle').classList.contains('hidden');
    if (puzzleOpen) {
      if (!$('yard-puzzle').classList.contains('hidden') && ['arrowup','arrowdown','arrowleft','arrowright'].includes(key)) { event.preventDefault(); moveYardPiece(key.slice(5)); return; }
      if (event.key === 'Escape') {
        $('puzzle').classList.add('hidden'); $('yard-puzzle').classList.add('hidden');
        if (!$('water-puzzle').classList.contains('hidden')) closeWaterPuzzle();
        if (!$('allocation-puzzle').classList.contains('hidden')) closeAllocationPuzzle();
        if ($('water-puzzle').classList.contains('hidden') && $('allocation-puzzle').classList.contains('hidden')) leavePuzzleAudio();
      }
      return;
    }
    if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)) { delete state._target; delete state._path; delete state._pathIndex; heldKeys.add(key.startsWith('arrow') ? event.key : key); event.preventDefault(); }
    if (event.key === 'Escape') { if (!$('yard-puzzle').classList.contains('hidden')) $('yard-puzzle').classList.add('hidden'); else if (!$('water-puzzle').classList.contains('hidden')) $('water-puzzle').classList.add('hidden'); else if (!$('allocation-puzzle').classList.contains('hidden')) $('allocation-puzzle').classList.add('hidden'); else if (!$('puzzle').classList.contains('hidden')) $('puzzle').classList.add('hidden'); else if (!$('bulletin').classList.contains('hidden')) closeBulletin(); else if (activePanel) closePanel(); else showPanel('menu'); if (puzzleOpen) leavePuzzleAudio(); return; }
    if (key === 'b') { toggleNavigationDebug(); return; }
    if (key === 'e') targetNearest();
    if (key === 'm') showPanel('bag');
    if (key === 'c') showPanel('evidence');
    if (key === 'j') showPanel('journal');
    if (key === 'k') showPanel('stats');
    if (key === 'v') toggleSound();
  });
  window.addEventListener('keyup', event => { heldKeys.delete(event.key); heldKeys.delete(event.key.toLowerCase()); });
  $('scene').addEventListener('pointerdown', (event) => {
    if (event.target.closest('button,.dialogue,.panel,.modal,.hud-top')) return;
    const rect = $('scene').getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 100, y = (event.clientY - rect.top) / rect.height * 100;
    requestWalk(x, y);
  });
  window.addEventListener('resize', renderNavigationOverlay);
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
})();
