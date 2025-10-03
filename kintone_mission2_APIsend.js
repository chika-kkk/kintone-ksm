(function () {
  'use strict';

  kintone.events.on('app.record.detail.show', function (event) {
    const button = document.createElement('button');
    button.textContent = '外部APIに送信';
    button.style.marginTop = '20px';
    button.onclick = async () => {
      const record = event.record;

      // 添付ファイルの情報を整形
      const files = record['添付ファイル'].value.map(file => ({
        name: file.name,
        url: file.url
      }));

      // 送信するデータ
      const payload = {
        folderNumber: record['フォルダ番号'].value,
        folderName: record['フォルダ名'].value,
        files: files
      };

      // 外部APIに送信（URLは仮）
      const resp = await fetch('https://your-api-endpoint.com/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await resp.json();
      console.log('外部APIの応答:', result);
    };

    kintone.app.record.getHeaderMenuSpaceElement().appendChild(button);
  });
})();

kintone.events.on('app.record.detail.show', async function(event) {
  const record = event.record;
  const file = record['添付ファイル'].value[0]; // フィールドコードは自分のに合わせてね
  const fileKey = file.fileKey;

  const headers = {
    'X-Requested-With': 'XMLHttpRequest'
  };

  try {
    const resp = await fetch(`/k/v1/file.json?fileKey=${fileKey}`, {
      method: 'GET',
      headers: headers
    });
    const blob = await resp.blob();
    console.log('ファイル取得成功！', blob);
    // ここでBoxへのアップロード処理に進めるよ
  } catch (err) {
    console.error('ファイル取得失敗', err);
  }

  return event;
});
