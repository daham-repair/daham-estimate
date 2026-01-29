/* =========================================
   다함 인테리어 견적 시스템 (동적 행 추가 기능 Ver 1.13)
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
            
            // [수정] 직접 입력 섹션은 '+ 추가' 버튼 표시
            if (sec.key === 'custom') {
                // 직접 입력 섹션: 헤더 + 동적 컨테이너 + 추가 버튼
                c.innerHTML = `
                    <div id="custom-rows-container-${idx}"></div>
                    <div class="no-print" style="padding: 0 10px;">
                        <button class="btn-add-row" onclick="addCustomRow(${idx})">+ 항목 추가하기</button>
                    </div>
                `;
            } else {
                // 일반 섹션
                let rows = `<div class="grid-row master-grid no-print bulk-row">
                    <div style="text-align:left;"><label class="item-label bulk-text"><input type="checkbox" onchange="toggleSec(${idx}, this)"><span class="checkmark"></span><span>전체선택</span></label></div>
                    <div style="grid-column: span 3; text-align:right;">
                        ${sec.isPaint ? `<select id="p-sel" class="paint-select" onchange="changeP(${idx}, this.value)">
                            <option value="water">수성 페인트</option><option value="elastic">탄성 코트</option><option value="ceramic">세라믹 코트</option>
                        </select>` : ''}
                    </div>
                </div>`;
                sec.items.forEach((item, iIdx) => {
                    // [기존 로직 유지]
                    let isCustomLine = (sec.category === '기타' && iIdx === sec.items.length - 1) ? true : false; 
                    // (기존 '기타'의 마지막 항목 로직은 이제 사용하지 않거나 유지해도 무방하나, 
                    // 이번 요청은 '직접 입력' 대메뉴를 쓰는 것이므로 일반 항목으로 처리)
                    
                    rows += `<div class="grid-row master-grid row-${idx} item-line">
                        <div style="text-align:left;"><label class="item-label"><input type="checkbox" class="chk" data-name="${item.n}" onchange="update()"><span class="checkmark"></span><span>${item.n}</span></label></div>
                        <div><input type="number" class="in-num qty" value="1" oninput="update()"></div>
                        <div><input type="number" class="in-num price" value="${item.p}" oninput="update()"></div>
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

// [추가] 직접 입력 행 추가 함수
function addCustomRow(secIdx, savedData = null) {
    const container = document.getElementById(`custom-rows-container-${secIdx}`);
    const div = document.createElement('div');
    div.className = `grid-row master-grid row-${secIdx} item-line custom-dynamic-row`;
    
    // 저장된 데이터가 있으면 사용, 없으면 기본값
    const nameVal = savedData ? savedData.name : "";
    const qtyVal = savedData ? savedData.qty : 1;
    const priceVal = savedData ? savedData.price : 0;
    
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

// [추가] 행 삭제 함수
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

                checkedItems.push({
                    name: itemName,
                    qty: row.querySelector('.qty').value,
                    price: row.querySelector('.price').value
                });
            }
        });

        if (checkedItems.length > 0) {
            const secHeader = document.createElement('div');
            secHeader.className = 'contract-section-header';
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

// [수정] 저장 로직 (동적 행까지 저장)
function saveToLocal() {
    const saveData = {
        name: document.getElementById('g-name').value,
        tel: document.getElementById('g-tel').value,
        addr: document.getElementById('g-addr').value,
        paintType: document.getElementById('p-sel') ? document.getElementById('p-sel').value : null,
        items: [],
        customItems: [] // [추가] 직접 입력 항목 별도 저장
    };
    
    // 일반 항목 저장
    document.querySelectorAll('.item-line:not(.custom-dynamic-row)').forEach((row, idx) => {
        const chk = row.querySelector('.chk');
        if(chk.checked) {
            saveData.items.push({ 
                // 주의: 동적행이 아니므로 DOM 순서상 index가 data.js와 일치하는지 확인 필요하나, 
                // 현재 구조상 '기타'까지는 순차적이므로 row index보다는 data-name 등을 활용하거나 
                // 기존 방식(전체 row 순회)을 유지하되 동적행만 제외.
                // data.js 순서와 DOM 순서가 일치한다고 가정 (동적행은 마지막 섹션이므로)
                idx: idx, 
                qty: row.querySelector('.qty').value, 
                price: row.querySelector('.price').value 
            });
        }
    });

    // 직접 입력 항목 저장
    document.querySelectorAll('.custom-dynamic-row').forEach(row => {
        const customInput = row.querySelector('.custom-name');
        if(customInput) {
            saveData.customItems.push({
                name: customInput.value,
                qty: row.querySelector('.qty').value,
                price: row.querySelector('.price').value
            });
        }
    });

    localStorage.setItem('daham_estimate_draft', JSON.stringify(saveData));
    showToast("임시 저장되었습니다.");
}

// [수정] 불러오기 로직 (동적 행 복구)
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
        // 일반 항목 복구
        const rows = document.querySelectorAll('.item-line:not(.custom-dynamic-row)');
        savedData.items.forEach(item => {
            if(rows[item.idx]) {
                const row = rows[item.idx];
                const chk = row.querySelector('.chk');
                chk.checked = true;
                row.querySelector('.qty').value = item.qty;
                row.querySelector('.price').value = item.price;
            }
        });

        // 직접 입력 항목 복구
        if(savedData.customItems && savedData.customItems.length > 0) {
            // 'custom' 섹션의 index 찾기 (마지막 섹션)
            const customSecIdx = data.length - 1; 
            const container = document.getElementById(`custom-rows-container-${customSecIdx}`);
            if(container) {
                container.innerHTML = ''; // 기존 내용 초기화
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
