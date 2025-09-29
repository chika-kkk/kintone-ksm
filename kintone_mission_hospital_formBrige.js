window.FormBridgeEvents = window.FormBridgeEvents || {};

// バリデーションルールの登録
window.FormBridgeEvents.addValidators = function(state) {
  return {
    hiragana_only: {
      getMessage: () => 'ひらがなで入力してください。',
      validate: value => /^[ぁ-んー]+$/.test(value)
    },
    valid_date: {
      getMessage: () => '西暦形式（YYYY-MM-DD）で入力してください。',
      validate: value => /^\d{4}-\d{2}-\d{2}$/.test(value)
    }
  };
};

// 初期化時にバリデーションをフィールドに適用
window.FormBridgeEvents.initialized = [function(state) {
  state.fields.find(({code}) => code === "furigana")?.validations.push({
    params: [],
    rule: "hiragana_only"
  });

  state.fields.find(({code}) => code === "birthdate")?.validations.push({
    params: [],
    rule: "valid_date"
  });

  return state;
}];
