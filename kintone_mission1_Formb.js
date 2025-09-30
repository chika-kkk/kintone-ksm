console.log("表示OK");
  
(function () {
  'use strict';

  kintone.events.on(['app.record.create.show', 'app.record.edit.show'], function (event) {
    const record = event.record;

    // 編集不可にしたいフィールド一覧
    const readonlyFields = ['氏名', '生年月日', '病名', '性別', '患者コード','既往歴','ふりがな'];

    readonlyFields.forEach(function (fieldCode) {
      if (record[fieldCode]) {
        record[fieldCode].disabled = true;
      }
    });

    return event;
  });
})();
