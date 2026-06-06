import requests

BASE_URL = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/{dataset_id}/records"
PAGE_LIMIT = 100


def fetch_all(dataset_id: str) -> list[dict]:
	"""Fetch all records for a dataset from the Paris Open Data API."""
	offset = 0
	all_results: list[dict] = []
	total_count: int | None = None

	while True:
		url = BASE_URL.format(dataset_id=dataset_id)
		params = {"limit": PAGE_LIMIT, "offset": offset}

		try:
			response = requests.get(url, params=params, timeout=30)
			response.raise_for_status()
			payload = response.json()
		except requests.RequestException as exc:
			print(f"Request failed at offset {offset}: {exc}")
			break
		except ValueError as exc:
			print(f"Invalid JSON at offset {offset}: {exc}")
			break

		results = payload.get("results", [])
		if total_count is None:
			total_count_value = payload.get("total_count")
			total_count = int(total_count_value) if total_count_value is not None else None

		all_results.extend(results)
		fetched = len(all_results)

		if total_count is not None:
			print(f"Fetched {fetched}/{total_count} records...")
		else:
			print(f"Fetched {fetched} records...")

		if not results:
			break

		if total_count is not None and fetched >= total_count:
			break

		offset += PAGE_LIMIT

	return all_results


def fetch_equipements() -> list[dict]:
	return fetch_all("ilots-de-fraicheur-equipements-activites")


def fetch_espaces_verts() -> list[dict]:
	return fetch_all("ilots-de-fraicheur-espaces-verts-frais")


def fetch_fontaines() -> list[dict]:
	return fetch_all("fontaines-a-boire")
