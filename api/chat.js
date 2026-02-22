// api/chat.js
// Proxy para llamadas a Claude desde el navegador

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

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: system || "",
        messages,
      }),
    });

    const data = await r.json();
    if (!data.content) return res.status(500).json({ error: "Error Claude", detail: data });
    return res.status(200).json({ reply: data.content[0].text });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
