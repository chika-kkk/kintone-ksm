(function () {
  'use strict';

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@2.9.4';
  script.onload = function () {
    kintone.events.on('app.record.index.show', function (event) {
     const records = event.records;
if (!records || records.length === 0) return;

// 一覧の先頭レコードの患者番号を取得
const targetPatient = records[0].患者番号.value;

// その患者のデータだけ抽出
const filtered = records.filter(r => r.患者番号.value === targetPatient);

      filtered.sort((a, b) => new Date(a.日付.value) - new Date(b.日付.value));

      const labels = filtered.map(r => r.日付.value);
      const tempData = filtered.map((r, i) => ({
        x: r.日付.value,
        y: parseFloat(r.体温.value?.replace(/[^\d.]/g, '') || '0')
      }));
      const bpHighData = filtered.map((r, i) => ({
        x: r.日付.value,
        y: parseInt(r['収縮期血圧'].value || '0')
      }));
      const bpLowData = filtered.map((r, i) => ({
        x: r.日付.value,
        y: parseInt(r['拡張期血圧'].value || '0')
      }));
      const pulseData = filtered.map((r, i) => ({
        x: r.日付.value,
        y: parseInt(r.脈拍.value || '0')
      }));

      const ctx = document.getElementById('myChart');
      if (!ctx) {
        console.log('canvasが見つかりません');
        return;
      }

      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: '体温',
              data: tempData,
              borderColor: 'red',
              fill: false,
              yAxisID: 'y-temp'
            },
            {
              label: '収縮期血圧',
              data: bpHighData,
              borderColor: 'blue',
              fill: false,
              yAxisID: 'y-vitals'
            },
            {
              label: '拡張期血圧',
              data: bpLowData,
              borderColor: 'purple',
              fill: false,
              yAxisID: 'y-vitals'
            },
            {
              label: '脈拍',
              data: pulseData,
              borderColor: 'green',
              fill: false,
              yAxisID: 'y-vitals'
            }
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
            xAxes: [{
              type: 'time',
              time: {
                unit: 'day',
                displayFormats: {
                  day: 'YYYY-MM-DD'
                }
              },
              scaleLabel: {
                display: true,
                labelString: '日付'
              }
            }],
            yAxes: [
              {
                id: 'y-temp',
                type: 'linear',
                position: 'left',
                ticks: {
                  min: 35,
                  max: 40,
                  stepSize: 0.5
                },
                scaleLabel: {
                  display: true,
                  labelString: '体温（℃）'
                }
              },
              {
                id: 'y-vitals',
                type: 'linear',
                position: 'right',
                ticks: {
                  min: 0,
                  max: 200,
                  stepSize: 20
                },
                gridLines: {
                  drawOnChartArea: false
                },
                scaleLabel: {
                  display: true,
                  labelString: '血圧・脈拍'
                }
              }
            ]
          }
        }
      });
    });
  };
  document.head.appendChild(script);
})();
