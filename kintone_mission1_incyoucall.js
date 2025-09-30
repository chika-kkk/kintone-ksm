(function () {
  'use strict';

  kintone.events.on('app.record.detail.process.proceed', function (event) {
    const nextStatus = event.nextStatus.value;

    // ステータスが「承認済」に変わったときだけ処理する
    if (nextStatus === '承認済') {
      const record = event.record;

      // 今日の日付（YYYY-MM-DD形式）
      const today = new Date().toISOString().split('T')[0];

      // ログインユーザー（承認者）
      const loginUser = kintone.getLoginUser();

      // 承認者と承認日時を自動入力
      record['承認者'].value = [{ code: loginUser.code }];
      record['承認日時'].value = today;

      // コメント投稿（院長への通知）
      kintone.api(kintone.api.url('/k/v1/record/comment', true), 'POST', {
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
