const Q = {
  ad: "Is this post a paid advertisement or sponsored promotion of a brand or product?",
  spam: "Is this post spam, a bot post, or unsolicited junk?",
  sales: "Is the author selling their own product, service or course (including a helpful-looking thread that ends in a pitch), or asking people to DM/buy?",
  affiliate: "Does this post promote a product through an affiliate, referral or discount-code link for commission?",
  scam: "Is this post a scam: fake investment, guaranteed profit, crypto pump, or luring people into a Line/Telegram group to send money?",
  bait: "Is this post engagement bait, such as asking to RT/like for a giveaway, reply with a word, or begging for follows/follow-backs?",
};
const QUESTIONS = Object.fromEntries(Object.entries(Q).map(([k, v]) => [k, { type: "noul", instructions: v }]));

chrome.runtime.onMessage.addListener((post, _sender, reply) => {
  classify(post).then(reply, () => reply(null));
  return true; // async reply
});

async function classify(post) {
  const { apiKey, enabled } = await chrome.storage.local.get(["apiKey", "enabled"]);
  if (!apiKey || enabled === false) return null;
  const res = await fetch("https://api.typesafe.ai/v1/systemone", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ state: post, model: "jev-latest", questions: QUESTIONS }),
  });
  if (!res.ok) throw new Error(res.status); // ponytail: no retry/backoff on 429, add when rate-limited
  const { answers } = await res.json();
  return Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v.noul]));
}
