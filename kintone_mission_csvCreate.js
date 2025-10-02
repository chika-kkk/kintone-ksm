console.log("ok");

const patientDetaAppId = 19;
const medicalRecordAppId = 20;

let patientList = [];
let medicalList = [];

function fetchPatientCodes(callback) {
  kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
    app: patientInfoAppID,
    fields: ['患者コード']
  }, callback);
}

function handlePatientData(resp) {
  const records = resp.records;
  patientList = records.map(r => r.患者コード.value);
  console.log('患者コード一覧:', patientList);
}

kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
  app: medicalRecordAppID,
  fields: ['患者コード']
}, function(resp) {
  const records = resp.records;
   medicalList = records.map(r => {
    const code = r.患者コード.value;
    console.log('カルテ側の患者コード:', code);
    return code;
  });
});

function matchPatientCodes(patientList, medicalList) {
  const matched = patientList.filter(code => medicalList.includes(code));
  console.log('照合済みの患者コード:', matched);
  return matched;
}


function createCSV(matchedCodes) {
  const csv = matchedCodes.join('\n');
  console.log('CSV出力:\n' + csv);
  // ここでダウンロード処理を追加してもOK
}

const select = document.createElement("select");
select.id = "patientDropdown";
document.body.appendChild(select);

// 患者コードを取得後→追加
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

const csvCreateButton = document.createElement("button");
csvCreateButton.textContent = "CSV作成する！";

function createCSV(matchedCodes) {
  const csv = matchedCodes.join('\n');
  console.log('CSV出力:\n' + csv);

  // プレビュー枠を探す or なければ作る
  let previewArea = document.getElementById("csvPreview");
  if (!previewArea) {
    previewArea = document.createElement("div");
    previewArea.id = "csvPreview";
    previewArea.style.border = "1px solid #ccc";
    previewArea.style.padding = "10px";
    previewArea.style.marginTop = "10px";
    document.body.appendChild(previewArea);
  }

  // プレビュー内容を表示
  previewArea.innerHTML = `
    <h3>CSVプレビュー</h3>
    <pre>${csv}</pre>
    <button id="downloadCSV">ダウンロード</button>
  `;

  // ダウンロード処理を追加
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
}


//ボタンを押したときの処理
//患者コードがカルテ側にも存在するかチェックして、一致したコードをに返す
csvCreateButton.addEventListener("click", function() {
  const selectedCode = select.value;
  const matched = matchPatientCodes([selectedCode], medicalList);
  createCSV(matched);
});
document.body.appendChild(csvCreateButton);

//閉じるボタン
const closeBtn = document.createElement("button");
closeBtn.textContent = "閉じる";
closeBtn.addEventListener("click", () => {
  previewArea.remove();
});
previewArea.appendChild(closeBtn);
