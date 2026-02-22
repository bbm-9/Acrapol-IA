// api/search.js
// Proxy para búsqueda vectorial en Supabase

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") return res.status(200).json({ status: "ok" });
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { embedding } = body;
    if (!embedding) return res.status(400).json({ error: "Falta embedding" });

    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/match_documents`, {
      method: "POST",
      headers: {
        "apikey": process.env.SUPABASE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query_embedding: embedding, match_threshold: 0.5, match_count: 5 }),
    });

    const data = await r.json();
    return res.status(200).json({ results: Array.isArray(data) ? data : [] });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
