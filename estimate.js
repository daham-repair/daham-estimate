/* [estimate.js Ver 1.49 - 초기 닫힘 및 체크박스 픽스] */

document.addEventListener('DOMContentLoaded', function() {
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div'); cont.id = 'cont-'+idx;
            const h = document.createElement('div'); h.className = 'section-bar';
            h.innerHTML = `<span class="section-title"><span class="section-icon">${icons[sec.key]}</span> ${sec.category}</span> <span class="arrow-icon">▼</span>`;
            
            h.onclick = () => {
                const target = document.getElementById('c-' + idx);
                target.classList.toggle('show');
            };
            cont.appendChild(h);

            // [Ver 1.49] 초기 상태: show 클래스 없이 생성 (닫힌 상태)
            const c = document.createElement('div'); c.className = 'section-content'; c.id = 'c-'+idx;
            
            let html = `<div class="grid-row quote-grid no-print" style="background:#f8f9fa;">
                <label class="item-label">
                    <input type="checkbox" onchange="toggleSec(${idx}, this)">
                    <span class="checkmark"></span> <b>전체 선택</b>
                </label>
            </div>`;

            sec.items.forEach(item => {
                html += `<div class="grid-row item-line quote-grid">
                    <div class="col-name">
                        <label class="item-label">
                            <input type="checkbox" class="chk" data-name="${item.n}" onchange="update()">
                            <span class="checkmark"></span>
                            <span class="item-name-text">${item.n}</span>
                        </label>
                    </div>
                    <div class="col-qty"><input type="number" class="input-num qty" value="1" oninput="update()"></div>
                    <div class="col-price"><input type="number" class="input-num price" value="${item.p/10000}" oninput="update()"></div>
                    <div class="col-sum row-sum">0</div>
                </div>`;
            });

            c.innerHTML = `<div id="fixed-${idx}">${html}</div><div id="dynamic-${idx}"></div>
            <div class="no-print" style="text-align:center;"><button class="btn-add-row" style="width:90%; padding:10px; margin:10px auto; border:1px dashed #ccc; background:#fff; cursor:pointer;" onclick="addCustomRow(${idx})">+ 항목 추가</button></div>`;
            
            cont.appendChild(c); body.appendChild(cont);
        });
    }
    loadFromLocal();
    initTelFormat();
});

function validateInputs() {
    const nameEl = document.getElementById('g-name');
    const telEl = document.getElementById('g-tel');
    const addrEl = document.getElementById('g-addr');
    if(!nameEl.value.trim()){ alert("고객명을 입력해주세요."); nameEl.focus(); return false; }
    if(!telEl.value.trim()){ alert("연락처를 입력해주세요."); telEl.focus(); return false; }
    if(!addrEl.value.trim()){ alert("현장 주소를 입력해주세요."); addrEl.focus(); return false; }
    return true;
}

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

function update() {
    let total = 0;
    document.querySelectorAll('.item-line').forEach(row => {
        const chk = row.querySelector('.chk');
        const qty = parseFloat(row.querySelector('.qty').value) || 0;
        const price = parseFloat(row.querySelector('.price').value) || 0;
        if (chk && chk.checked) {
            const sum = qty * price * 10000; total += sum;
            row.querySelector('.row-sum').innerText = sum.toLocaleString();
        } else if(row.querySelector('.row-sum')) { row.querySelector('.row-sum').innerText = "0"; }
    });
    document.getElementById('final-sum').innerText = total.toLocaleString() + " 원";
}

function toggleSec(idx, master) {
    const content = document.getElementById(`c-${idx}`);
    content.querySelectorAll('.chk').forEach(chk => { chk.checked = master.checked; });
    update();
}

function switchToDetailed() {
    if(!validateInputs()) return;
    update();
    document.getElementById('view-general').style.display = 'none';
    document.getElementById('view-detailed').style.display = 'block';
    document.getElementById('btn-group-main').style.display = 'none';
    document.getElementById('btn-group-sub').style.display = 'flex';
    window.scrollTo(0,0);
}

function backToGeneral() {
    document.getElementById('view-detailed').style.display = 'none';
    document.getElementById('view-general').style.display = 'block';
    document.getElementById('btn-group-main').style.display = 'flex';
    document.getElementById('btn-group-sub').style.display = 'none';
}

function saveToLocal() { const t = document.getElementById('toast-msg'); t.className = "toast show"; setTimeout(()=>t.className="toast", 2000); }
function loadFromLocal() {}
function resetForm() { if(confirm('초기화하시겠습니까?')) location.reload(); }
function printContract() { window.print(); }
function smartPrint() { if(!validateInputs()) return; window.print(); }
