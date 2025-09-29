console.log("JS loaded")
(function waitForFb(retry = 0) {
  if (typeof fb !== 'undefined') {
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
          }
        };
      };

      state.fields.find(({code}) => code === "furigana")?.validations.push({
        params: [],
        rule: 'hiragana_only'
      });

      state.fields.find(({code}) => code === "birthdate")?.validations.push({
        params: [],
        rule: 'valid_date'
      });

      return state;
    }];
  } else if (retry < 10) {
    setTimeout(() => waitForFb(retry + 1), 300); // 最大3秒まで待機
  } else {
    console.error("FormBridge (fb) が定義されませんでした。");
  }
})();
