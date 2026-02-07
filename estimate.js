/* [estimate.js Ver 3.0 - DB 수정 연동] */

let currentEstimateId = null; // 현재 불러온 견적서 ID 저장용

document.addEventListener('DOMContentLoaded', function() {
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        body.innerHTML = ''; 
        data.forEach((sec, idx) => {
            const cont = document.createElement('div'); cont.id = 'cont-' + idx;
            const h = document.createElement('div'); h.className = 'section-bar';
            h.innerHTML = `<div><span class="section-icon">${icons[sec.key] || ''}</span>${sec.category}</div> <span>▼</span>`;
            h.onclick = () => document.getElementById('c-' + idx).classList.toggle('show');
            cont.appendChild(h);

            const c = document.createElement('div'); c.className = 'section-content'; c.id = 'c-'+idx;
            let html = '';
            if (sec.key !== 'custom') {
                html += `<div class="grid-row quote-grid no-print" style="background:#f8f9fa;"><label class="item-label"><input type="checkbox" onchange="toggleSec(${idx}, this)"><span class="checkmark"></span> <b>전체 선택</b></label></div>`;
            }
            sec.items.forEach((item) => {
                let paintSelectHtml = '';
                let initialPrice = item.p / 10000; 
                if(sec.category === '페인트' || sec.key === 'paint') {
                    initialPrice = 0; 
                    paintSelectHtml = `
                        <select class="info-select no-print paint-selector" style="margin-top:5px; padding:6px; font-size:13px;" onchange="changePaintPrice(this)">
                            <option value="0" disabled selected>도료 선택</option>
                            <option value="13">수성 (13만)</option>
                            <option value="23">탄성 (23만)</option>
                            <option value="37">세라믹 (37만)</option>
                        </select>`;
                }
                html += `
                <div class="grid-row quote-grid item-line">
                    <div class="col-name">
                        <label class="item-label">
                            <input type="checkbox" class="chk" data-name="${item.n}" data-origin-name="${item.n}" onchange="updateSum()">
                            <span class="checkmark"></span>
                            <div><span class="item-name-text">${item.n}</span>${paintSelectHtml}</div>
                        </label>
                    </div>
                    <div class="col-center"><input type="number" class="input-num qty" value="1" oninput="updateSum()"></div>
                    <div class="col-center"><input type="number" class="input-num price" value="${initialPrice}" oninput="updateSum()"></div>
                    <div class="col-right row-sum">0</div>
                </div>`;
            });
            c.innerHTML = `<div id="fixed-${idx}">${html}</div><div id="dynamic-${idx}"></div><div class="no-print" style="padding:15px;"><button class="info-select" style="width:100%; border:1px dashed #ccc; padding:12px; color:#888; cursor:pointer;" onclick="addCustomRow(${idx})">+ 항목 직접 추가</button></div>`;
            cont.appendChild(c); body.appendChild(cont);
        });
    }
    initTelFormat(); initDate();
    
    // URL에서 load_id 확인 후 데이터 로드
    const urlParams = new URLSearchParams(window.location.search);
    const loadId = urlParams.get('load_id');
    if(loadId) loadFromDB(loadId);
});

function changePaintPrice(selectEl) {
    const row = selectEl.closest('.grid-row'), priceInput = row.querySelector('.price'), nameText = row.querySelector('.item-name-text'), chk = row.querySelector('.chk');
    if(selectEl.value !== "0") priceInput.value = selectEl.value;
    let baseName = chk.getAttribute('data-origin-name') || chk.dataset.name.split('(')[0];
    chk.setAttribute('data-origin-name', baseName);
    const optionText = selectEl.options[selectEl.selectedIndex].text.split(' ')[0], newName = `${baseName}(${optionText})`;
    nameText.innerText = newName; chk.dataset.name = newName; chk.checked = true; updateSum();
}

function loadFromDB(id) {
    fetch('/get_estimate/' + id)
    .then(res => res.json())
    .then(savedData => {
        if(savedData.error) { alert("데이터를 찾을 수 없습니다."); return; }
        currentEstimateId = savedData.id; // 현재 ID 저장
        document.getElementById('g-name').value = savedData.name || '';
        document.getElementById('g-tel').value = savedData.tel || '';
        document.getElementById('g-addr').value = savedData.addr || '';
        const details = savedData.details;
        details.forEach(item => {
            const secIdx = data.findIndex(d => d.category === item.c);
            if(secIdx === -1) return;
            const sectionDiv = document.getElementById(`c-${secIdx}`);
            let foundCheckbox = null;
            sectionDiv.querySelectorAll('.chk').forEach(chk => {
                const origin = chk.getAttribute('data-origin-name') || chk.dataset.name;
                if(item.n.includes(origin)) foundCheckbox = chk;
            });
            if(foundCheckbox) {
                foundCheckbox.checked = true;
                const row = foundCheckbox.closest('.grid-row');
                row.querySelector('.qty').value = item.q; row.querySelector('.price').value = item.p;
                const selectEl = row.querySelector('select');
                if(selectEl) {
                    if(item.n.includes('수성')) selectEl.value = 13;
                    else if(item.n.includes('탄성')) selectEl.value = 23;
                    else if(item.n.includes('세라믹')) selectEl.value = 37;
                }
                row.querySelector('.item-name-text').innerText = item.n; foundCheckbox.dataset.name = item.n;
            } else { addCustomRow(secIdx, item.n, item.q, item.p); }
            sectionDiv.classList.add('show');
        });
        updateSum();
    }).catch(err => alert("데이터 로드 중 오류 발생"));
}

