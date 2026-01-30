/* [estimate.js Ver 1.34 - 최종 로직] */
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
let dbClient = null;

document.addEventListener('DOMContentLoaded', function() {
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div'); cont.id = 'cont-'+idx;
            const h = document.createElement('div'); h.className = 'section-bar';
            
            // [핵심] 화살표에 'arrow-icon' 클래스 추가 -> CSS에서 인쇄 시 숨김 처리됨
            h.innerHTML = `<span class="section-title"><svg class="section-icon" viewBox="0 0 24 24">${icons[sec.key]}</svg> ${sec.category}</span> <span class="arrow-icon">▼</span>`;
            
            h.onclick = () => {
                const target = document.getElementById('c-' + idx);
                const isShown = target.classList.contains('show');
                document.querySelectorAll('.section-content').forEach(c => c.classList.remove('show'));
                if (!isShown) target.classList.add('show');
            };
            cont.appendChild(h);

            const c = document.createElement('div'); c.className = 'section-content'; c.id = 'c-'+idx;
            
            let html = `<div class="grid-row no-print" style="background:#f8f9fa;">
                <label class="item-label"><input type="checkbox" onchange="toggleSec(${idx}, this)"><span class="checkmark"></span> <b>전체 선택</b></label>
            </div>`;

            sec.items.forEach(item => {
                html += `<div class="grid-row item-line">
                    <div class="col-name">
                        <label class="item-label">
                            <input type="checkbox" class="chk" data-name="${item.n}" onchange="update()">
                            <span class="checkmark"></span>
                            <span class="item-name-text">${item.n}</span>
                        </label>
                    </div>
                    <div class="col-qty"><input type="number" class="input-num qty" value="1" oninput="update()"></div>
                    <div class="col-price"><input type="number" class="input-num price" value="${item.p/10000}" oninput="update()"></div>
                    <div class="col-sum row-total">0</div>
                </div>`;
            });

            c.innerHTML = `<div id="fixed-${idx}">${html}</div><div id="dynamic-${idx}"></div>
            <div class="no-print" style="text-align:center;"><button class="btn-add-row" onclick="addCustomRow(${idx})">+ 항목 추가</button></div>`;
            
            cont.appendChild(c); body.appendChild(cont);
        });
    }
    loadFromLocal();
    initTelFormat();
});

function initTelFormat() {
    const telInput = document.getElementById('g-tel');
    if(telInput) {
        telInput.addEventListener('input', function(e) {
            let v = e.target.value.replace(/[^0-9]/g, '');
            if (v.length > 11) v = v.substring(0, 11);
            if (v.length > 3 && v.length <= 7) e.target.value = v.replace(/(\d{3})(\d{1,4})/, '$1-$2');
            else if (v.length > 7) e.target.value = v.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
            else e.target.value = v;
        });
    }
}

