/* [estimate.js Ver 1.61 - 발행 필터링 및 텍스트 변환 로직] */

document.addEventListener('DOMContentLoaded', function() {
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div');
            cont.id = 'cont-' + idx; // 섹션 ID 부여
            const h = document.createElement('div');
            h.className = 'section-bar';
            h.innerHTML = `<div><span class="section-icon">${icons[sec.key] || ''}</span>${sec.category}</div> <span>▼</span>`;
            h.onclick = () => document.getElementById('c-' + idx).classList.toggle('show');
            cont.appendChild(h);

            const c = document.createElement('div');
            c.className = 'section-content'; 
            c.id = 'c-'+idx;
            
            let html = '';
            sec.items.forEach(item => {
                html += `
                <div class="grid-row quote-grid item-line">
                    <div class="col-name">
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

// [Ver 1.61 핵심] 견적 발행용 스마트 인쇄 함수
function smartPrint() {
    const name = document.getElementById('g-name').value;
    const tel = document.getElementById('g-tel').value;
    const addr = document.getElementById('g-addr').value;

    if(!name.trim()){ alert("고객명을 입력해주세요."); return; }

    // 1. 입력값을 정적 텍스트로 동기화
    document.getElementById('t-name').innerText = name;
    document.getElementById('t-tel').innerText = tel;
    document.getElementById('t-addr').innerText = addr;

    // 2. 미체크 항목 및 빈 섹션 필터링
    document.querySelectorAll('.item-line').forEach(row => {
        const isChecked = row.querySelector('.chk').checked;
        if(!isChecked) row.classList.add('hidden-print');
        else row.classList.remove('hidden-print');
    });

    data.forEach((_, idx) => {
        const cont = document.getElementById('cont-' + idx);
        const hasChecked = cont.querySelectorAll('.chk:checked').length > 0;
        if(!hasChecked) cont.classList.add('hidden-print');
        else cont.classList.remove('hidden-print');
    });

    // 3. 출력 후 복구
    window.print();
    setTimeout(() => {
        document.querySelectorAll('.hidden-print').forEach(el => el.classList.remove('hidden-print'));
    }, 1000);
}

function addCustomRow(idx) {
    const target = document.getElementById(`dynamic-${idx}`);
    const div = document.createElement('div');
    div.className = 'grid-row quote-grid item-line';
    div.innerHTML = `
        <div style="display:flex; align-items:flex-start;">
            <label class="item-label" style="width:auto;">
                <input type="checkbox" class="chk" checked onchange="updateSum()">
                <span class="checkmark"></span>
            </label>
            <textarea class="info-input" style="padding:4px; font-size:13px; height:auto; flex:1; min-height:28px; line-height:1.2;" placeholder="항목명" oninput="updateSum()"></textarea>
        </div>
        <div class="col-center"><input type="number" class="input-num qty" value="1" oninput="updateSum()"></div>
        <div class="col-center"><input type="number" class="input-num price" value="0" oninput="updateSum()"></div>
        <div class="col-right" style="display:flex; align-items:center; justify-content:flex-end;">
            <span class="row-sum" style="margin-right:5px;">0</span>
            <button class="btn-del-row" onclick="this.closest('.grid-row').remove(); updateSum();">×</button>
        </div>
    `;
    target.appendChild(div);
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
    document.querySelectorAll('.grid-row.item-line').forEach(row => {
        const chk = row.querySelector('.chk');
        if (chk && chk.checked) {
            const q = row.querySelector('.qty')?.value || 0;
            const p = row.querySelector('.price')?.value || 0;
            const sum = q * p * 10000;
            total += sum;
            const sEl = row.querySelector('.row-sum');
            if(sEl) sEl.innerText = sum.toLocaleString();
        } else if(row.querySelector('.row-sum')) {
            row.querySelector('.row-sum').innerText = "0";
        }
    });
    const fs = document.getElementById('final-sum');
    if(fs) fs.innerText = total.toLocaleString() + " 원";
    return total;
}

function switchToDetailed() {
    const name = document.getElementById('g-name').value;
    if(!name.trim()){ alert("고객명을 입력해주세요."); return; }
    
    const total = updateSum();
    document.getElementById('page-title').innerText = "계약서 작성";
    document.getElementById('d-name-display').innerText = name;
    document.getElementById('d-tel-display').innerText = document.getElementById('g-tel').value;
    document.getElementById('d-addr-display').innerText = document.getElementById('g-addr').value;
    const dBody = document.getElementById('detailed-body'); dBody.innerHTML = '';
    
    data.forEach((sec, idx) => {
        const rows = document.querySelectorAll(`#c-${idx} .item-line`);
        let hasChecked = false;
        rows.forEach(r => { if(r.querySelector('.chk')?.checked) hasChecked = true; });
        if(hasChecked) {
            const sh = document.createElement('div');
            sh.className = 'grid-row'; sh.style.backgroundColor = '#f8f9fa'; sh.style.fontWeight = 'bold'; sh.style.gridTemplateColumns = '1fr';
            sh.innerText = sec.category; dBody.appendChild(sh);
            rows.forEach(row => {
                const chk = row.querySelector('.chk');
                if(chk && chk.checked) {
                    const nameText = chk.dataset.name || row.querySelector('textarea')?.value || "직접 입력";
                    const q = row.querySelector('.qty').value;
                    const sum = q * row.querySelector('.price').value * 10000;
                    const div = document.createElement('div');
                    div.className = 'grid-row contract-grid';
                    div.innerHTML = `<div style="white-space:normal;">${nameText}</div><div><textarea class="spec-field" rows="1" placeholder="사양 입력"></textarea></div><div class="col-center">${q}</div><div class="col-right">${sum.toLocaleString()}</div>`;
                    dBody.appendChild(div);
                }
            });
        }
    });
    document.getElementById('d-total').innerText = total.toLocaleString() + " 원";
    document.getElementById('view-general').style.display = 'none';
    document.getElementById('view-detailed').style.display = 'block';
    document.getElementById('btn-group-main').classList.remove('active');
    document.getElementById('btn-group-sub').classList.add('active');
    window.scrollTo(0,0);
}

function backToGeneral() {
    document.getElementById('page-title').innerText = "견적서 작성";
    document.getElementById('view-general').style.display = 'block';
    document.getElementById('view-detailed').style.display = 'none';
    document.getElementById('btn-group-main').classList.add('active');
    document.getElementById('btn-group-sub').classList.remove('active');
}

function resetForm() { if(confirm('초기화하시겠습니까?')) location.reload(); }
function saveToLocal() { alert('저장되었습니다.'); }
