(function () {
  'use strict';

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@2.9.4';
  script.onload = function () {
    const appId = kintone.app.getId();
    const canvas = document.getElementById('myChart');
    const ctx = canvas.getContext('2d');
    const select = document.getElementById('patientSelect');

    let chartInstance = null;

    // 全患者番号を取得してセレクトボックスに追加
    kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: appId,
      query: 'order by 日付 asc',
      fields: ['患者番号']
    }, function (resp) {
      const uniquePatients = [...new Set(resp.records.map(r => r.患者番号.value))];
      uniquePatients.forEach(pn => {
        const option = document.createElement('option');
        option.value = pn;
        option.textContent = pn;
        select.appendChild(option);
      });

      // 初期表示（最初の患者）
      drawChart(uniquePatients[0]);
    });

    // 選択変更時にグラフ更新
    select.addEventListener('change', function () {
      drawChart(this.value);
    });

    function drawChart(patientNumber) {
      const query = `患者番号 = "${patientNumber}" order by 日付 asc`;

      kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
        app: appId,
        query: query
      }, function (resp) {
        const records = resp.records;
        const formatDate = (str) => new Date(str).toISOString();

        const tempData = records.map(r => {
          const raw = r.体温.value || '';
          const cleaned = raw.replace(/[^\d.]/g, '');
          return {
            x: formatDate(r.日付.value),
            y: parseFloat(cleaned || '0')
          };
        });

        const bpHighData = records.map(r => ({
          x: formatDate(r.日付.value),
          y: parseInt(r['収縮期血圧'].value || '0')
        }));
        const bpLowData = records.map(r => ({
          x: formatDate(r.日付.value),
          y: parseInt(r['拡張期血圧'].value || '0')
        }));
        const pulseData = records.map(r => ({
          x: formatDate(r.日付.value),
          y: parseInt(r.脈拍.value || '0')
        }));

        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
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
              text: `患者 ${patientNumber} のバイタルサイン推移`
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
    }
  };
  document.head.appendChild(script);
})();
