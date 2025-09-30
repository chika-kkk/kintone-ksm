(function () {
  'use strict';

  kintone.events.on('app.record.create.submit.success', async function (event) {
    const appId = kintone.app.getId();
    const recordId = event.recordId;

    // 採番済みの最大番号を取得
    const resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: appId,
      query: '患者コード != "" order by 作成日時 desc limit 1',
      fields: ['患者コード']
    });

    let nextNumber = 1;
    if (resp.records.length > 0) {
      const lastCode = resp.records[0]['患者コード'].value; // 例: 患者番号-00001
      const match = lastCode.match(/(\d{5})$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const newCode = '患者番号-' + String(nextNumber).padStart(5, '0');

    // レコード更新
    const updateBody = {
      app: appId,
      id: recordId,
      record: {
        患者コード: { value: newCode }
      }
    };

    await kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', updateBody);
    return event;
  });
})();
