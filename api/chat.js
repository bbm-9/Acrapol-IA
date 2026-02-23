// api/chat.js
// Proxy para llamadas a OpenAI desde el navegador

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") return res.status(200).json({ status: "ok", message: "Chat proxy funcionando" });
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { messages, system } = body;
    if (!messages) return res.status(400).json({ error: "Faltan mensajes" });

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 1500,
        messages: [
          { role: "system", content: system || "" },
          ...messages
        ],
      }),
    });

    const data = await r.json();
    if (!data.choices) return res.status(500).json({ error: "Error OpenAI", detail: data });
    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
