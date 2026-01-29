/* =========================================
   다함 인테리어 견적 시스템 (단가 로직 안정화 Ver 1.15)
   ========================================= */

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
let dbClient = null;

window.onbeforeunload = function() {
    if(document.getElementById('final-sum').innerText !== "0 원") {
        return "작성 중인 내용이 사라질 수 있습니다.";
    }
};

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
            h.innerHTML = `<span><div class="section-icon">${icons[sec.key]}</div> ${sec.category}<span id="pv-${idx}" class="paint-print-val"></span></span><span class="no-print">▼</span>`;
            h.onclick = () => document.getElementById('c-'+idx).classList.toggle('show');
            cont.appendChild(h);
            
            const c = document.createElement('div'); c.className = 'section-content'; c.id = 'c-'+idx;
            
            if (sec.key === 'custom') {
                c.innerHTML = `
                    <div id="custom-rows-container-${idx}"></div>
                    <div class="no-print" style="padding: 0 10px;">
                        <button class="btn-add-row" onclick="addCustomRow(${idx})">+ 항목 추가하기</button>
                    </div>
                `;
            } else {
                let rows = `<div class="grid-row master-grid no-print bulk-row">
                    <div style="text-align:left;"><label class="item-label bulk-text"><input type="checkbox" onchange="toggleSec(${idx}, this)"><span class="checkmark"></span><span>전체선택</span></label></div>
                    <div style="grid-column: span 3; text-align:right;">
                        ${sec.isPaint ? `<select id="p-sel" class="paint-select" onchange="changeP(${idx}, this.value)">
                            <option value="water">수성 페인트</option><option value="elastic">탄성 코트</option><option value="ceramic">세라믹 코트</option>
                        </select>` : ''}
                    </div>
                </div>`;
                sec.items.forEach((item, iIdx) => {
                    // [핵심] 단가는 표시용(만원 단위)으로 초기 렌더링
                    rows += `<div class="grid-row master-grid row-${idx} item-line">
                        <div style="text-align:left;"><label class="item-label"><input type="checkbox" class="chk" data-name="${item.n}" onchange="update()"><span class="checkmark"></span><span>${item.n}</span></label></div>
                        <div><input type="number" class="in-num qty" value="1" oninput="update()"></div>
                        <div><input type="number" class="in-num price" value="${item.p / 10000}" oninput="update()"></div>
                        <div class="row-total" style="text-align:right;">0</div>
                    </div>`;
                });
                c.innerHTML = rows;
            }

            cont.appendChild(c); body.appendChild(cont);
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
            } else { e.target.value = v; }
        });
    }
    loadFromLocal();
});

function addCustomRow(secIdx, savedData = null) {
    const container = document.getElementById(`custom-rows-container-${secIdx}`);
    const div = document.createElement('div');
    div.className = `grid-row master-grid row-${secIdx} item-line custom-dynamic-row`;
    
    const nameVal = savedData ? savedData.name : "";
    const qtyVal = savedData ? savedData.qty : 1;
    const priceVal = savedData ? (parseFloat(savedData.price) / 10000) : 0;
    
    div.innerHTML = `
        <div style="text-align:left; display:flex; align-items:center;">
            <label class="item-label" style="width:auto; margin-right:10px;">
                <input type="checkbox" class="chk" data-name="${nameVal || '직접 입력'}" checked onchange="update()">
                <span class="checkmark" style="margin-right:0;"></span>
            </label>
            <input type="text" class="custom-name" placeholder="항목 입력" value="${nameVal}" oninput="syncCustomName(this)">
        </div>
        <div><input type="number" class="in-num qty" value="${qtyVal}" oninput="update()"></div>
        <div><input type="number" class="in-num price" value="${priceVal}" oninput="update()"></div>
        <div style="text-align:right; display:flex; justify-content:flex-end; align-items:center;">
            <span class="row-total">0</span>
            <button class="btn-del-row no-print" onclick="deleteRow(this)">-</button>
        </div>
    `;
    container.appendChild(div);
    update();
}

function deleteRow(btn) {
    btn.closest('.grid-row').remove();
    update();
}

const paintMap = { water: 12, elastic: 22, ceramic: 30 };

function syncCustomName(el) {
    const row = el.closest('.grid-row');
    const chk = row.querySelector('.chk');
    chk.dataset.name = el.value.trim() === "" ? "직접 입력" : el.value;
}

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

