document.addEventListener('DOMContentLoaded', function () {
  console.log("表示OK");

  const readonlyFields = ['氏名', '生年月日', '病名', '性別', 'ふりがな','入院日','担当看護師', '既往歴', 'メモ','担当医サイン', '担当医'];

  readonlyFields.forEach(function (fieldCode) {
    // 通常のinput要素
    const input = document.querySelector(`[name="${fieldCode}"]`);
    if (input) {
      input.setAttribute('readonly', true);
      input.style.backgroundColor = '#f5f5f5';
    }

    // 新バージョン対応：セレクト・ラジオなど
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
