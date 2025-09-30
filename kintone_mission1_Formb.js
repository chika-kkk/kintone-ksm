console.log("表示OK");
  
document.addEventListener('DOMContentLoaded', function () {
  // 編集不可にしたいフィールドのname属性（フィールドコード）を指定
  const readonlyFields = ['氏名', '生年月日', '病名', '性別', 'ふりがな','性別', '入院日','担当看護師', '既往歴', 'メモ','担当医サイン', '担当医'];

  readonlyFields.forEach(function (fieldCode) {
    const input = document.querySelector(`[name="${fieldCode}"]`);
    if (input) {
      input.setAttribute('readonly', true);
      input.style.backgroundColor = '#f5f5f5'; // 見た目もグレーに
    }

    // セレクトボックスやラジオボタンにも対応
    const selects = document.querySelectorAll(`[name="${fieldCode}"]`);
    selects.forEach(function (el) {
      el.disabled = true;
    });
  });
});
