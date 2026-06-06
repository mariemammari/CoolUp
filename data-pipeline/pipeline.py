import unicodedata

import pandas as pd

COMMUNE_MAP = {
	"PARIS 1ER ARRONDISSEMENT": "75001",
	"PARIS 2EME ARRONDISSEMENT": "75002",
	"PARIS 3EME ARRONDISSEMENT": "75003",
	"PARIS 4EME ARRONDISSEMENT": "75004",
	"PARIS 5EME ARRONDISSEMENT": "75005",
	"PARIS 6EME ARRONDISSEMENT": "75006",
	"PARIS 7EME ARRONDISSEMENT": "75007",
	"PARIS 8EME ARRONDISSEMENT": "75008",
	"PARIS 9EME ARRONDISSEMENT": "75009",
	"PARIS 10EME ARRONDISSEMENT": "75010",
	"PARIS 11EME ARRONDISSEMENT": "75011",
	"PARIS 12EME ARRONDISSEMENT": "75012",
	"PARIS 13EME ARRONDISSEMENT": "75013",
	"PARIS 14EME ARRONDISSEMENT": "75014",
	"PARIS 15EME ARRONDISSEMENT": "75015",
	"PARIS 16EME ARRONDISSEMENT": "75016",
	"PARIS 17EME ARRONDISSEMENT": "75017",
	"PARIS 18EME ARRONDISSEMENT": "75018",
	"PARIS 19EME ARRONDISSEMENT": "75019",
	"PARIS 20EME ARRONDISSEMENT": "75020",
}

EQUIP_LOW_TYPES = {
	"piscine",
	"baignade exterieure",
	"brumisateur",
	"bains-douches",
	"bibliotheque",
	"musee",
	"lieux de culte",
}

EQUIP_MEDIUM_TYPES = {
	"mairie d'arrondissement",
	"ombriere perenne",
	"terrain de boules",
}

FONTAINE_LOW_TYPES = {
	"FTNE_PETILLANTE",
	"FONTNE_WALLACE",
	"FONTAINE_2EN1",
	"BORNE_FONTAINE",
}

FONTAINE_LOW_MED_TYPES = {
	"FONTAINE_BOIS",
	"FONTAINE_ARCEAU",
	"FONTAINE_TOTEM",
}


def _normalize_text(value: object) -> str:
	if value is None:
		return ""
	text = str(value).strip()
	text = unicodedata.normalize("NFKD", text)
	return "".join(char for char in text if not unicodedata.combining(char))


def _normalize_oui_non(value: object) -> str:
	return _normalize_text(value).upper()


def _to_bool_oui_non(value: object) -> bool:
	return _normalize_oui_non(value) == "OUI"


def _is_free_from_payant(value: object) -> bool:
	return _normalize_oui_non(value) != "OUI"


def _extract_coord(value: object, key: str) -> float | None:
	if isinstance(value, dict):
		return value.get(key)
	return None


def _equip_heat_score(value: object) -> int:
	value_str = _normalize_text(value).lower()
	if value_str in EQUIP_LOW_TYPES:
		return 25
	if value_str in EQUIP_MEDIUM_TYPES:
		return 55
	return 75


def _fontaine_heat_score(value: object) -> int:
	value_str = str(value).strip().upper() if value is not None else ""
	if value_str in FONTAINE_LOW_TYPES:
		return 15
	if value_str in FONTAINE_LOW_MED_TYPES:
		return 25
	return 40


def clean_equipements(records: list[dict]) -> list[dict]:
	keep_cols = [
		"identifiant",
		"nom",
		"type",
		"payant",
		"adresse",
		"arrondissement",
		"geo_point_2d",
	]
	df = pd.DataFrame(records).reindex(columns=keep_cols)

	df["type"] = df["type"].fillna("Inconnu")
	df["adresse"] = df["adresse"].fillna("Adresse inconnue")

	df["is_free"] = df["payant"].fillna("Non").map(_is_free_from_payant)

	df["lat"] = df["geo_point_2d"].apply(lambda value: _extract_coord(value, "lat"))
	df["lng"] = df["geo_point_2d"].apply(lambda value: _extract_coord(value, "lon"))

	df["dataset"] = "equipment"
	df["heat_risk_score"] = df["type"].map(_equip_heat_score)

	df = df.drop(columns=["payant", "geo_point_2d"])
	return df.to_dict(orient="records")


