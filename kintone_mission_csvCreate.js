console.log("OK");

const patientInfoAppId = 19;
const medicalRecordAppId = 20;

let patientList = [];
let medicalList = [];
let select;

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
  medicalList = records.map(r => r.患者コード.value);
  console.log('カルテ側の患者コード:', medicalList);
});

// 照合処理
function matchPatientCodes(patientList, medicalList) {
  const matched = patientList.filter(code => medicalList.includes(code));
  console.log('照合済みの患者コード:', matched);
  return matched;
}

// ドロップダウン作成（画面下への追加は削除済み）
function setupDropdown() {
  select = document.createElement("select");
  select.id = "patientDropdown";
}

// CSV作成処理（省略せずそのまま）
function createCSV(matchedCodes) {
  const selectedCode = matchedCodes[0];
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

  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "CSVダウンロード";
  downloadBtn.style.marginTop = "10px";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "閉じる";
  closeBtn.style.marginTop = "10px";
  closeBtn.addEventListener("click", () => overlay.remove());

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "flex-end";
  buttonContainer.style.gap = "10px";
  buttonContainer.style.marginBottom = "10px";
  buttonContainer.appendChild(downloadBtn);
  buttonContainer.appendChild(closeBtn);

  const patientQuery = `患者コード = "${selectedCode}"`;
  kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
    app: patientInfoAppId,
    query: patientQuery,
    fields: ['氏名', '性別', '生年月日', '病名', '担当医', '担当看護師', '承認日時', '担当医サイン']
  }, function(patientResp) {
    const patient = patientResp.records[0];
    if (!patient) {
      modal.innerHTML = `<p>患者情報が見つかりませんでした</p>`;
      modal.appendChild(closeBtn);
      return;
    }

    const medicalQuery = `患者コード = "${selectedCode}" order by 日付 desc limit 1`;
    kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: medicalRecordAppId,
      query: medicalQuery,
      fields: ['病名', '体温', '脈', '収縮期血圧', '拡張期血圧', '呼吸数', '日付']
    }, function(medicalResp) {
      const medical = medicalResp.records[0];
      console.log("最新のカルテ:", medical);

      fetch("https://chika-kkk.github.io/kintone-ksm/kintone_mission1popupTemplate.html")
        .then(res => res.text())
        .then(html => {
          modal.innerHTML = html;
          modal.prepend(buttonContainer);

          document.getElementById("氏名").textContent = patient.氏名.value;
          document.getElementById("性別").textContent = patient.性別.value;
          document.getElementById("生年月日").textContent = patient.生年月日.value;
          document.getElementById("病名").textContent = patient.病名.value;
          document.getElementById("体温").textContent = medical?.体温?.value || "未記録";
          document.getElementById("脈").textContent = medical?.脈?.value || "未記録";
          document.getElementById("収縮期血圧").textContent = medical?.収縮期血圧?.value || "未記録";
          document.getElementById("拡張期血圧").textContent = medical?.拡張期血圧?.value || "未記録";
          document.getElementById("呼吸数").textContent = medical?.呼吸数?.value || "未記録";
          document.getElementById("担当医").textContent = patient.担当医.value[0]?.name || "未設定";
          document.getElementById("担当看護師").textContent = patient.担当看護師.value[0]?.name || "未設定";
          document.getElementById("承認日時").textContent = patient.承認日時.value;
          document.getElementById("担当医サイン").textContent = patient.担当医サイン.value;
        });

      downloadBtn.addEventListener("click", function() {
        const csvText = [
          `氏名,${patient.氏名.value}`,
          `性別,${patient.性別.value}`,
          `生年月日,${patient.生年月日.value}`,
          `病名,${patient.病名.value}`,
          `担当医,${patient.担当医.value[0]?.name || ""}`,
          `担当看護師,${patient.担当看護師.value[0]?.name || ""}`,
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
    });
  });
}

// 一覧画面のヘッダーにボタンとドロップダウンを追加
(function() {
  "use strict";

  kintone.events.on('app.record.index.show', function() {
    if (document.getElementById("csvCreateButton")) return;

    const headerSpace = kintone.app.getHeaderMenuSpaceElement();

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "10px";

    const csvCreateButton = document.createElement("button");
    csvCreateButton.id = "csvCreateButton";
    csvCreateButton.textContent = "CSV作成する！";

    setupDropdown(); // ドロップダウン要素を作成

    container.appendChild(csvCreateButton);
    container.appendChild(select);
    headerSpace.appendChild(container);

    fetchPatientCodes(handlePatientData);

    csvCreateButton.addEventListener("click", function() {
      if (!select || typeof select.value === 'undefined') {
        alert("患者コードを選択してください");
        return;
      }
      const selectedCode = select.value;
      const matched = matchPatientCodes([selectedCode], medicalList);
      createCSV(matched);
    });
  });
})();
