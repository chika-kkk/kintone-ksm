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
    },
    phone_unique: {
      getMessage: () => 'この電話番号はすでに登録されています。',
      validate: (value, params) => params[0].totalCount === 0
    }
  };
};

// ひらがなチェック
fb.events.form.created.push(function(state) {
  state.fields.find(({code}) => code === "furigana").validations.push({
    params: [],
    rule: 'hiragana_only'
  });
  return state;
});

// 生年月日チェック
fb.events.form.created.push(function(state) {
  state.fields.find(({code}) => code === "birthdate").validations.push({
    params: [],
    rule: 'valid_date'
  });
  return state;
});

// 性別チェック
fb.events.form.created.push(function(state) {
  state.fields.find(({code}) => code === "gender").validations.push({
    params: [],
    rule: 'gender_check'
  });
  return state;
});

// 電話番号重複チェック（kViewer連携）
fb.events.fields.phone.changed = [function(state) {
  const phoneValue = state.record.phone.value;
  const kv_data = "https://kviewer.kintoneapp.com/view/〇〇"; // あなたのkViewerビューURLに置き換えてね
  const params = {
    additionalFilters: [
      { width: "and", field: "電話番号", sign: "=", value: phoneValue }
    ]
  };
  const url = kViewr.generateUrl(kv_data, params);
  return $j.ajax({ url }).then(function(data) {
    state.fields.find(({code}) => code === "phone").validations.push({
      params: [data],
      rule: 'phone_unique'
    });
    return state;
  });
}];
