// api/embed.js
// Proxy para generar embeddings desde el navegador sin problemas de CORS

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Test GET
  if (req.method === "GET") return res.status(200).json({ status: "ok", message: "Proxy ACRAPOL funcionando" });

  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const text = body?.text;
    if (!text) return res.status(400).json({ error: "Falta el texto" });

    const r = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
        dimensions: 1024,
      }),
    });

    const data = await r.json();
    if (!data.data) return res.status(500).json({ error: "Error OpenAI", detail: data });
    return res.status(200).json({ embedding: data.data[0].embedding });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
