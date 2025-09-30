document.addEventListener('DOMContentLoaded', function () {
  console.log("表示OK");

  const readonlyFields = ['氏名', '生年月日', '病名', '性別', 'ふりがな','入院日','担当看護師', '入院時写真' ,'既往歴', 'メモ','担当医サイン', '担当医', '患者コード'];

  readonlyFields.forEach(function (fieldCode) {
    // 新バージョン対応：すべてのフィールドを data-field-code で取得
    const fieldContainer = document.querySelector(`.fb-custom--field[data-field-code="${fieldCode}"]`);
    if (fieldContainer) {
      const elements = fieldContainer.querySelectorAll('input, select, textarea');
      elements.forEach(function (el) {
        el.disabled = true;
        el.style.backgroundColor = '#f5f5f5';
      });
    }
  });
});
