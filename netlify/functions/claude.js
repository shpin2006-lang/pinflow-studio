exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const body = JSON.parse(event.body);
    const msg = body.messages[0];
    
    // Build Gemini contents — handle text only or text + image
    let contents;
    if (msg.image) {
      contents = [{
        parts: [
          { text: msg.content },
          { inline_data: { mime_type: msg.image.mimeType, data: msg.image.data } }
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
          generationConfig: { maxOutputTokens: body.max_tokens || 4096 }
        }),
      }
    );
    const data = await response.json();
    
    if (data.error) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: { message: data.error.message } }),
      };
    }
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: [{ type: "text", text }] }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: error.message } }),
    };
  }
};