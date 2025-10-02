console.log("０");

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

function createCSV(matchedCodes) {
  const selectedCode = matchedCodes[0]; // 単一選択前提

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

  // モーダル枠
  const modal = document.createElement("div");
  modal.style.backgroundColor = "#fff";
  modal.style.padding = "20px";
  modal.style.borderRadius = "8px";
  modal.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  modal.style.width = "600px";
  modal.style.maxHeight = "80%";
  modal.style.overflowY = "auto";
  modal.innerHTML = `<h2 style="margin-top:0;">患者情報とカルテ</h2><p>読み込み中...</p>`;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // 閉じるボタン（先に定義しておく）
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "閉じる";
  closeBtn.style.marginTop = "10px";
  closeBtn.addEventListener("click", () => overlay.remove());



  overlay.appendChild(modal);
  document.body.appendChild(overlay);

 // 患者情報取得
  const patientQuery = `患者コード = "${selectedCode}"`;
  kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
    app: 19,
    query: patientQuery,
    fields: ['氏名', '性別', '生年月日', '病名', '担当医', '担当看護師', '承認日時', '担当医サイン']
  }, function(patientResp) {
    const patient = patientResp.records[0];
    if (!patient) {
      modal.innerHTML = `<p>患者情報が見つかりませんでした</p>`;
      modal.appendChild(closeBtn);
      return;
    }

    // カルテ情報取得
    const medicalQuery = `患者コード = "${selectedCode}"`;
    kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: 20,
      query: medicalQuery,
      fields: ['病名', '体温',　'脈', '収縮期血圧', '拡張期血圧', '呼吸数']
    }, function(medicalResp) {
      const medical = medicalResp.records[0];

      const html = `
        <h3>患者情報</h3>
        <p>氏名: ${patient.氏名.value}</p>
        <p>性別: ${patient.性別.value}</p>
        <p>生年月日: ${patient.生年月日.value}</p>
        <p>病名: ${patient.病名.value}</p>
        <p>担当医: ${patient.担当医.value}</p>
        <p>担当看護師: ${patient.担当看護師.value}</p>
        <p>承認日時: ${patient.承認日時.value}</p>
        <p>担当医サイン: ${patient.担当医サイン.value}</p>
        <h3>カルテ情報</h3>
        ${medical ? `
          <p>病名: ${medical.病名.value}</p>
          <p>:体温 ${medical.体温.value}</p>
          <p>脈: ${medical.脈.value}</p>
          <p>収縮期血圧: ${medical.収縮期血圧.value}</p>
          <p>拡張期血圧: ${medical.拡張期血圧.value}</p>
          <p>呼吸数: ${medical.呼吸数.value}</p>
        ` : `<p>カルテ情報が見つかりませんでした</p>`}
      `;

      modal.innerHTML = html;

      // CSVダウンロードボタン
      const downloadBtn = document.createElement("button");
      downloadBtn.textContent = "CSVダウンロード";
      downloadBtn.style.marginTop = "10px";
      downloadBtn.addEventListener("click", function() {
        const csvText = [
          `氏名,${patient.氏名.value}`,
          `性別,${patient.性別.value}`,
          `生年月日,${patient.生年月日.value}`,
          `病名,${patient.病名.value}`,
          `担当医,${patient.担当医.value}`,
          `担当看護師,${patient.担当看護師.value}`,
          `承認日時,${patient.承認日時.value}`,
          `担当医サイン,${patient.担当医サイン.value}`,
          medical ? `病名,${medical.病名.value}` : '',
          medical ? `体温,${medical.体温.value}` : '',
          medical ? `脈,${medical.脈.value}` : '',
          medical ? `収縮期血圧,${medical.収縮期血圧.value}` : '',
          medical ? `拡張期血圧,${medical.拡張期血圧.value}` : '',
          medical ? `呼吸数,${medical.呼吸数.value}` : ''
        ].filter(line => line).join('\n');

        const blob = new Blob([csvText], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "patient_full_info.csv";
        a.click();
        URL.revokeObjectURL(url);
      });

      modal.appendChild(downloadBtn);
      modal.appendChild(closeBtn);
    });
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

// 初期化
setupDropdown();
fetchPatientCodes(handlePatientData);



/*
console.log("ｋ");

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

// 印刷用ボタン追加
const recordModalButton = document.createElement("button");
recordModalButton.textContent = "csvを選択する！";
document.body.appendChild(recordModalButton);

recordModalButton.addEventListener("click", function() {
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

  // モーダル枠
  const modal = document.createElement("div");
  modal.style.backgroundColor = "#fff";
  modal.style.padding = "20px";
  modal.style.borderRadius = "8px";
  modal.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  modal.style.width = "500px";
  modal.style.maxHeight = "80%";
  modal.style.overflowY = "auto";

  modal.innerHTML = `
  <h2>患者情報印刷</h2>
  <label>患者コード: 
    <select id="modalPatientSelect">
      ${patientList.map(code => `<option value="${code}">${code}</option>`).join('')}
    </select>
  </label><br><br>
  <label>カルテコード: <input type="text" id="inputMedicalCode"></label><br><br>
  <button id="fetchRecord">取得</button>
  <div id="recordPreview" style="margin-top:20px;"></div>
  <button id="downloadCSV" style="margin-top:10px;">CSVダウンロード</button>
  <button id="closeModal" style="margin-left:10px;">閉じる</button>
`;


  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // 閉じる処理
  document.getElementById("closeModal").addEventListener("click", function() {
    overlay.remove();
  });

  // 取得処理
  document.getElementById("fetchRecord").addEventListener("click", function() {
    const patientCode = document.getElementById("inputPatientCode").value;
    const medicalCode = document.getElementById("inputMedicalCode").value;

    const query = `患者コード = "${patientCode}"`;
    kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: 19,
      query: query,
      fields: ['氏名', '性別', '生年月日', '病名', '担当医']
    }, function(resp) {
      const record = resp.records[0];
      if (!record) {
        alert("患者情報が見つかりませんでした");
        return;
      }

      const preview = `
        <h3>患者情報</h3>
        <p>氏名: ${record.氏名.value}</p>
        <p>性別: ${record.性別.value}</p>
        <p>生年月日: ${record.生年月日.value}</p>
        <p>病名: ${record.病名.value}</p>
        <p>担当医: ${record.担当医.value}</p>
      `;
      document.getElementById("recordPreview").innerHTML = preview;
    });
  });

  // ダウンロード処理
  document.getElementById("downloadCSV").addEventListener("click", function() {
    const previewText = document.getElementById("recordPreview").innerText;
    const blob = new Blob([previewText], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patient_info.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
});


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
*/
