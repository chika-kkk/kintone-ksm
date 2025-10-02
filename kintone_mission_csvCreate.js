const patientInfoAppId = 19;
const medicalRecordAppId = 20;

let patientList = [];
let medicalList = [];

// 患者コード取得
function fetchPatientCodes(callback) {
  kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
    app: patientInfoAppId,
    fields: ['患者コード']
  }, callback);
}

// 患者コード処理
function handlePatientData(resp) {
  const records = resp.records;
  patientList = records.map(r => r.患者コード.value);
  console.log('患者コード一覧:', patientList);

  patientList.forEach(code => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = code;
    select.appendChild(option);
  });
}

// カルテ側の患者コード取得
kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
  app: medicalRecordAppId,
  fields: ['患者コード']
}, function(resp) {
  const records = resp.records;
  medicalList = records.map(r => {
    const code = r.患者コード.value;
    console.log('カルテ側の患者コード:', code);
    return code;
  });
});

// 照合処理
function matchPatientCodes(patientList, medicalList) {
  const matched = patientList.filter(code => medicalList.includes(code));
  console.log('照合済みの患者コード:', matched);
  return matched;
}

// CSV作成＋プレビュー＋ダウンロード＋閉じる
function createCSV(matchedCodes) {
  const csv = matchedCodes.join('\n');
  console.log('CSV出力:\n' + csv);

  let previewArea = document.getElementById("csvPreview");
  if (!previewArea) {
    previewArea = document.createElement("div");
    previewArea.id = "csvPreview";
    previewArea.style.border = "1px solid #ccc";
    previewArea.style.padding = "10px";
    previewArea.style.marginTop = "10px";
    document.body.appendChild(previewArea);
  }

  previewArea.innerHTML = `
    <h3>CSVプレビュー</h3>
    <pre>${csv}</pre>
    <button id="downloadCSV">ダウンロード</button>
  `;

  const downloadBtn = document.getElementById("downloadCSV");
  downloadBtn.addEventListener("click", function() {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "matched_patient_codes.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "閉じる";
  closeBtn.style.marginTop = "10px";
  closeBtn.addEventListener("click", () => {
    previewArea.remove();
  });
  previewArea.appendChild(closeBtn);
}


let select; // グローバルに定義
// ドロップダウン作成
function setupDropdown() {
  select = document.createElement("select");
  select.id = "patientDropdown";
  document.body.appendChild(select);
}


// ボタン作成
const csvCreateButton = document.createElement("button");
csvCreateButton.textContent = "CSV作成する！";
document.body.appendChild(csvCreateButton);

// ボタン押下時の処理
csvCreateButton.addEventListener("click", function() {
  if (!select || typeof select.value === 'undefined') {
  alert("患者コードを選択してください");
  return;
}
  const selectedCode = select.value;
  const matched = matchPatientCodes([selectedCode], medicalList);
  createCSV(matched);
});

// 患者コード取得を実行
fetchPatientCodes(handlePatientData);
