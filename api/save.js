// api/save.js
// Proxy para guardar fragmentos en Supabase sin problemas de CORS

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") return res.status(200).json({ status: "ok", message: "Save proxy funcionando" });
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { content, metadata, embedding } = body;
    if (!content || !embedding) return res.status(400).json({ error: "Faltan datos" });

    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/documents`, {
      method: "POST",
      headers: {
        "apikey": process.env.SUPABASE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ content, metadata, embedding }),
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: "Error Supabase", detail: err });
    }

    return res.status(200).json({ success: true });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
