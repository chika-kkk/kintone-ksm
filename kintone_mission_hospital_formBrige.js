console.log("カスタムJS読み込み開始");

function initializeFormBridgeCustomization() {
    // 1. fb オブジェクトが存在するかチェック
    if (typeof fb === 'undefined' || !fb.events) {
        // まだ fb が利用できない場合は、100ms 待って再試行
        setTimeout(initializeFormBridgeCustomization, 100);
        return;
    }

    console.log("fbオブジェクトが検出されました。イベント登録を開始します。");
    
    // 2. カスタムバリデーターの登録（従来の形式）
    fb.addValidators = function(state) {
        return {
            hiragana_only: {
                getMessage: () => 'ひらがなで入力してください。',
                validate: value => /^[ぁ-んー]+$/.test(value)
            },
            valid_date: {
                getMessage: () => '西暦形式（YYYY-MM-DD）で入力してください。',
                validate: value => /^\d{4}-\d{2}-\d{2}$/.test(value)
            },
            gender_check: {
                getMessage: () => '性別は「男」か「女」のいずれかを選択してください。',
                validate: value => value === '男' || value === '女'
            }
        };
    };

    // 3. フォーム作成イベントでバリデーションを適用
    fb.events.form.created.push(function(state) {
        state.fields.find(({code}) => code === "furigana")?.validations.push({
            params: [],
            rule: 'hiragana_only'
        });

        state.fields.find(({code}) => code === "birthdate")?.validations.push({
            params: [],
            rule: 'valid_date'
        });

        state.fields.find(({code}) => code === "gender")?.validations.push({
            params: [],
            rule: 'gender_check'
        });

        return state;
    });
    
    // 4. record.submit.before イベントでバリデーションを二重チェック（保険）
    // fb.events.record.submit.before にイベントを登録する形式に戻します。
    // ※ このイベントがエラーにならないことを期待
    fb.events.record.submit.before = [function(state) {
        const furiganaField = state.fields.find(f => f.code === "furigana");
        const birthdateField = state.fields.find(f => f.code === "birthdate");

        const furiganaValue = furiganaField?.value || "";
        const birthdateValue = birthdateField?.value || "";

        const furiganaValid = /^[ぁ-んー]+$/.test(furiganaValue);
        const birthdateValid = /^\d{4}-\d{2}-\d{2}$/.test(birthdateValue);

        if (!furiganaValid || !birthdateValid) {
            // alertは使用できません。代わりにカスタムモーダルやフィールドエラーを使いますが、
            //ここではFormBridgeの仕様に依存して Promise.reject で止めます。
            alert("入力内容に誤りがあります。修正してください。");
            return Promise.reject(state);
        }

        return state;
    }];
}

// 最初の実行を試みる
initializeFormBridgeCustomization();
