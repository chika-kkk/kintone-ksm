console.log("読み込みできてる")

window.FormBridgeEvents.beforeSubmit = [function(state) {
  const furiganaField = state.fields.find(f => f.code === "furigana");
  const birthdateField = state.fields.find(f => f.code === "birthdate");

  const furiganaValid = /^[ぁ-んー]+$/.test(furiganaField.value);
  const birthdateValid = /^\d{4}-\d{2}-\d{2}$/.test(birthdateField.value);

  if (!furiganaValid || !birthdateValid) {
    alert("入力内容に誤りがあります。修正してください。");
    return false; // 送信を止める！
  }

  return true; // バリデーションOKなら送信
}];
