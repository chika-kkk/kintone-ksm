(function () {
  'use strict';

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@2.9.4';
  document.head.appendChild(script);

  kintone.events.on('app.record.index.show', function (event) {
    if (typeof Chart === 'undefined') {
      console.log('Chart.jsがまだ読み込まれていません');
      return;
    }

    const records = event.records;
    if (!records || records.length === 0) return;

    const filtered = records.filter(r => r.患者番号.value === '00001');
    filtered.sort((a, b) => new Date(a.日付.value) - new Date(b.日付.value));

    const labels = filtered.map(r => r.日付.value);
    const tempData = filtered.map(r => {
      const raw = r.体温.value;
      return raw ? parseFloat(raw.replace(/[^\d.]/g, '')) : null;
    });
    const bpHighData = filtered.map(r => parseInt(r['血圧（上）'].value));
    const bpLowData = filtered.map(r => parseInt(r['血圧（下）'].value));
    const pulseData = filtered.map(r => parseInt(r.脈拍.value));

    const ctx = document.getElementById('myChart');
    if (!ctx) {
      console.log('canvasが見つかりません');
      return;
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: '体温', data: tempData, borderColor: 'red', fill: false },
          { label: '収縮期血圧', data: bpHighData, borderColor: 'blue', fill: false },
          { label: '拡張期血圧', data: bpLowData, borderColor: 'purple', fill: false },
          { label: '脈拍', data: pulseData, borderColor: 'green', fill: false }
        ]
      },
     options: {
  responsive: true,
  maintainAspectRatio: false,
  title: {
    display: true,
    text: '患者00001のバイタルサイン推移'
  },
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true
      }
    }]
  }
}
