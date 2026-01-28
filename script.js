/* =========================================
   [1] 수파베이스 연결 설정 (변수명 충돌 해결)
   ========================================= */
const supabaseUrl = '여기에_Project_URL_붙여넣기'; // 따옴표 안의 내용을 본인 것으로 꼭 바꾸세요!
const supabaseKey = '여기에_API_Key_anon_public_붙여넣기'; // 따옴표 안의 내용을 본인 것으로 꼭 바꾸세요!

// [수정] 변수 이름을 'supabase' -> 'dbClient'로 변경하여 충돌 방지
let dbClient = null;
if (typeof supabase !== 'undefined') {
    dbClient = supabase.createClient(supabaseUrl, supabaseKey);
} else {
    console.log("수파베이스 라이브러리가 로드되지 않았습니다. (HTML 헤더 확인 필요)");
}

/* =========================================
   [2] 데이터 및 아이콘 설정
   ========================================= */
const icons = {
    demolition: `<svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    carpentry: `<svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 19V5h10v14H7z"/></svg>`,
    film: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`,
    plumbing: `<svg viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>`,
    electrical: `<svg viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>`,
    wallpaper: `<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"/></svg>`,
    flooring: `<svg viewBox="0 0 24 24"><path d="M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z"/></svg>`,
    furniture: `<svg viewBox="0 0 24 24"><path d="M4 18v3h3v-3h10v3h3v-3h1V3H3v15h1z"/></svg>`,
    door: `<svg viewBox="0 0 24 24"><path d="M6 3v18h12V3H6z"/></svg>`,
    sash: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`,
    paint: `<svg viewBox="0 0 24 24"><path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 0 0-1.41 0L9 13.59V18h4.41l10.3-10.3c.39-.39.39-1.02 0-1.41z"/></svg>`,
    plus: `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`
};

const data = [
    { category: "철거 (Demolition)", key: "demolition", items: [{n:"샤시", p:35},{n:"문", p:5},{n:"문틀", p:5},{n:"몰딩", p:1.5},{n:"우물박스", p:5},{n:"걸레받이", p:1},{n:"싱크대", p:20},{n:"신발장", p:10},{n:"붙박이장", p:15},{n:"화장실 타일", p:25},{n:"화장실 도기", p:20},{n:"화장실 천장", p:10},{n:"화장실 바닥", p:15},{n:"현관 타일", p:15},{n:"현관 디딤석", p:5},{n:"베란다 타일", p:20},{n:"스위치 철거", p:0.5},{n:"콘센트 철거", p:0.5},{n:"등 철거", p:1},{n:"강마루 철거(평)", p:1.8},{n:"철거인건비", p:0}] },
    { category: "목공 (Carpentry)", key: "carpentry", items: [{n:"천장시공", p:25},{n:"천장몰딩", p:2},{n:"걸레받이 시공", p:2},{n:"문선몰딩", p:5},{n:"문틀시공", p:35},{n:"가벽시공", p:20},{n:"실링팬 보강", p:10},{n:"단열작업", p:18},{n:"기타", p:0},{n:"목공인건비", p:0}] },
    { category: "필름 (Film)", key: "film", items: [{n:"샤시", p:25},{n:"문틀", p:10},{n:"문", p:12},{n:"싱크대", p:30},{n:"신발장", p:15},{n:"붙박이장", p:30},{n:"기타", p:0},{n:"필름인건비", p:0}] },
    { category: "설비 (Plumbing)", key: "plumbing", items: [{n:"화장실 방수", p:45},{n:"화장실 수도 배관 교체", p:20},{n:"주방 수도 배관 교체", p:20},{n:"주방 수도 내림", p:15},{n:"도기 셋팅", p:25},{n:"배란다 수도 연장", p:15},{n:"설비인건비", p:0}] },
    { category: "타일 (Tile)", key: "plus", items: [{n:"화장실 벽", p:120},{n:"화장실 바닥", p:30},{n:"주방 타일", p:40},{n:"베란다 타일", p:60},{n:"현관 타일", p:25},{n:"타일인건비", p:0}] },
    { category: "전기 (Electrical)", key: "electrical", items: [{n:"스위치 교체", p:2},{n:"콘센트 교체", p:2},{n:"전기증설 인입", p:35},{n:"방등", p:3.5},{n:"다운라이트", p:2.5},{n:"실링팬 설치", p:15},{n:"차단기 교체", p:10},{n:"차단기 증설", p:15},{n:"전기인건비", p:0}] },
    { category: "도배 (Wallpaper)", key: "wallpaper", items: [{n:"합지", p:3.5},{n:"실크", p:5.5},{n:"도배인건비", p:0}] },
    { category: "바닥마감재 (Flooring)", key: "flooring", items: [{n:"장판", p:6.5},{n:"강화마루", p:12},{n:"강마루", p:15},{n:"데코타일", p:6},{n:"바닥인건비", p:0}] },
    { category: "싱크대/가구 (Furniture)", key: "furniture", items: [{n:"싱크대", p:120},{n:"신발장", p:45},{n:"큰방 붙박이", p:22},{n:"작은장 붙박이", p:55},{n:"베란다 창고장", p:25},{n:"가구인건비", p:0}] },
    { category: "중문 (Middle Door)", key: "door", items: [{n:"슬라이딩", p:110},{n:"3연동", p:100},{n:"미닫이", p:120},{n:"중문인건비", p:0}] },
    { category: "샤시 (Sash)", key: "sash", items: [{n:"샤시 교체/수리", p:0},{n:"샤시인건비", p:0}] },
    { category: "페인트 (Paint)", key: "paint", isPaint: true, items: [{n:"거실베란다", p:12},{n:"큰방베란다", p:12},{n:"작은베란다", p:12},{n:"주방베란다", p:12},{n:"페인트인건비", p:0}] },
    { category: "기타 (Others)", key: "plus", items: [{n:"화장실 돔천장", p:20},{n:"입주 청소", p:30},{n:"폐기물 처리", p:0},{n:"기타인건비", p:0}] }
];

