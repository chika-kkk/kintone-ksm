const appId = 22;
const apiToken = 'BbEoPJYxX0LLeOTsP9z0oNqzERdp80ozWttzeufX';
const formBridgeUrl = 'https://2b0d58d3.form.kintoneapp.com/public/bae4d386eeab10eb71c36381a4f253917c745d9efda595a075fa6fad89f25ded';

fetch(`https://neh926t6he9h.cybozu.com/k/v1/records.json?app=${appId}`, {
  method: 'GET',
  headers: {
    'X-Cybozu-API-Token': apiToken,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  const tbody = document.querySelector('#recordTable tbody');
  data.records.forEach(record => {
    const status = record['院長サイン']?.value;
    if (!status || status === '未承認') {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${record['氏名']?.value || ''}</td>
        <td>${record['病名']?.value || ''}</td>
        <td>${record['入院日']?.value || ''}</td>
        <td><a class="edit-button" href="${formBridgeUrl}?record_id=${record.$id.value}" target="_blank">編集する</a></td>
      `;
      tbody.appendChild(tr);
    }
  });
})
.catch(error => {
  console.error('取得エラー:', error);
});