function updateSum() {
    let supplyTotal = 0; 
    document.querySelectorAll('.grid-row.item-line').forEach(row => {
        const chk = row.querySelector('.chk');
        if (chk && chk.checked) {
            const q = parseFloat(row.querySelector('.qty').value) || 0, p = parseFloat(row.querySelector('.price').value) || 0;
            const sum = q * p * 10000; supplyTotal += sum;
            if(row.querySelector('.row-sum')) row.querySelector('.row-sum').innerText = sum.toLocaleString();
        } else if(row.querySelector('.row-sum')) row.querySelector('.row-sum').innerText = "0";
    });
    const vat = Math.floor(supplyTotal * 0.1), finalTotal = supplyTotal + vat;
    if(document.getElementById('total-supply')) document.getElementById('total-supply').innerText = supplyTotal.toLocaleString() + " 원";
    if(document.getElementById('total-vat')) document.getElementById('total-vat').innerText = vat.toLocaleString() + " 원";
    if(document.getElementById('final-sum')) document.getElementById('final-sum').innerText = finalTotal.toLocaleString() + " 원";
}

function saveToDB() {
    if(!validateInputs()) return;
    let details = [];
    data.forEach((sec, idx) => {
        document.querySelectorAll(`#c-${idx} .item-line`).forEach(row => {
            const chk = row.querySelector('.chk');
            if(chk && chk.checked) {
                let name = chk.dataset.name || row.querySelector('.custom-name-input')?.value || "직접 입력";
                details.push({ c: sec.category, n: name, q: row.querySelector('.qty').value, p: row.querySelector('.price').value });
            }
        });
    });
    const totalStr = document.getElementById('final-sum').innerText.replace(/[^0-9]/g, '');
    const dataToSend = { 
        id: currentEstimateId, // ID가 있으면 업데이트, 없으면 신규
        name: document.getElementById('g-name').value, 
        tel: document.getElementById('g-tel').value, 
        addr: document.getElementById('g-addr').value, 
        total: parseInt(totalStr), 
        details: details 
    };
    fetch('/save_estimate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend) })
    .then(res => res.json()).then(data => {
        alert(data.msg);
        if(data.id) currentEstimateId = data.id; // 신규 저장 시 생성된 ID 저장
    }).catch(err => alert("저장 중 오류 발생"));
}

// 나머지 헬퍼 함수들 (validateInputs, smartPrint, resetForm 등 기존과 동일)
function validateInputs() {
    const n = document.getElementById('g-name'), t = document.getElementById('g-tel'), a = document.getElementById('g-addr');
    if (!n.value.trim()) { alert("고객명을 입력해주세요."); n.focus(); return false; }
    if (!t.value.trim()) { alert("연락처를 입력해주세요."); t.focus(); return false; }
    if (!a.value.trim()) { alert("현장 주소를 입력해주세요."); a.focus(); return false; }
    return true;
}
function smartPrint() {
    if(!validateInputs()) return;
    document.getElementById('t-name').innerText = document.getElementById('g-name').value;
    document.getElementById('t-tel').innerText = document.getElementById('g-tel').value;
    document.getElementById('t-addr').innerText = document.getElementById('g-addr').value;
    document.querySelectorAll('.item-line').forEach(row => {
        const input = row.querySelector('.custom-name-input'), printSpan = row.querySelector('.custom-name-print');
        if(input && printSpan) printSpan.innerText = input.value;
        const chk = row.querySelector('.chk');
        if(chk && !chk.checked) row.classList.add('hidden-print'); else row.classList.remove('hidden-print');
    });
    data.forEach((_, idx) => {
        const container = document.getElementById(`cont-${idx}`), content = document.getElementById(`c-${idx}`);
        if(content.querySelectorAll('.item-line:not(.hidden-print)').length === 0) container.classList.add('hidden-print');
        else { container.classList.remove('hidden-print'); content.classList.add('show'); }
    });
    window.print();
    setTimeout(() => { document.querySelectorAll('.hidden-print').forEach(el => el.classList.remove('hidden-print')); }, 500);
}
function addCustomRow(idx, nameVal='', qtyVal=1, priceVal=0) {
    const target = document.getElementById(`dynamic-${idx}`), div = document.createElement('div');
    div.className = 'grid-row quote-grid item-line';
    div.innerHTML = `<div class="col-name" style="display:flex; align-items:center; gap:5px;"><label class="item-label" style="width:auto;"><input type="checkbox" class="chk" checked onchange="updateSum()"><span class="checkmark"></span></label><input type="text" class="info-input custom-name-input" placeholder="항목명 입력" value="${nameVal}" oninput="updateSum()"><span class="custom-name-print"></span></div><div class="col-center"><input type="number" class="input-num qty" value="${qtyVal}" oninput="updateSum()"></div><div class="col-center"><input type="number" class="input-num price" value="${priceVal}" oninput="updateSum()"></div><div class="col-right"><span class="row-sum">0</span><button class="btn-del-row" onclick="this.closest('.grid-row').remove(); updateSum();">×</button></div>`;
    target.appendChild(div); document.getElementById(`c-${idx}`).classList.add('show'); updateSum();
}
function resetForm() { if(confirm('입력된 내용을 모두 지우시겠습니까?')) location.reload(); }
function toggleSec(idx, master) { document.querySelectorAll(`#c-${idx} .chk`).forEach(c => c.checked = master.checked); updateSum(); }
function initDate() { document.getElementById('today-date').innerText = new Date().toLocaleDateString(); }
function initTelFormat() {
    const t = document.getElementById('g-tel');
    if(t) t.addEventListener('input', e => {
        let v = e.target.value.replace(/[^0-9]/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        if (v.length > 7) e.target.value = v.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
        else if (v.length > 3) e.target.value = v.replace(/(\d{3})(\d{1,4})/, '$1-$2');
        else e.target.value = v;
    });
}