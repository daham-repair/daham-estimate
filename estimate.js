/* [estimate.js Ver 1.26 - 핵심 로직 및 인쇄 최적화] */
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
let dbClient = null;

document.addEventListener('DOMContentLoaded', function() {
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div');
            const h = document.createElement('div'); h.className = 'section-header';
            h.innerHTML = `<span><svg class="section-icon" viewBox="0 0 24 24">${icons[sec.key]}</svg> ${sec.category}</span> <span>▼</span>`;
            
            // [Ver 1.26] 아코디언 로직 (클릭한 섹션만 열기)
            h.onclick = () => {
                const c = document.getElementById('c-' + idx);
                const isShown = c.classList.contains('show');
                document.querySelectorAll('.section-content').forEach(el => el.classList.remove('show'));
                if(!isShown) c.classList.add('show');
            };
            cont.appendChild(h);

            const c = document.createElement('div'); c.className = 'section-content'; c.id = 'c-'+idx;
            
            // 1. 벌크 행 (전체선택)
            let html = `<div class="grid-row no-print" style="background:#f8f9fa;">
                <label class="item-label"><input type="checkbox" onchange="toggleSec(${idx}, this)"><span class="checkmark"></span> 전체선택</label>
            </div>`;

            // 2. 기본 항목 렌더링
            sec.items.forEach(item => {
                html += `<div class="grid-row item-line">
                    <div class="col-name">
                        <label class="item-label">
                            <input type="checkbox" class="chk" data-name="${item.n}" onchange="update()">
                            <span class="checkmark"></span>
                            <span class="item-name-text">${item.n}</span>
                        </label>
                    </div>
                    <div class="col-qty"><input type="number" class="in-num qty" value="1" oninput="update()"></div>
                    <div class="col-price"><input type="number" class="in-num price" value="${item.p/10000}" oninput="update()"></div>
                    <div class="col-sum row-total">0</div>
                </div>`;
            });

            c.innerHTML = `<div id="fixed-${idx}">${html}</div><div id="dynamic-${idx}"></div>
            <div class="no-print" style="text-align:center;"><button class="btn-add-row" onclick="addCustomRow(${idx})">+ 항목 추가</button></div>`;
            
            cont.appendChild(c); body.appendChild(cont);
        });
    }
    loadFromLocal();
    
    // 전화번호 포맷팅
    const telInput = document.getElementById('g-tel');
    if(telInput) {
        telInput.addEventListener('input', function(e) {
            let v = e.target.value.replace(/[^0-9]/g, '');
            if (v.length > 3 && v.length <= 7) e.target.value = v.replace(/(\d{3})(\d{1,4})/, '$1.$2');
            else if (v.length > 7) e.target.value = v.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1.$2.$3');
            else e.target.value = v;
        });
    }
});

// [Ver 1.26] 동적 행 추가 (레이아웃 클래스 적용)
function addCustomRow(idx) {
    const div = document.createElement('div'); div.className = `grid-row item-line custom-row-${idx}`;
    div.innerHTML = `
        <div class="col-name" style="display:flex; align-items:center;">
            <label class="item-label" style="width:auto;">
                <input type="checkbox" class="chk" data-name="직접 입력" checked onchange="update()">
                <span class="checkmark"></span>
            </label>
            <input type="text" class="custom-name" placeholder="입력" oninput="this.previousElementSibling.querySelector('.chk').dataset.name=this.value">
        </div>
        <div class="col-qty"><input type="number" class="in-num qty" value="1" oninput="update()"></div>
        <div class="col-price"><input type="number" class="in-num price" value="0" oninput="update()"></div>
        <div class="col-sum row-total" style="display:flex; justify-content:flex-end; align-items:center;">
            <span>0</span> <button class="btn-del" onclick="this.closest('.grid-row').remove(); update();">×</button>
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
        const sumEl = row.querySelector('.row-total');
        
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
    
    // [Ver 1.26] 저장 로직: 체크된 항목만 저장
    document.querySelectorAll('.item-line').forEach((row) => {
        const chk = row.querySelector('.chk');
        if(chk.checked) {
            // 섹션 인덱스 찾기 (row의 부모의 부모 ID에서 추출 등 복잡하므로 간단히 저장)
            // 여기서는 고도화된 저장 로직이 필요하면 추가 구현 가능
        }
    });
    
    localStorage.setItem('daham_estimate_draft', JSON.stringify(data));
    const t = document.getElementById('toast-msg'); t.className = "toast show"; setTimeout(()=>t.className="toast", 2000);
}

function loadFromLocal() {
    const saved = localStorage.getItem('daham_estimate_draft');
    if(saved) {
        const d = JSON.parse(saved);
        if(d.name) document.getElementById('g-name').value = d.name;
        if(d.tel) document.getElementById('g-tel').value = d.tel;
        if(d.addr) document.getElementById('g-addr').value = d.addr;
    }
}

// [Ver 1.26] 견적발행 (인쇄 시 숨김 처리)
function smartPrint() {
    update();
    const name = document.getElementById('g-name').value;
    if(!name) return alert('고객명을 입력하세요');
    
    // 체크 안된 것 숨기기
    document.querySelectorAll('.item-line').forEach(row => {
        if(!row.querySelector('.chk').checked) row.classList.add('hidden-print');
        else row.classList.remove('hidden-print');
    });
    
    // 섹션 내용 열기 (인쇄용)
    document.querySelectorAll('.section-content').forEach(c => c.classList.add('show'));

    window.print();
    
    // 복구 (인쇄 후 다시 원래대로)
    setTimeout(() => {
        document.querySelectorAll('.hidden-print').forEach(el => el.classList.remove('hidden-print'));
        document.querySelectorAll('.section-content').forEach(c => c.classList.remove('show'));
    }, 1000);
}

function resetForm() {
    if(confirm('초기화 하시겠습니까?')) {
        localStorage.removeItem('daham_estimate_draft');
        location.reload();
    }
}

function switchToDetailed() {
    alert("계약서 기능은 준비 중입니다.");
}

function printContract() {
    window.print();
}
