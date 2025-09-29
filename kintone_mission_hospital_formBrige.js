console.log("読み込みできてる");

// FormBridgeEventsが利用可能になった後、イベントを登録
// FormBridgeの新しい構文に合わせ、配列代入ではなく .on() を使用します。

window.FormBridgeEvents.on('form.created', (state) => {
    console.log("FormBridgeEvents.on: form.created が実行されました。");

    // FormBridgeではカスタムバリデーションを使わず、beforeSubmitで処理する場合、
    // ここでフィールドコードの修正などを行えますが、今回はスキップします。

    return state;
});

window.FormBridgeEvents.on('record.submit.before', (state) => {
    console.log("FormBridgeEvents.on: record.submit.before が実行されました。");
    
    // フィールドコードが全角（ふりがな, 生年月日）で定義されている前提で処理を記述
    const furiganaField = state.fields.find(f => f.code === "ふりがな");
    const birthdateField = state.fields.find(f => f.code === "生年月日");

    // 値がない場合はバリデーションをスキップ
    const furiganaValue = furiganaField?.value || "";
    const birthdateValue = birthdateField?.value || "";

    const furiganaValid = /^[ぁ-んー]+$/.test(furiganaValue);
    const birthdateValid = /^\d{4}-\d{2}-\d{2}$/.test(birthdateValue);

    // バリデーションチェック
    if (!furiganaValid || !birthdateValid) {
        alert("入力内容に誤りがあります。ふりがなはひらがな、生年月日はYYYY-MM-DD形式で入力してください。");
        // false を返す代わりに、Promise.reject() または throw new Error() を使用
        // FormBridgeの仕様に合わせて return state ではなく Promise.reject() を使います
        return Promise.reject(state);
    }
    
    // 正常な場合は Promise.resolve() を返す
    return Promise.resolve(state);
});

// NOTE: 従来の形式 (fb.events.initialized) でのカスタムバリデータ登録が動かない場合、
// beforeSubmit でのバリデーションは、この形式が最も確実です。
