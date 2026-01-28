/* =========================================
   다함 인테리어 견적 시스템 V_FINAL
   ========================================= */

// ▼▼▼ Supabase 설정 (기존 키 유지하세요) ▼▼▼
const supabaseUrl = '여기에_Project_URL_붙여넣기';
const supabaseKey = '여기에_API_Key_anon_public_붙여넣기';
// ▲▲▲--------------------------------------▲▲▲

let dbClient = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log("System Ready");

    // DB 연결
    try {
        if (typeof supabase !== 'undefined' && supabaseUrl.startsWith('http')) {
            dbClient = supabase.createClient(supabaseUrl, supabaseKey);
            console.log("DB Connected");
        }
    } catch (e) { console.error("DB Error:", e); }

    // 견적 리스트 생성
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div'); cont.className = 'section-container'; cont.id = 'cont-'+idx;
            
            // ★★★ [수정됨] 아이콘 태그 제거함 ★★★
            const h = document.createElement('div'); h.className = 'section-header'; 
            h.innerHTML = `<span>${sec.category}<span id="pv-${idx}" class="paint-print-val"></span></span><span class="no-print" style="font-size:10px; color:#aaa;">▼</span>`;
            
            h.onclick = () => document.getElementById('c-'+idx).classList.toggle('show');
            cont.appendChild(h);
            
            // 섹션 내용
            const c = document.createElement('div'); c.className = 'section-content'; c.id = 'c-'+idx;
            
            // 전체 선택 및 옵션 행
            let rows = `<div class="grid-row master-grid no-print bulk-row" style="background:#f9f9f9;">
                <div style="text-align:left;"><label class="item-label bulk-text"><input type="checkbox" onchange="toggleSec(${idx}, this)"><span class="checkmark"></span><span>전체선택</span></label></div>
                <div style="grid-column: span 3; text-align:right;">
                    ${sec.isPaint ? `<select id="p-sel" class="paint-select" onchange="changeP(${idx}, this.value)" style="padding:2px;">
                        <option value="water">수성 페인트</option><option value="elastic">탄성 코트</option><option value="ceramic">세라믹 코트</option>
                    </select>` : ''}
                </div>
            </div>`;
            
            // 개별 아이템 행
            sec.items.forEach((item, iIdx) => {
                rows += `<div class="grid-row master-grid row-${idx} item-line">
                    <div style="text-align:left;"><label class="item-label"><input type="checkbox" class="chk" data-name="${item.n}" onchange="update()"><span class="checkmark"></span><span>${item.n}</span></label></div>
                    <div><input type="number" class="in-num qty" value="1" oninput="update()"></div>
                    <div><input type="number" class="in-num price" value="${item.p}" oninput="update()" id="p-${idx}-${iIdx}"></div>
                    <div class="row-total" style="text-align:right; font-weight:bold;">0</div>
                </div>`;
            });
            c.innerHTML = rows; cont.appendChild(c); body.appendChild(cont);
        });
    }

    loadFromLocal();
});

// [기능 1] 전화번호 자동 포맷팅 (010.XXXX.XXXX)
function autoFormatTel(target) {
    let raw = target.value.replace(/[^0-9]/g, '');
    let fmt = '';
    if(raw.length < 4) {
        fmt = raw;
    } else if(raw.length < 7) {
        fmt = raw.substr(0,3)+'.'+raw.substr(3);
    } else if(raw.length < 11) {
        fmt = raw.substr(0,3)+'.'+raw.substr(3,3)+'.'+raw.substr(6);
    } else {
        fmt = raw.substr(0,3)+'.'+raw.substr(3,4)+'.'+raw.substr(7);
    }
    target.value = fmt;
}

// [기능 2] 필수 입력 검사 및 커서 이동
function validateInputs() {
    const elName = document.getElementById('g-name');
    const elTel = document.getElementById('g-tel');
    const elAddr = document.getElementById('g-addr');

    if(!elName.value.trim()) {
        alert("고객명을 입력해주세요.");
        elName.focus();
        return false;
    }
    if(!elTel.value.trim()) {
        alert("연락처를 입력해주세요.");
        elTel.focus();
        return false;
    }
    if(!elAddr.value.trim()) {
        alert("현장 주소를 입력해주세요.");
        elAddr.focus();
        return false;
    }
    return true;
}

const paintMap = { water: 12, elastic: 22, ceramic: 30 };

function changeP(sIdx, type) {
    const np = paintMap[type];
    for(let i=0; i<4; i++) {
        const el = document.getElementById(`p-${sIdx}-${i}`);
        if(el) el.value = np;
    }
    update();
}

function toggleSec(idx, master) {
    document.querySelectorAll(`.row-${idx} .chk`).forEach(c => c.checked = master.checked);
    update();
}

function formatKRW(num) { if (!num) return "0"; return Math.floor(num * 10000).toLocaleString(); }

function update() {
    let total = 0;
    document.querySelectorAll('#view-general .item-line').forEach(row => {
        const chk = row.querySelector('.chk');
        if(chk.checked) {
            const sum = (parseFloat(row.querySelector('.qty').value)||0)*(parseFloat(row.querySelector('.price').value)||0);
            total += sum; row.querySelector('.row-total').innerText = formatKRW(sum);
        } else if (row.querySelector('.row-total')) row.querySelector('.row-total').innerText = "0";
    });
    const sumEl = document.getElementById('final-sum');
    if(sumEl) sumEl.innerText = formatKRW(total) + " 원";
}

