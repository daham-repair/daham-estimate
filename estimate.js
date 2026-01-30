/* [estimate.js Ver 1.51 - 초기 닫힘 고정] */
document.addEventListener('DOMContentLoaded', function() {
    const body = document.getElementById('estimate-body');
    if(body && typeof data !== 'undefined') {
        data.forEach((sec, idx) => {
            const cont = document.createElement('div');
            const h = document.createElement('div');
            h.className = 'section-bar';
            h.innerHTML = `<span>${sec.category}</span> <span>▼</span>`;
            h.onclick = () => document.getElementById('c-' + idx).classList.toggle('show');
            cont.appendChild(h);

            // [요청사항 2] 초기 상태는 show 클래스 없이 생성 (닫힌 상태)
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
                    <div class="col-center"><input type="number" class="input-num" value="1" oninput="updateSum()"></div>
                    <div class="col-center"><input type="number" class="input-num" value="${item.p/10000}" oninput="updateSum()"></div>
                    <div class="col-right row-sum">0</div>
                </div>`;
            });
            c.innerHTML = html;
            cont.appendChild(c);
            body.appendChild(cont);
        });
    }
});

function updateSum() { /* 계산 로직 생략 */ }
function switchToDetailed() { /* 화면 전환 로직 */ }