def clean_espaces_verts(records: list[dict]) -> list[dict]:
	keep_cols = [
		"identifiant",
		"nom",
		"type",
		"arrondissement",
		"ouvert_24h",
		"canicule_ouverture",
		"ouverture_estivale_nocturne",
		"categorie",
		"geo_point_2d",
		"surf_veget_sup8m_2024",
		"indice_veget_sup8m_2024",
	]
	df = pd.DataFrame(records).reindex(columns=keep_cols)

	if "arrondissement" in df.columns:
		df = df[df["arrondissement"].notna()]

	df["nom"] = df["nom"].fillna("Espace vert")
	df["type"] = df["type"].fillna("Inconnu")
	df["categorie"] = df["categorie"].fillna("Non classifie")

	bool_cols = ["ouvert_24h", "canicule_ouverture", "ouverture_estivale_nocturne"]
	for col in bool_cols:
		df[col] = df[col].fillna("Non").map(_to_bool_oui_non)

	df["indice_veget_sup8m_2024"] = pd.to_numeric(
		df["indice_veget_sup8m_2024"], errors="coerce"
	)
	mean_veg = df["indice_veget_sup8m_2024"].mean()
	if pd.isna(mean_veg):
		mean_veg = 0.0
	df["indice_veget_sup8m_2024"] = df["indice_veget_sup8m_2024"].fillna(mean_veg)

	df["surf_veget_sup8m_2024"] = pd.to_numeric(
		df["surf_veget_sup8m_2024"], errors="coerce"
	).fillna(0)

	df["lat"] = df["geo_point_2d"].apply(lambda value: _extract_coord(value, "lat"))
	df["lng"] = df["geo_point_2d"].apply(lambda value: _extract_coord(value, "lon"))

	df["dataset"] = "green_space"

	veg = df["indice_veget_sup8m_2024"].astype(float)
	cani = df["canicule_ouverture"].astype(int)
	nuit = df["ouverture_estivale_nocturne"].astype(int)
	coolness = (0.6 * veg) + (0.25 * cani) + (0.15 * nuit)
	df["heat_risk_score"] = ((1 - coolness) * 100).round(1)

	df = df.drop(columns=["geo_point_2d"])
	return df.to_dict(orient="records")


def clean_fontaines(records: list[dict]) -> list[dict]:
	keep_cols = [
		"gid",
		"type_objet",
		"modele",
		"voie",
		"commune",
		"dispo",
		"geo_point_2d",
	]
	df = pd.DataFrame(records).reindex(columns=keep_cols)

	df["modele"] = df["modele"].fillna("Modele inconnu")
	df["is_available"] = df["dispo"].map(_to_bool_oui_non)

	df["commune"] = df["commune"].map(COMMUNE_MAP).fillna(df["commune"])

	type_objet = df["type_objet"].fillna("Fontaine").astype(str).str.strip()
	voie = df["voie"].fillna("").astype(str).str.strip()
	df["nom"] = type_objet
	mask = voie != ""
	df.loc[mask, "nom"] = type_objet[mask] + " - " + voie[mask]

	df["lat"] = df["geo_point_2d"].apply(lambda value: _extract_coord(value, "lat"))
	df["lng"] = df["geo_point_2d"].apply(lambda value: _extract_coord(value, "lon"))

	df["dataset"] = "fountain"
	df["heat_risk_score"] = df["type_objet"].map(_fontaine_heat_score)

	df = df.drop(columns=["dispo", "geo_point_2d"])
	return df.to_dict(orient="records")


def run_full_pipeline(raw_equip, raw_verts, raw_fontaines) -> list[dict]:
	equip = clean_equipements(raw_equip)
	verts = clean_espaces_verts(raw_verts)
	fontaines = clean_fontaines(raw_fontaines)
	all_records = equip + verts + fontaines
	print(f"Pipeline complete - {len(all_records)} total records")
	print(f"  Equipment: {len(equip)}")
	print(f"  Green spaces: {len(verts)}")
	print(f"  Fountains: {len(fontaines)}")
	return all_records
