/* =========================================
   다함 인테리어 견적 시스템 (버전 동기화 Ver 1.17)
   ========================================= */

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
let dbClient = null;

window.onbeforeunload = function() {
    if(document.getElementById('final-sum').innerText !== "0 원") return "작성 중인 내용이 사라질 수 있습니다.";
};

document.addEventListener('DOMContentLoaded', function() {
    try { if (typeof supabase !== 'undefined' && supabaseUrl.startsWith('http')) dbClient = supabase.createClient(supabaseUrl, supabaseKey); } catch (e) { console.error("DB 연결 실패:", e); }
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div'); cont.className = 'section-container'; cont.id = 'cont-'+idx;
            const h = document.createElement('div'); h.className = 'section-header'; 
            h.innerHTML = `<span><div class="section-icon">${icons[sec.key]}</div> ${sec.category}<span id="pv-${idx}" class="paint-print-val"></span></span><span class="no-print">▼</span>`;
            h.onclick = () => document.getElementById('c-'+idx).classList.toggle('show');
            cont.appendChild(h);
            const c = document.createElement('div'); c.className = 'section-content'; c.id = 'c-'+idx;
            
            let rowsHtml = `<div class="grid-row master-grid no-print bulk-row"><div style="text-align:left;"><label class="item-label bulk-text"><input type="checkbox" onchange="toggleSec(${idx}, this)"><span class="checkmark"></span><span>전체선택</span></label></div><div style="grid-column: span 3; text-align:right;">${sec.isPaint ? `<select id="p-sel" class="paint-select" onchange="changeP(${idx}, this.value)"><option value="water">수성 페인트</option><option value="elastic">탄성 코트</option><option value="ceramic">세라믹 코트</option></select>` : ''}</div></div>`;
            
            sec.items.forEach((item) => {
                rowsHtml += `<div class="grid-row master-grid row-${idx} item-line"><div style="text-align:left;"><label class="item-label"><input type="checkbox" class="chk" data-name="${item.n}" onchange="update()"><span class="checkmark"></span><span>${item.n}</span></label></div><div><input type="number" class="in-num qty" value="1" oninput="update()"></div><div><input type="number" class="in-num price" value="${item.p / 10000}" oninput="update()"></div><div class="row-total" style="text-align:right;">0</div></div>`;
            });
            
            c.innerHTML = `
                <div id="fixed-rows-${idx}">${rowsHtml}</div>
                <div id="dynamic-rows-container-${idx}"></div>
                <div class="no-print" style="text-align:center;">
                    <button class="btn-add-row" onclick="addCustomRow(${idx})">+ 항목 추가하기</button>
                </div>
            `;
            cont.appendChild(c); body.appendChild(cont);
        });
    }
    const telInput = document.getElementById('g-tel');
    if(telInput) {
        telInput.addEventListener('input', function(e) {
            let v = e.target.value.replace(/[^0-9]/g, ''); if (v.length > 11) v = v.substr(0, 11); 
            if (v.length > 3 && v.length <= 7) e.target.value = v.replace(/(\d{3})(\d{1,4})/, '$1.$2');
            else if (v.length > 7) e.target.value = v.startsWith('02') ? v.replace(/(\d{2})(\d{3,4})(\d{4})/, '$1.$2.$3') : v.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1.$2.$3');
            else e.target.value = v;
        });
    }
    loadFromLocal();
});

function addCustomRow(secIdx, savedData = null) {
    const container = document.getElementById(`dynamic-rows-container-${secIdx}`);
    if(!container) return;
    const div = document.createElement('div'); div.className = `grid-row master-grid row-${secIdx} item-line custom-dynamic-row`;
    const nameVal = savedData ? savedData.name : ""; const qtyVal = savedData ? savedData.qty : 1; const priceVal = savedData ? (parseFloat(savedData.price) / 10000) : 0;
    div.innerHTML = `<div style="text-align:left; display:flex; align-items:center;"><label class="item-label" style="width:auto; margin-right:10px;"><input type="checkbox" class="chk" data-name="${nameVal || '직접 입력'}" checked onchange="update()"><span class="checkmark" style="margin-right:0;"></span></label><input type="text" class="custom-name" placeholder="항목 입력" value="${nameVal}" oninput="syncCustomName(this)"></div><div><input type="number" class="in-num qty" value="${qtyVal}" oninput="update()"></div><div><input type="number" class="in-num price" value="${priceVal}" oninput="update()"></div><div style="text-align:right; display:flex; justify-content:flex-end; align-items:center;"><span class="row-total">0</span><button class="btn-del-row no-print" onclick="deleteRow(this)">-</button></div>`;
    container.appendChild(div); update();
}

