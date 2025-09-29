fb.events.form.created.push(function(state) {
  // バリデーションルール定義
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

  // バリデーション適用
  state.fields.find(({code}) => code === "ひらがな")?.validations.push({
    params: [],
    rule: 'hiragana_only'
  });

  state.fields.find(({code}) => code === "生年月日")?.validations.push({
    params: [],
    rule: 'valid_date'
  });

  state.fields.find(({code}) => code === "性別")?.validations.push({
    params: [],
    rule: 'gender_check'
  });

  return state;
});

// 電話番号重複チェック（kViewer連携）
fb.events.fields.phone.changed = [function(state) {
  const phoneValue = state.record.phone.value;
  const kv_data = "https://kviewer.kintoneapp.com/view/416293";
  const params = {
    additionalFilters: [
      { width: "and", field: "緊急連絡先", sign: "=", value: phoneValue }
    ]
  };
  const url = kViewr.generateUrl(kv_data, params);
  return $j.ajax({ url }).then(function(data) {
    state.fields.find(({code}) => code === "phone")?.validations.push({
      params: [data],
      rule: 'phone_unique'
    });
    return state;
  });
}];
