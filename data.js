const SYSTEM_VERSION = "Ver 1.51";

document.addEventListener('DOMContentLoaded', function() {
    const badge = document.createElement('div');
    badge.className = 'global-version-badge no-print';
    badge.innerText = SYSTEM_VERSION;
    const target = document.querySelector('.container') || document.body;
    target.appendChild(badge);
});

const icons = {
    demo: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H5v-4h9v4zM5 11V7h9v4H5zm14 6h-3v-4h3v4zm0-6h-3V7h3v4z"/></svg>`,
    wood: `<svg viewBox="0 0 24 24"><path d="M4 18v3h3v-3h10v3h3v-6H4v3zm15-8h-3v3h3v-3zM9 10h6v3H9v-3zM4 10h3v3H4v-3z"/></svg>`,
    paper: `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 14h-8v-2h8v2zm0-4h-8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
    bath: `<svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="2"/><circle cx="11" cy="7" r="2"/><circle cx="15" cy="7" r="2"/><path d="M20.6 12.5c-.3-.4-.8-.5-1.1-.1L18 13.9V5c0-1.6-1.4-3-3-3s-3 1.4-3 3v4.2l-5.6-5.6c-.4-.4-1-.4-1.4 0L2 6.6c-.4.4-.4 1 0 1.4l5.6 5.6H4c-1.1 0-2 .9-2 2v4h18v-4c0-1.1-.9-2-2-2h-3.4l1.9-2.2c.4-.3.5-.8.1-1.1z"/></svg>`
    // ... 나머지 아이콘 생략 (기존 데이터 유지 가능)
};

const data = [
    { key: 'demo', category: '철거', items: [{n:'마루 철거 (평)', p:35000}, {n:'장판 철거 (평)', p:10000}] },
    { key: 'wood', category: '목공', items: [{n:'몰딩 (평)', p:45000}, {n:'걸레받이 (평)', p:40000}] },
    { key: 'bath', category: '욕실', items: [{n:'변기 교체', p:350000}, {n:'세면대 교체', p:300000}] }
    // ... 나머지 데이터 생략 (기존 데이터 유지 가능)
];