// [기능 3] 인쇄 (하단바는 CSS @media print로 자동 숨김)
async function smartPrint() {
    if(!validateInputs()) return;

    const inputs = document.querySelectorAll('.in-num');
    const name = document.getElementById('g-name').value;
    const tel = document.getElementById('g-tel').value;
    const addr = document.getElementById('g-addr').value;

    // DB 저장 로직
    let selectedData = [];
    let totalAmt = 0;
    document.querySelectorAll('#view-general .item-line').forEach(row => {
        const chk = row.querySelector('.chk');
        if(chk.checked) {
            const qty = parseFloat(row.querySelector('.qty').value)||0;
            const price = parseFloat(row.querySelector('.price').value)||0;
            selectedData.push({ item: chk.dataset.name, qty: qty, price: price, sum: qty * price });
            totalAmt += (qty * price);
        }
    });

    if(dbClient) {
        try {
            await dbClient.from('estimates').insert([{ 
                client_name: name, client_phone: tel, client_address: addr,
                total_price: formatKRW(totalAmt), detail_data: selectedData
            }]);
        } catch (err) { console.error("DB Insert Failed:", err); }
    }

    // 인쇄용 뷰 변환
    inputs.forEach(input => { if (input.classList.contains('price')) { input.dataset.orig = input.value; input.type = "text"; input.value = formatKRW(parseFloat(input.value)||0); } });
    const ps = document.getElementById('p-sel');
    if(ps) { const txt = ps.options[ps.selectedIndex].text; document.getElementById('pv-11').innerText = ` [${txt}]`; }
    
    for(let idx=0; idx<13; idx++) {
        const rows = document.querySelectorAll(`.row-${idx}`);
        let hasChecked = false;
        rows.forEach(r => { 
            if(!r.querySelector('.chk').checked) { r.classList.add('hidden-print'); } 
            else { r.classList.remove('hidden-print'); hasChecked = true; } 
        });

        const cont = document.getElementById('cont-'+idx);
        const content = document.getElementById('c-'+idx);
        if(cont && content) {
            if(hasChecked) {
                cont.classList.remove('hidden-print');
                content.classList.add('show');
            } else {
                cont.classList.add('hidden-print');
            }
        }
    }

    window.print();

    // 복구
    setTimeout(() => {
        inputs.forEach(input => { if (input.classList.contains('price')) { input.type = "number"; input.value = input.dataset.orig; } });
        document.querySelectorAll('.section-container').forEach(el => el.classList.remove('hidden-print'));
        update();
    }, 1000);
}

// [기능 4] 계약서 발행 (이때 하단 메뉴 숨김)
function switchToDetailed() {
    if(!validateInputs()) return;
    
    const name = document.getElementById('g-name').value;
    const tel = document.getElementById('g-tel').value;
    const addr = document.getElementById('g-addr').value;
    
    const dBody = document.getElementById('detailed-body'); dBody.innerHTML = '';
    let dTotal = 0;
    
    document.querySelectorAll('.item-line').forEach(row => {
        const chk = row.querySelector('.chk');
        if(chk && chk.checked) {
            const n = chk.dataset.name;
            const q = row.querySelector('.qty').value;
            const p = row.querySelector('.price').value;
            const sum = q * p; dTotal += sum;
            const div = document.createElement('div');
            div.className = 'grid-row detail-grid';
            div.innerHTML = `<div>${n}</div><input type="text" class="spec-field" style="width:100%; border:1px solid #ddd;" placeholder="사양 입력"><div>${q}</div><div>${parseInt(p).toLocaleString()}</div><div style="text-align:right;">${formatKRW(sum)}</div>`;
            dBody.appendChild(div);
        }
    });
    
    document.getElementById('d-name-display').value = name;
    document.getElementById('d-tel-display').value = tel;
    document.getElementById('d-addr-display').value = addr;
    document.getElementById('d-total').innerText = formatKRW(dTotal) + " 원";
    
    document.getElementById('view-general').classList.remove('active-view');
    document.getElementById('view-detailed').classList.add('active-view');

    // ★★★ 하단 메뉴바 숨김 ★★★
    const actionBar = document.querySelector('.bottom-action-bar');
    if(actionBar) actionBar.style.display = 'none';

    window.scrollTo(0,0);
}

function backToGeneral() {
    document.getElementById('view-detailed').classList.remove('active-view');
    document.getElementById('view-general').classList.add('active-view');
    
    // ★★★ 하단 메뉴바 복구 ★★★
    const actionBar = document.querySelector('.bottom-action-bar');
    if(actionBar) actionBar.style.display = 'flex';

    window.scrollTo(0,0);
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
    if(!confirm("작성 중인 내용이 있습니다. 불러오시겠습니까?")) {
        localStorage.removeItem('daham_estimate_draft'); return;
    }
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
        showToast("불러오기 완료");
    }, 100);
}

function resetForm() {
    if(confirm("모든 내용을 초기화 하시겠습니까?")) {
        localStorage.removeItem('daham_estimate_draft');
        location.reload();
    }
}

function showToast(message) {
    const x = document.getElementById("toast-msg");
    if(x) { x.innerText = message; x.className = "toast show"; setTimeout(() => x.className = x.className.replace("show", ""), 3000); }
}
