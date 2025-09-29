console.log("読み込みできてる");

function waitForFormBridgeEvents(callback) {
  if (window.FormBridgeEvents) {
    callback();
  } else {
    setTimeout(() => waitForFormBridgeEvents(callback), 100);
  }
}

waitForFormBridgeEvents(() => {
  window.FormBridgeEvents.beforeSubmit = [function(state) {
    const furiganaField = state.fields.find(f => f.code === "ふりがな");
    const birthdateField = state.fields.find(f => f.code === "生年月日");

    const furiganaValid = /^[ぁ-んー]+$/.test(furiganaField?.value || "");
    const birthdateValid = /^\d{4}-\d{2}-\d{2}$/.test(birthdateField?.value || "");

    if (!furiganaValid || !birthdateValid) {
      alert("入力内容に誤りがあります。修正してください。");
      return false;
    }

    return true;
  }];
});
