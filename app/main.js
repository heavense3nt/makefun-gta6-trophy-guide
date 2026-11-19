// Leonida Trophy Guide — boot, render and tracker wiring.
// Loads app/data/trophies.json and app/data/roadmap.json, draws the roadmap
// and the trophy cards, and keeps the earned checklist in localStorage.
import { loadEarned, saveEarned, downloadProgress, parseProgressFile } from './store.js';

const grid = document.getElementById('cardGrid');
const shownLine = document.getElementById('shownCount');
const emptyNote = document.getElementById('emptyNote');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const gradeCounts = document.getElementById('gradeCounts');
const searchBox = document.getElementById('searchBox');
const kindBar = document.getElementById('kindBar');
const gradePick = document.getElementById('gradePick');
const spoilerSwitch = document.getElementById('spoilerSwitch');

const params = new URLSearchParams(location.search);
let earned = loadEarned();
let allTrophies = [];
let activeKind = params.get('kind') ?? 'all';
let activeGrade = params.get('grade') ?? 'all';
let spoilersHidden = params.get('spoiler') === 'on';
let openId = Number(params.get('open') ?? '0') || 0;

const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };
const SOURCE_LINKS = { 'GTA Zone — GTA 6 Trophy List': 'https://gta-zone.com/news/gta-6-trophies-achievements/' };

function gradeLabel(grade) {
  return grade[0].toUpperCase() + grade.slice(1);
}

function sourceLine(sources) {
  return sources.map((name) => {
    const href = SOURCE_LINKS[name];
    return href ? `<a href="${href}" target="_blank" rel="noopener">${name}</a>` : name;
  }).join(' · ');
}

function trophyVisible(trophy) {
  if (activeKind === 'online') return false;
  if (activeKind !== 'all' && trophy.kind !== activeKind) return false;
  if (activeGrade !== 'all' && trophy.grade !== activeGrade) return false;
  const needle = searchBox.value.trim().toLowerCase();
  if (needle) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  return true;
}

function renderRoadmap(plan) {
  document.getElementById('roadmapTitle').textContent = plan.title;
  document.getElementById('roadmapMeta').textContent =
    `Difficulty ${plan.difficulty} · ${plan.estimate_hours} hours · ${plan.playthroughs} · Online trophies: ${plan.online}`;
  document.getElementById('roadmapList').replaceChildren(...plan.stages.map((stage) => {
    const item = document.createElement('li');
    const head = document.createElement('strong');
    head.textContent = stage.title;
    const hours = document.createElement('span');
    hours.className = 'hours';
    hours.textContent = stage.hours;
    const body = document.createElement('span');
    body.textContent = stage.summary;
    item.append(head, hours, body);
    return item;
  }));
  document.getElementById('roadmapNote').textContent = plan.missable_note;
}

function renderCards() {
  const shown = allTrophies.filter(trophyVisible);
  grid.replaceChildren(...shown.map((trophy) => {
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(trophy.name) ? ' earned' : '');
    card.dataset.trophy = String(trophy.id);

    const top = document.createElement('div');
    top.className = 'topline';
    const badge = document.createElement('span');
    badge.className = `badge ${trophy.grade}`;
    badge.textContent = gradeLabel(trophy.grade);
    top.append(badge);
    if (trophy.missable) {
      const flag = document.createElement('span');
      flag.className = 'tag missable';
      flag.textContent = 'Missable';
      top.append(flag);
    }
    if (trophy.hidden) {
      const flag = document.createElement('span');
      flag.className = 'tag hidden';
      flag.textContent = 'Hidden on PS5';
      top.append(flag);
    }
    // The Missable flag above already says it; a kind tag would repeat it.
    if (!trophy.missable) {
      const kind = document.createElement('span');
      kind.className = 'tag';
      kind.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
      top.append(kind);
    }

    const name = document.createElement('h3');
    const official = document.createElement('p');
    official.className = 'official';
    if (spoilersHidden && trophy.hidden && !earned.has(trophy.name)) {
      name.textContent = 'Hidden trophy — earn it to reveal';
      official.textContent = 'Hidden on PlayStation until earned.';
    } else {
      name.textContent = trophy.name;
      official.textContent = `“${trophy.description}”`;
    }

    const details = document.createElement('details');
    if (trophy.id === openId) details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = 'How to earn it';
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = trophy.guide;
    const src = document.createElement('p');
    src.className = 'src';
    src.innerHTML = `Sources: ${sourceLine(trophy.sources)}`;
    details.append(summary, guide, src);

    const check = document.createElement('label');
    check.className = 'check';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveEarned(earned);
      renderAll();
    });
    check.append(box, document.createTextNode(box.checked ? 'Earned' : 'Mark as earned'));

    card.append(top, name, official);
    if (typeof trophy.count === 'number') {
      const count = document.createElement('p');
      count.className = 'count';
      count.textContent = `Target: ${trophy.count.toLocaleString('en-US')}`;
      card.append(count);
    }
    card.append(details, check);
    return card;
  }));

  const total = allTrophies.length;
  const done = earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${done} of ${total} earned · ${pct}%`;
  const byGrade = {};
  for (const trophy of allTrophies) byGrade[trophy.grade] = (byGrade[trophy.grade] ?? 0) + 1;
  const earnedByGrade = {};
  for (const trophy of allTrophies) {
    if (earned.has(trophy.name)) earnedByGrade[trophy.grade] = (earnedByGrade[trophy.grade] ?? 0) + 1;
  }
  gradeCounts.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${earnedByGrade[g] ?? 0}/${byGrade[g] ?? 0} ${g}`)
    .join(' · ');
  shownLine.textContent = `Showing ${shown.length} of ${total} trophies`;
  emptyNote.hidden = shown.length > 0;
}

function renderAll() {
  renderCards();
}

function syncControls() {
  searchBox.value = params.get('search') ?? '';
  gradePick.value = activeGrade;
  spoilerSwitch.checked = spoilersHidden;
  for (const button of kindBar.querySelectorAll('button')) {
    button.classList.toggle('on', button.dataset.kind === activeKind);
  }
}

kindBar.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-kind]');
  if (!button) return;
  activeKind = button.dataset.kind;
  syncControls();
  renderAll();
});
gradePick.addEventListener('change', () => {
  activeGrade = gradePick.value;
  renderAll();
});
searchBox.addEventListener('input', renderAll);
spoilerSwitch.addEventListener('change', () => {
  spoilersHidden = spoilerSwitch.checked;
  renderAll();
});
document.getElementById('exportBtn').addEventListener('click', () => downloadProgress(earned));
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    earned = await parseProgressFile(file);
    saveEarned(earned);
    renderAll();
  } catch {
    alert('That file is not a trophy-progress export.');
  }
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveEarned(earned);
  renderAll();
});

const [trophyDoc, plan] = await Promise.all([
  (await fetch('data/trophies.json')).json(),
  (await fetch('data/roadmap.json')).json(),
]);
allTrophies = trophyDoc.trophies;
renderRoadmap(plan);
syncControls();
renderAll();
