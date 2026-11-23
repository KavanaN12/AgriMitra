from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Location
from app.schemas.schemas import LocationResponse

router = APIRouter(prefix="/locations", tags=["Locations"])

MANDYA_HIERARCHY = {
    "Karnataka": {
        "Mandya": {
            "Mandya": {
                "Kasaba": ["Guthalu", "Induvalu", "Bannuru Road", "Yeliyuru"],
                "Dudda": ["Dudda", "Shivalli", "Bevinahalli", "Keelara"],
                "Keragodu": ["Keragodu", "Hulivana", "Kothathi", "Basaralu"]
            },
            "Maddur": {
                "Kasaba": ["Shivapura", "Someshwarapura", "Kadukothanahalli"],
                "Koppa": ["Koppa", "Besagarahalli", "Mallenahalli"],
                "Athagur": ["Athagur", "Chikkarasinakere", "Maraliga"]
            },
            "Malavalli": {
                "Halaguru": ["Halaguru", "Dalavayi Kodihalli", "Bannuru"],
                "Kirugavalu": ["Kirugavalu", "Kunduru", "Mikere"],
                "Kasaba": ["Malavalli Town", "Chottanahalli", "Marehalli"]
            },
            "Pandavapura": {
                "Melukote": ["Melukote", "Jakkanahalli", "Kyathanahalli"],
                "Kasaba": ["Pandavapura Town", "Harohalli", "Chinya"]
            },
            "Srirangapatna": {
                "Arakere": ["Arakere", "Tadagavadi", "Kodiyala"],
                "Kasaba": ["Ganjam", "Pashchimavahini", "Palahalli"]
            },
            "Krishnarajpet": {
                "Santhebachahalli": ["Santhebachahalli", "Sindhaghatta", "Aghalaya"],
                "Kasaba": ["K.R. Pet Town", "Kikkeri", "Bommenahalli"]
            },
            "Nagamangala": {
                "Belluru": ["Belluru", "Adichunchanagiri", "Bindiganavile"],
                "Kasaba": ["Nagamangala Town", "Devalapura", "Honakere"]
            }
        }
    }
}

@router.get("", response_model=List[LocationResponse], summary="List pilot locations in Mandya district")
def get_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()

@router.get("/hierarchy", summary="Get administrative hierarchy tree (State -> District -> Taluk -> Hobli -> Village)")
def get_location_hierarchy() -> Dict[str, Any]:
    return MANDYA_HIERARCHY
