const express = require("express");

const app = express();
const mapsApiKey = process.env.MAPS_API_KEY;

if (!mapsApiKey) {
  console.warn("MAPS_API_KEY is not set. Google Maps features will not work.");
}

app.get("/api/autocomplete", async (req, res) => {
  if (!mapsApiKey) {
    res.status(500).json({ error: "MAPS_API_KEY is not configured" });
    return;
  }
  const input = req.query.input;
  if (!input || typeof input !== "string") {
    res.status(400).json({ error: "Missing input parameter" });
    return;
  }
  try {
    const params = new URLSearchParams({
      input,
      key: mapsApiKey,
      types: "address",
      components: "country:us",
    });
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Google API responded ${resp.status}`);
    }
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error("Autocomplete proxy failed", err);
    res.status(500).json({ error: "Autocomplete lookup failed" });
  }
});

app.get("/api/staticmap", async (req, res) => {
  if (!mapsApiKey) {
    res.status(500).json({ error: "MAPS_API_KEY is not configured" });
    return;
  }
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    res.status(400).json({ error: "Missing lat or lon parameter" });
    return;
  }
  try {
    const params = new URLSearchParams({
      center: `${lat},${lon}`,
      zoom: "13",
      size: "600x300",
      markers: `color:red|${lat},${lon}`,
      key: mapsApiKey,
    });
    const url = `https://maps.googleapis.com/maps/api/staticmap?${params}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Google API responded ${resp.status}`);
    res.set("Content-Type", resp.headers.get("content-type") || "image/png");
    const buf = await resp.arrayBuffer();
    res.send(Buffer.from(buf));
  } catch (err) {
    console.error("Static map proxy failed", err);
    res.status(500).json({ error: "Static map lookup failed" });
  }
});

app.use(express.static("dist"));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
