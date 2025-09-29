const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/chart.js@2.9.4';
script.onload = function () {
  drawChart(); // Chart.jsが読み込まれた後に描画
};
document.head.appendChild(script);

function drawChart() {
  kintone.events.on('app.record.index.show', function (event) {
    const records = event.records;
    if (!records || records.length === 0) return;

    const labels = records.map(r => r.日付.value);
    const tempData = records.map(r => parseFloat(r.体温.value));
    const bpHighData = records.map(r => parseInt(r['血圧（上）'].value));
    const bplowData = records.map(r => parseInt(r['血圧（下）'].value));
    const pulseData = records.map(r => parseInt(r.脈拍.value));

    const ctx = document.getElementById('myChart');
    if (!ctx) return;

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
          {
            label: '拡張期血圧',
            data: bplowData,
            borderColor: 'purple',
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
}
