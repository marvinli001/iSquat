import "server-only";

type ModerationResult = {
  ok: boolean;
  reason: string;
};

const moderationEnabled = process.env.LLM_IMAGE_MODERATION !== "0";
const baseUrl = (process.env.LLM_API_BASE_URL ?? "").replace(/\/+$/, "");
const apiKey = process.env.LLM_API_KEY ?? "";
const model = process.env.LLM_MODEL ?? "";

const buildModerationUrl = () => `${baseUrl}/chat/completions`;

const parseModerationJson = (content: string): ModerationResult | null => {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.ok !== "boolean") {
      return null;
    }
    return {
      ok: parsed.ok,
      reason: typeof parsed.reason === "string" ? parsed.reason : "unspecified",
    };
  } catch {
    return null;
  }
};

export const moderateImage = async (
  dataUrl: string,
  context: string
): Promise<ModerationResult> => {
  if (!moderationEnabled || !baseUrl || !apiKey || !model) {
    return { ok: true, reason: "moderation_disabled" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  const systemPrompt =
    "You are a safety reviewer for a public toilet review app. " +
    "Allow normal restroom photos, building exteriors, signage, and maps. " +
    "Reject nudity, sexual content, graphic violence, gore, hate symbols, " +
    "self-harm, illegal activity, or private personal info. " +
    'Respond only with JSON like {"ok":true,"reason":"short reason"}';

  const userPrompt =
    `Review this image for ${context || "user upload"} compliance.`;

  try {
    const response = await fetch(buildModerationUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, reason: "moderation_request_failed" };
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return { ok: false, reason: "moderation_invalid_response" };
    }

    const parsed = parseModerationJson(content);
    if (!parsed) {
      return { ok: false, reason: "moderation_unparseable" };
    }

    return parsed;
  } catch {
    return { ok: false, reason: "moderation_failed" };
  } finally {
    clearTimeout(timeout);
  }
};
