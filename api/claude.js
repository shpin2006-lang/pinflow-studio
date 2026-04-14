const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
  process.env.GEMINI_API_KEY_7,
  process.env.GEMINI_API_KEY_8,
  process.env.GEMINI_API_KEY_9,
].filter(Boolean);

let currentKeyIndex = 0;

function getNextKey() {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const body = req.body;
    const msg = body.messages[0];

    let contents;
    if (msg.image && msg.image.data) {
      contents = [{
        parts: [
          { text: msg.content },
          {
            inline_data: {
              mime_type: msg.image.mimeType || "image/jpeg",
              data: msg.image.data
            }
          }
        ]
      }];
    } else {
      contents = [{ parts: [{ text: msg.content }] }];
    }

    // Try each key until one works
    let lastError = null;
    for (let i = 0; i < API_KEYS.length; i++) {
      const key = getNextKey();
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              generationConfig: {
                maxOutputTokens: 4096,
                temperature: 0.7
              }
            }),
          }
        );

        const data = await response.json();

        // If quota exceeded or server error try next key
        if (data.error?.code === 429 ||
            data.error?.code === 503 ||
            data.error?.code === 504 ||
            data.error?.status === "RESOURCE_EXHAUSTED") {
          lastError = data.error;
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }

        if (data.error) {
          return res.status(400).json({
            error: { message: data.error.message || "Gemini API error" }
          });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return res.status(200).json({
          content: [{ type: "text", text }]
        });

      } catch (fetchError) {
        lastError = fetchError;
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
    }

    // All keys failed
    return res.status(429).json({
      error: { message: lastError?.message || "All API keys exhausted. Please try again tomorrow." }
    });

  } catch (error) {
    return res.status(500).json({
      error: { message: error.message }
    });
  }
}