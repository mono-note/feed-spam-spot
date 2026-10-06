const COLORS = {
  ad: "#f59e0b", spam: "#dc2626", sales: "#7c3aed", affiliate: "#db2777",
  scam: "#991b1b", bait: "#0891b2",
};
const MIN_P = 0.6;
const seen = new WeakSet();
const cache = new Map(); // post text -> result
const queue = [];
let running = 0;

function pump() {
  while (running < 3 && queue.length) {
    running++;
    queue.shift()().finally(() => { running--; pump(); });
  }
}

const q = (a, sel) => a.querySelector(sel)?.innerText ?? "";

// one adapter per site: how to find posts and read them
const ADAPTERS = {
  x: {
    posts: () => document.querySelectorAll('article[data-testid="tweet"]'),
    read: (a) => ({
      text: q(a, '[data-testid="tweetText"]'),
      author: q(a, '[data-testid="User-Name"]'),
      links: [...a.querySelectorAll("a[href]")].map((l) => l.innerText.trim()).filter((t) => /\w\.\w/.test(t) && !t.startsWith("@")),
      promoted: [...a.querySelectorAll("span")].some((s) => /^(Ad|Promoted|โฆษณา)$/.test(s.textContent)),
    }),
  },
  // ponytail: Facebook obfuscates its DOM; selectors are best-effort and may need re-tuning
  fb: {
    posts: () => [...document.querySelectorAll('div[role="article"]')].filter((a) => !a.parentElement.closest('[role="article"]')), // skip comments
    read: (a) => ({
      text: q(a, '[data-ad-rendering-role="story_message"], [data-ad-comet-preview="message"], [data-ad-preview="message"]'),
      author: q(a, '[data-ad-rendering-role="profile_name"], h2, h3'),
      links: [...a.querySelectorAll("a[href]")].map((l) => {
        try {
          const u = new URL(l.href);
          return u.hostname === "l.facebook.com" ? new URL(u.searchParams.get("u")).hostname : u.hostname;
        } catch { return ""; }
      }).filter((h) => h && !h.endsWith("facebook.com")),
      promoted: /Sponsored|ได้รับการสนับสนุน/.test(a.innerText.slice(0, 300)),
    }),
  },
};
const site = ADAPTERS[location.hostname.includes("facebook") ? "fb" : "x"];

const NAMES = {
  ad: "โฆษณา", spam: "สแปม", sales: "ขายของ", affiliate: "ลิงก์ Affiliate",
  scam: "หลอกลงทุน/Scam", bait: "ปั่น Engagement/ขอ Follow",
};

function badge(a, labels) {
  const c = COLORS[labels[0]];
  a.style.position = "relative";
  const box = document.createElement("div");
  box.style.cssText = "visibility:hidden;position:absolute;top:0;right:0;z-index:9;display:flex;flex-wrap:wrap;justify-content:flex-end;max-width:70%";
  for (const l of labels) {
    const b = document.createElement("span");
    b.textContent = NAMES[l];
    b.style.cssText = `padding:2px 10px;font:700 12px system-ui;color:#fff;background:${COLORS[l]}`;
    box.append(b);
  }
  a.append(box);

  const dim = document.createElement("div");
  dim.style.cssText = `position:absolute;inset:0;z-index:8;pointer-events:none;visibility:hidden;background:${c}40`;
  a.append(dim);

  const stamp = document.createElement("div");
  stamp.textContent = NAMES[labels[0]];
  stamp.style.cssText = `position:absolute;top:50%;left:50%;z-index:9;pointer-events:none;visibility:hidden;padding:8px 32px;border:8px solid ${c};border-radius:16px;color:${c};background:#fffffff2;box-shadow:0 0 0 4px #fffffff2,0 8px 30px #0006;font:900 56px system-ui;letter-spacing:.06em;white-space:nowrap;opacity:.95;transform:translate(-50%,-50%) rotate(-12deg);`;
  a.append(stamp);
  const play = () => {
  a.style.cssText += `;outline:3px solid ${c};outline-offset:-3px;background:${c}33`;
  dim.style.visibility = stamp.style.visibility = box.style.visibility = "visible";
  dim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
  stamp.animate([
    { opacity: 0, transform: "translate(-50%,-50%) rotate(-12deg) scale(3)" },
    { opacity: 1, transform: "translate(-50%,-50%) rotate(-12deg) scale(.92)", offset: .6 },
    { opacity: .95, transform: "translate(-50%,-50%) rotate(-12deg) scale(1)" },
  ], { duration: 450, easing: "cubic-bezier(.2,.8,.3,1)" });
  a.animate([{ transform: "translate(0,0)" }, { transform: "translate(-3px,2px)", offset: .6 }, { transform: "translate(2px,-1px)", offset: .75 }, { transform: "translate(0,0)" }], { duration: 450 }); // impact shake
  };
  // play once, when half the post (or half the screen, for tall posts) is visible
  const io = new IntersectionObserver(([e]) => {
    if (e.intersectionRatio >= .5 || e.intersectionRect.height >= innerHeight / 2) { io.disconnect(); play(); }
  }, { threshold: [0, .25, .5, .75, 1] });
  io.observe(a);
}

function handle(a) {
  if (seen.has(a)) return;
  seen.add(a);
  const { promoted, ...post } = site.read(a);
  if (promoted) return badge(a, ["ad"]); // platform's own label, no API call
  if (!post.text) return;
  queue.push(async () => {
    try {
      if (!cache.has(post.text)) {
        const res = await chrome.runtime.sendMessage(post);
        if (res) cache.set(post.text, res); // don't cache failures
      }
    } catch (e) {
      return console.warn("feed-spam-spotter:", e.message); // e.g. extension reloaded: refresh the page
    }
    const r = cache.get(post.text);
    if (!r) return;
    const hits = Object.keys(r).filter((k) => r[k] >= MIN_P).sort((x, y) => r[y] - r[x]);
    if (hits.length) badge(a, hits);
  });
  pump();
}

const scan = () => site.posts().forEach(handle);
new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
scan();
