(function () {
  'use strict';

  kintone.events.on(['app.record.edit.submit.success', 'app.record.create.submit.success'], async function (event) {
    const record = event.record;

    // 承認チェックボックスの値を確認（例：「承認済み」が入っているか）
    const isApproved = record['承認'].value.includes('承認済');

    if (isApproved) {
      const loginUser = kintone.getLoginUser();
      const today = new Date().toISOString().split('T')[0];

      // 承認者と承認日時を自動入力（フィールドがあれば）
      if (record['承認者']) {
        record['承認者'].value = [{ code: loginUser.code }];
      }
      if (record['承認日時']) {
        record['承認日時'].value = today;
      }

      // コメント通知（院長へのメッセージ）
      await kintone.api(kintone.api.url('/k/v1/record/comment', true), 'POST', {
        app: kintone.app.getId(),
        record: kintone.app.record.getId(),
        comment: {
          text: `✅ ${loginUser.name} が患者情報を承認しました。\n院長確認をお願いします。`
        }
      });
    }

    return event;
  });
})();
