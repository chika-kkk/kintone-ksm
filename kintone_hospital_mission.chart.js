(function () {
  'use strict';

  // Chart.js(グラフを書くためのライブラリ)  
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@2.9.4';

  script.onload = function () {
    const appId = kintone.app.getId(); // 現在のアプリIDを取得
    const canvas = document.getElementById('myChart'); // グラフ描画用のcanvas要素
    const ctx = canvas.getContext('2d'); // 描画コンテキスト
    const select = document.getElementById('patientSelect'); // 患者選択用セレクトボックス

    //書いたグラフを保存するための変数
    let chartInstance = null;

    //kintoneのAPI通信。全患者番号を取得してセレクトボックスに追加
    //kintone.api(URL, メソッド, パラメータ, コールバック関数)
    kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: appId,
      query: 'order by 日付 asc',
      fields: ['患者番号']
    }, function(resp) {
      const records = resp.records;

      // 重複を除いた患者番号一覧
      const uniquePatients = [...new Set(records.map(r => r.患者番号?.value).filter(Boolean))];

      // セレクトボックスに患者番号を追加
      uniquePatients.forEach(pn => {
        const option = document.createElement('option');
        option.value = pn;
        option.textContent = pn;
        select.appendChild(option);
      });

      // 最初の患者を選択してグラフ表示
      if (uniquePatients.length > 0) {
        drawChart(uniquePatients[0]);
      }
    });

    // セレクトボックスの選択変更時にグラフを更新
    select.addEventListener('change', function () {
      drawChart(this.value);
    });

    // グラフ描画関数（選択された患者番号に応じてデータ取得＆描画）
    function drawChart(patientNumber) {
      const query = `患者番号 = "${patientNumber}" order by 日付 asc`;

      kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
        app: appId,
        query: query
      }, function (resp) {
        const records = resp.records;

        // 日付をISO形式に変換する関数
        const formatDate = (str) => new Date(str).toISOString();

        // 各バイタルデータを整形
        const tempData = records.map(r => {
          const raw = r.体温?.value || '';
          const cleaned = raw.replace(/[^\d.]/g, ''); // 数字と小数点以外を除去
          return {
            x: formatDate(r.日付.value),
            y: parseFloat(cleaned || '0')
          };
        });

        const bpHighData = records.map(r => ({
          x: formatDate(r.日付.value),
          y: parseInt(r['収縮期血圧']?.value || '0')
        }));

        const bpLowData = records.map(r => ({
          x: formatDate(r.日付.value),
          y: parseInt(r['拡張期血圧']?.value || '0')
        }));

        const pulseData = records.map(r => ({
          x: formatDate(r.日付.value),
          y: parseInt(r.脈拍?.value || '0')
        }));

        // 既存のグラフがあれば破棄
        if (chartInstance) chartInstance.destroy();

        // Chart.jsでグラフ描画
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

  // Chart.jsスクリプトを読み込み開始
  document.head.appendChild(script);
})();


/*
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
    }, function(resp) {
      const records = resp.records;
      const uniquePatients = [...new Set(records.map(r => r.患者番号?.value).filter(Boolean))];

      uniquePatients.forEach(pn => {
        const option = document.createElement('option');
        option.value = pn;
        option.textContent = pn;
        select.appendChild(option);
      });

      if (uniquePatients.length > 0) {
        drawChart(uniquePatients[0]);
      }
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
          const raw = r.体温?.value || '';
          const cleaned = raw.replace(/[^\d.]/g, '');
          return {
            x: formatDate(r.日付.value),
            y: parseFloat(cleaned || '0')
          };
        });

        const bpHighData = records.map(r => ({
          x: formatDate(r.日付.value),
          y: parseInt(r['収縮期血圧']?.value || '0')
        }));
        const bpLowData = records.map(r => ({
          x: formatDate(r.日付.value),
          y: parseInt(r['拡張期血圧']?.value || '0')
        }));
        const pulseData = records.map(r => ({
          x: formatDate(r.日付.value),
          y: parseInt(r.脈拍?.value || '0')
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
*/
