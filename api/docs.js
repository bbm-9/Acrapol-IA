// api/docs.js
// Listar y eliminar documentos del temario

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Listar documentos
  if (req.method === "GET") {
    try {
      const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/documents?select=id,metadata&order=id.desc&limit=1000`, {
        headers: {
          "apikey": process.env.SUPABASE_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
        },
      });
      const data = await r.json();
      if (!Array.isArray(data)) return res.status(500).json({ error: "Error Supabase", detail: data });

      const grouped = {};
      data.forEach(d => {
        const src = d.metadata?.source || "Sin nombre";
        if (!grouped[src]) grouped[src] = { name: src, count: 0 };
        grouped[src].count++;
      });
      return res.status(200).json({ docs: Object.values(grouped) });

    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Eliminar documentos por nombre
  if (req.method === "DELETE") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { name } = body;
      if (!name) return res.status(400).json({ error: "Falta nombre" });

      await fetch(`${process.env.SUPABASE_URL}/rest/v1/documents?metadata->>source=eq.${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: {
          "apikey": process.env.SUPABASE_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
        },
      });
      return res.status(200).json({ success: true });

    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
