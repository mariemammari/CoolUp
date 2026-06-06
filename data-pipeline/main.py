from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from fetcher import fetch_equipements, fetch_espaces_verts, fetch_fontaines
from models import CoolSpot
from pipeline import run_full_pipeline

app = FastAPI()

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:3000", "http://localhost:5173"],
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
	print("CoolUp data-pipeline ready")


@app.get("/health")
def health() -> dict:
	return {"status": "ok", "service": "CoolUp data-pipeline"}


def _to_coolspot_payload(record: dict) -> dict:
	return {
		"source_id": record.get("identifiant") or record.get("gid"),
		"dataset": record.get("dataset"),
		"nom": record.get("nom"),
		"type": record.get("type") or record.get("type_objet"),
		"lat": record.get("lat"),
		"lng": record.get("lng"),
		"adresse": record.get("adresse") or record.get("voie"),
		"arrondissement": record.get("arrondissement") or record.get("commune"),
		"is_free": record.get("is_free"),
		"is_available": record.get("is_available")
		if "is_available" in record
		else record.get("ouvert_24h"),
		"canicule_ouverture": record.get("canicule_ouverture"),
		"ouverture_estivale_nocturne": record.get("ouverture_estivale_nocturne"),
		"categorie": record.get("categorie"),
		"modele": record.get("modele"),
		"surf_veget_sup8m_2024": record.get("surf_veget_sup8m_2024"),
		"indice_veget_sup8m_2024": record.get("indice_veget_sup8m_2024"),
		"heat_risk_score": record.get("heat_risk_score"),
	}


@app.get("/process")
def process() -> dict:
	try:
		raw_equip = fetch_equipements()
		raw_verts = fetch_espaces_verts()
		raw_fontaines = fetch_fontaines()
		cleaned = run_full_pipeline(raw_equip, raw_verts, raw_fontaines)

		records = [CoolSpot(**_to_coolspot_payload(record)) for record in cleaned]
		return {"total": len(records), "records": records}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))