function addCustomRow(idx) {
    const div = document.createElement('div'); div.className = `grid-row item-line custom-row-${idx}`;
    div.innerHTML = `
        <div class="col-name" style="display:flex; align-items:center;">
            <label class="item-label" style="width:auto;">
                <input type="checkbox" class="chk" data-name="직접 입력" checked onchange="update()">
                <span class="checkmark"></span>
            </label>
            <input type="text" class="custom-input" placeholder="항목 입력" oninput="this.previousElementSibling.querySelector('.chk').dataset.name=this.value">
        </div>
        <div class="col-qty"><input type="number" class="input-num qty" value="1" oninput="update()"></div>
        <div class="col-price"><input type="number" class="input-num price" value="0" oninput="update()"></div>
        <div class="col-sum row-total" style="display:flex; justify-content:flex-end; align-items:center;">
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

function formatKRW(num) { if (!num && num !== 0) return "0"; return Math.floor(parseFloat(num) * 10000).toLocaleString(); }

function toggleSec(idx, master) {
    const content = document.getElementById(`c-${idx}`);
    content.querySelectorAll('.chk').forEach(chk => {
        chk.checked = master.checked;
    });
    update();
}

function smartPrint() {
    update();
    const name = document.getElementById('g-name').value;
    if(!name) return alert('고객명을 입력해주세요.');
    
    document.querySelectorAll('.item-line').forEach(row => {
        if(!row.querySelector('.chk').checked) row.classList.add('hidden-print');
        else row.classList.remove('hidden-print');
    });
    
    data.forEach((_, idx) => {
        const cont = document.getElementById('cont-' + idx);
        const hasChecked = cont.querySelectorAll('.chk:checked').length > 0;
        if(!hasChecked) {
            cont.classList.add('hidden-print');
        } else {
            cont.classList.remove('hidden-print');
            document.getElementById('c-'+idx).classList.add('show');
        }
    });

    window.print();
    
    setTimeout(() => {
        document.querySelectorAll('.hidden-print').forEach(el => el.classList.remove('hidden-print'));
        document.querySelectorAll('.section-content').forEach(c => c.classList.remove('show'));
    }, 1000);
}

function switchToDetailed() {
    update();
    const name = document.getElementById('g-name').value;
    const tel = document.getElementById('g-tel').value;
    const addr = document.getElementById('g-addr').value;
    if(!name) return alert('고객 정보를 입력해주세요.');

    document.getElementById('d-name-display').innerText = name;
    document.getElementById('d-tel-display').innerText = tel;
    document.getElementById('d-addr-display').innerText = addr;
    
    const dBody = document.getElementById('detailed-body');
    dBody.innerHTML = '';
    let dTotal = 0;

    data.forEach((sec, idx) => {
        const checked = document.querySelectorAll(`#c-${idx} .item-line .chk:checked`);
        if(checked.length > 0) {
            const sh = document.createElement('div');
            sh.className = 'grid-row';
            sh.style.backgroundColor = '#f1f3f5';
            sh.style.fontWeight = 'bold';
            sh.innerText = sec.category;
            dBody.appendChild(sh);

            checked.forEach(chk => {
                const row = chk.closest('.item-line');
                const name = chk.dataset.name || row.querySelector('.custom-input').value;
                const qty = row.querySelector('.qty').value;
                const price = row.querySelector('.price').value;
                const sum = qty * price * 10000;
                dTotal += sum;

                const div = document.createElement('div');
                div.className = 'grid-row';
                div.style.gridTemplateColumns = '2fr 3fr 1fr 2fr';
                div.innerHTML = `
                    <div style="text-align:left;">${name}</div>
                    <div><textarea class="spec-field" rows="1" placeholder="사양 입력"></textarea></div>
                    <div style="text-align:center;">${qty}</div>
                    <div style="text-align:right;">${sum.toLocaleString()}</div>
                `;
                dBody.appendChild(div);
            });
        }
    });
    
    document.getElementById('d-total').innerText = dTotal.toLocaleString() + " 원";
    document.getElementById('view-general').style.display = 'none';
    document.getElementById('view-detailed').style.display = 'block';
    
    document.querySelectorAll('.fab-btn').forEach(b => b.style.display = 'none');
    document.getElementById('btn-back').style.display = 'flex';
    document.getElementById('btn-print-cont').style.display = 'flex';
    window.scrollTo(0,0);
}

function backToGeneral() {
    document.getElementById('view-detailed').style.display = 'none';
    document.getElementById('view-general').style.display = 'block';
    document.querySelectorAll('.fab-btn').forEach(b => b.style.display = 'flex');
    document.getElementById('btn-back').style.display = 'none';
    document.getElementById('btn-print-cont').style.display = 'none';
}

function saveToLocal() {
    const t = document.getElementById('toast-msg'); t.className = "toast show"; setTimeout(()=>t.className="toast", 2000);
}
function loadFromLocal() {}
function resetForm() { if(confirm('초기화?')) location.reload(); }
function printContract() { window.print(); }
