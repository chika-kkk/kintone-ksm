(function () {
  'use strict';

  console.log("OK");

  kintone.events.on('app.record.index.show', async function () {
    const appId = kintone.app.getId();

    // 採番されていないレコードを取得
    const resp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
  app: appId,
  query: '患者コード = "" order by 作成日時 asc',
  fields: ['患者コード', '$id']
});


    if (resp.records.length === 0) return;

    // 採番済みの最大番号を取得
    const maxResp = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: appId,
      query: '患者コード != "" order by 作成日時 desc limit 1',
      fields: ['患者コード']
    });

    let nextNumber = 1;
    if (maxResp.records.length > 0) {
      const lastRecord = maxResp.records[0];
      const lastCode = lastRecord?.['患者コード']?.value || '';
      const match = lastCode.match(/(\d{5})$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // 採番されていないレコードに番号を付ける
    for (const [i, record] of resp.records.entries()) {
      const newCode = '患者番号-' + String(nextNumber + i).padStart(5, '0');
      await kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', {
        app: appId,
        id: record.$id.value,
        record: {
          患者コード: { value: newCode }
        }
      });
    }
  });
})();
