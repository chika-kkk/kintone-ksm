window.FormBridgeEvents = window.FormBridgeEvents || {};
window.FormBridgeEvents.initialized = [function(state) {
  const validators = {
    hiragana_only: {
      getMessage: () => 'ひらがなで入力してください。',
      validate: value => /^[ぁ-んー]+$/.test(value)
    },
    valid_date: {
      getMessage: () => '西暦形式（YYYY-MM-DD）で入力してください。',
      validate: value => /^\d{4}-\d{2}-\d{2}$/.test(value)
    }
  };

  // バリデーションを state に直接適用
  state.fields.find(({code}) => code === "furigana")?.validations.push({
    params: [],
    rule: "hiragana_only"
  });

  state.fields.find(({code}) => code === "birthdate")?.validations.push({
    params: [],
    rule: "valid_date"
  });

  // バリデーションルールを返す
  return {
    ...state,
    validators
  };
}];
