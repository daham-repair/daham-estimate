/* =========================================
   다함 인테리어 견적 시스템 (계약서 아이콘 제거)
   ========================================= */

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
let dbClient = null;

document.addEventListener('DOMContentLoaded', function() {
    try {
        if (typeof supabase !== 'undefined' && supabaseUrl.startsWith('http')) {
            dbClient = supabase.createClient(supabaseUrl, supabaseKey);
        }
    } catch (e) { console.error("DB 연결 실패:", e); }

    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div'); cont.className = 'section-container'; cont.id = 'cont-'+idx;
            const h = document.createElement('div'); h.className = 'section-header'; 
            // [참고] 견적 입력창(General View)에는 여전히 아이콘이 표시됨
            h.innerHTML = `<span><div class="section-icon">${icons[sec.key]}</div> ${sec.category}<span id="pv-${idx}" class="paint-print-val"></span></span><span class="no-print">▼</span>`;
            h.onclick = () => document.getElementById('c-'+idx).classList.toggle('show');
            cont.appendChild(h);
            
            const c = document.createElement('div'); c.className = 'section-content'; c.id = 'c-'+idx;
            let rows = `<div class="grid-row master-grid no-print bulk-row">
                <div style="text-align:left;"><label class="item-label bulk-text"><input type="checkbox" onchange="toggleSec(${idx}, this)"><span class="checkmark"></span><span>전체선택</span></label></div>
                <div style="grid-column: span 3; text-align:right;">
                    ${sec.isPaint ? `<select id="p-sel" class="paint-select" onchange="changeP(${idx}, this.value)">
                        <option value="water">수성 페인트</option><option value="elastic">탄성 코트</option><option value="ceramic">세라믹 코트</option>
                    </select>` : ''}
                </div>
            </div>`;
            sec.items.forEach((item, iIdx) => {
                rows += `<div class="grid-row master-grid row-${idx} item-line">
                    <div style="text-align:left;"><label class="item-label"><input type="checkbox" class="chk" data-name="${item.n}" onchange="update()"><span class="checkmark"></span><span>${item.n}</span></label></div>
                    <div><input type="number" class="in-num qty" value="1" oninput="update()"></div>
                    <div><input type="number" class="in-num price" value="${item.p}" oninput="update()"></div>
                    <div class="row-total" style="text-align:right;">0</div>
                </div>`;
            });
            c.innerHTML = rows; cont.appendChild(c); body.appendChild(cont);
        });
    }

    const telInput = document.getElementById('g-tel');
    if(telInput) {
        telInput.addEventListener('input', function(e) {
            let v = e.target.value.replace(/[^0-9]/g, ''); 
            if (v.length > 11) v = v.substr(0, 11); 

            if (v.length > 3 && v.length <= 7) {
                e.target.value = v.replace(/(\d{3})(\d{1,4})/, '$1.$2');
            } else if (v.length > 7) {
                if(v.startsWith('02') && v.length <= 10) { 
                    e.target.value = v.replace(/(\d{2})(\d{3,4})(\d{4})/, '$1.$2.$3');
                } else {
                    e.target.value = v.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1.$2.$3');
                }
            } else {
                e.target.value = v;
            }
        });
    }
    loadFromLocal();
});

const paintMap = { water: 12, elastic: 22, ceramic: 30 };

function changeP(sIdx, type) {
    const np = paintMap[type];
    const sectionContent = document.getElementById(`c-${sIdx}`);
    if (sectionContent) {
        sectionContent.querySelectorAll('.price').forEach(el => { el.value = np; });
    }
    update();
}

function toggleSec(idx, master) {
    document.querySelectorAll(`.row-${idx} .chk`).forEach(c => c.checked = master.checked);
    update();
}

function formatKRW(num) { 
    if (!num && num !== 0) return "0"; 
    return Math.floor(num * 10000).toLocaleString(); 
}

function update() {
    let total = 0;
    document.querySelectorAll('#view-general .item-line').forEach(row => {
        const chk = row.querySelector('.chk');
        const qtyVal = parseFloat(row.querySelector('.qty').value) || 0;
        const priceVal = parseFloat(row.querySelector('.price').value) || 0;
        if(chk.checked) {
            const sum = qtyVal * priceVal;
            total += sum; row.querySelector('.row-total').innerText = formatKRW(sum);
        } else {
            row.querySelector('.row-total').innerText = "0";
        }
    });
    const sumEl = document.getElementById('final-sum');
    if(sumEl) sumEl.innerText = formatKRW(total) + " 원";
}

async function smartPrint() {
    const nameEl = document.getElementById('g-name');
    const telEl = document.getElementById('g-tel');
    const addrEl = document.getElementById('g-addr');

    if(!nameEl.value) { alert("고객명을 입력해주세요."); nameEl.focus(); return; }
    if(!telEl.value) { alert("연락처를 입력해주세요."); telEl.focus(); return; }
    if(!addrEl.value) { alert("현장 주소를 입력해주세요."); addrEl.focus(); return; }

    const inputs = document.querySelectorAll('.in-num');
    inputs.forEach(input => { 
        if (input.classList.contains('price')) { 
            input.dataset.orig = input.value; 
            input.type = "text"; 
            input.value = formatKRW(parseFloat(input.value)||0); 
        } 
    });

    const ps = document.getElementById('p-sel');
    if(ps) { 
        const txt = ps.options[ps.selectedIndex].text;
        data.forEach((sec, idx) => {
            if (sec.isPaint) {
                const el = document.getElementById(`pv-${idx}`);
                if(el) el.innerText = ` [${txt}]`;
            }
        });
    }
    
    data.forEach((_, idx) => {
        const rows = document.querySelectorAll(`.row-${idx}`);
        let hasChecked = false;
        rows.forEach(r => { 
            if(!r.querySelector('.chk').checked) { r.classList.add('hidden-print'); } 
            else { r.classList.remove('hidden-print'); hasChecked = true; } 
        });
        const cont = document.getElementById('cont-'+idx);
        const content = document.getElementById('c-'+idx);
        if(cont && content) {
            if(hasChecked) { cont.classList.remove('hidden-print'); content.classList.add('show'); }
            else { cont.classList.add('hidden-print'); }
        }
    });

    window.print();

    setTimeout(() => {
        inputs.forEach(input => { if (input.classList.contains('price')) { input.type = "number"; input.value = input.dataset.orig; } });
        document.querySelectorAll('.section-container, .grid-row').forEach(el => el.classList.remove('hidden-print'));
        document.querySelectorAll('.paint-print-val').forEach(el => el.innerText = "");
        update();
    }, 1000);
}

