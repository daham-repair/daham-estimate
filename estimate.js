/* [estimate.js Ver 1.28 - 인쇄 로직 강화] */

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
let dbClient = null;

document.addEventListener('DOMContentLoaded', function() {
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div'); cont.id = 'cont-' + idx; // [Ver 1.28] 섹션 컨테이너 ID 추가
            const h = document.createElement('div'); h.className = 'section-bar';
            h.innerHTML = `<span class="section-title">${icons[sec.key]} ${sec.category}</span> <span>▼</span>`;
            
            h.onclick = () => {
                const c = document.getElementById('c-' + idx);
                c.classList.toggle('open');
            };
            cont.appendChild(h);

            const c = document.createElement('div'); c.className = 'section-body'; c.id = 'c-'+idx;
            
            let html = `<div class="grid-row bulk-action-row no-print">
                <label class="item-checkbox-wrap">
                    <input type="checkbox" onchange="toggleSec(${idx}, this)">
                    <span class="checkmark-box"><span class="checkmark-icon">✔</span></span>
                    <span class="item-name">전체 선택</span>
                </label>
                <div></div><div></div><div></div>
            </div>`;

            sec.items.forEach(item => {
                html += `<div class="grid-row item-line">
                    <label class="item-checkbox-wrap">
                        <input type="checkbox" class="chk" data-name="${item.n}" onchange="update()">
                        <span class="checkmark-box"><span class="checkmark-icon">✔</span></span>
                        <span class="item-name">${item.n}</span>
                    </label>
                    <div class="col-center"><input type="number" class="input-num qty" value="1" oninput="update()"></div>
                    <div class="col-center"><input type="number" class="input-num price" value="${item.p/10000}" oninput="update()"></div>
                    <div class="col-right row-sum">0</div>
                </div>`;
            });

            c.innerHTML = `<div id="fixed-${idx}">${html}</div><div id="dynamic-${idx}"></div>
            <div class="no-print"><button class="btn-add-row" onclick="addCustomRow(${idx})">+ 직접 입력 항목 추가</button></div>`;
            
            cont.appendChild(c); body.appendChild(cont);
        });
    }
    loadFromLocal();
    initTelFormat();
});

function addCustomRow(idx) {
    const div = document.createElement('div'); div.className = `grid-row item-line custom-row`;
    div.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <label class="item-checkbox-wrap" style="width:auto;">
                <input type="checkbox" class="chk" data-name="직접 입력" checked onchange="update()">
                <span class="checkmark-box"><span class="checkmark-icon">✔</span></span>
            </label>
            <input type="text" class="custom-input" placeholder="항목명 입력" oninput="this.previousElementSibling.querySelector('.chk').dataset.name=this.value">
        </div>
        <div class="col-center"><input type="number" class="input-num qty" value="1" oninput="update()"></div>
        <div class="col-center"><input type="number" class="input-num price" value="0" oninput="update()"></div>
        <div class="col-right row-sum" style="display:flex; justify-content:flex-end; align-items:center; gap:10px;">
            <span>0</span> <button class="btn-del-row" onclick="this.closest('.grid-row').remove(); update();">×</button>
        </div>
    `;
    document.getElementById(`dynamic-${idx}`).appendChild(div);
    update();
}

function update() {
    let total = 0;
    document.querySelectorAll('.item-line').forEach(row => {
        const chk = row.querySelector('.chk');
        const qty = parseFloat(row.querySelector('.qty').value) || 0;
        const price = parseFloat(row.querySelector('.price').value) || 0;
        const sumEl = row.querySelector('.row-sum');
        
        if (chk.checked) {
            const sum = qty * price * 10000;
            total += sum;
            if(sumEl.querySelector('span')) sumEl.querySelector('span').innerText = sum.toLocaleString();
            else sumEl.innerText = sum.toLocaleString();
        } else {
            if(sumEl.querySelector('span')) sumEl.querySelector('span').innerText = "0";
            else sumEl.innerText = "0";
        }
    });
    document.getElementById('final-sum').innerText = total.toLocaleString() + " 원";
}

function toggleSec(idx, master) {
    const content = document.getElementById(`c-${idx}`);
    content.querySelectorAll('.chk').forEach(chk => {
        chk.checked = master.checked;
    });
    update();
}

function saveToLocal() {
    const data = {
        name: document.getElementById('g-name').value,
        tel: document.getElementById('g-tel').value,
        addr: document.getElementById('g-addr').value,
        items: [] 
    };
    localStorage.setItem('daham_draft_v2', JSON.stringify(data));
    const t = document.getElementById('toast-msg'); t.className = "toast show"; setTimeout(()=>t.className="toast", 2000);
}

function loadFromLocal() {
    const saved = localStorage.getItem('daham_draft_v2');
    if(saved) {
        const d = JSON.parse(saved);
        if(d.name) document.getElementById('g-name').value = d.name;
        if(d.tel) document.getElementById('g-tel').value = d.tel;
        if(d.addr) document.getElementById('g-addr').value = d.addr;
    }
}

// [Ver 1.28] 스마트 인쇄 (빈 섹션 숨김 로직 추가)
function smartPrint() {
    update();
    const name = document.getElementById('g-name').value;
    if(!name) return alert('고객명을 입력해주세요.');
    
    // 1. 체크 안된 개별 항목 숨기기
    document.querySelectorAll('.item-line').forEach(row => {
        if(!row.querySelector('.chk').checked) row.classList.add('hidden-print');
        else row.classList.remove('hidden-print');
    });
    
    // 2. 모든 섹션 열기 및 빈 섹션 숨기기
    document.querySelectorAll('.section-body').forEach(c => c.classList.add('open'));
    
    // [Ver 1.28] 빈 섹션(대메뉴) 숨김 처리
    data.forEach((_, idx) => {
        const cont = document.getElementById('cont-' + idx);
        const hasCheckedItems = cont.querySelectorAll('.chk:checked').length > 0;
        if (!hasCheckedItems) {
            cont.classList.add('hidden-print');
        } else {
            cont.classList.remove('hidden-print');
        }
    });

    window.print();
    
    // 3. 인쇄 후 복구
    setTimeout(() => {
        document.querySelectorAll('.hidden-print').forEach(el => el.classList.remove('hidden-print'));
        document.querySelectorAll('.section-body').forEach(c => c.classList.remove('open'));
    }, 500);
}

function resetForm() {
    if(confirm('작성 중인 내용을 모두 초기화 하시겠습니까?')) {
        localStorage.removeItem('daham_draft_v2');
        location.reload();
    }
}

function initTelFormat() {
    const telInput = document.getElementById('g-tel');
    if(telInput) {
        telInput.addEventListener('input', function(e) {
            let v = e.target.value.replace(/[^0-9]/g, '');
            if (v.length > 3 && v.length <= 7) e.target.value = v.replace(/(\d{3})(\d{1,4})/, '$1.$2');
            else if (v.length > 7) e.target.value = v.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1.$2.$3');
            else e.target.value = v;
        });
    }
}
