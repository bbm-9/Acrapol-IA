// api/embed.js
// Proxy para generar embeddings desde el navegador sin problemas de CORS

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { text } = req.body;
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
  res.status(200).json({ embedding: data.data[0].embedding });
}
