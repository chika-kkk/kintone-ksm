console.log(OK);
  
(function () {
  'use strict';

  const appId = 22;
  const apiToken = 'BbEoPJYxX0LLeOTsP9z0oNqzERdp80ozWttzeufX';
  const formBridgeUrl = 'https://2b0d58d3.form.kintoneapp.com/public/bae4d386eeab10eb71c36381a4f253917c745d9efda595a075fa6fad89f25ded';

  kintone.events.on('app.record.index.show', function () {
    const container = document.createElement('div');
    container.innerHTML = `
      <h2>未承認患者一覧</h2>
      <table id="recordTable" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2a0;">
            <th style="border: 1px solid #ccc; padding: 8px;">氏名</th>
            <th style="border: 1px solid #ccc; padding: 8px;">病名</th>
            <th style="border: 1px solid #ccc; padding: 8px;">入院日</th>
            <th style="border: 1px solid #ccc; padding: 8px;">編集</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;
    const space = document.querySelector('.gaia-argoui-app-index');
    if (space) {
      space.prepend(container);
    }

    const body = {
      app: appId,
      query: '承認欄 = "" or 承認欄 = "未承認"',
      fields: ['氏名', '病名', '入院日', '承認欄']
    };

    kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body, function (resp) {
      const tbody = document.querySelector('#recordTable tbody');
      resp.records.forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="border: 1px solid #ccc; padding: 8px;">${record['氏名']?.value || ''}</td>
          <td style="border: 1px solid #ccc; padding: 8px;">${record['病名']?.value || ''}</td>
          <td style="border: 1px solid #ccc; padding: 8px;">${record['入院日']?.value || ''}</td>
          <td style="border: 1px solid #ccc; padding: 8px;">
            <a style="background-color: #4CAF50; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px;"
               href="${formBridgeUrl}?record_id=${record.$id.value}" target="_blank">編集する</a>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }, function (error) {
      console.error('取得エラー:', error);
    });
  });
})();
