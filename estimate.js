/* [estimate.js Ver 1.25 - 라인 정렬 및 체크박스 로직] */
document.addEventListener('DOMContentLoaded', function() {
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div');
            const h = document.createElement('div'); h.className = 'section-header';
            h.innerHTML = `<span><svg class="section-icon" viewBox="0 0 24 24">${icons[sec.key]}</svg> ${sec.category}</span> <span>▼</span>`;
            
            // 아코디언
            h.onclick = () => {
                const c = document.getElementById('c-' + idx);
                const isShown = c.classList.contains('show');
                document.querySelectorAll('.section-content').forEach(el => el.classList.remove('show'));
                if(!isShown) c.classList.add('show');
            };
            cont.appendChild(h);

            const c = document.createElement('div'); c.className = 'section-content'; c.id = 'c-'+idx;
            
            // 1. 벌크 행
            let html = `<div class="grid-row no-print" style="background:#f8f9fa;">
                <label class="item-label"><input type="checkbox" onchange="toggleSec(${idx}, this)"><span class="checkmark"></span> 전체선택</label>
            </div>`;

            // 2. 기본 항목
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
});

function addCustomRow(idx) {
    const div = document.createElement('div'); div.className = `grid-row item-line custom-row-${idx}`;
    div.innerHTML = `
        <div class="col-name" style="display:flex;">
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
            // row-total 안에 span이나 텍스트 노드가 있을 수 있음
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
    // 저장 로직 (간소화됨, 필요시 이전 버전 로직 전체 복사 권장)
    localStorage.setItem('daham_draft', JSON.stringify(data));
    const t = document.getElementById('toast-msg'); t.className = "toast show"; setTimeout(()=>t.className="toast", 2000);
}

function loadFromLocal() {
    const saved = localStorage.getItem('daham_draft');
    if(saved) {
        const d = JSON.parse(saved);
        if(d.name) document.getElementById('g-name').value = d.name;
        if(d.tel) document.getElementById('g-tel').value = d.tel;
        if(d.addr) document.getElementById('g-addr').value = d.addr;
    }
}

function smartPrint() {
    update();
    const name = document.getElementById('g-name').value;
    if(!name) return alert('고객명을 입력하세요');
    
    // 체크 안된 것 숨기기
    document.querySelectorAll('.item-line').forEach(row => {
        if(!row.querySelector('.chk').checked) row.classList.add('hidden-print');
        else row.classList.remove('hidden-print');
    });
    
    window.print();
    
    // 복구
    setTimeout(() => {
        document.querySelectorAll('.hidden-print').forEach(el => el.classList.remove('hidden-print'));
    }, 1000);
}

function resetForm() {
    if(confirm('초기화 하시겠습니까?')) {
        localStorage.removeItem('daham_draft');
        location.reload();
    }
}
