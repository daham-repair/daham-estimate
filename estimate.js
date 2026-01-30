/* [estimate.js Ver 1.51] */
document.addEventListener('DOMContentLoaded', function() {
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div');
            const h = document.createElement('div');
            h.className = 'section-bar';
            // 금색 아이콘 및 제목
            h.innerHTML = `<span><span class="section-icon">${icons[sec.key] || ''}</span>${sec.category}</span> <span>▼</span>`;
            
            // 클릭 시에만 토글
            h.onclick = () => document.getElementById('c-' + idx).classList.toggle('show');
            cont.appendChild(h);

            // [픽스] 초기 상태는 show 클래스 없음 (닫힘)
            const c = document.createElement('div');
            c.className = 'section-content'; 
            c.id = 'c-'+idx;
            
            let html = '';
            sec.items.forEach(item => {
                html += `
                <div class="grid-row quote-grid">
                    <div>
                        <label class="item-label">
                            <input type="checkbox" class="chk" onchange="updateSum()">
                            <span class="checkmark"></span>
                            <span>${item.n}</span>
                        </label>
                    </div>
                    <div class="col-center"><input type="number" class="input-num qty" value="1" oninput="updateSum()"></div>
                    <div class="col-center"><input type="number" class="input-num price" value="${item.p/10000}" oninput="updateSum()"></div>
                    <div class="col-right row-sum">0</div>
                </div>`;
            });
            c.innerHTML = html;
            cont.appendChild(c);
            body.appendChild(cont);
        });
    }
});

function updateSum() {
    let total = 0;
    document.querySelectorAll('.grid-row').forEach(row => {
        const chk = row.querySelector('.chk');
        if (chk && chk.checked) {
            const q = row.querySelector('.qty').value;
            const p = row.querySelector('.price').value;
            const sum = q * p * 10000;
            total += sum;
            row.querySelector('.row-sum').innerText = sum.toLocaleString();
        } else if(row.querySelector('.row-sum')) {
            row.querySelector('.row-sum').innerText = "0";
        }
    });
    document.getElementById('final-sum').innerText = total.toLocaleString() + " 원";
}

function switchToDetailed() {
    document.getElementById('page-title').innerText = "계약서 작성";
    document.getElementById('view-general').style.display = 'none';
    document.getElementById('view-detailed').style.display = 'block';
    document.getElementById('btn-group-main').style.display = 'none';
    document.getElementById('btn-group-sub').style.display = 'flex';
}