function deleteRow(btn) { btn.closest('.grid-row').remove(); update(); }
const paintMap = { water: 12, elastic: 22, ceramic: 30 };
function syncCustomName(el) { const row = el.closest('.grid-row'); const chk = row.querySelector('.chk'); chk.dataset.name = el.value.trim() === "" ? "직접 입력" : el.value; }
function changeP(sIdx, type) { const np = paintMap[type]; const content = document.getElementById(`cont-${sIdx}`); if (content) content.querySelectorAll('.price').forEach(el => { el.value = np; }); update(); }
function toggleSec(idx, master) { document.querySelectorAll(`.row-${idx} .chk`).forEach(c => c.checked = master.checked); update(); }
function formatKRW(num) { if (!num && num !== 0) return "0"; return Math.floor(parseFloat(num) * 10000).toLocaleString(); }

function update() {
    let total = 0;
    document.querySelectorAll('#view-general .item-line').forEach(row => {
        const chk = row.querySelector('.chk'); const qtyVal = parseFloat(row.querySelector('.qty').value) || 0;
        let pRaw = row.querySelector('.price').value.toString().replace(/,/g, ''); const priceVal = parseFloat(pRaw) || 0;
        if(chk.checked) { const sum = qtyVal * priceVal; total += sum; row.querySelector('.row-total').innerText = formatKRW(sum); } else row.querySelector('.row-total').innerText = "0";
    });
    const sumEl = document.getElementById('final-sum'); if(sumEl) sumEl.innerText = formatKRW(total) + " 원";
}

async function smartPrint() {
    update(); const nameEl = document.getElementById('g-name'); const telEl = document.getElementById('g-tel'); const addrEl = document.getElementById('g-addr');
    if(!nameEl.value || !telEl.value || !addrEl.value) { alert("고객 정보(이름, 연락처, 주소)를 모두 입력해주세요."); return; }
    const inputs = document.querySelectorAll('.in-num');
    inputs.forEach(input => { if (input.classList.contains('price')) { input.dataset.orig = input.value; input.type = "text"; input.value = formatKRW(parseFloat(input.value.toString().replace(/,/g, ''))||0); } });
    const ps = document.getElementById('p-sel'); if(ps) { const txt = ps.options[ps.selectedIndex].text; data.forEach((sec, idx) => { if (sec.isPaint) { const el = document.getElementById(`pv-${idx}`); if(el) el.innerText = ` [${txt}]`; } }); }
    document.querySelectorAll('.item-line').forEach(row => { if(!row.querySelector('.chk').checked) row.classList.add('hidden-print'); else row.classList.remove('hidden-print'); });
    data.forEach((_, idx) => {
        const hasChecked = document.querySelectorAll(`.row-${idx} .chk:checked`).length > 0;
        const cont = document.getElementById('cont-'+idx);
        if(cont) { if(hasChecked) { cont.classList.remove('hidden-print'); document.getElementById('c-'+idx).classList.add('show'); } else cont.classList.add('hidden-print'); }
    });
    window.print();
    setTimeout(() => {
        inputs.forEach(input => { if (input.classList.contains('price')) { input.type = "number"; input.value = input.dataset.orig; } });
        document.querySelectorAll('.section-container, .grid-row').forEach(el => el.classList.remove('hidden-print'));
        document.querySelectorAll('.paint-print-val').forEach(el => el.innerText = ""); update();
    }, 1000);
}

function printContract() { window.print(); }

