import { INSTRUMENTS, LEVELS } from '../config.js';
import { getLessons } from '../lessons/index.js';
import { setVolume } from '../audio/engine.js';
import { resetStore, saveStore } from '../progress/store.js';
import { isDesktopInput } from '../input/device.js';
import { el } from './components.js';

export function renderSettings(app) {
  const v = el('div', 'view'); const s = app.data.settings;
  const desktop = isDesktopInput();
  v.innerHTML = `<div class="wrap narrow"><button class="backlink" data-back>← ተመለስ · Back</button><div class="page-head"><p>ማስተካከያ</p><h1>Settings</h1></div>
  <section class="form-card"><label>የቋንቋ ቅድሚያ · Language emphasis<select data-lang><option value="am">አማርኛ ቅድሚያ · Amharic first</option><option value="en">English first · እንግሊዝኛ</option></select></label>
  <label>ድምፅ · Sound volume <output data-volout>${Math.round(s.volume*100)}%</output><input data-volume type="range" min="0" max="1" step=".05" value="${s.volume}"></label>
  ${desktop ? `<label class="check-row"><input data-keylabels type="checkbox" ${s.keyLabels ? 'checked' : ''}> የኪቦርድ ፊደሎችን አሳይ · Show computer-keyboard key labels on instruments</label>` : ''}
  <button class="danger" data-reset>ሁሉንም እድገት ሰርዝ · Reset progress</button></section></div>`;
  v.querySelector('[data-lang]').value=s.language;
  v.querySelector('[data-lang]').onchange=e=>{s.language=e.target.value; document.documentElement.dataset.language=s.language; saveStore(app.data)};
  v.querySelector('[data-volume]').oninput=e=>{s.volume=+e.target.value; setVolume(s.volume); v.querySelector('[data-volout]').value=`${Math.round(s.volume*100)}%`; saveStore(app.data)};
  v.querySelector('[data-keylabels]')?.addEventListener('change', (e) => { s.keyLabels = e.target.checked; saveStore(app.data); });
  v.querySelector('[data-reset]').onclick=()=>{if(confirm('የትምህርት እድገትዎን ሙሉ በሙሉ ይሰርዝ?')){resetStore(); location.reload();}};
  v.querySelector('[data-back]').onclick=app.back; return v;
}

export function renderAbout(app) { const v=el('div','view'); v.innerHTML=`<div class="wrap narrow"><button class="backlink" data-back>← ተመለስ · Back</button><div class="page-head"><p>ስለ ቅኝት</p><h1>Music in your hands</h1></div><section class="prose-card"><p class="am-copy">ቅኝት የኢትዮጵያን ሙዚቃ ከመጀመሪያው ኖታ ጀምሮ በማዳመጥና በመጫወት የሚያስተምር ትምህርት ቤት ነው።</p><p>ትዝታ · Tizita — warm and nostalgic<br>ባቲ · Bati — bright and searching<br>አምባሰል · Ambassel — poised and spacious<br>አንቺሆዬ · Anchihoye — ceremonial and bold</p><p>All practice melodies are original. Traditional tunings contain expressive shades that fixed western notes only approximate.</p><div class="credit">Created by <b>Axiom Digital</b><br>Version 1.0.0 · Offline audio by Web Audio</div></section></div>`;v.querySelector('[data-back]').onclick=app.back;return v; }

export function renderCertificate(app) { const {instrument,level}=app.state, inst=INSTRUMENTS[instrument], lv=LEVELS[level]; const v=el('div','view'); v.innerHTML=`<div class="wrap narrow"><button class="backlink" data-back>← ተመለስ · Back</button><div class="certificate" data-cert><span class="seal">ቅኝት</span><p>የስኬት ማረጋገጫ · CERTIFICATE OF ACHIEVEMENT</p><input data-name placeholder="ስምዎ · Your name" maxlength="40"><div class="cert-rule"></div><h2>${inst.am}<small>${inst.en} · ${lv.en}</small></h2><p>${new Intl.DateTimeFormat('am-ET',{dateStyle:'long'}).format(new Date())}</p><b>Axiom Digital</b></div><button class="btn cert-download" data-download>ምስል አውርድ · Download image</button></div>`;
  v.querySelector('[data-download]').onclick=()=>downloadCertificate(v.querySelector('[data-name]').value||'ተማሪ',inst,lv); v.querySelector('[data-back]').onclick=app.back; return v; }

function downloadCertificate(name,inst,lv){const c=document.createElement('canvas');c.width=1200;c.height=800;const x=c.getContext('2d');x.fillStyle='#0c130f';x.fillRect(0,0,1200,800);x.strokeStyle='#e9b84e';x.lineWidth=10;x.strokeRect(35,35,1130,730);x.textAlign='center';x.fillStyle='#e9b84e';x.font='bold 110px sans-serif';x.fillText('ቅኝት',600,180);x.fillStyle='#f3ead9';x.font='32px sans-serif';x.fillText('CERTIFICATE OF ACHIEVEMENT',600,270);x.font='bold 58px sans-serif';x.fillText(name,600,390);x.fillStyle='#c7cabf';x.font='32px sans-serif';x.fillText(`${inst.en} · ${lv.en}`,600,475);x.font='24px sans-serif';x.fillText(new Date().toLocaleDateString(),600,550);x.fillStyle='#e9b84e';x.fillText('Axiom Digital',600,670);c.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.download='kinit-certificate.png';a.href=url;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)},'image/png')}

export function renderOnboarding(app) {
  const v=el('div','view onboarding'); let step=0,inst='keyboard';
  const draw=()=>{
    const pages=[
      `<div class="onboard-icon">♪</div><h1>እንኳን ደህና መጡ</h1><p>Learn by hearing, seeing and playing. Every sound works offline.</p>`,
      `<h1>መሣሪያዎን ይምረጡ</h1><div class="choice-grid">${Object.entries(INSTRUMENTS).map(([k,i])=>`<button data-inst="${k}" class="choice ${k===inst?'on':''}">${i.ic}<span>${i.am}</span></button>`).join('')}</div>`,
      `<h1>ጀማሪ ደረጃ · Beginner</h1><p>የመጀመሪያው ሙሉ ክፍል ዝግጁ ነው። · Your complete first course is ready.</p><div class="onboard-levels"><div class="choice on">✓ ጀማሪ<span>Beginner · Open</span></div><div class="choice locked">🔒 መካከለኛ<span>ክፍል 2 · በቅርቡ</span></div><div class="choice locked">🔒 ባለሙያ<span>ክፍል 3 · በቅርቡ</span></div></div>`
    ];
    v.innerHTML=`<div class="onboard-card"><div class="dots">${[0,1,2].map(i=>`<i class="${i===step?'on':''}"></i>`).join('')}</div>${pages[step]}<button class="btn" data-next>${step<2?'ቀጥል · Continue':'ጀምር · Start'}</button></div>`;
    v.querySelectorAll('[data-inst]').forEach(b=>b.onclick=()=>{inst=b.dataset.inst;draw()});
    v.querySelector('[data-next]').onclick=()=>{if(step<2){step++;draw()}else{app.data.onboarded=true;saveStore(app.data);app.openLevel(inst,'beginner')}};
  };
  draw(); return v;
}
