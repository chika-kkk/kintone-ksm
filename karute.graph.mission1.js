(function () {
  'use strict';

  // 一覧ビュー表示時に実行
  kintone.events.on('app.record.index.show', async function () {
    const select = document.getElementById('patientSelect');
    const canvas = document.getElementById('myChart');

    if (!select || !canvas) return;

    // 患者番号一覧を取得
    const resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: kintone.app.getId(),
      query: 'order by 作成日時 asc',
      fields: ['患者番号']
    });

    console.log('取得したレコード:', resp.records);

    const patientCodes = [...new Set(
  resp.records
    .map(r => r['患者番号']?.value)
    .filter(v => v) // 空欄を除外
)];

    // ドロップダウンに追加
    select.innerHTML = '<option value="">選択してください</option>';
    patientCodes.forEach(code => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = code;
      select.appendChild(option);
    });

    // 選択時にグラフ描画
    select.addEventListener('change', async function () {
      const selectedCode = select.value;
      if (!selectedCode) return;

      const dataResp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
        app: kintone.app.getId(),
        query: `患者番号 = "${selectedCode}" order by 作成日時 asc`,
        fields: ['体温', '脈', '収縮期血圧', '拡張期血圧', '作成日時']
      });

      const records = dataResp.records;
      const labels = records.map(r => new Date(r['作成日時'].value).toLocaleDateString());
      const temperature = records.map(r => parseFloat(r['体温'].value));
      const pulse = records.map(r => parseFloat(r['脈'].value));
      const systolic = records.map(r => parseFloat(r['収縮期血圧'].value));
      const diastolic = records.map(r => parseFloat(r['拡張期血圧'].value));

      // グラフ描画
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      canvas.innerHTML = ''; // 前のグラフを消す

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
            title: { display: true, text: `患者 ${selectedCode} のバイタル推移` }
          }
        }
      });
    });
  });
})();
