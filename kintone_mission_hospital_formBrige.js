console.log("読み込めてる");

function initializeFormBridgeCustomization() {
    // 1. fb オブジェクトが存在するかチェック (ポーリング)
    if (typeof fb === 'undefined' || !fb.events) {
        // まだ fb が利用できない場合は、100ms 待って再試行
        setTimeout(initializeFormBridgeCustomization, 100);
        return;
    }

    console.log("fbオブジェクトが検出されました。イベント登録を開始します。");
    
    // 2. カスタムバリデーターの登録（従来の形式）
    fb.addValidators = function(state) {
        return {
            // ふりがな：ひらがなのみ
            hiragana_only: {
                getMessage: () => 'ひらがなで入力してください。',
                validate: value => /^[ぁ-んー]+$/.test(value)
            },
            // 生年月日：YYYY-MM-DD形式
            valid_date: {
                getMessage: () => '西暦形式（YYYY-MM-DD）で入力してください。',
                validate: value => /^\d{4}-\d{2}-\d{2}$/.test(value)
            }
            // 性別チェックは削除しました
        };
    };

    // 3. フォーム作成イベントでバリデーションを適用
    fb.events.form.created.push(function(state) {
        // ふりがなフィールドにひらがなバリデーションを適用
        state.fields.find(({code}) => code === "ふりがな")?.validations.push({
            params: [],
            rule: 'hiragana_only'
        });

        // 生年月日フィールドに日付形式バリデーションを適用
        state.fields.find(({code}) => code === "生年月日")?.validations.push({
            params: [],
            rule: 'valid_date'
        });

        // 性別フィールドへの適用は削除しました
        
        return state;
    });
    
    // 4. record.submit.before イベントでの二重チェック（保険ロジック）を削除
}

// 最初の実行を試みる
initializeFormBridgeCustomization();
