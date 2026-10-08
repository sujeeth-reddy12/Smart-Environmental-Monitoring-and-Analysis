from fastapi import APIRouter, Query

from app.integrations.geocoding import search_locations

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("/search")
def location_search(q: str = Query(min_length=2), limit: int = Query(8, ge=1, le=10)):
    return search_locations(q, limit)