function switchToDetailed() {
    update(); const nameEl = document.getElementById('g-name'); const telEl = document.getElementById('g-tel'); const addrEl = document.getElementById('g-addr');
    if(!nameEl.value || !telEl.value || !addrEl.value) { alert("고객 정보를 입력해주세요."); return; }
    const dBody = document.getElementById('detailed-body'); dBody.innerHTML = ''; let dTotal = 0;
    data.forEach((sec, idx) => {
        const checkedRows = document.querySelectorAll(`.row-${idx} .chk:checked`);
        if (checkedRows.length > 0) {
            const secHeader = document.createElement('div'); secHeader.className = 'contract-section-header'; secHeader.innerHTML = `${sec.category}`; dBody.appendChild(secHeader);
            checkedRows.forEach(chk => {
                const row = chk.closest('.grid-row');
                let itemName = chk.dataset.name; const customInput = row.querySelector('.custom-name');
                if(customInput && customInput.value.trim() !== "") itemName = customInput.value;
                let pRaw = row.querySelector('.price').value.toString().replace(/,/g, '');
                const realPrice = parseFloat(pRaw) * 10000; const qty = parseFloat(row.querySelector('.qty').value);
                const sum = qty * realPrice; dTotal += sum;
                const div = document.createElement('div'); div.className = 'grid-row detail-grid';
                div.innerHTML = `<strong>${itemName}</strong><textarea class="spec-field" placeholder="사양 입력" rows="1"></textarea><div>${qty}</div><div>${realPrice.toLocaleString()}</div><div style="text-align:right;">${sum.toLocaleString()}</div>`;
                dBody.appendChild(div);
            });
        }
    });
    document.getElementById('d-name-display').innerText = nameEl.value; document.getElementById('d-tel-display').innerText = telEl.value; document.getElementById('d-addr-display').innerText = addrEl.value;
    document.getElementById('d-total').innerText = dTotal.toLocaleString() + " 원";
    document.getElementById('view-general').classList.remove('active-view'); document.getElementById('view-detailed').classList.add('active-view');
    toggleButtons(true); window.scrollTo(0,0);
}

function backToGeneral() { document.getElementById('view-detailed').classList.remove('active-view'); document.getElementById('view-general').classList.add('active-view'); toggleButtons(false); update(); }
function toggleButtons(isContractMode) {
    const estBtns = ['btn-reset', 'btn-save', 'btn-print-est', 'btn-go-contract']; const contBtns = ['btn-back', 'btn-print-cont'];
    estBtns.forEach(id => { const el = document.getElementById(id); if(el) el.style.display = isContractMode ? 'none' : 'flex'; }); 
    contBtns.forEach(id => { const el = document.getElementById(id); if(el) el.style.display = isContractMode ? 'flex' : 'none'; });
}

function saveToLocal() {
    update(); 
    const saveData = { name: document.getElementById('g-name').value, tel: document.getElementById('g-tel').value, addr: document.getElementById('g-addr').value, paintType: document.getElementById('p-sel') ? document.getElementById('p-sel').value : null, items: [], customItems: [] };
    document.querySelectorAll('.item-line:not(.custom-dynamic-row)').forEach((row) => { 
        if(row.querySelector('.chk').checked) {
            const secIdx = row.classList[2].split('-')[1];
            saveData.items.push({ secIdx: secIdx, name: row.querySelector('.chk').dataset.name, qty: row.querySelector('.qty').value, price: parseFloat(row.querySelector('.price').value.toString().replace(/,/g, '')) * 10000 }); 
        }
    });
    document.querySelectorAll('.custom-dynamic-row').forEach(row => { 
        const secIdx = row.classList[2].split('-')[1];
        if(row.querySelector('.chk').checked) {
            saveData.customItems.push({ secIdx: secIdx, name: row.querySelector('.custom-name').value, qty: row.querySelector('.qty').value, price: parseFloat(row.querySelector('.price').value.toString().replace(/,/g, '')) * 10000 }); 
        }
    });
    localStorage.setItem('daham_estimate_draft', JSON.stringify(saveData)); 
    showToast("임시 저장되었습니다.");
}

function loadFromLocal() {
    const saved = localStorage.getItem('daham_estimate_draft'); if(!saved) return; if(!confirm("저장된 내용을 불러오시겠습니까?")) return;
    const savedData = JSON.parse(saved); document.getElementById('g-name').value = savedData.name || ''; document.getElementById('g-tel').value = savedData.tel || ''; document.getElementById('g-addr').value = savedData.addr || '';
    if(savedData.paintType && document.getElementById('p-sel')) document.getElementById('p-sel').value = savedData.paintType;
    setTimeout(() => {
        savedData.items.forEach(item => { 
            const rows = document.querySelectorAll(`.row-${item.secIdx}:not(.custom-dynamic-row)`);
            rows.forEach(row => {
                if(row.querySelector('.chk').dataset.name === item.name) { row.querySelector('.chk').checked = true; row.querySelector('.qty').value = item.qty; row.querySelector('.price').value = item.price / 10000; }
            });
        });
        if(savedData.customItems) { savedData.customItems.forEach(cItem => addCustomRow(cItem.secIdx, cItem)); }
        update();
    }, 200);
}

function resetForm() { if(confirm("모든 내용을 초기화 하시겠습니까?")) { localStorage.removeItem('daham_estimate_draft'); window.onbeforeunload = null; location.reload(); } }
function showToast(message) { const x = document.getElementById("toast-msg"); x.innerText = message; x.className = "toast show"; setTimeout(() => x.className = x.className.replace("show", ""), 3000); }
