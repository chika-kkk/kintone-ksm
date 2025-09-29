console.log("読み込みできてる");

// FormBridgeがkintoneのイベント形式を模倣している場合に備え、
// kintone.events.on の形式で record.submit.before にイベントを登録する。
kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], (state) => {
    console.log("kintone.events.on: フォーム送信前イベントが実行されました。");

    // フィールドコードは全角である前提
    const furiganaField = state.record.ふりがな;
    const birthdateField = state.record.生年月日;

    // 値の取得とチェック
    const furiganaValue = furiganaField?.value || "";
    const birthdateValue = birthdateField?.value || "";

    const furiganaValid = /^[ぁ-んー]+$/.test(furiganaValue);
    const birthdateValid = /^\d{4}-\d{2}-\d{2}$/.test(birthdateValue);

    // バリデーションチェック
    if (!furiganaValid || !birthdateValid) {
        alert("入力内容に誤りがあります。ふりがなはひらがな、生年月日はYYYY-MM-DD形式で入力してください。");
        
        // kintone形式では、エラー時にPromise.reject()ではなく、
        // イベントオブジェクトの返却を停止し、エラーメッセージを設定します。
        // FormBridgeでこれが動作するか試します。
        
        // ※ kintone形式の代替案のため、エラーメッセージはkintoneの標準の場所には表示されません。
        // alertで通知し、送信を止めます。
        return false;
    }

    return state;
});