// [핵심] 만원 단위를 원 단위로 변환하여 콤마 표시
function formatKRW(num) { 
    if (!num && num !== 0) return "0"; 
    // num은 만원 단위 숫자임
    return Math.floor(parseFloat(num) * 10000).toLocaleString(); 
}

function update() {
    let total = 0;
    document.querySelectorAll('#view-general .item-line').forEach(row => {
        const chk = row.querySelector('.chk');
        // [수정] 입력값이 콤마를 포함하고 있을 경우 대비하여 제거 후 읽기
        const qtyVal = parseFloat(row.querySelector('.qty').value) || 0;
        let priceRaw = row.querySelector('.price').value.toString().replace(/,/g, '');
        const priceVal = parseFloat(priceRaw) || 0;

        if(chk.checked) {
            const sum = qtyVal * priceVal;
            total += sum; 
            row.querySelector('.row-total').innerText = formatKRW(sum);
        } else {
            row.querySelector('.row-total').innerText = "0";
        }
    });
    const sumEl = document.getElementById('final-sum');
    if(sumEl) sumEl.innerText = formatKRW(total) + " 원";
}

async function smartPrint() {
    update(); 
    const nameEl = document.getElementById('g-name');
    const telEl = document.getElementById('g-tel');
    const addrEl = document.getElementById('g-addr');

    if(!nameEl.value) { alert("고객명을 입력해주세요."); nameEl.focus(); return; }
    if(!telEl.value) { alert("연락처를 입력해주세요."); telEl.focus(); return; }
    if(!addrEl.value) { alert("현장 주소를 입력해주세요."); addrEl.focus(); return; }

    const inputs = document.querySelectorAll('.in-num');
    inputs.forEach(input => { 
        if (input.classList.contains('price')) { 
            // 현재 만원 단위 숫자를 백업하고 화면만 포맷팅
            input.dataset.orig = input.value; 
            const formatted = formatKRW(parseFloat(input.value.toString().replace(/,/g, ''))||0);
            input.type = "text"; 
            input.value = formatted; 
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

    // 인쇄 후 복구 시 데이터 변형 방지
    setTimeout(() => {
        inputs.forEach(input => { 
            if (input.classList.contains('price')) { 
                input.type = "number"; 
                input.value = input.dataset.orig; 
            } 
        });
        document.querySelectorAll('.section-container, .grid-row').forEach(el => el.classList.remove('hidden-print'));
        document.querySelectorAll('.paint-print-val').forEach(el => el.innerText = "");
        update();
    }, 1000);
}

function printContract() {
    window.print();
}

function switchToDetailed() {
    // 1. 먼저 현재 입력값들을 기준으로 전체 계산(만원 단위)을 확실히 수행
    update();

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
                let itemName = chk.dataset.name;
                const customInput = row.querySelector('.custom-name');
                if(customInput && customInput.value.trim() !== "") {
                    itemName = customInput.value;
                }

                // [수정] 콤마 제거 후 숫자만 읽어오기
                let pRaw = row.querySelector('.price').value.toString().replace(/,/g, '');
                checkedItems.push({
                    name: itemName,
                    qty: row.querySelector('.qty').value,
                    price: pRaw // 만원 단위 숫자
                });
            }
        });

        if (checkedItems.length > 0) {
            const secHeader = document.createElement('div');
            secHeader.className = 'contract-section-header';
            secHeader.innerHTML = `${sec.category}`;
            dBody.appendChild(secHeader);

            checkedItems.forEach(item => {
                // 실금액 계산 (만원 단위 숫자 * 10,000)
                const realPrice = parseFloat(item.price) * 10000;
                const sum = parseFloat(item.qty) * realPrice;
                dTotal += sum;
                const div = document.createElement('div');
                div.className = 'grid-row detail-grid';
                div.innerHTML = `
                    <strong>${item.name}</strong>
                    <textarea class="spec-field" placeholder="사양 입력" rows="1"></textarea>
                    <div>${item.qty}</div>
                    <div>${realPrice.toLocaleString()}</div>
                    <div style="text-align:right;">${sum.toLocaleString()}</div>
                `;
                dBody.appendChild(div);
            });
        }
    });
    
    document.getElementById('d-name-display').innerText = nameEl.value;
    document.getElementById('d-tel-display').innerText = telEl.value;
    document.getElementById('d-addr-display').innerText = addrEl.value;
    document.getElementById('d-total').innerText = dTotal.toLocaleString() + " 원";

    document.getElementById('view-general').classList.remove('active-view');
    document.getElementById('view-detailed').classList.add('active-view');

    toggleButtons(true);
    window.scrollTo(0,0);
}

