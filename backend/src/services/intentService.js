"use strict";

/**
 * Intent detection using Claude API.
 * Returns one of: complaint | refund | urgent | approval | invoice | greeting | other
 */

const INTENT_LABELS = [
  "complaint",
  "refund",
  "urgent",
  "approval",
  "invoice",
  "greeting",
  "other",
];

// Keyword-based fallback when AI API is unavailable
function detectIntentByKeywords(subject = "", snippet = "") {
  const text = (subject + " " + snippet).toLowerCase();
  if (
    /urgent|asap|immediately|emergency|critical|help|sos|please check/.test(
      text,
    )
  )
    return "urgent";
  if (
    /complaint|complain|unhappy|dissatisfied|issue|problem|wrong|bad|terrible/.test(
      text,
    )
  )
    return "complaint";
  if (/refund|money back|return|cancel|reimburs/.test(text)) return "refund";
  if (/invoice|bill|payment|due|amount|receipt/.test(text)) return "invoice";
  if (/approve|approval|sign off|authorize|confirm|review|pending/.test(text))
    return "approval";
  if (/hello|hi |hey |greetings|good morning|good afternoon|dear/.test(text))
    return "greeting";
  return "other";
}

async function detectIntent(subject = "", snippet = "") {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return detectIntentByKeywords(subject, snippet);

  const prompt = `You are an email intent classifier. Given the subject and snippet below, reply with EXACTLY ONE word from this list: ${INTENT_LABELS.join(", ")}.

Subject: ${subject}
Snippet: ${snippet.slice(0, 300)}

Intent:`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 10,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await resp.json();
    // Handle API errors (e.g. low credits) — fall back to keyword detection
    if (data?.type === "error") {
      console.warn(
        "intentService API error:",
        data.error?.message,
        "— using keyword fallback",
      );
      return detectIntentByKeywords(subject, snippet);
    }
    const raw = (data?.content?.[0]?.text || "").trim().toLowerCase();
    return INTENT_LABELS.includes(raw)
      ? raw
      : detectIntentByKeywords(subject, snippet);
  } catch (err) {
    console.error(
      "intentService error:",
      err.message,
      "— using keyword fallback",
    );
    return detectIntentByKeywords(subject, snippet);
  }
}

/**
 * Auto-suggest rules based on email history patterns.
 * Returns array of suggested rule objects.
 */
async function suggestRules(emailSamples = []) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || emailSamples.length === 0) return [];

  const samples = emailSamples
    .slice(0, 20)
    .map((s) => `From: ${s.from} | Subject: ${s.subject}`)
    .join("\n");

  const prompt = `Analyze these email patterns and suggest up to 3 automation rules. Reply ONLY with a JSON array (no markdown, no extra text):
[
  {
    "name": "Rule name",
    "reason": "Why this rule is useful",
    "conditions": { "from": "...", "subjectContains": "...", "intentTrigger": "complaint|refund|urgent|approval|invoice|greeting|other" },
    "actions": { "label": "LabelName", "autoReply": false, "autoReplyTemplate": "", "archive": false }
  }
]

Email patterns:
${samples}`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await resp.json();
    const raw = (data?.content?.[0]?.text || "").trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("suggestRules error:", err.message);
    return [];
  }
}

module.exports = { detectIntent, suggestRules };
