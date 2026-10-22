const $ = (id) => document.getElementById(id);
const statusEl = $("status");

const toggle = $("enabled");
const renderEnabled = (enabled) => {
  toggle.checked = enabled;
  $("enabled-state").textContent = enabled ? "เปิดอยู่" : "ปิดอยู่";
};
chrome.storage.local.get({ enabled: true }, ({ enabled }) => {
  renderEnabled(enabled !== false);
  toggle.disabled = false;
});
toggle.onchange = async () => {
  const enabled = toggle.checked;
  toggle.disabled = true;
  try {
    await chrome.storage.local.set({ enabled });
    renderEnabled(enabled);
  } catch {
    renderEnabled(!enabled);
    $("enabled-state").textContent = "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง";
  } finally {
    toggle.disabled = false;
  }
};

chrome.storage.local.get({ mode: "label" }, ({ mode }) => ($("mode").checked = mode === "hide"));
$("mode").onchange = () => chrome.storage.local.set({ mode: $("mode").checked ? "hide" : "label" });

chrome.storage.local.get("apiKey", ({ apiKey }) => {
  $("key").value = apiKey ?? "";
  statusEl.textContent = apiKey ? "✓ Key saved" : "Enter your key to start";
  statusEl.className = apiKey ? "ok" : "";
});

$("eye").onclick = () => {
  $("key").classList.toggle("masked");
};

const save = () =>
  chrome.storage.local.set({ apiKey: $("key").value.trim() }, () => {
    statusEl.textContent = "✓ Saved. Refresh the page to apply";
    statusEl.className = "ok";
  });
$("save").onclick = save;
$("key").onkeydown = (e) => {
  if (e.key === "Enter") save();
};