function backToGeneral() {
    document.getElementById('view-detailed').classList.remove('active-view');
    document.getElementById('view-general').classList.add('active-view');
    toggleButtons(false);
    // 복귀 후 다시 계산 업데이트
    update();
}

function toggleButtons(isContractMode) {
    const estBtns = ['btn-reset', 'btn-save', 'btn-print-est', 'btn-go-contract'];
    const contBtns = ['btn-back', 'btn-print-cont'];
    estBtns.forEach(id => document.getElementById(id).style.display = isContractMode ? 'none' : 'flex');
    contBtns.forEach(id => document.getElementById(id).style.display = isContractMode ? 'flex' : 'none');
}

function saveToLocal() {
    update(); // 저장 전 계산 동기화
    const saveData = {
        name: document.getElementById('g-name').value,
        tel: document.getElementById('g-tel').value,
        addr: document.getElementById('g-addr').value,
        paintType: document.getElementById('p-sel') ? document.getElementById('p-sel').value : null,
        items: [],
        customItems: [] 
    };
    
    document.querySelectorAll('.item-line:not(.custom-dynamic-row)').forEach((row, idx) => {
        const chk = row.querySelector('.chk');
        if(chk.checked) {
            let pRaw = row.querySelector('.price').value.toString().replace(/,/g, '');
            saveData.items.push({ 
                idx: idx, 
                qty: row.querySelector('.qty').value, 
                price: parseFloat(pRaw) * 10000 // 실금액으로 저장
            });
        }
    });

    document.querySelectorAll('.custom-dynamic-row').forEach(row => {
        const customInput = row.querySelector('.custom-name');
        if(customInput) {
            let pRaw = row.querySelector('.price').value.toString().replace(/,/g, '');
            saveData.customItems.push({
                name: customInput.value,
                qty: row.querySelector('.qty').value,
                price: parseFloat(pRaw) * 10000 
            });
        }
    });

    localStorage.setItem('daham_estimate_draft', JSON.stringify(saveData));
    showToast("임시 저장되었습니다.");
}

function loadFromLocal() {
    const saved = localStorage.getItem('daham_estimate_draft');
    if(!saved) return;
    if(!confirm("저장된 내용을 불러오시겠습니까?")) return;

    const savedData = JSON.parse(saved);
    document.getElementById('g-name').value = savedData.name || '';
    document.getElementById('g-tel').value = savedData.tel || '';
    document.getElementById('g-addr').value = savedData.addr || '';
    
    if(savedData.paintType && document.getElementById('p-sel')) {
        document.getElementById('p-sel').value = savedData.paintType;
    }
    
    setTimeout(() => {
        const rows = document.querySelectorAll('.item-line:not(.custom-dynamic-row)');
        savedData.items.forEach(item => {
            if(rows[item.idx]) {
                const row = rows[item.idx];
                const chk = row.querySelector('.chk');
                chk.checked = true;
                row.querySelector('.qty').value = item.qty;
                // 불러온 실금액을 다시 만원 단위 숫자로 변환
                row.querySelector('.price').value = parseFloat(item.price) / 10000;
            }
        });

        if(savedData.customItems && savedData.customItems.length > 0) {
            const customSecIdx = data.length - 1; 
            const container = document.getElementById(`custom-rows-container-${customSecIdx}`);
            if(container) {
                container.innerHTML = ''; 
                savedData.customItems.forEach(cItem => {
                    addCustomRow(customSecIdx, cItem);
                });
            }
        }
        update();
    }, 200);
}

function resetForm() {
    if(confirm("모든 내용을 초기화 하시겠습니까?")) {
        localStorage.removeItem('daham_estimate_draft');
        window.onbeforeunload = null; 
        location.reload();
    }
}

function showToast(message) {
    const x = document.getElementById("toast-msg");
    x.innerText = message; x.className = "toast show"; 
    setTimeout(() => x.className = x.className.replace("show", ""), 3000);
}
