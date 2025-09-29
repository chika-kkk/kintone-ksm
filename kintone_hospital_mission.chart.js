// Chart.jsの読み込み（CDN）
const script = document.createElement('script');
script.src = 'https://js.cybozu.com/chartjs/v2.7.3/Chart.min.js';
document.head.appendChild(script);

kintone.events.on('app.record.index.show', function(event) {
  // レコード一覧が表示されたときに実行
  const records = event.records;

  // 日付順に並べ替え（必要なら）
  records.sort((a, b) => new Date(a.日付.value) - new Date(b.日付.value));

  // データの準備
  const labels = records.map(r => r.日付.value);
  const tempData = records.map(r => parseFloat(r.体温.value));
  const bpHighData = records.map(r => parseInt(r['収縮期血圧'].value));
  const bplowData = records.map(r => parseInt(r['拡張期血圧'].value));
  const pulseData = records.map(r => parseInt(r.脈拍.value));

  // Chart.jsで描画
  const ctx = document.getElementById('myChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '体温',
          data: tempData,
          borderColor: 'red',
          fill: false
        },
        {
          label: '収縮期血圧',
          data: bpHighData,
          borderColor: 'blue',
          fill: false
        },
        label: '拡張期血圧',
          data: bplowData,
          borderColor: 'blue',
          fill: false
        },
        {
          label: '脈拍',
          data: pulseData,
          borderColor: 'green',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: '診療記録の推移'
      }
    }
  });
});
