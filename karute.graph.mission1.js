(function () {
  'use strict';

  kintone.events.on('app.record.detail.show', async function (event) {
    const record = event.record;
    const patientCode = record['patient_code'].value;

    // グラフ表示スペース
    const space = kintone.app.record.getSpaceElement('graph_space');
    const canvas = document.createElement('canvas');
    canvas.id = 'myChart';
    canvas.width = 600;
    canvas.height = 300;
    space.innerHTML = ''; // 前のグラフを消す
    space.appendChild(canvas);

    // REST APIで患者の記録を取得
    const query = `patient_code = "${patientCode}" order by 作成日時 asc`;
    const resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: kintone.app.getId(),
      query: query,
      fields: ['体温', '脈', '収縮期血圧', '拡張期血圧', '作成日時']
    });

    const records = resp.records;
    const labels = records.map(r => new Date(r['作成日時'].value).toLocaleDateString());
    const temperature = records.map(r => parseFloat(r['体温'].value));
    const pulse = records.map(r => parseFloat(r['脈'].value));
    const systolic = records.map(r => parseFloat(r['収縮期血圧'].value));
    const diastolic = records.map(r => parseFloat(r['拡張期血圧'].value));

    // Chart.jsで描画
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: '体温', data: temperature, borderColor: 'orange', fill: false },
          { label: '脈拍', data: pulse, borderColor: 'blue', fill: false },
          { label: '収縮期血圧', data: systolic, borderColor: 'red', fill: false },
          { label: '拡張期血圧', data: diastolic, borderColor: 'green', fill: false }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: `患者 ${patientCode} のバイタル推移` }
        }
      }
    });
  });
})();
