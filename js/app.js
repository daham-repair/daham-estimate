 기존 로직 유지 (요약 버전)
const body = document.getElementById('estimate-body');
const data = [{category'철거',items[{n'샤시',p35},{n'문',p5}]}];
function formatKRW(n){return Math.floor(n10000).toLocaleString()+ 원}
function update(){let t=0;document.querySelectorAll('.item-line').forEach(r={const c=r.querySelector('.chk');if(c&&c.checked){const q=r.querySelector('.qty').value,p=r.querySelector('.price').value;t+=qp;r.querySelector('.row-total').innerText=formatKRW(qp)}});document.getElementById('final-sum').innerText=formatKRW(t)}
function smartPrint(){window.print()}
function switchToDetailed(){document.getElementById('view-general').classList.remove('active-view');document.getElementById('view-detailed').classList.add('active-view')}
function backToGeneral(){location.reload()}
