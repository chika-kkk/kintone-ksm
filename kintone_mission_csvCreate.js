console.log("o");

const patientInfoAppId = 19;
const medicalRecordAppId = 20;

let patientList = [];
let medicalList = [];
let select; // グローバルに定義

// ドロップダウン作成
function setupDropdown() {
  select = document.createElement("select");
  select.id = "patientDropdown";
  document.body.appendChild(select);
}

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

  if (!select) {
    console.warn("select が未定義です。setupDropdown() が呼ばれていない可能性があります。");
    return;
  }

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

  // モーダル背景
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  // 書類風の枠
  const modal = document.createElement("div");
  modal.style.backgroundColor = "#fff";
  modal.style.padding = "20px";
  modal.style.borderRadius = "8px";
  modal.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  modal.style.width = "500px";
  modal.style.maxHeight = "80%";
  modal.style.overflowY = "auto";

  modal.innerHTML = `
    <h2 style="margin-top:0;">CSVプレビュー</h2>
    <pre style="background:#f9f9f9; padding:10px; border:1px solid #ccc;">${csv}</pre>
    <button id="downloadCSV" style="margin-top:10px;">ダウンロード</button>
    <button id="closeModal" style="margin-left:10px;">閉じる</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // ダウンロード処理
  document.getElementById("downloadCSV").addEventListener("click", function() {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "matched_patient_codes.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  // 閉じる処理
  document.getElementById("closeModal").addEventListener("click", function() {
    overlay.remove();
  });
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

setupDropdown();
fetchPatientCodes(handlePatientData);
