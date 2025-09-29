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
        };
    };
}];