const paintMap = { water: 12, elastic: 22, ceramic: 30 };
const body = document.getElementById('estimate-body');

// 초기 렌더링
data.forEach((sec, idx) => {
    const cont = document.createElement('div'); cont.className = 'section-container'; cont.id = 'cont-'+idx;
    const h = document.createElement('div'); h.className = 'section-header'; 
    h.innerHTML = `<span><div class="section-icon">${icons[sec.key]}</div> ${sec.category}<span id="pv-${idx}" class="paint-print-val"></span></span><span class="no-print">▼</span>`;
    h.onclick = () => document.getElementById('c-'+idx).classList.toggle('show');
    cont.appendChild(h);
    
    const c = document.createElement('div'); c.className = 'section-content'; c.id = 'c-'+idx;
    let rows = `<div class="grid-row master-grid no-print bulk-row">
        <div style="text-align:left;"><label class="item-label bulk-text"><input type="checkbox" onchange="toggleSec(${idx}, this)"><span class="checkmark"></span><span>전체선택</span></label></div>
        <div style="grid-column: span 3; text-align:right;">
            ${sec.isPaint ? `<select id="p-sel" class="paint-select" onchange="changeP(${idx}, this.value)">
                <option value="water">수성 페인트</option><option value="elastic">탄성 코트</option><option value="ceramic">세라믹 코트</option>
            </select>` : ''}
        </div>
    </div>`;
    sec.items.forEach((item, iIdx) => {
        rows += `<div class="grid-row master-grid row-${idx} item-line">
            <div style="text-align:left;"><label class="item-label"><input type="checkbox" class="chk" data-name="${item.n}" onchange="update()"><span class="checkmark"></span><span>${item.n}</span></label></div>
            <div><input type="number" class="in-num qty" value="1" oninput="update()"></div>
            <div><input type="number" class="in-num price" value="${item.p}" oninput="update()" id="p-${idx}-${iIdx}"></div>
            <div class="row-total" style="text-align:right; padding-right:20px;">0</div>
        </div>`;
    });
    c.innerHTML = rows; cont.appendChild(c); body.appendChild(cont);
});

// 기능 함수들
function changeP(sIdx, type) {
    const np = paintMap[type];
    for(let i=0; i<4; i++) {
        const el = document.getElementById(`p-${sIdx}-${i}`);
        if(el) el.value = np;
    }
    update();
}

function toggleSec(idx, master) {
    document.querySelectorAll(`.row-${idx} .chk`).forEach(c => c.checked = master.checked);
    update();
}

function formatKRW(num) { if (!num) return "0"; return Math.floor(num * 10000).toLocaleString(); }

function update() {
    let total = 0;
    document.querySelectorAll('#view-general .item-line').forEach(row => {
        const chk = row.querySelector('.chk');
        if(chk.checked) {
            const sum = (parseFloat(row.querySelector('.qty').value)||0)*(parseFloat(row.querySelector('.price').value)||0);
            total += sum; row.querySelector('.row-total').innerText = format
