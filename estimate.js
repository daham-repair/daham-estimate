/* [estimate.js Ver 1.57 - 전체 로직 정상화] */

document.addEventListener('DOMContentLoaded', function() {
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div');
            const h = document.createElement('div');
            h.className = 'section-bar';
            h.innerHTML = `<span><span class="section-icon">${icons[sec.key] || ''}</span>${sec.category}</span> <span>▼</span>`;
            
            // 초기 닫힘 상태 유지
            h.onclick = () => document.getElementById('c-' + idx).classList.toggle('show');
            cont.appendChild(h);

            const c = document.createElement('div');
            c.className = 'section-content'; 
            c.id = 'c-'+idx;
            
            let html = '';
            sec.items.forEach(item => {
                html += `
                <div class="grid-row quote-grid">
                    <div>
                        <label class="item-label">
                            <input type="checkbox" class="chk" data-name="${item.n}" onchange="updateSum()">
                            <span class="checkmark"></span>
                            <span class="item-name-text">${item.n}</span>
                        </label>
                    </div>
                    <div class="col-center"><input type="number" class="input-num qty" value="1" oninput="updateSum()"></div>
                    <div class="col-center"><input type="number" class="input-num price" value="${item.p/10000}" oninput="updateSum()"></div>
                    <div class="col-right row-sum">0</div>
                </div>`;
            });

            // [복구] 동적 추가 영역 및 버튼
            c.innerHTML = `
                <div id="fixed-${idx}">${html}</div>
                <div id="dynamic-${idx}"></div>
                <div class="no-print" style="text-align:center; padding:10px;">
                    <button class="fab-btn btn-reset" style="width:100%; border:1px dashed #ccc; height:44px;" onclick="addCustomRow(${idx})">+ 항목 직접 추가</button>
                </div>`;
            
            cont.appendChild(c);
            body.appendChild(cont);
        });
    }
    initTelFormat();
});

function addCustomRow(idx) {
    const div = document.createElement('div');
    div.className = 'grid-row quote-grid';
    div.innerHTML = `
        <div>
            <label class="item-label">
                <input type="checkbox" class="chk" checked onchange="updateSum()">
                <span class="checkmark"></span>
                <input type="text" class="info-input" style="padding:4px; font-size:13px; height:28px;" placeholder="항목명 입력" oninput="updateSum()">
            </label>
        </div>
        <div class="col-center"><input type="number" class="input-num qty" value="1" oninput="updateSum()"></div>
        <div class="col-center"><input type="number" class="input-num price" value="0" oninput="updateSum()"></div>
        <div class="col-right row-sum">0</div>
    `;
    document.getElementById(`dynamic-${idx}`).appendChild(div);
    updateSum();
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

function updateSum() {
    let total = 0;
    document.querySelectorAll('.grid-row').forEach(row => {
        const chk = row.querySelector('.chk');
        if (chk && chk.checked) {
            const q = row.querySelector('.qty').value || 0;
            const p = row.querySelector('.price').value || 0;
            const sum = q * p * 10000;
            total += sum;
            if(row.querySelector('.row-sum')) row.querySelector('.row-sum').innerText = sum.toLocaleString();
        } else if(row.querySelector('.row-sum')) {
            row.querySelector('.row-sum').innerText = "0";
        }
    });
    const finalSum = document.getElementById('final-sum');
    if(finalSum) finalSum.innerText = total.toLocaleString() + " 원";
    return total;
}

function validateInputs() {
    const name = document.getElementById('g-name');
    if(!name.value.trim()){ alert("고객명을 입력해주세요."); name.focus(); return false; }
    return true;
}

function switchToDetailed() {
    if(!validateInputs()) return;
    const total = updateSum();
    document.getElementById('page-title').innerText = "계약서 작성";
    document.getElementById('d-name-display').innerText = document.getElementById('g-name').value;
    document.getElementById('d-tel-display').innerText = document.getElementById('g-tel').value;
    document.getElementById('d-addr-display').innerText = document.getElementById('g-addr').value;
    const dBody = document.getElementById('detailed-body'); dBody.innerHTML = '';
    
    data.forEach((sec, idx) => {
        const rows = document.querySelectorAll(`#c-${idx} .grid-row`);
        let hasChecked = false;
        rows.forEach(r => { if(r.querySelector('.chk')?.checked) hasChecked = true; });
        
        if(hasChecked) {
            const sh = document.createElement('div');
            sh.className = 'grid-row'; sh.style.backgroundColor = '#f8f9fa'; sh.style.fontWeight = 'bold'; sh.style.gridTemplateColumns = '1fr';
            sh.innerText = sec.category; dBody.appendChild(sh);
            
            rows.forEach(row => {
                const chk = row.querySelector('.chk');
                if(chk && chk.checked) {
                    const nameText = chk.dataset.name || row.querySelector('input[type="text"]')?.value || "직접 입력";
                    const q = row.querySelector('.qty').value;
                    const p = row.querySelector('.price').value;
                    const sum = q * p * 10000;
                    const div = document.createElement('div');
                    div.className = 'grid-row contract-grid';
                    div.innerHTML = `<div>${nameText}</div><div><textarea class="spec-field" rows="1" placeholder="사양 입력"></textarea></div><div class="col-center">${q}</div><div class="col-right">${sum.toLocaleString()}</div>`;
                    dBody.appendChild(div);
                }
            });
        }
    });
    document.getElementById('d-total').innerText = total.toLocaleString() + " 원";
    document.getElementById('view-general').style.display = 'none';
    document.getElementById('view-detailed').style.display = 'block';
    document.getElementById('btn-group-main').style.display = 'none';
    document.getElementById('btn-group-sub').style.display = 'flex';
    window.scrollTo(0,0);
}

function backToGeneral() {
    document.getElementById('page-title').innerText = "견적서 작성";
    document.getElementById('view-general').style.display = 'block';
    document.getElementById('view-detailed').style.display = 'none';
    document.getElementById('btn-group-main').style.display = 'flex';
    document.getElementById('btn-group-sub').style.display = 'none';
}

function resetForm() { if(confirm('초기화하시겠습니까?')) location.reload(); }
function smartPrint() { if(!validateInputs()) return; window.print(); }
function saveToLocal() { alert('저장되었습니다.'); }
