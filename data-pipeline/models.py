from typing import Optional

from pydantic import BaseModel


class CoolSpot(BaseModel):
	source_id: Optional[str] = None
	dataset: str
	nom: str
	type: Optional[str] = None
	lat: float
	lng: float
	adresse: Optional[str] = None
	arrondissement: Optional[str] = None
	is_free: Optional[bool] = None
	is_available: Optional[bool] = None
	canicule_ouverture: Optional[bool] = None
	ouverture_estivale_nocturne: Optional[bool] = None
	categorie: Optional[str] = None
	modele: Optional[str] = None
	surf_veget_sup8m_2024: Optional[float] = None
	indice_veget_sup8m_2024: Optional[float] = None
	heat_risk_score: float
