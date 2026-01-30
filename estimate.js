/* [estimate.js Ver 1.50] */
document.addEventListener('DOMContentLoaded', function() {
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div');
            const h = document.createElement('div');
            h.className = 'section-bar';
            h.innerHTML = `<span>${sec.category}</span> <span>▼</span>`;
            
            // 클릭 시 열고 닫기
            h.onclick = () => {
                const target = document.getElementById('c-' + idx);
                target.classList.toggle('show');
            };
            cont.appendChild(h);

            // [핵심] 초기 상태: show 클래스 없음 (닫혀있음)
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
                    <div class="col-center"><input type="number" class="input-num" value="1"></div>
                    <div class="col-center"><input type="number" class="input-num" value="${item.p/10000}"></div>
                    <div class="col-right">0</div>
                </div>`;
            });
            c.innerHTML = html;
            cont.appendChild(c);
            body.appendChild(cont);
        });
    }
});

function updateSum() { /* 합계 계산 로직 */ }
