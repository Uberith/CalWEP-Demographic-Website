import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
import httpx

app = FastAPI()

maps_api_key = os.environ.get("GOOGLE_MAPS_API_KEY") or os.environ.get("MAPS_API_KEY")
if not maps_api_key:
    print("GOOGLE_MAPS_API_KEY is not set. Google Maps features will not work.")

@app.get("/api/staticmap")
async def staticmap(lat: float | None = None, lon: float | None = None):
    if not maps_api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_MAPS_API_KEY is not configured")
    if lat is None or lon is None:
        raise HTTPException(status_code=400, detail="Missing lat or lon parameter")
    params = {
        "center": f"{lat},{lon}",
        "zoom": "15",
        "size": "600x400",
        "markers": f"color:red|{lat},{lon}",
        "key": maps_api_key,
    }
    url = "https://maps.googleapis.com/maps/api/staticmap"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
    if resp.status_code != 200:
        print("Google Static Map error", resp.status_code, resp.text)
        raise HTTPException(status_code=502, detail="Static map lookup failed")
    return Response(content=resp.content, media_type=resp.headers.get("content-type", "image/png"))
