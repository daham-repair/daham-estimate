/* [estimate.js Ver 1.73 - 인쇄 잔상 방지 로직 보강] */

document.addEventListener('DOMContentLoaded', function() {
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div');
            cont.id = 'cont-' + idx;
            const h = document.createElement('div');
            h.className = 'section-bar';
            h.innerHTML = `<div><span class="section-icon">${icons[sec.key] || ''}</span>${sec.category}</div> <span>▼</span>`;
            h.onclick = () => document.getElementById('c-' + idx).classList.toggle('show');
            cont.appendChild(h);
            const c = document.createElement('div');
            c.className = 'section-content'; 
            c.id = 'c-'+idx;
            let html = '';
            if (sec.key !== 'custom') {
                html += `<div class="grid-row quote-grid no-print" style="background:#f8f9fa;"><label class="item-label"><input type="checkbox" onchange="toggleSec(${idx}, this)"><span class="checkmark"></span> <b>전체 선택</b></label></div>`;
            }
            if(sec.isPaint) {
                html += `<div class="grid-row quote-grid no-print" style="background:#fffbe6; border-bottom:2px solid #ffe58f;"><div style="font-weight:bold;">페인트 종류</div><div style="grid-column: span 3;"><select class="info-select" onchange="updatePaintPrice(${idx}, this)"><option value="water">수성 페인트 (12만)</option><option value="elastic">탄성 코트 (22만)</option><option value="ceramic">세라믹 코트 (30만)</option></select></div></div>`;
            }
            sec.items.forEach(item => {
                html += `
                <div class="grid-row quote-grid item-line">
                    <div class="col-name"><label class="item-label"><input type="checkbox" class="chk" data-name="${item.n}" onchange="updateSum()"><span class="checkmark"></span><span class="item-name-text">${item.n}</span></label></div>
                    <div class="col-center"><input type="number" class="input-num qty" value="1" oninput="updateSum()"></div>
                    <div class="col-center"><input type="number" class="input-num price" value="${item.p/10000}" oninput="updateSum()"></div>
                    <div class="col-right row-sum">0</div>
                </div>`;
            });
            c.innerHTML = `<div id="fixed-${idx}">${html}</div><div id="dynamic-${idx}"></div><div class="no-print" style="padding:10px;"><button class="fab-btn btn-reset" style="width:100%; border:1px dashed #ccc; height:44px;" onclick="addCustomRow(${idx})">항목 직접 추가</button></div>`;
            cont.appendChild(c);
            body.appendChild(cont);
        });
    }
    initTelFormat();
});

function validateInputs() {
    const n = document.getElementById('g-name'), t = document.getElementById('g-tel'), a = document.getElementById('g-addr');
    if (!n.value.trim()) { alert("고객명을 입력해주세요."); n.focus(); return false; }
    if (!t.value.trim()) { alert("연락처를 입력해주세요."); t.focus(); return false; }
    if (!a.value.trim()) { alert("현장 주소를 입력해주세요."); a.focus(); return false; }
    return true;
}

// [Ver 1.73] 스마트 인쇄 (메시지 강제 종료 포함)
function smartPrint() {
    if(!validateInputs()) return;
    
    // 메시지 레이어가 보이고 있다면 즉시 닫기
    const toast = document.getElementById('toast-msg');
    if(toast) toast.classList.remove('show');

    document.getElementById('t-name').innerText = document.getElementById('g-name').value;
    document.getElementById('t-tel').innerText = document.getElementById('g-tel').value;
    document.getElementById('t-addr').innerText = document.getElementById('g-addr').value;

    document.querySelectorAll('.item-line').forEach(row => {
        const txt = row.querySelector('.custom-name-input'), span = row.querySelector('.custom-name-print');
        if(txt && span) span.innerText = txt.value || "(내용 없음)";
        if(!row.querySelector('.chk').checked) row.classList.add('hidden-print');
        else row.classList.remove('hidden-print');
    });

    data.forEach((_, i) => {
        const cont = document.getElementById('cont-' + i);
        if(cont.querySelectorAll('.chk:checked').length === 0) cont.classList.add('hidden-print');
        else cont.classList.remove('hidden-print');
    });

    window.print();
    setTimeout(() => { document.querySelectorAll('.hidden-print').forEach(el => el.classList.remove('hidden-print')); }, 1000);
}

