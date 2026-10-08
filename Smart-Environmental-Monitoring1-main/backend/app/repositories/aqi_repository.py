
from typing import List, Optional

from app.database.mongodb import get_database


# Collection name used by this repository. Centralizing the name makes
# refactoring and testing easier and follows clean-architecture practices.
COLLECTION = "aqi"
ENVIRONMENTAL_COLLECTION = "environmental_data"


def _stringify_id(document: dict) -> dict:
	"""Return a shallow copy of `document` with `_id` converted to str.

	This keeps returned payloads JSON-serializable for FastAPI responses.
	"""
	if not document:
		return document

	doc = dict(document)
	if "_id" in doc:
		try:
			doc["_id"] = str(doc["_id"])
		except Exception:
			# If conversion fails for some reason, leave the original value.
			pass
	return doc


async def insert_aqi(data: dict) -> str:
	"""Insert an AQI document into the configured collection.

	Args:
		data: A dictionary representing the AQI document.

	Returns:
		The inserted document's id as a string.
	"""
	db = get_database()
	if db is None:
		raise RuntimeError("Database not initialized. Call connect_to_mongodb() first.")

	result = await db[COLLECTION].insert_one(data)
	return str(result.inserted_id)


async def insert_environmental_data(document: dict) -> str:
	"""Insert an environmental snapshot into the dedicated collection."""

	db = get_database()
	if db is None:
		raise RuntimeError("Database not initialized. Call connect_to_mongodb() first.")

	# Keep environmental records separate from flat AQI documents.
	result = await db[ENVIRONMENTAL_COLLECTION].insert_one(document)
	return str(result.inserted_id)


async def get_latest_aqi(city: str) -> Optional[dict]:
	"""Return the most recent AQI document based on `timestamp`.

	Returns:
		The latest AQI document with `_id` converted to string, or `None`
		if the collection is empty.
	"""
	db = get_database()
	if db is None:
		raise RuntimeError("Database not initialized. Call connect_to_mongodb() first.")

	doc = await db[COLLECTION].find_one(
		{"city": {"$regex": f"^{city.strip()}$", "$options": "i"}},
		sort=[("timestamp", -1)],
	)
	return _stringify_id(doc) if doc is not None else None


async def get_aqi_history(city: str,limit: int = 50) -> List[dict]:
	"""Return a list of AQI documents ordered by `timestamp` descending.

	Args:
		limit: Maximum number of documents to return (default 50).

	Returns:
		A list of AQI documents (most recent first) with `_id` fields as
		strings to ensure JSON serialization compatibility.
	"""
	db = get_database()
	if db is None:
		raise RuntimeError("Database not initialized. Call connect_to_mongodb() first.")

	cursor = (
		db[COLLECTION]
		.find({"city": {"$regex": f"^{city.strip()}$", "$options": "i"}})
		.sort("timestamp", -1)
		.limit(limit)
	)
	docs = await cursor.to_list(length=limit)
	return [_stringify_id(d) for d in docs]

async def get_latest_environment(city: str):
    db = get_database()

    doc = await db[ENVIRONMENTAL_COLLECTION].find_one(
        {"city": city},
        sort=[("collected_at", -1)]
    )

    return _stringify_id(doc) if doc else None