function printContract() {
    window.print();
}

function switchToDetailed() {
    const nameEl = document.getElementById('g-name');
    const telEl = document.getElementById('g-tel');
    const addrEl = document.getElementById('g-addr');

    if(!nameEl.value) { alert("고객명을 입력해주세요."); nameEl.focus(); return; }
    if(!telEl.value) { alert("연락처를 입력해주세요."); telEl.focus(); return; }
    if(!addrEl.value) { alert("현장 주소를 입력해주세요."); addrEl.focus(); return; }
    
    const dBody = document.getElementById('detailed-body'); dBody.innerHTML = '';
    let dTotal = 0;
    
    data.forEach((sec, idx) => {
        const checkedItems = [];
        const rows = document.querySelectorAll(`.row-${idx}`);
        rows.forEach(row => {
            const chk = row.querySelector('.chk');
            if (chk && chk.checked) {
                checkedItems.push({
                    name: chk.dataset.name,
                    qty: row.querySelector('.qty').value,
                    price: row.querySelector('.price').value
                });
            }
        });

        if (checkedItems.length > 0) {
            const secHeader = document.createElement('div');
            secHeader.className = 'contract-section-header';
            // [수정] 아이콘 태그 제거 (텍스트만 표시)
            secHeader.innerHTML = `${sec.category}`;
            dBody.appendChild(secHeader);

            checkedItems.forEach(item => {
                const sum = item.qty * item.price;
                dTotal += sum;
                const div = document.createElement('div');
                div.className = 'grid-row detail-grid';
                div.innerHTML = `
                    <strong>${item.name}</strong>
                    <textarea class="spec-field" placeholder="사양 입력" rows="1"></textarea>
                    <div>${item.qty}</div>
                    <div>${parseInt(item.price).toLocaleString()}</div>
                    <div style="text-align:right;">${formatKRW(sum)}</div>
                `;
                dBody.appendChild(div);
            });
        }
    });
    
    document.getElementById('d-name-display').innerText = nameEl.value;
    document.getElementById('d-tel-display').innerText = telEl.value;
    document.getElementById('d-addr-display').innerText = addrEl.value;
    document.getElementById('d-total').innerText = formatKRW(dTotal) + " 원";

    document.getElementById('view-general').classList.remove('active-view');
    document.getElementById('view-detailed').classList.add('active-view');

    toggleButtons(true);
    
    window.scrollTo(0,0);
}

function backToGeneral() {
    document.getElementById('view-detailed').classList.remove('active-view');
    document.getElementById('view-general').classList.add('active-view');
    toggleButtons(false);
}

function toggleButtons(isContractMode) {
    const estBtns = ['btn-reset', 'btn-save', 'btn-print-est', 'btn-go-contract'];
    const contBtns = ['btn-back', 'btn-print-cont'];

    estBtns.forEach(id => document.getElementById(id).style.display = isContractMode ? 'none' : 'flex');
    contBtns.forEach(id => document.getElementById(id).style.display = isContractMode ? 'flex' : 'none');
}

function saveToLocal() {
    const saveData = {
        name: document.getElementById('g-name').value,
        tel: document.getElementById('g-tel').value,
        addr: document.getElementById('g-addr').value,
        items: []
    };
    document.querySelectorAll('.item-line').forEach((row, idx) => {
        const chk = row.querySelector('.chk');
        if(chk.checked) {
            saveData.items.push({ idx: idx, qty: row.querySelector('.qty').value, price: row.querySelector('.price').value });
        }
    });
    localStorage.setItem('daham_estimate_draft', JSON.stringify(saveData));
    showToast("임시 저장되었습니다.");
}

function loadFromLocal() {
    const saved = localStorage.getItem('daham_estimate_draft');
    if(!saved) return;
    if(!confirm("이전에 작성하던 내용이 있습니다. 불러오시겠습니까?")) return;
    const data = JSON.parse(saved);
    document.getElementById('g-name').value = data.name || '';
    document.getElementById('g-tel').value = data.tel || '';
    document.getElementById('g-addr').value = data.addr || '';
    
    setTimeout(() => {
        const rows = document.querySelectorAll('.item-line');
        data.items.forEach(item => {
            if(rows[item.idx]) {
                rows[item.idx].querySelector('.chk').checked = true;
                rows[item.idx].querySelector('.qty').value = item.qty;
                rows[item.idx].querySelector('.price').value = item.price;
            }
        });
        update();
    }, 200);
}

function resetForm() {
    if(confirm("모든 내용을 초기화 하시겠습니까?")) {
        localStorage.removeItem('daham_estimate_draft');
        location.reload();
    }
}

function showToast(message) {
    const x = document.getElementById("toast-msg");
    x.innerText = message; x.className = "toast show"; 
    setTimeout(() => x.className = x.className.replace("show", ""), 3000);
}