function addCustomRow(idx) {
    const target = document.getElementById(`dynamic-${idx}`), div = document.createElement('div');
    div.className = 'grid-row quote-grid item-line';
    div.innerHTML = `
        <div style="display:flex; align-items:flex-start;"><label class="item-label" style="width:auto;"><input type="checkbox" class="chk" checked onchange="updateSum()"><span class="checkmark"></span></label><textarea class="info-input custom-name-input" style="padding:4px; font-size:13px; height:auto; flex:1; min-height:28px; line-height:1.2;" placeholder="항목명" oninput="updateSum()"></textarea><span class="custom-name-print"></span></div>
        <div class="col-center"><input type="number" class="input-num qty" value="1" oninput="updateSum()"></div>
        <div class="col-center"><input type="number" class="input-num price" value="0" oninput="updateSum()"></div>
        <div class="col-right" style="display:flex; align-items:center; justify-content:flex-end;"><span class="row-sum" style="margin-right:5px;">0</span><button class="btn-del-row" onclick="this.closest('.grid-row').remove(); updateSum();">×</button></div>`;
    target.appendChild(div);
    updateSum();
}

function updateSum() {
    let total = 0;
    document.querySelectorAll('.grid-row.item-line').forEach(row => {
        const chk = row.querySelector('.chk');
        if (chk && chk.checked) {
            const sum = (parseFloat(row.querySelector('.qty')?.value)||0) * (parseFloat(row.querySelector('.price')?.value)||0) * 10000;
            total += sum;
            if(row.querySelector('.row-sum')) row.querySelector('.row-sum').innerText = sum.toLocaleString();
        } else if(row.querySelector('.row-sum')) { row.querySelector('.row-sum').innerText = "0"; }
    });
    if(document.getElementById('final-sum')) document.getElementById('final-sum').innerText = total.toLocaleString() + " 원";
    return total;
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
        const rows = document.querySelectorAll(`#c-${idx} .item-line`);
        let groupHasChecked = false;
        rows.forEach(r => { if(r.querySelector('.chk')?.checked) groupHasChecked = true; });
        if(groupHasChecked) {
            const sh = document.createElement('div');
            sh.className = 'grid-row'; sh.style.backgroundColor = '#f8f9fa'; sh.style.fontWeight = 'bold'; sh.style.gridTemplateColumns = '1fr';
            sh.innerText = sec.category; dBody.appendChild(sh);
            rows.forEach(row => {
                const chk = row.querySelector('.chk');
                if(chk && chk.checked) {
                    const nameText = chk.dataset.name || row.querySelector('.custom-name-input')?.value || "직접 입력";
                    const q = row.querySelector('.qty').value, p = row.querySelector('.price').value, sum = q * p * 10000;
                    const div = document.createElement('div');
                    div.className = 'grid-row contract-grid';
                    div.innerHTML = `<div style="white-space:normal;">${nameText}</div><div><textarea class="spec-field" rows="1" placeholder="사양 입력" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea></div><div class="col-center">${q}</div><div class="col-right">${sum.toLocaleString()}</div>`;
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
function saveToLocal() {
    const t = document.getElementById('toast-msg');
    t.classList.add('show'); setTimeout(() => { t.classList.remove('show'); }, 2500);
}

function updatePaintPrice(idx, select) {
    const section = document.getElementById('c-' + idx), val = select.value;
    let price = (val === 'elastic') ? 22 : (val === 'ceramic') ? 30 : 12;
    section.querySelectorAll('.grid-row.item-line').forEach(row => {
        const nameText = row.querySelector('.item-name-text')?.innerText || "";
        if(nameText.includes('베란다')) row.querySelector('.price').value = price;
    });
    updateSum();
}

function toggleSec(idx, master) {
    document.getElementById('c-' + idx).querySelectorAll('.chk').forEach(c => c.checked = master.checked);
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
