// dashboardadmin.js
const user = JSON.parse(localStorage.getItem('ge_user') || '{}');
const username = user.username || 'Admin';
const email = user.email || 'admin@stackly.org';
const initials = username.charAt(0).toUpperCase();

document.getElementById('userName').textContent = username;
document.getElementById('userEmail').textContent = email;
document.getElementById('greetName').textContent = `Hello, ${username}!`;
document.getElementById('greetEmail').textContent = `${email} · Administrator`;
document.getElementById('userAvatar').textContent = initials;

const mStudies = document.getElementById('mStudies');
function updateStudies() { mStudies.textContent = Math.floor(20 + Math.random() * 10); }
updateStudies();
setInterval(updateStudies, 4000);

const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('pageTitle');
const titles = {
  overview:'Overview', metrics:'Metrics', sites:'Lab Manager', alerts:'Reviews',
  users:'Researchers', devices:'Instruments', reports:'Reports', billing:'Funding',
  logs:'System Logs', settings:'Settings'
};
navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const target = item.dataset.page;
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    pages.forEach(p => p.classList.remove('active'));
    const pg = document.getElementById('page-' + target);
    if (pg) pg.classList.add('active');
    pageTitle.textContent = titles[target] || target;
    if (window.innerWidth <= 768) closeSidebar();
    if (target === 'metrics') drawBigChart();
    if (target === 'logs') renderLogs();
  });
});

const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');
const overlay = document.getElementById('overlay');
const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  if(hamburger){
    hamburger.classList.add('open');
    const icon = hamburger.querySelector('i');
    if(icon) icon.className = 'ph ph-x';
  }
}
function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  if(hamburger){
    hamburger.classList.remove('open');
    const icon = hamburger.querySelector('i');
    if(icon) icon.className = 'ph ph-list';
  }
}
hamburger?.addEventListener('click', () => sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
overlay?.addEventListener('click', closeSidebar);
sidebarCloseBtn?.addEventListener('click', closeSidebar);
window.addEventListener('resize', () => { if(window.innerWidth > 768 && sidebar.classList.contains('open')) closeSidebar(); });

// Chart Data (Publications by Domain)
const barData = [55,70,60,80,95,85,78,88,72,68,90,82,74,86,92,79,83,77,88,96,84,76,90,88];
const chartArea = document.getElementById('chartArea');
if(chartArea){
  const maxVal = Math.max(...barData);
  barData.forEach(v => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = (v / maxVal * 100) + '%';
    bar.title = v + ' Publications';
    chartArea.appendChild(bar);
  });
}

// Lab Status Data
const siteData = [
  { name:'Genomics Lab', pct:92 },
  { name:'AI Research', pct:76 },
  { name:'Space Array', pct:84 },
  { name:'Energy Lab', pct:98 },
  { name:'Biotech Hub', pct:88 }
];
const siteRows = document.getElementById('siteRows');
if(siteRows){
  siteData.forEach(s => {
    const row = document.createElement('div');
    row.className = 'site-row';
    row.innerHTML = `<span class="site-row-name">${s.name}</span><div class="site-row-bar-wrap"><div class="site-row-bar" style="width:${s.pct}%"></div></div><span class="site-row-pct">${s.pct}%</span>`;
    siteRows.appendChild(row);
  });
}

function drawBigChart(){
  const canvas = document.getElementById('bigChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 700;
  canvas.height = canvas.offsetHeight || 260;
  const W = canvas.width, H = canvas.height;
  const vals = Array.from({length:24}, (_,h) => (h < 6 || h > 20) ? 2 + Math.random() * 3 : 8 + Math.random() * 6);
  const maxV = Math.max(...vals);
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  [0.25,0.5,0.75,1].forEach(f => { const y = H - f * (H - 30) - 30; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); });
  const grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0, 'rgba(15,107,107,0.25)');
  grad.addColorStop(1, 'rgba(15,107,107,0.02)');
  ctx.beginPath();
  vals.forEach((v,i) => { const x = (i / 23) * W; const y = H - (v / maxV) * (H - 40) - 20; i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y); });
  ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = '#0f6b6b'; ctx.lineWidth = 2.5;
  vals.forEach((v,i) => { const x = (i / 23) * W; const y = H - (v / maxV) * (H - 40) - 20; i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y); });
  ctx.stroke();
}

const logMessages = [
  { level:'ok', msg:'Genomics Lab: CRISPR trial data submitted for review' },
  { level:'info', msg:'User elena@stackly.org signed in from 103.x.x.x' },
  { level:'warn', msg:'Space Array: Calibration required on D1 bench' },
  { level:'ok', msg:'Daily backup completed — 240 MB archived' },
  { level:'info', msg:'API call: GET /v1/labs/all — 200 OK' },
  { level:'ok', msg:'MIT AI Lab: Model training completed' },
  { level:'warn', msg:'Biotech Hub: Reagent levels low' }
];
function renderLogs(){
  const terminal = document.getElementById('logTerminal');
  if(!terminal) return;
  terminal.innerHTML = '';
  const now = new Date();
  logMessages.forEach((l,i) => {
    const t = new Date(now - i * 320000);
    const ts = `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}:${t.getSeconds().toString().padStart(2,'0')}`;
    const line = document.createElement('div'); line.className = 'log-line';
    line.innerHTML = `<span class="log-time">${ts}</span><span class="log-level-${l.level}">[${l.level.toUpperCase()}]</span><span class="log-msg">${l.msg}</span>`;
    terminal.appendChild(line);
  });
  terminal.scrollTop = terminal.scrollHeight;
}