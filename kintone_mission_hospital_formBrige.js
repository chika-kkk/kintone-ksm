fb.events.initialized = [function(state) {
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
            // phone_unique は削除
        };
    };

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

    // 電話番号の変更時イベントも、重複チェックロジックが不要になったため削除
    
    return state;
}];
