const $ = (id) => document.getElementById(id);
const statusEl = $("status");

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
