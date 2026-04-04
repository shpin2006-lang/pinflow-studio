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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: { 
  maxOutputTokens: 8192,
  temperature: 0.7
}
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({
        error: { message: data.error.message || "Gemini API error" }
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({
      content: [{ type: "text", text }]
    });

  } catch (error) {
    return res.status(500).json({
      error: { message: error.message }
    });
  }
}