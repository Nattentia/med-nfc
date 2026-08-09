// 출처: zzngseo/yaktalk-data medications.json. 약 추가/변경 시 이 목록도 같이 갱신할 것.
const DB = [
  { code: "MED001", name: "니트로글리세린정", keyword: "니트로글리세린" },
  { code: "MED002", name: "노바스크정", keyword: "노바스크" },
  { code: "MED003", name: "코솝점안액", keyword: "코솝" },
  { code: "MED004", name: "포사맥스정", keyword: "포사맥스" },
  { code: "MED005", name: "메트포민정", keyword: "메트포민" },
  { code: "MED006", name: "에스프라졸정", keyword: "에스프라졸" },
  { code: "MED007", name: "부광리바스티그민패취10", keyword: "리바스티그민" },
  { code: "MED008", name: "케토톱플라스타", keyword: "케토톱" },
  { code: "MED009", name: "제일와파린정", keyword: "와파린" },
];

const YAKTALK_BASE = "https://yaktalk.vercel.app/med/";
const WRITE_PAGE_BASE = "https://nattentia.github.io/med-nfc/write.html";
const QR_API = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=";

let dismissed = false;

function showQrModal(code) {
  const existing = document.getElementById("yaktalk-nfc-qr-modal");
  if (existing) existing.remove();

  const writeUrl = `${WRITE_PAGE_BASE}?code=${code}`;
  const overlay = document.createElement("div");
  overlay.id = "yaktalk-nfc-qr-modal";
  overlay.innerHTML = `
    <div class="yt-qr-box">
      <div class="yt-qr-close">✕</div>
      <div class="yt-qr-title">${code} 태그 굽기 페이지</div>
      <img src="${QR_API}${encodeURIComponent(writeUrl)}" alt="QR">
      <div class="yt-qr-hint">폰(안드로이드 크롬)으로 스캔하면<br>이 약이 자동 선택된 태그 굽기 화면이 열립니다.</div>
      <div class="yt-qr-url">${writeUrl}</div>
    </div>
  `;
  overlay.onclick = (e) => {
    if (e.target === overlay || e.target.classList.contains("yt-qr-close")) {
      overlay.remove();
    }
  };
  document.body.appendChild(overlay);
}

function findMatches() {
  const text = document.body.innerText || "";
  return DB.filter((d) => text.includes(d.keyword));
}

function render(matches) {
  let box = document.getElementById("yaktalk-nfc-overlay");

  if (matches.length === 0 || dismissed) {
    if (box) box.remove();
    return;
  }

  if (!box) {
    box = document.createElement("div");
    box.id = "yaktalk-nfc-overlay";
    document.body.appendChild(box);
  }

  box.innerHTML = "";

  const header = document.createElement("div");
  header.className = "yt-header";
  header.innerHTML = `<span>약톡 NFC 등록 약물 (${matches.length})</span>`;
  const closeBtn = document.createElement("span");
  closeBtn.className = "yt-close";
  closeBtn.textContent = "✕";
  closeBtn.onclick = () => {
    dismissed = true;
    box.remove();
  };
  header.appendChild(closeBtn);
  box.appendChild(header);

  matches.forEach((m) => {
    const item = document.createElement("div");
    item.className = "yt-item";
    item.innerHTML = `
      <div class="yt-name">${m.name}</div>
      <div class="yt-code">${m.code}</div>
      <div class="yt-hint">클릭: 코드 복사 · Shift+클릭: 폰 태그굽기 QR · Alt+클릭: 약톡 미리보기</div>
    `;
    item.onclick = (e) => {
      if (e.shiftKey) {
        showQrModal(m.code);
        return;
      }
      if (e.altKey) {
        window.open(YAKTALK_BASE + m.code, "_blank");
        return;
      }
      navigator.clipboard.writeText(m.code).then(() => {
        const hint = item.querySelector(".yt-hint");
        const original = hint.textContent;
        hint.textContent = "코드 복사됨!";
        setTimeout(() => (hint.textContent = original), 1200);
      });
    };
    box.appendChild(item);
  });
}

function scan() {
  render(findMatches());
}

scan();

let scanScheduled = false;
const observer = new MutationObserver(() => {
  if (scanScheduled) return;
  scanScheduled = true;
  setTimeout(() => {
    scanScheduled = false;
    scan();
  }, 500);
});
observer.observe(document.body, { childList: true, subtree: true, characterData: true });
