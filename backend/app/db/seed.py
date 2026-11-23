import datetime
import json
import sys
from sqlalchemy.orm import Session
from app.models.models import (
    Location, User, Crop, UserCrop, WeatherRecord, AdvisoryItem,
    CommunityGroup, GroupMember, GroupAnnouncement, CommunityPost, PostComment, PostLike, SavedPost,
    ContentReport, MarketListing, SavedListing, GroupListingContribution, MarketEnquiry, EnquiryMessage,
    Notification, UserNotificationPreference, SupportTicket, ModerationAuditLog
)
from app.core.security import get_password_hash
from app.core.config import settings

MANDYA_LOCATIONS = [
    {"state": "Karnataka", "district": "Mandya", "taluk": "Mandya", "village": "Guthalu", "pincode": "571403", "latitude": 12.5223, "longitude": 76.8966},
    {"state": "Karnataka", "district": "Mandya", "taluk": "Maddur", "village": "Shivapura", "pincode": "571428", "latitude": 12.5833, "longitude": 77.0450},
    {"state": "Karnataka", "district": "Mandya", "taluk": "Malavalli", "village": "Halaguru", "pincode": "571421", "latitude": 12.3872, "longitude": 77.1738},
    {"state": "Karnataka", "district": "Mandya", "taluk": "Pandavapura", "village": "Melukote", "pincode": "571431", "latitude": 12.6631, "longitude": 76.6548},
    {"state": "Karnataka", "district": "Mandya", "taluk": "Srirangapatna", "village": "Arakere", "pincode": "571415", "latitude": 12.4181, "longitude": 76.6947},
    {"state": "Karnataka", "district": "Mandya", "taluk": "Krishnarajpet", "village": "Santhebachahalli", "pincode": "571426", "latitude": 12.7915, "longitude": 76.4950},
    {"state": "Karnataka", "district": "Mandya", "taluk": "Nagamangala", "village": "Belluru", "pincode": "571418", "latitude": 12.8710, "longitude": 76.7570},
]

MANDYA_CROPS = [
    {
        "code": "SUGARCANE",
        "name_en": "Sugarcane",
        "name_kn": "ಕಬ್ಬು (Kabbu)",
        "category": "commercial",
        "seasonality": "Perennial (10-12 months)",
        "typical_duration_days": 360,
        "description_en": "Primary cash crop in the Cauvery basin of Mandya district. High biomass producer requiring good drainage and deep loamy soil.",
        "description_kn": "ಮಂಡ್ಯ ಕಾವೇರಿ ಅಚ್ಚುಕಟ್ಟು ಪ್ರದೇಶದ ಪ್ರಮುಖ ವಾಣಿಜ್ಯ ಬೆಳೆ. ಅಧಿಕ ಇಳುವರಿಗಾಗಿ ಉತ್ತಮ ಬಸಿಗಾಲುವೆ ಹಾಗೂ ಆಳವಾದ ಗೋಡು ಮಣ್ಣು ಅವಶ್ಯಕ.",
        "soil_requirements_en": "Deep well-drained loamy soils, pH 6.5 to 7.5. Avoid waterlogged alkaline soils.",
        "soil_requirements_kn": "ಆಳವಾದ ಗೋಡು ಮಣ್ಣು, ಪಿ.ಎಚ್ 6.5 ರಿಂದ 7.5. ಜೌಗು ಮತ್ತು ಕ್ಷಾರಯುಕ್ತ ಮಣ್ಣು ಸೂಕ್ತವಲ್ಲ.",
        "water_requirements_en": "1800 - 2200 mm total requirement. Peak water need during Tillering and Grand Growth phases.",
        "water_requirements_kn": "ಒಟ್ಟು 1800 - 2200 ಮಿ.ಮೀ ನೀರು ಬೇಕಾಗುತ್ತದೆ. ಕವಲೊಡೆಯುವ ಹಾಗೂ ತೀವ್ರ ಬೆಳವಣಿಗೆಯ ಹಂತದಲ್ಲಿ ನೀರಾವರಿ ನಿರ್ಣಾಯಕ.",
        "irrigation_guidance_en": "Alternate furrow irrigation or drip irrigation saves 35-40% water. Maintain 7-10 days interval in summer and 12-15 days in winter.",
        "irrigation_guidance_kn": "ಬೆರೆತ ಸಾಲು ಅಥವಾ ಹನಿ ನೀರಾವರಿ ಪದ್ಧತಿಯಿಂದ 35-40% ನೀರು ಉಳಿತಾಯವಾಗುತ್ತದೆ. ಬೇಸಿಗೆಯಲ್ಲಿ 7-10 ದಿನಕ್ಕೊಮ್ಮೆ ನೀರು ಹಾಯಿಸಿ.",
        "growth_stages_json": json.dumps([
            {"stage": "Germination", "stage_kn": "ಮೊಳಕೆ ಒಡೆಯುವಿಕೆ", "duration_days": 35, "water_need": "Moderate", "key_practices": "Ensure light irrigation and weed-free field."},
            {"stage": "Tillering", "stage_kn": "ಕವಲೊಡೆಯುವ ಹಂತ", "duration_days": 65, "water_need": "High", "key_practices": "First top dressing of nitrogen and earthing up."},
            {"stage": "Grand Growth", "stage_kn": "ತೀವ್ರ ಬೆಳವಣಿಗೆ ಹಂತ", "duration_days": 150, "water_need": "Critical High", "key_practices": "Adequate irrigation, detrashting, and proping against lodging."},
            {"stage": "Maturity", "stage_kn": "ಕಟಾವಿಗೆ ಸಿದ್ಧ", "duration_days": 110, "water_need": "Low", "key_practices": "Withhold water 15 days before harvest to build sucrose concentration."}
        ]),
        "pests_diseases_json": json.dumps([
            {"pest_name": "Early Shoot Borer", "pest_kn": "ಸುಳಿ ಕೊರೆಯುವ ಹುಳು", "symptoms": "Dead hearts in 1-3 month canes.", "management": "Release Trichogramma chilonis egg parasitoids (50,000/ha), trash mulching."},
            {"pest_name": "Red Rot", "pest_kn": "ಕೆಂಪು ಕೊಳೆ ರೋಗ", "symptoms": "Third or fourth leaf yellowing, reddened internal tissues.", "management": "Use certified disease-free setts, treat with Trichoderma viride."}
        ])
    },
    {
        "code": "PADDY",
        "name_en": "Paddy / Rice",
        "name_kn": "ಭತ್ತ (Bhatta)",
        "category": "cereal",
        "seasonality": "Kharif / Rabi",
        "typical_duration_days": 135,
        "description_en": "Staple cereal crop of Mandya cultivated under canal and borewell commands. Varieties include Jaya, Jyothi, Tanu, and BPT 5204 (Sona Masoori).",
        "description_kn": "ಮಂಡ್ಯ ಕಾಲುವೆ ಮತ್ತು ಬೋರ್‌ವೆಲ್ ಅಚ್ಚುಕಟ್ಟಿನಲ್ಲಿ ವ್ಯಾಪಕವಾಗಿ ಬೆಳೆಯುವ ಪ್ರಮುಖ ಆಹಾರ ಧಾನ್ಯ. ಜಯ, ಜ್ಯೋತಿ, ತನು ಹಾಗೂ ಸೋನಾ ಮಸೂರಿ ಪ್ರಮುಖ ತಳಿಗಳು.",
        "soil_requirements_en": "Heavy clayey or clay-loam soils capable of holding standing water. pH 5.5 to 7.0.",
        "soil_requirements_kn": "ನೀರನ್ನು ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುವ ಜೇಡಿ ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು ಸೂಕ್ತ. ಪಿ.ಎಚ್ 5.5 ರಿಂದ 7.0.",
        "water_requirements_en": "1200 - 1400 mm total. Critical stages: Panicle Initiation, Flowering and Milking stage.",
        "water_requirements_kn": "ಒಟ್ಟು 1200 - 1400 ಮಿ.ಮೀ ನೀರು. ಹೂ ಬಿಡುವ ಮತ್ತು ಕಾಳು ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ನೀರಿನ ಕೊರತೆ ಇರಬಾರದು.",
        "irrigation_guidance_en": "Adopt Alternate Wetting and Drying (AWD) after tillering. Stop irrigation 10-12 days before harvest.",
        "irrigation_guidance_kn": "ಕವಲೊಡೆದ ನಂತರ ಪರ್ಯಾಯ ಒಣಗಿಸುವಿಕೆ ಮತ್ತು ನೆನೆಸುವಿಕೆ (AWD) ವಿಧಾನ ಅನುಸರಿಸಿ. ಕಟಾವಿಗೆ 10-12 ದಿನ ಮುಂಚಿತವಾಗಿ ನೀರು ನಿಲ್ಲಿಸಿ.",
        "growth_stages_json": json.dumps([
            {"stage": "Nursery", "stage_kn": "ಸಸಿ ಮಡಿ", "duration_days": 25, "water_need": "Moderate", "key_practices": "Protect seedlings from gall midge and thrips."},
            {"stage": "Tillering", "stage_kn": "ಕವಲೊಡೆಯುವಿಕೆ", "duration_days": 30, "water_need": "High", "key_practices": "Maintain 2-3 cm water depth, apply zinc sulfate."},
            {"stage": "Panicle Initiation", "stage_kn": "ತೆನೆ ಮೂಡುವ ಹಂತ", "duration_days": 20, "water_need": "Critical High", "key_practices": "Do not let soil crack, apply potash top dressing."},
            {"stage": "Flowering & Milking", "stage_kn": "ಹೂವಾಡುವ & ಹಾಲು ತುಂಬುವ ಹಂತ", "duration_days": 20, "water_need": "Critical High", "key_practices": "Maintain standing water, monitor for blast and BPH."},
            {"stage": "Maturity", "stage_kn": "ಕಾಳು ಮಾಗುವಿಕೆ", "duration_days": 40, "water_need": "Low", "key_practices": "Drain standing water 10 days before harvest for uniform ripening."}
        ]),
        "pests_diseases_json": json.dumps([
            {"pest_name": "Leaf Blast", "pest_kn": "ಬೆಂಕಿ ರೋಗ", "symptoms": "Spindle-shaped brown lesions on leaves.", "management": "Foliar spray of Pseudomonas fluorescens (10g/L), avoid excessive urea application."},
            {"pest_name": "Brown Plant Hopper (BPH)", "pest_kn": "ಕಂದು ಜಿಗಿಹುಳು", "symptoms": "Hopper burn, drying patches in circular spots.", "management": "Form 30 cm alleyways every 2m, drain water temporarily."}
        ])
    },
    {
        "code": "RAGI",
        "name_en": "Finger Millet (Ragi)",
        "name_kn": "ರಾಗಿ (Ragi)",
        "category": "cereal",
        "seasonality": "Kharif",
        "typical_duration_days": 110,
        "description_en": "Drought-resilient nutritious millet extensively grown in Mandya's drylands and rainfed taluks (Nagamangala, KR Pet). Varieties: GPU 28, ML 365, KMR 301.",
        "description_kn": "ಮಂಡ್ಯದ ಒಣಭೂಮಿ ಮತ್ತು ಮಳೆಯಾಶ್ರಿತ ಪ್ರದೇಶಗಳ (ನಾಗಮಂಗಲ, ಕೆ.ಆರ್. ಪೇಟೆ) ಪೌಷ್ಟಿಕ ಸಿರಿಧಾನ್ಯ ಬೆಳೆ. ಜಿ.ಪಿ.ಯು 28, ಎಂ.ಎಲ್ 365, ಕೆ.ಎಂ.ಆರ್ 301 ಪ್ರಮುಖ ತಳಿಗಳು.",
        "soil_requirements_en": "Red sandy loam and light gravelly soils with good porosity. Tolerates poor fertility. pH 5.0 to 7.5.",
        "soil_requirements_kn": "ಕೆಂಪು ಮರಳು ಗೋಡು ಮತ್ತು ಹಗುರವಾದ ಮಣ್ಣು. ಕಡಿಮೆ ಫಲವತ್ತತೆಯಲ್ಲೂ ಬೆಳೆಯುತ್ತದೆ. ಪಿ.ಎಚ್ 5.0 ರಿಂದ 7.5.",
        "water_requirements_en": "350 - 500 mm. Highly drought-hardy with deep fibrous root system.",
        "water_requirements_kn": "350 - 500 ಮಿ.ಮೀ ನೀರು ಸಾಕು. ತೀವ್ರ ಬರ ಸಹಿಷ್ಣು ಬೆಳೆ.",
        "irrigation_guidance_en": "Requires only 2-3 protective irrigations during dry spells, especially at flowering and grain filling.",
        "irrigation_guidance_kn": "ಮಳೆಯಾಶ್ರಿತ ಬೆಳೆ. ದೀರ್ಘ ಮಳೆ ಬಿಡುವಿನ ವೇಳೆಯಲ್ಲಿ ತೆನೆ ಕಟ್ಟುವಾಗ 2 ಬಾರಿ ರಕ್ಷಣಾತ್ಮಕ ನೀರು ಕೊಡಿ.",
        "growth_stages_json": json.dumps([
            {"stage": "Sowing & Establishment", "stage_kn": "ಬಿತ್ತನೆ ಮತ್ತು ನಾಟಿ", "duration_days": 20, "water_need": "Low", "key_practices": "Line sowing or transplanting with 22.5 x 10 cm spacing."},
            {"stage": "Tillering", "stage_kn": "ಕವಲೊಡೆಯುವ ಹಂತ", "duration_days": 25, "water_need": "Moderate", "key_practices": "Intercultivation and weeding at 20 and 35 days."},
            {"stage": "Booting & Flowering", "stage_kn": "ತೆನೆ ಹೊರಡುವ ಹಂತ", "duration_days": 25, "water_need": "High", "key_practices": "Give protective irrigation if rain fails for >12 days."},
            {"stage": "Grain Filling", "stage_kn": "ಕಾಳು ತುಂಬುವ ಹಂತ", "duration_days": 40, "water_need": "Moderate", "key_practices": "Harvest when earheads turn brown."}
        ]),
        "pests_diseases_json": json.dumps([
            {"pest_name": "Ragi Blast", "pest_kn": "ರಾಗಿ ಬೆಂಕಿ ರೋಗ", "symptoms": "Diamond-shaped lesions on neck and fingers.", "management": "Seed treatment with Trichoderma (4g/kg seed), avoid high nitrogen in cloudy weather."}
        ])
    },
    {
        "code": "BANANA",
        "name_en": "Banana (Yelakki / Robusta)",
        "name_kn": "ಬಾಳೆ (Baale)",
        "category": "horticulture",
        "seasonality": "Perennial",
        "typical_duration_days": 300,
        "description_en": "High-value horticulture crop in riverine plains of Maddur and Srirangapatna. Yelakki bale is renowned for its sweet aroma and high market value.",
        "description_kn": "ಮದ್ದೂರು ಮತ್ತು ಶ್ರೀರಂಗಪಟ್ಟಣ ನದೀಮುಖ ಪ್ರದೇಶಗಳ ಪ್ರಮುಖ ತೋಟಗಾರಿಕಾ ಬೆಳೆ. ಏಲಕ್ಕಿ ಬಾಳೆ ತನ್ನ ಸುವಾಸನೆ ಹಾಗೂ ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆಗೆ ಪ್ರಸಿದ್ಧಿ.",
        "soil_requirements_en": "Rich clayey loam or alluvial soils, minimum 1 meter depth. pH 6.0 to 7.5.",
        "soil_requirements_kn": "ಫಲವತ್ತಾದ ಗೋಡು ಅಥವಾ ನದಿ ಮೆಕ್ಕಲು ಮಣ್ಣು, ಕನಿಷ್ಠ 1 ಮೀಟರ್ ಆಳ. ಪಿ.ಎಚ್ 6.0 ರಿಂದ 7.5.",
        "water_requirements_en": "1500 - 1800 mm. Requires continuous uniform moisture without stagnant water.",
        "water_requirements_kn": "1500 - 1800 ಮಿ.ಮೀ. ನಿರಂತರ ತೇವಾಂಶ ಅಗತ್ಯ, ಆದರೆ ಬಸಿಗಾಲುವೆ ಉತ್ತಮವಾಗಿರಬೇಕು.",
        "irrigation_guidance_en": "Drip irrigation (15-20 liters/plant/day) with fertigation ensures uniform bunches and high yield.",
        "irrigation_guidance_kn": "ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ಗಿಡಕ್ಕೆ ದಿನಕ್ಕೆ 15-20 ಲೀಟರ್ ನೀರು ನೀಡುವುದು ಅತ್ಯಂತ ಪರಿಣಾಮಕಾರಿ.",
        "growth_stages_json": json.dumps([
            {"stage": "Vegetative", "stage_kn": "ಸಸ್ಯಾಭಿವೃದ್ಧಿ ಹಂತ", "duration_days": 120, "water_need": "Moderate", "key_practices": "Desuckering every 45 days, retain only mother plant."},
            {"stage": "Shooting", "stage_kn": "ಗೊನೆ ಬಿಡುವ ಹಂತ", "duration_days": 60, "water_need": "Critical High", "key_practices": "Provide propping with bamboo poles to prevent wind damage."},
            {"stage": "Bunch Maturation", "stage_kn": "ಗೊನೆ ಮಾಗುವ ಹಂತ", "duration_days": 120, "water_need": "High", "key_practices": "Bag bunches with blue perforated polythene sleeves."}
        ]),
        "pests_diseases_json": json.dumps([
            {"pest_name": "Sigatoka Leaf Spot", "pest_kn": "ಸಿಗಟೋಕ ಎಲೆ ಚುಕ್ಕೆ", "symptoms": "Dark brown oval spots with grey center on older leaves.", "management": "Deleaf severely infected leaves, spray Bordeaux mixture 1% or propiconazole 0.1%."}
        ])
    },
    {
        "code": "COCONUT",
        "name_en": "Tender Coconut",
        "name_kn": "ಎಳನೀರು / ತೆಂಗು (Elaneeru / Tengu)",
        "category": "horticulture",
        "seasonality": "Perennial",
        "typical_duration_days": 365,
        "description_en": "Perennial plantation crop famous across Mandya (Maddur Tender Coconut Market is the largest in Asia). Varieties include Gangabondam, Tiptur Tall, and hybrids.",
        "description_kn": "ಮದ್ದೂರು ಏಷ್ಯಾದಲ್ಲೇ ಅತಿ ದೊಡ್ಡ ಎಳನೀರು ಮಾರುಕಟ್ಟೆಯಾಗಿದೆ. ಮಂಡ್ಯದ ಬಹುಮುಖ್ಯ ತೋಟಗಾರಿಕೆ ಬೆಳೆ. ತಿಪಟೂರು ಟಾಲ್ ಮತ್ತು ಗಂಗಾಬೊಂಡಂ ಪ್ರಮುಖ ತಳಿಗಳು.",
        "soil_requirements_en": "Deep sandy loam or red loams, free from hard subsoil pan. pH 5.2 to 8.0.",
        "soil_requirements_kn": "ಆಳವಾದ ಮರಳು ಗೋಡು ಅಥವಾ ಕೆಂಪು ಗೋಡು ಮಣ್ಣು. ಪಿ.ಎಚ್ 5.2 ರಿಂದ 8.0.",
        "water_requirements_en": "50-80 liters per adult palm per day in winter, 100-120 liters in hot summer.",
        "water_requirements_kn": "ಚಳಿಗಾಲದಲ್ಲಿ ದಿನಕ್ಕೆ 50-80 ಲೀಟರ್, ಬೇಸಿಗೆಯಲ್ಲಿ ಪ್ರತಿ ಮರಕ್ಕೆ 100-120 ಲೀಟರ್ ನೀರು ಅಗತ್ಯ.",
        "irrigation_guidance_en": "Drip irrigation in ring basin around the palm canopy perimeter. Apply coir pith mulching to conserve moisture.",
        "irrigation_guidance_kn": "ಮರದ ಬುಡದಿಂದ 1.5 ಮೀಟರ್ ದೂರದಲ್ಲಿ ವೃತ್ತಾಕಾರವಾಗಿ ಹನಿ ನೀರಾವರಿ ಅಳವಡಿಸಿ. ಕೊಳೆತ ತೆಂಗಿನ ನಾರಿನ ತ್ಯಾಜ್ಯದಿಂದ ಮಣ್ಣು ಮುಚ್ಚಿ ತೇವಾಂಶ ಕಾಪಾಡಿ.",
        "growth_stages_json": json.dumps([
            {"stage": "Vegetative & Inflorescence", "stage_kn": "ಹೂಗೊಂಚಲು ಹೊರಡುವಿಕೆ", "duration_days": 90, "water_need": "Moderate", "key_practices": "Apply organic manure and neem cake around basin."},
            {"stage": "Nut Setting & Water Filling", "stage_kn": "ಎಳನೀರು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ", "duration_days": 180, "water_need": "High", "key_practices": "Ensure regular drip irrigation, monitor for eriophyid mite."},
            {"stage": "Tender Harvest Stage", "stage_kn": "ಎಳನೀರು ಕೊಯ್ಲು ಹಂತ", "duration_days": 95, "water_need": "Moderate", "key_practices": "Harvest at 7-8 months stage for sweet water and thin gelatinous kernel."}
        ]),
        "pests_diseases_json": json.dumps([
            {"pest_name": "Rhinoceros Beetle", "pest_kn": "ಖಡ್ಗಮೃಗ ದುಂಬಿ", "symptoms": "V-shaped cuts on fronds, bore holes in crown.", "management": "Hook out beetles with wire, fill leaf axils with neem seed kernel powder + sand (1:2)."}
        ])
    },
    {
        "code": "TOMATO",
        "name_en": "Tomato",
        "name_kn": "ಟೊಮೆಟೊ (Tomato)",
        "category": "vegetable",
        "seasonality": "Kharif / Rabi",
        "typical_duration_days": 90,
        "description_en": "Short-duration, high-return vegetable crop grown in Mandya, Malavalli and KR Pet. Heavy fruit load requires trellis staking.",
        "description_kn": "ಮಂಡ್ಯ, ಮಳವಳ್ಳಿ ಹಾಗೂ ಕೆ.ಆರ್. ಪೇಟೆಯಲ್ಲಿ ಬೆಳೆಯುವ ಪ್ರಮುಖ ತರಕಾರಿ ಬೆಳೆ. ಗಿಡಗಳು ನೆಲಕ್ಕೆ ಬೀಳದಂತೆ ಕೋಲು ಕಟ್ಟುವುದು (ಸ್ಟೇಕಿಂಗ್) ಮುಖ್ಯ.",
        "soil_requirements_en": "Well-drained sandy loam with rich organic matter. pH 6.0 to 7.0.",
        "soil_requirements_kn": "ಸಾವಯವ ಸಮೃದ್ಧವಾದ ಮರಳು ಗೋಡು ಮಣ್ಣು. ಪಿ.ಎಚ್ 6.0 ರಿಂದ 7.0.",
        "water_requirements_en": "400 - 600 mm. Highly sensitive to water stress during flowering and fruit setting.",
        "water_requirements_kn": "400 - 600 ಮಿ.ಮೀ. ಹೂ ಬಿಡುವ ಮತ್ತು ಕಾಯಿ ಕಚ್ಚುವ ಹಂತದಲ್ಲಿ ನೀರಿನ ವ್ಯತ್ಯಯವಾಗಬಾರದು.",
        "irrigation_guidance_en": "Furrow or drip irrigation. Avoid overhead sprinkling to prevent foliar fungal diseases. Mulch beds.",
        "irrigation_guidance_kn": "ಹನಿ ನೀರಾವರಿ ಪದ್ಧತಿ ಅತ್ಯುತ್ತಮ. ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಬೀಳದಂತೆ ನೋಡಿಕೊಳ್ಳಿ, ಇದರಿಂದ ಶಿಲೀಂಧ್ರ ರೋಗಗಳು ತಡೆಯಲ್ಪಡುತ್ತವೆ.",
        "growth_stages_json": json.dumps([
            {"stage": "Transplanting", "stage_kn": "ನಾಟಿ ಹಂತ", "duration_days": 20, "water_need": "Moderate", "key_practices": "Transplant 25-day seedlings in evening, drench with bio-fungicide."},
            {"stage": "Vegetative & Flowering", "stage_kn": "ಬೆಳವಣಿಗೆ ಮತ್ತು ಹೂ ಬಿಡುವಿಕೆ", "duration_days": 25, "water_need": "High", "key_practices": "Staking with bamboo poles, install yellow sticky traps for whiteflies."},
            {"stage": "Fruit Setting & Maturation", "stage_kn": "ಕಾಯಿ ಕಟ್ಟುವುದು & ಮಾಗುವಿಕೆ", "duration_days": 45, "water_need": "High", "key_practices": "Apply calcium nitrate to prevent blossom end rot, pick at breaker stage."}
        ]),
        "pests_diseases_json": json.dumps([
            {"pest_name": "Early Blight", "pest_kn": "ಮುಂಚಿನ ಅಂಗಮಾರಿ ರೋಗ", "symptoms": "Concentric ring spots (target-like) on lower leaves.", "management": "Mulch soil surface, prune infected lower leaves, spray Trichoderma viride."}
        ])
    }
]

def seed_database(db: Session, force: bool = False):
    """Seed baseline metadata (locations, crops, administrator) and optional demonstration dataset."""
    try:
        if not force and db.query(Location).first() is not None:
            # Check if users are already seeded
            if db.query(User).count() >= 1:
                return
    except Exception:
        from app.core.database import Base, engine
        Base.metadata.create_all(bind=engine)

    if force:
        # Clear tables in safe dependency order
        for model in [
            ModerationAuditLog, SupportTicket, UserNotificationPreference, Notification,
            EnquiryMessage, MarketEnquiry, GroupListingContribution, SavedListing, MarketListing,
            ContentReport, SavedPost, PostLike, PostComment, CommunityPost, GroupAnnouncement,
            GroupMember, CommunityGroup, AdvisoryItem, WeatherRecord, UserCrop, Crop, User, Location
        ]:
            try:
                db.query(model).delete()
            except Exception:
                db.rollback()
        db.commit()

    # 1. Locations (Mandya 7 Taluks)
    loc_objs = []
    for loc_data in MANDYA_LOCATIONS:
        loc = db.query(Location).filter(Location.village == loc_data["village"]).first()
        if not loc:
            loc = Location(**loc_data)
            db.add(loc)
            db.flush()
        loc_objs.append(loc)
    db.commit()

    # 2. Crops (Mandya 6 Major Crops)
    crop_objs = []
    for crop_data in MANDYA_CROPS:
        crop = db.query(Crop).filter(Crop.code == crop_data["code"]).first()
        if not crop:
            crop = Crop(**crop_data)
            db.add(crop)
            db.flush()
        crop_objs.append(crop)
    db.commit()

    # 3. Initial Platform Administrator (Ensured across all environments)
    admin_pw_hash = get_password_hash(settings.ADMIN_INITIAL_PASSWORD)
    admin_user = db.query(User).filter(
        (User.phone_number == settings.ADMIN_INITIAL_PHONE) | (User.email == settings.ADMIN_INITIAL_EMAIL)
    ).first()
    if not admin_user:
        admin_user = User(
            phone_number=settings.ADMIN_INITIAL_PHONE,
            full_name=settings.ADMIN_FULL_NAME,
            password_hash=admin_pw_hash,
            preferred_language="kn",
            role="admin",
            roles="admin",
            active_role="admin",
            is_onboarded=True,
            onboarding_step=5,
            is_admin=True,
            is_verified=True,
            is_expert=True,
            bio="Agricultural Extension Officer and AgriMitra Mandya District Platform Administrator.",
            email=settings.ADMIN_INITIAL_EMAIL,
            text_size="normal",
            data_saver=False,
            phone_visible=True,
            location_id=loc_objs[0].id if loc_objs else None,
            is_active=True
        )
        db.add(admin_user)
        db.commit()

    # In production, stop here. Real farmers and buyers register themselves.
    if settings.ENVIRONMENT == "production":
        return

    # Helper maps
    crop_by_code = {c.code: c for c in crop_objs}

    # 4. Demo Users (Development only)
    demo_pw_hash = get_password_hash("Password@123")

    # Persona 1: Ramesh Gowda - Sugarcane & Paddy, Maddur
    user1 = db.query(User).filter(User.phone_number == "9845012345").first()
    if not user1:
        user1 = User(
            phone_number="9845012345",
            full_name="Ramesh Gowda",
            password_hash=demo_pw_hash,
            preferred_language="kn",
            role="farmer",
            roles="both",
            active_role="farmer",
            is_onboarded=True,
            onboarding_step=5,
            is_admin=False,
            is_verified=True,
            is_expert=False,
            farm_size_acres=5.5,
            farming_type="natural",
            irrigation_source="canal",
            bio="Natural farming advocate cultivating organic sugarcane and ragi in Shivapura, Maddur.",
            email="ramesh.gowda@mandyafarms.in",
            text_size="normal",
            data_saver=False,
            phone_visible=True,
            location_id=loc_objs[1].id,  # Maddur / Shivapura
            is_active=True
        )
        db.add(user1)

    # Persona 2: Lakshmi Devi - Coconut & Ragi, Malavalli
    user2 = db.query(User).filter(User.phone_number == "9845098765").first()
    if not user2:
        user2 = User(
            phone_number="9845098765",
            full_name="Lakshmi Devi",
            password_hash=demo_pw_hash,
            preferred_language="kn",
            role="farmer",
            roles="farmer",
            active_role="farmer",
            is_onboarded=True,
            onboarding_step=5,
            is_admin=False,
            is_verified=True,
            is_expert=False,
            farm_size_acres=4.0,
            farming_type="organic",
            irrigation_source="drip",
            bio="Horticulture and tender coconut farmer practicing Jeevamrutha preparation in Halaguru.",
            email="lakshmi.devi@halaguru.in",
            text_size="normal",
            data_saver=False,
            phone_visible=True,
            location_id=loc_objs[2].id,  # Malavalli / Halaguru
            is_active=True
        )
        db.add(user2)

    # Persona 3: Mysore Agro Traders (Basavaraj) - Buyer
    buyer1 = db.query(User).filter(User.phone_number == "9900112233").first()
    if not buyer1:
        buyer1 = User(
            phone_number="9900112233",
            full_name="Mysore Agro Traders (Basavaraj)",
            password_hash=demo_pw_hash,
            preferred_language="en",
            role="buyer",
            roles="buyer",
            active_role="buyer",
            is_onboarded=True,
            onboarding_step=5,
            is_admin=False,
            is_verified=True,
            is_expert=False,
            buyer_business_name="Mysore Agro Wholesale Procurement Ltd.",
            buyer_type="wholesaler",
            buyer_license_no="APMC-MYS-88219",
            interested_crops="Paddy, Sugarcane, Tender Coconut, Banana",
            bio="Wholesale agro commodities procurer supplying Mysuru APMC and Bengaluru supermarkets.",
            email="basavaraj@mysoreagro.com",
            text_size="normal",
            data_saver=False,
            phone_visible=True,
            location_id=loc_objs[0].id,  # Mandya town
            is_active=True
        )
        db.add(buyer1)

    # Persona 4: Mandya Krishi Admin - Platform Administrator & Agronomist
    admin_user = db.query(User).filter(User.phone_number == "9845000000").first()
    if not admin_user:
        admin_user = User(
            phone_number="9845000000",
            full_name="Mandya Krishi Admin",
            password_hash=admin_pw_hash,
            preferred_language="kn",
            role="admin",
            roles="admin",
            active_role="admin",
            is_onboarded=True,
            onboarding_step=5,
            is_admin=True,
            is_verified=True,
            is_expert=True,
            bio="Agricultural Extension Officer and AgriMitra Mandya District Platform Administrator.",
            email="admin@agrimitra.gov.in",
            text_size="normal",
            data_saver=False,
            phone_visible=True,
            location_id=loc_objs[0].id,  # Mandya town
            is_active=True
        )
        db.add(admin_user)

    # Persona 5: Suresh Gowda - Banana & Sugarcane, Melukote, Pandavapura
    user5 = db.query(User).filter(User.phone_number == "9845033333").first()
    if not user5:
        user5 = User(
            phone_number="9845033333",
            full_name="Suresh Gowda",
            password_hash=demo_pw_hash,
            preferred_language="kn",
            role="farmer",
            roles="farmer",
            active_role="farmer",
            is_onboarded=True,
            onboarding_step=5,
            is_admin=False,
            is_verified=True,
            is_expert=False,
            farm_size_acres=5.5,
            farming_type="mixed",
            irrigation_source="borewell",
            bio="Specialist Yelakki banana and sugarcane grower near Melukote hills with drip fertigation setup.",
            email="suresh.melukote@gmail.com",
            text_size="normal",
            data_saver=False,
            phone_visible=True,
            location_id=loc_objs[3].id,  # Pandavapura / Melukote
            is_active=True
        )
        db.add(user5)

    # Persona 6: Nagaraju K. - Paddy & Tomato, Guthalu, Mandya
    user6 = db.query(User).filter(User.phone_number == "9845022222").first()
    if not user6:
        user6 = User(
            phone_number="9845022222",
            full_name="Nagaraju K.",
            password_hash=demo_pw_hash,
            preferred_language="kn",
            role="farmer",
            roles="farmer",
            active_role="farmer",
            is_onboarded=True,
            onboarding_step=5,
            is_admin=False,
            is_verified=True,
            is_expert=False,
            farm_size_acres=4.5,
            farming_type="conventional",
            irrigation_source="canal",
            bio="Progressive vegetable and paddy grower in Guthalu, adopting integrated pest management.",
            email="nagaraju.guthalu@mandyafarms.in",
            text_size="normal",
            data_saver=False,
            phone_visible=True,
            location_id=loc_objs[0].id,  # Mandya / Guthalu
            is_active=True
        )
        db.add(user6)

    db.commit()

    # 4. Farmer Crops
    if db.query(UserCrop).count() == 0:
        now = datetime.datetime.utcnow()
        user_crops = [
            # Ramesh Gowda (User 1)
            UserCrop(user_id=user1.id, crop_id=crop_by_code["SUGARCANE"].id, acreage=3.5, stage="vegetative", sowing_date=now - datetime.timedelta(days=90), soil_type="Deep Loam", irrigation_type="Furrow"),
            UserCrop(user_id=user1.id, crop_id=crop_by_code["PADDY"].id, acreage=2.0, stage="flowering", sowing_date=now - datetime.timedelta(days=60), soil_type="Clay Loam", irrigation_type="Canal"),
            # Lakshmi Devi (User 2)
            UserCrop(user_id=user2.id, crop_id=crop_by_code["RAGI"].id, acreage=1.5, stage="growing", sowing_date=now - datetime.timedelta(days=35), soil_type="Red Sandy Loam", irrigation_type="Rainfed"),
            UserCrop(user_id=user2.id, crop_id=crop_by_code["COCONUT"].id, acreage=4.0, stage="harvesting", sowing_date=now - datetime.timedelta(days=365), soil_type="Sandy Loam", irrigation_type="Drip"),
            # Suresh Gowda (User 5)
            UserCrop(user_id=user5.id, crop_id=crop_by_code["BANANA"].id, acreage=2.5, stage="vegetative", sowing_date=now - datetime.timedelta(days=120), soil_type="Alluvial Loam", irrigation_type="Drip"),
            UserCrop(user_id=user5.id, crop_id=crop_by_code["SUGARCANE"].id, acreage=3.0, stage="tillering", sowing_date=now - datetime.timedelta(days=45), soil_type="Deep Loam", irrigation_type="Borewell"),
            # Nagaraju K. (User 6)
            UserCrop(user_id=user6.id, crop_id=crop_by_code["PADDY"].id, acreage=3.0, stage="tillering", sowing_date=now - datetime.timedelta(days=30), soil_type="Clayey Soil", irrigation_type="Canal"),
            UserCrop(user_id=user6.id, crop_id=crop_by_code["TOMATO"].id, acreage=1.5, stage="flowering", sowing_date=now - datetime.timedelta(days=25), soil_type="Red Loam", irrigation_type="Drip"),
        ]
        db.add_all(user_crops)
        db.commit()

    # 5. Weather Records
    if db.query(WeatherRecord).count() == 0:
        weathers = [
            WeatherRecord(
                location_id=loc_objs[0].id,  # Mandya / Guthalu
                temperature_c=28.5,
                humidity_percent=68.0,
                rainfall_mm=2.5,
                wind_speed_kmh=12.0,
                uv_index=5.5,
                precipitation_probability=35.0,
                source="Open-Meteo (Live / Cached)",
                forecast_summary_en="Partly cloudy with scattered evening showers expected across Mandya basin.",
                forecast_summary_kn="ಭಾಗಶಃ ಮೋಡ ಕವಿದ ವಾತಾವರಣ, ಸಂಜೆ ಮಂಡ್ಯ ಕಣಿವೆಯ ಸುತ್ತ ಸಾಧಾರಣ ಮಳೆಯ ಸಾಧ್ಯತೆ."
            ),
            WeatherRecord(
                location_id=loc_objs[3].id,  # Pandavapura / Melukote
                temperature_c=27.2,
                humidity_percent=72.0,
                rainfall_mm=4.0,
                wind_speed_kmh=15.0,
                uv_index=5.0,
                precipitation_probability=45.0,
                source="Open-Meteo (Live / Cached)",
                forecast_summary_en="Gentle breeze and intermittent drizzles near Melukote hill ridge.",
                forecast_summary_kn="ಮೇಲುಕೋಟೆ ಬೆಟ್ಟದ ಸಾಲಿನಲ್ಲಿ ತಂಗಾಳಿ ಹಾಗೂ ಅಲ್ಲಲ್ಲಿ ತುಂತುರು ಮಳೆ."
            ),
            WeatherRecord(
                location_id=loc_objs[2].id,  # Malavalli / Halaguru
                temperature_c=29.4,
                humidity_percent=62.0,
                rainfall_mm=0.0,
                wind_speed_kmh=10.0,
                uv_index=6.0,
                precipitation_probability=15.0,
                source="Open-Meteo (Live / Cached)",
                forecast_summary_en="Warm sunshine and dry afternoon winds over eastern plains of Malavalli.",
                forecast_summary_kn="ಮಳವಳ್ಳಿ ಪೂರ್ವ ಬಯಲು ಸೀಮೆಯಲ್ಲಿ ಶುಷ್ಕ ವಾತಾವರಣ ಮತ್ತು ಬಿಸಿಲು."
            )
        ]
        db.add_all(weathers)
        db.commit()

    # 6. Advisories
    if db.query(AdvisoryItem).count() == 0:
        valid_date = datetime.datetime.utcnow() + datetime.timedelta(days=14)
        adv1 = AdvisoryItem(
            crop_id=crop_by_code["SUGARCANE"].id,
            location_id=loc_objs[0].id,
            title_en="Sugarcane Top Borer Alert - Early Monitoring",
            title_kn="ಕಬ್ಬಿನ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ಎಚ್ಚರಿಕೆ - ಮುಂಜಾಗ್ರತೆ ಕ್ರಮ",
            severity="warning",
            category="pest",
            message_en="Farmers in Maddur and Malavalli taluks are advised to inspect 2-3 month old sugarcane ratoon crops for central shoot drying ('dead hearts'). Apply Trichogramma chilonis egg parasitoids at 50,000/ha.",
            message_kn="ಮದ್ದೂರು ಮತ್ತು ಮಳವಳ್ಳಿ ಭಾಗದಲ್ಲಿ 2-3 ತಿಂಗಳ ಕಬ್ಬಿನ ಬೆಳೆಗಳಲ್ಲಿ ಸುಳಿ ಕೊರೆಯುವ ಹುಳುವಿನ ಬಾಧೆ ಕಂಡುಬಂದಿದೆ. ಸುಳಿ ಒಣಗುವುದನ್ನು ತಡೆಗಟ್ಟಲು ಎಕರೆಗೆ ಟ್ರೈಕೋಗ್ರಾಮ ಪರಾವಲಂಬಿ ಕಾರ್ಡ್‌ಗಳನ್ನು ಅಳವಡಿಸಿ.",
            action_items_en="1. Inspect field for dried central spindles.\n2. Release Trichogramma parasitoids.\n3. Avoid excess nitrogen fertilization.",
            action_items_kn="1. ಒಣಗಿದ ಸುಳಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ತೆಗೆಯಿರಿ.\n2. ಟ್ರೈಕೋಗ್ರಾಮ ಕಾರ್ಡ್ ಅಳವಡಿಸಿ.\n3. ಯೂರಿಯಾ ರಸಗೊಬ್ಬರವನ್ನು ಮಿತವಾಗಿ ಬಳಸಿ.",
            explanation_en="Triggered by current warm temperature (29-32°C) combined with dry canopy conditions favorable for moth oviposition.",
            explanation_kn="ಪ್ರಸ್ತುತ ಮಂಡ್ಯದಲ್ಲಿ ಉಷ್ಣಾಂಶ 29-32°C ಇದ್ದು, ಒಣ ಹವಾಮಾನವು ಪತಂಗಗಳು ಮೊಟ್ಟೆ ಇಡಲು ಪ್ರಶಸ್ತವಾಗಿರುವುದರಿಂದ ಈ ಎಚ್ಚರಿಕೆ ನೀಡಲಾಗಿದೆ.",
            source_reference="ICAR - Sugarcane Breeding Institute & KVK Mandya",
            trigger_condition="Temperature > 29°C & Humidity < 65%",
            is_personalized=True,
            valid_until=valid_date
        )
        adv2 = AdvisoryItem(
            crop_id=crop_by_code["PADDY"].id,
            location_id=loc_objs[0].id,
            title_en="Paddy Blast Prevention during High Morning Humidity",
            title_kn="ಭತ್ತದ ಬೆಂಕಿ ರೋಗ ಮುಂಜಾಗ್ರತೆ - ಹೆಚ್ಚಿನ ತೇವಾಂಶ",
            severity="warning",
            category="disease",
            message_en="Relative humidity exceeding 80% during morning hours promotes blast conidia germination. Spray Pseudomonas fluorescens @ 10g/L or tricyclazole 75 WP @ 0.6g/L.",
            message_kn="ಬೆಳಗಿನ ಜಾವ ವಾತಾವರಣದಲ್ಲಿ 80% ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ತೇವಾಂಶ ಇರುವುದರಿಂದ ಭತ್ತದಲ್ಲಿ ಬೆಂಕಿ ರೋಗದ ಬೀಜಾಣುಗಳು ವೃದ್ಧಿಯಾಗುತ್ತವೆ. ಮುಂಜಾಗ್ರತೆಯಾಗಿ ಸ್ಯೂಡೋಮೊನಾಸ್ 10 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.",
            action_items_en="1. Check nursery and tillering beds for spindle lesions.\n2. Spray bio-fungicide in morning calm hours.\n3. Stop urea top-dressing until weather clears.",
            action_items_kn="1. ಎಲೆಗಳ ಮೇಲೆ ಕಣ್ಣಿನಾಕಾರದ ಚುಕ್ಕೆಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ.\n2. ಬೆಳಿಗ್ಗೆ ಶುಷ್ಕ ಗಾಳಿಯಿದ್ದಾಗ ಜೈವಿಕ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ.\n3. ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ ಬರುವವರೆಗೆ ಯೂರಿಯಾ ಗೊಬ್ಬರ ಹಾಕಬೇಡಿ.",
            explanation_en="Prolonged leaf wetness (>9 hours) and cloudy skies in Mandya basin create optimal conditions for Pyricularia blast infection.",
            explanation_kn="ಮಂಡ್ಯ ಕಣಿವೆಯಲ್ಲಿ ಎಲೆಗಳ ಮೇಲೆ 9 ಗಂಟೆಗೂ ಹೆಚ್ಚು ಇಬ್ಬನಿ ತೇವಾಂಶ ಇರುವುದರಿಂದ ಬೆಂಕಿ ರೋಗದ ಅಪಾಯ ಹೆಚ್ಚಾಗಿದೆ.",
            source_reference="UAS Bangalore - ZARS V.C. Farm Mandya",
            trigger_condition="Relative Humidity > 80% for 2 consecutive days",
            is_personalized=True,
            valid_until=valid_date
        )
        adv3 = AdvisoryItem(
            crop_id=crop_by_code["SUGARCANE"].id,
            location_id=loc_objs[0].id,
            title_en="Smart Irrigation Guidance: Postpone Irrigation Due to Showers",
            title_kn="ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ ಸಲಹೆ: ಮಳೆ ನಿರೀಕ್ಷೆಯಿರುವುದರಿಂದ ನೀರು ಹಾಯಿಸುವುದನ್ನು ಮುಂದೂಡಿ",
            severity="info",
            category="irrigation",
            message_en="Scattered precipitation of 15-20mm is forecasted over the next 48 hours across Mandya and Maddur taluks. Postpone furrow irrigation to prevent root hypoxia.",
            message_kn="ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಮಂಡ್ಯ ಮತ್ತು ಮದ್ದೂರು ಭಾಗದಲ್ಲಿ 15-20 ಮಿ.ಮೀ ಸಾಧಾರಣ ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇದೆ. ಬೇರುಗಳು ಕೊಳೆಯುವುದನ್ನು ತಪ್ಪಿಸಲು ಕಾಲುವೆ ನೀರು ಹಾಯಿಸುವುದನ್ನು ಮುಂದೂಡಿ.",
            action_items_en="1. Delay planned irrigation cycle by 2-3 days.\n2. Clear field drainage channels to avoid standing water.\n3. Collect rainwater in farm ponds.",
            action_items_kn="1. ನಿಗದಿತ ನೀರಾವರಿಯನ್ನು 2-3 ದಿನ ಮುಂದೂಡಿ.\n2. ಜಮೀನಿನ ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ.\n3. ಕೃಷಿ ಹೊಂಡಗಳಲ್ಲಿ ಮಳೆನೀರು ಸಂಗ್ರಹಿಸಿ.",
            explanation_en="Soil moisture retention currently at 72% + expected 18mm rainfall satisfies crop water need for the next 4 days.",
            explanation_kn="ಮಣ್ಣಿನಲ್ಲಿ ಈಗಾಗಲೇ 72% ತೇವಾಂಶವಿದ್ದು, ಬರುವ ಮಳೆಯು ಮುಂದಿನ 4 ದಿನಗಳ ನೀರಿನ ಅಗತ್ಯವನ್ನು ಪೂರೈಸುತ್ತದೆ.",
            source_reference="IMD Agromet Advisory Service & KSNMDC Karnataka",
            trigger_condition="Rainfall forecast > 15mm in 48h",
            is_personalized=False,
            valid_until=valid_date
        )
        adv4 = AdvisoryItem(
            crop_id=crop_by_code["TOMATO"].id,
            location_id=loc_objs[0].id,
            title_en="Tomato Early Blight Vigilance & Trellis Support",
            title_kn="ಟೊಮೆಟೊ ಮುಂಚಿನ ಅಂಗಮಾರಿ ರೋಗ ಮತ್ತು ಕೋಲು ಕಟ್ಟುವ ಸಲಹೆ",
            severity="warning",
            category="disease",
            message_en="Intermittent rains and warm days trigger early blight alternaria spots on lower tomato foliage. Prune bottom leaves touching wet soil and tie vines firmly to trellis stakes.",
            message_kn="ಮಳೆ ಹಾಗೂ ಬಿಸಿಲಿನ ಬದಲಾವಣೆಯಿಂದ ಟೊಮೆಟೊ ಗಿಡಗಳ ಕೆಳಭಾಗದ ಎಲೆಗಳಲ್ಲಿ ಅಂಗಮಾರಿ ಚುಕ್ಕೆ ರೋಗ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು. ಮಣ್ಣು ತಾಗುವ ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ತೆಗೆದು, ಗಿಡಗಳಿಗೆ ಕೋಲು ಕಟ್ಟಿ.",
            action_items_en="1. Prune bottom 15 cm foliage to enhance airflow.\n2. Spray copper oxychloride 3g/L or Mancozeb 2g/L.\n3. Apply dry mulch over drip irrigation lines.",
            action_items_kn="1. ಗಾಳಿಯಾಡಲು ಕೆಳಭಾಗದ 15 ಸೆಂ.ಮೀ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ ತೆಗೆಯಿರಿ.\n2. ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ 3 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.\n3. ಮಣ್ಣಿನ ಮೇಲೆ ಒಣ ತ್ಯಾಜ್ಯದಿಂದ ಹೊದಿಕೆ (ಮಲ್ಚಿಂಗ್) ಮಾಡಿ.",
            explanation_en="Alternaria solani spores splash from wet soil particles during rain showers onto unpruned lower tomato leaves.",
            explanation_kn="ಮಳೆ ಹನಿಗಳು ಬಿದ್ದಾಗ ಮಣ್ಣಿನಲ್ಲಿರುವ ಶಿಲೀಂಧ್ರ ಬೀಜಾಣುಗಳು ಕೆಳ ಎಲೆಗಳಿಗೆ ಹರಡುವುದರಿಂದ ರೋಗ ಹೆಚ್ಚಾಗುತ್ತದೆ.",
            source_reference="IIHR Hesaraghatta & Horticulture Department Mandya",
            trigger_condition="Rainfall + Temperature > 26°C",
            is_personalized=True,
            valid_until=valid_date
        )
        adv5 = AdvisoryItem(
            crop_id=crop_by_code["BANANA"].id,
            location_id=loc_objs[3].id,  # Pandavapura
            title_en="Banana Sigatoka Management & Propping Alert",
            title_kn="ಬಾಳೆ ಸಿಗಟೋಕ ರೋಗ ನಿಯಂತ್ರಣ ಮತ್ತು ಗಿಡಗಳಿಗೆ ಬೆಂಬಲ ಕೋಲು",
            severity="warning",
            category="disease",
            message_en="Strong pre-monsoon wind gusts and cloudy weather require urgent bamboo propping for heavy banana bunches in Srirangapatna and Pandavapura. Deleaf sigatoka spotted leaves immediately.",
            message_kn="ಗಾಳಿಯ ವೇಗ ಹೆಚ್ಚಾಗಿರುವುದರಿಂದ ಭಾರವಾದ ಬಾಳೆ ಗೊನೆಗಳಿಗೆ ಬಿದಿರಿನ ಕೋಲಿನ ಆಧಾರ ನೀಡಿ. ಸಿಗಟೋಕ ಚುಕ್ಕೆ ಬಿದ್ದ ಒಣ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ ಸುಟ್ಟು ಹಾಕಿ.",
            action_items_en="1. Provide two bamboo props in inverted-V structure per tree.\n2. Remove severely infected leaves from farm.\n3. Spray Propiconazole 0.1% with sticker.",
            action_items_kn="1. ಪ್ರತಿ ಗಿಡಕ್ಕೆ ವಿ-ಆಕಾರದಲ್ಲಿ ಎರಡು ಬಿದಿರಿನ ಕೋಲುಗಳನ್ನು ಕಟ್ಟಿ.\n2. ರೋಗಪೀಡಿತ ಎಲೆಗಳನ್ನು ತೋಟದಿಂದ ಹೊರಗೆ ಹಾಕಿ.\n3. ಪ್ರೋಪಿಕೊನಾಜೋಲ್ 1 ಮಿ.ಲೀ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.",
            explanation_en="Heavy bunches are susceptible to pseudostem snapping when wind speeds exceed 18 km/h.",
            explanation_kn="18 ಕಿ.ಮೀ/ಗಂಟೆಗೂ ಹೆಚ್ಚಿನ ವೇಗದ ಗಾಳಿ ಬೀಸಿದಾಗ ಗೊನೆ ತೂಕಕ್ಕೆ ಬಾಳೆ ಗಿಡಗಳು ಮುರಿಯುವ ಸಾಧ್ಯತೆ ಇರುತ್ತದೆ.",
            source_reference="National Research Centre for Banana (NRCB)",
            trigger_condition="Wind Speed > 15 km/h & High Humidity",
            is_personalized=True,
            valid_until=valid_date
        )
        db.add_all([adv1, adv2, adv3, adv4, adv5])
        db.commit()

    # 7. Community Groups (5 Groups across Mandya Taluks)
    if db.query(CommunityGroup).count() == 0:
        grp1 = CommunityGroup(
            name_en="Maddur Sugarcane Growers Forum",
            name_kn="ಮದ್ದೂರು ಕಬ್ಬು ಬೆಳೆಗಾರರ ವೇದಿಕೆ",
            taluk="Maddur",
            village="Shivapura",
            district="Mandya",
            crop_id=crop_by_code["SUGARCANE"].id,
            creator_id=user1.id,
            description_en="Official discussion group for sugarcane cultivation practices, mill cutting schedules, and drip subsidies in Maddur.",
            description_kn="ಮದ್ದೂರು ತಾಲೂಕಿನ ಕಬ್ಬು ಬೆಳೆಗಾರರ ಚರ್ಚಾ ವೇದಿಕೆ - ಕಟಾವು, ರಸಗೊಬ್ಬರ ಮತ್ತು ಹನಿ ನೀರಾವರಿ ಮಾಹಿತಿ.",
            rules_en="Respect fellow growers; only share verified agronomic practices; strictly no commercial advertisements.",
            rules_kn="ರೈತ ಬಾಂಧವರೊಂದಿಗೆ ಸೌಹಾರ್ದಯುತವಾಗಿ ವರ್ತಿಸಿ; ಸರಿಯಾದ ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ಹಂಚಿಕೊಳ್ಳಿ.",
            member_count=142
        )
        grp2 = CommunityGroup(
            name_en="Mandya Organic & Natural Farming Sangha",
            name_kn="ಮಂಡ್ಯ ಸಾವಯವ ಮತ್ತು ನೈಸರ್ಗಿಕ ಕೃಷಿ ಸಂಘ",
            taluk="Mandya",
            village="Guthalu",
            district="Mandya",
            crop_id=crop_by_code["RAGI"].id,
            creator_id=user2.id,
            description_en="Sharing Jeevamrutha preparation, Desi cow manure usage, and direct marketing experiences across Mandya.",
            description_kn="ಜೀವಾಮೃತ ತಯಾರಿ, ದೇಸಿ ಗೋವಿನ ಗೊಬ್ಬರ ಮತ್ತು ನೈಸರ್ಗಿಕ ಕೃಷಿ ಪದ್ಧತಿಗಳ ವಿನಿಮಯ ವೇದಿಕೆ.",
            rules_en="Promote organic and natural farming inputs; support peer seed-saving and barter.",
            rules_kn="ನೈಸರ್ಗಿಕ ಕೃಷಿಗೆ ಪ್ರೋತ್ಸಾಹ ನೀಡಿ; ಬೀಜ ಸಂರಕ್ಷಣೆ ಮತ್ತು ವಿನಿಮಯಕ್ಕೆ ಬೆಂಬಲ ನೀಡಿ.",
            member_count=88
        )
        grp3 = CommunityGroup(
            name_en="Pandavapura Paddy Cultivators Union",
            name_kn="ಪಾಂಡವಪುರ ಭತ್ತ ಬೆಳೆಗಾರರ ಒಕ್ಕೂಟ",
            taluk="Pandavapura",
            village="Melukote",
            district="Mandya",
            crop_id=crop_by_code["PADDY"].id,
            creator_id=user5.id,
            description_en="Discussions on canal water release schedules, Sona Masoori pest management, and combine harvester booking.",
            description_kn="ಕಾಲುವೆ ನೀರು ಬಿಡುಗಡೆ ವೇಳಾಪಟ್ಟಿ, ಸೋನಾ ಮಸೂರಿ ಬೆಳೆ ರೋಗ ನಿರ್ವಹಣೆ ಮತ್ತು ಕಟಾವು ಯಂತ್ರಗಳ ಬುಕಿಂಗ್ ಕುರಿತು ಚರ್ಚೆ.",
            rules_en="Keep canal dispute discussions constructive. Coordinate collective logistics for harvesters.",
            rules_kn="ಕಾಲುವೆ ನೀರಿನ ಚರ್ಚೆಗಳನ್ನು ಸೌಹಾರ್ದಯುತವಾಗಿ ನಡೆಸಿ. ಕಟಾವು ಯಂತ್ರಗಳ ಸಾಮೂಹಿಕ ಬಳಕೆಗೆ ಸಹಕರಿಸಿ.",
            member_count=115
        )
        grp4 = CommunityGroup(
            name_en="Malavalli Horticulture & Sericulture Producers",
            name_kn="ಮಳವಳ್ಳಿ ತೋಟಗಾರಿಕೆ ಮತ್ತು ರೇಷ್ಮೆ ಬೆಳೆಗಾರರ ವೇದಿಕೆ",
            taluk="Malavalli",
            village="Halaguru",
            district="Mandya",
            crop_id=crop_by_code["COCONUT"].id,
            creator_id=user2.id,
            description_en="Promoting high-value horticulture crops: tender coconuts, vegetables, and mulberry sericulture in Malavalli.",
            description_kn="ಮಳವಳ್ಳಿಯ ಎಳನೀರು, ತರಕಾರಿ ಮತ್ತು ರೇಷ್ಮೆ ಕೃಷಿಯ ತಂತ್ರಜ್ಞಾನ ಹಾಗೂ ನೇರ ಮಾರುಕಟ್ಟೆ ಚರ್ಚೆ.",
            rules_en="Share local mandi market rates and pest management tips.",
            rules_kn="ಸ್ಥಳೀಯ ಮಂಡಿ ಧಾರಣೆ ಹಾಗೂ ಕೀಟ ಬಾಧೆ ನಿವಾರಣಾ ಸಲಹೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",
            member_count=64
        )
        grp5 = CommunityGroup(
            name_en="Srirangapatna Riverine Banana Growers",
            name_kn="ಶ್ರೀರಂಗಪಟ್ಟಣ ನದೀಮುಖ ಬಾಳೆ ಬೆಳೆಗಾರರ ಸಂಘ",
            taluk="Srirangapatna",
            village="Arakere",
            district="Mandya",
            crop_id=crop_by_code["BANANA"].id,
            creator_id=user5.id,
            description_en="Cauvery riverbank alluvial growers group specializing in scented Yelakki banana cultivation and export quality sorting.",
            description_kn="ಕಾವೇರಿ ನದಿ ತೀರದ ಮೆಕ್ಕಲು ಮಣ್ಣಿನಲ್ಲಿ ಏಲಕ್ಕಿ ಬಾಳೆ ಬೆಳೆಯುವ ರೈತರ ಒಕ್ಕೂಟ.",
            rules_en="Ensure quality bunch bagging and natural ripening standards.",
            rules_kn="ಗೊನೆಗಳಿಗೆ ರಕ್ಷಣಾ ಕವಚ ಹಾಕುವುದು ಮತ್ತು ಗುಣಮಟ್ಟ ಕಾಯ್ದುಕೊಳ್ಳುವುದಕ್ಕೆ ಆದ್ಯತೆ ನೀಡಿ.",
            member_count=52
        )
        db.add_all([grp1, grp2, grp3, grp4, grp5])
        db.commit()

    # Query groups
    grp_maddur = db.query(CommunityGroup).filter(CommunityGroup.taluk == "Maddur").first()
    grp_organic = db.query(CommunityGroup).filter(CommunityGroup.name_en.ilike("%Organic%")).first()
    grp_paddy = db.query(CommunityGroup).filter(CommunityGroup.taluk == "Pandavapura").first()
    grp_hort = db.query(CommunityGroup).filter(CommunityGroup.taluk == "Malavalli").first()
    grp_banana = db.query(CommunityGroup).filter(CommunityGroup.taluk == "Srirangapatna").first()

    # 8. Group Memberships
    if db.query(GroupMember).count() == 0 and grp_maddur and grp_organic and grp_paddy:
        members = [
            GroupMember(group_id=grp_maddur.id, user_id=user1.id, role="admin", status="approved"),
            GroupMember(group_id=grp_maddur.id, user_id=user2.id, role="member", status="approved"),
            GroupMember(group_id=grp_maddur.id, user_id=user6.id, role="member", status="approved"),
            GroupMember(group_id=grp_organic.id, user_id=user2.id, role="admin", status="approved"),
            GroupMember(group_id=grp_organic.id, user_id=user1.id, role="moderator", status="approved"),
            GroupMember(group_id=grp_organic.id, user_id=user6.id, role="member", status="approved"),
            GroupMember(group_id=grp_paddy.id, user_id=user5.id, role="admin", status="approved"),
            GroupMember(group_id=grp_paddy.id, user_id=user1.id, role="member", status="approved"),
            GroupMember(group_id=grp_paddy.id, user_id=user6.id, role="member", status="approved"),
            GroupMember(group_id=grp_hort.id, user_id=user2.id, role="admin", status="approved"),
            GroupMember(group_id=grp_hort.id, user_id=user6.id, role="member", status="approved"),
            GroupMember(group_id=grp_banana.id, user_id=user5.id, role="admin", status="approved"),
            GroupMember(group_id=grp_banana.id, user_id=user1.id, role="member", status="approved"),
            # Pending join request for testing buyer joining group
            GroupMember(group_id=grp_hort.id, user_id=buyer1.id, role="member", status="pending"),
        ]
        db.add_all(members)
        db.commit()

    # 9. Group Announcements
    if db.query(GroupAnnouncement).count() == 0 and grp_maddur and grp_organic and grp_banana:
        announcements = [
            GroupAnnouncement(
                group_id=grp_maddur.id,
                author_id=user1.id,
                title="Cauvery Canal Water Release Update for Sugarcane",
                content="ಮದ್ದೂರು ತಾಲೂಕಿನ ಎಲ್ಲಾ ಕಬ್ಬು ಬೆಳೆಗಾರರಿಗೆ ಮಾಹಿತಿ: ಈ ವಾರ ವಿಶ್ವೇಶ್ವರಯ್ಯ ನಾಲೆಯಲ್ಲಿ ನೀರು ಹರಿಸಲಾಗುತ್ತಿದೆ. ಎಲ್ಲಾ ರೈತರು ಕಳೆ ಕೀಳುವಿಕೆ ಮುಗಿಸಿ ನೀರು ಹಾಯಿಸಲು ಸಿದ್ಧತೆ ಮಾಡಿಕೊಳ್ಳಿ.",
                priority="urgent"
            ),
            GroupAnnouncement(
                group_id=grp_organic.id,
                author_id=user2.id,
                title="Weekly Jeevamrutha Workshop at Guthalu",
                content="Sunday 10 AM practical demonstration on Ghanajeevamrutha preparation using indigenous Hallikar cow dung at Guthalu community hall.",
                priority="normal"
            ),
            GroupAnnouncement(
                group_id=grp_banana.id,
                author_id=user5.id,
                title="Demonstration on Blue Polythene Bunch Bagging",
                content="Learn how 6% perforated blue polythene sleeves protect bunches from thrips and sun-scald at Arakere demonstration orchard.",
                priority="normal"
            ),
            GroupAnnouncement(
                group_id=grp_paddy.id,
                author_id=user5.id,
                title="Kharif Paddy Seed Subsidy at Pandavapura RSK",
                content="BPT 5204 and Jyothi certified foundation seeds available at 50% subsidy at Raitha Samparka Kendra with RTC copy.",
                priority="normal"
            )
        ]
        db.add_all(announcements)
        db.commit()

    # 10. Community Posts & Threaded Comments
    if db.query(CommunityPost).count() == 0:
        post1 = CommunityPost(
            group_id=grp_maddur.id if grp_maddur else None,
            author_id=user1.id,
            crop_id=crop_by_code["SUGARCANE"].id,
            location_id=loc_objs[1].id,
            title="Best drip fertigation schedule for VSI-434 sugarcane?",
            content="ನಮಸ್ಕಾರ ಸ್ನೇಹಿತರೆ, ಮದ್ದೂರು ಶಿವಪುರದಲ್ಲಿ 2 ತಿಂಗಳ ಕಬ್ಬಿಗೆ ಹನಿ ನೀರಾವರಿ ಮೂಲಕ 19:19:19 ಗೊಬ್ಬರ ಎಷ್ಟು ದಿನಕ್ಕೊಮ್ಮೆ ಕೊಡಬೇಕು? ಅನುಭವಸ್ಥ ರೈತರು ತಿಳಿಸಿ.",
            topic="cultivation",
            language="kn",
            likes_count=18,
            comments_count=2,
            is_pinned=True
        )
        post2 = CommunityPost(
            group_id=grp_organic.id if grp_organic else None,
            author_id=user2.id,
            crop_id=crop_by_code["RAGI"].id,
            location_id=loc_objs[2].id,
            title="Desi neem-cake recipe for soil-borne grub control in Ragi",
            content="ರಾಗಿ ಬೆಳೆಯ ಬೇರು ಹುಳುಗಳಿಗೆ ಬೇವಿನ ಹಿಂಡಿ ಮತ್ತು ಹರಳೆಣ್ಣೆ ಹಿಂಡಿ ಮಿಶ್ರಣ ಬಳಸಿ ಅತ್ಯುತ್ತಮ ಫಲಿತಾಂಶ ಸಿಕ್ಕಿದೆ. ರಾಸಾಯನಿಕ ಕ್ರಿಮಿನಾಶಕ ಬೇಕಾಗಿಲ್ಲ.",
            topic="pest_control",
            language="kn",
            likes_count=26,
            comments_count=2,
            is_pinned=False
        )
        post3 = CommunityPost(
            group_id=grp_banana.id if grp_banana else None,
            author_id=user5.id,
            crop_id=crop_by_code["BANANA"].id,
            location_id=loc_objs[4].id,
            title="Yelakki Banana bunch stem snapping prevention in Srirangapatna",
            content="Heavy bunch load combined with afternoon gusty winds near the Cauvery bank. What bamboo propping angle gives maximum wind resistance?",
            topic="cultivation",
            language="en",
            likes_count=14,
            comments_count=2,
            is_pinned=False
        )
        post4 = CommunityPost(
            group_id=grp_hort.id if grp_hort else None,
            author_id=user6.id,
            crop_id=crop_by_code["TOMATO"].id,
            location_id=loc_objs[0].id,
            title="Staking techniques for indeterminate hybrid tomatoes during rainy spells",
            content="ಟೊಮೆಟೊ ಗಿಡಗಳಿಗೆ ತಂತಿ ಮತ್ತು ನೈಲಾನ್ ದಾರದ ಆಸರೆ ಕಟ್ಟುವ ವಿಧಾನದಿಂದ ಕಾಯಿ ಕೊಳೆಯುವುದು ಶೇ.90 ಕಡಿಮೆಯಾಗಿದೆ. ಮಣ್ಣು ತಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳುವುದು ಮುಖ್ಯ.",
            topic="cultivation",
            language="kn",
            likes_count=12,
            comments_count=1,
            is_pinned=False
        )
        post5 = CommunityPost(
            group_id=None,  # Public General Forum
            author_id=user1.id,
            crop_id=crop_by_code["PADDY"].id,
            location_id=loc_objs[1].id,
            title="Combined paddy harvester availability in Maddur & Mandya",
            content="Does anyone have direct contact numbers for combine harvesters with rubber tracks available next week near Shivapura? Please share rates per hour.",
            topic="machinery",
            language="en",
            likes_count=15,
            comments_count=2,
            is_pinned=False
        )
        db.add_all([post1, post2, post3, post4, post5])
        db.commit()

        # Threaded Comments & Nested Replies
        c1 = PostComment(
            post_id=post1.id,
            author_id=user2.id,
            content="ರಮೇಶ್ ಅವರೇ, ಪ್ರತಿ 8-10 ದಿನಕ್ಕೊಮ್ಮೆ ಬೆಳಿಗ್ಗೆ ವೇಳೆ 3 ಕೆಜಿ 19:19:19 ಕರಗಿಸಿ ವೆಂಚುರಿ ಮೂಲಕ ಕೊಡಿ. ಸಂಜೆ ವೇಳೆಯಲ್ಲಿ ಬೇಡ.",
            likes_count=7
        )
        db.add(c1)
        db.commit()

        c1_reply = PostComment(
            post_id=post1.id,
            author_id=user1.id,
            parent_id=c1.id,
            content="ಧನ್ಯವಾದಗಳು ಲಕ್ಷ್ಮಿ ಅಕ್ಕ, ನಾಳೆಯಿಂದಲೇ ಈ ವೇಳಾಪಟ್ಟಿ ಅನುಸರಿಸುತ್ತೇನೆ.",
            likes_count=3
        )
        c2 = PostComment(
            post_id=post2.id,
            author_id=user6.id,
            content="ಬೇವಿನ ಹಿಂಡಿ ಎಕರೆಗೆ ಎಷ್ಟು ಪ್ರಮಾಣದಲ್ಲಿ ಹಾಕಬೇಕು ಮೇಡಂ? ಬಿತ್ತನೆಗೆ ಮುಂಚೆ ಅಥವಾ ನಂತರವೇ?",
            likes_count=4
        )
        db.add_all([c1_reply, c2])
        db.commit()

        c2_reply = PostComment(
            post_id=post2.id,
            author_id=user2.id,
            parent_id=c2.id,
            content="ಕೊನೆಯ ಉಳುಮೆ ವೇಳೆ ಎಕರೆಗೆ 150-200 ಕೆಜಿ ಬೇವಿನ ಹಿಂಡಿಯನ್ನು ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರದೊಂದಿಗೆ ಮಿಶ್ರಣ ಮಾಡಿ ಭೂಮಿಗೆ ಸೇರಿಸಿ ನಾಗರಾಜ್ ಅವರೇ.",
            likes_count=5
        )
        c3 = PostComment(
            post_id=post3.id,
            author_id=admin_user.id,
            content="Use double bamboo prop at 60-degree angle anchored 1.5 feet deep. Tie using coir rope cushioned with dried banana leaf sheath.",
            likes_count=6
        )
        c4 = PostComment(
            post_id=post4.id,
            author_id=user5.id,
            content="ಅತ್ಯುತ್ತಮ ಸಲಹೆ ನಾಗರಾಜು ಅವರೇ. ನಾವೂ ಸಹ ಇದೇ ಮಾದರಿಯನ್ನು ತೋಟಗಾರಿಕೆಯಲ್ಲಿ ಅನುಸರಿಸುತ್ತಿದ್ದೇವೆ.",
            likes_count=2
        )
        c5 = PostComment(
            post_id=post5.id,
            author_id=user2.id,
            content="Contact Sri Manjunatha Harvesters in Maddur: ₹2,400 per hour with operator including fuel. Phone shared in DM.",
            likes_count=4
        )
        db.add_all([c2_reply, c3, c4, c5])
        db.commit()

        # Likes & Saves
        db.add_all([
            PostLike(post_id=post1.id, user_id=user1.id),
            PostLike(post_id=post2.id, user_id=user1.id),
            PostLike(post_id=post2.id, user_id=user6.id),
            PostLike(post_id=post3.id, user_id=user1.id),
            SavedPost(post_id=post2.id, user_id=user1.id),
            SavedPost(post_id=post3.id, user_id=user6.id),
        ])
        db.commit()

    # 11. Content Reports
    if db.query(ContentReport).count() == 0:
        first_post = db.query(CommunityPost).first()
        r1 = ContentReport(
            user_id=user1.id,
            post_id=first_post.id if first_post else None,
            reason="misleading_advice",
            details="Farmer recommended unregistered high chemical dosage in public forum without agrochemical badge.",
            status="pending"
        )
        r2 = ContentReport(
            user_id=user2.id,
            post_id=first_post.id if first_post else None,
            reason="commercial_ad",
            details="External dealer posted tractor promotional link without group admin permission.",
            status="dismissed"
        )
        db.add_all([r1, r2])
        db.commit()

    # 12. Market Listings (6 realistic listings across Mandya taluks)
    if db.query(MarketListing).count() == 0:
        now = datetime.datetime.utcnow()
        ml1 = MarketListing(
            farmer_id=user1.id,
            crop_id=crop_by_code["SUGARCANE"].id,
            variety="Co 86032 (Nayana)",
            quantity=45.0,
            unit="ton",
            price_per_unit=3150.0,
            harvest_date=now + datetime.timedelta(days=25),
            available_from=now,
            available_until=now + datetime.timedelta(days=40),
            village="Shivapura",
            taluk="Maddur",
            district="Mandya",
            pickup_address="Maddur-Malavalli Main Road, Farm Gate 4",
            image_url="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800",
            is_collective=False,
            status="active",
            description="Fresh healthy 11-month standing sugarcane crop near Maddur-Malavalli road. High brix sugar content, suitable for jaggery or mill."
        )
        ml2 = MarketListing(
            farmer_id=user2.id,
            crop_id=crop_by_code["COCONUT"].id,
            variety="Mandya Local Green Tender Coconut",
            quantity=2500.0,
            unit="piece",
            price_per_unit=32.0,
            harvest_date=now + datetime.timedelta(days=5),
            available_from=now,
            available_until=now + datetime.timedelta(days=20),
            village="Halaguru",
            taluk="Malavalli",
            district="Mandya",
            pickup_address="Halaguru Roadside Farm Gate, Near Canal Bridge",
            image_url="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800",
            is_collective=False,
            status="active",
            description="Sweet water grade-A tender coconuts directly from Halaguru plantation. Direct lorry and pickup truck access to farm."
        )
        ml3 = MarketListing(
            farmer_id=user1.id,
            crop_id=crop_by_code["RAGI"].id,
            variety="GPU 28 Certified Organic",
            quantity=80.0,
            unit="quintal",
            price_per_unit=3850.0,
            harvest_date=now + datetime.timedelta(days=12),
            available_from=now,
            available_until=now + datetime.timedelta(days=60),
            village="Shivapura",
            taluk="Maddur",
            district="Mandya",
            pickup_address="Shivapura Primary Agricultural Society Godown",
            image_url="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800",
            is_collective=False,
            status="active",
            description="Naturally grown GPU 28 finger millet with zero chemical pesticides. Cleaned and sun-dried in 50kg gunny bags."
        )
        ml4 = MarketListing(
            farmer_id=user5.id,
            group_id=grp_paddy.id if grp_paddy else None,
            crop_id=crop_by_code["PADDY"].id,
            variety="BPT 5204 (Sona Masoori)",
            quantity=250.0,
            unit="quintal",
            price_per_unit=2650.0,
            harvest_date=now + datetime.timedelta(days=15),
            available_from=now,
            available_until=now + datetime.timedelta(days=45),
            village="Melukote",
            taluk="Pandavapura",
            district="Mandya",
            pickup_address="Pandavapura Raitha Bhavan Community Collection Center",
            image_url="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800",
            is_collective=True,
            status="active",
            description="Collective paddy lot aggregated from 3 verified farmers of Pandavapura Paddy Union. Moisture 13%, combine harvested, sorted lot."
        )
        ml5 = MarketListing(
            farmer_id=user5.id,
            group_id=grp_banana.id if grp_banana else None,
            crop_id=crop_by_code["BANANA"].id,
            variety="Yelakki Bale (Scented)",
            quantity=120.0,
            unit="quintal",
            price_per_unit=4200.0,
            harvest_date=now + datetime.timedelta(days=8),
            available_from=now,
            available_until=now + datetime.timedelta(days=25),
            village="Melukote",
            taluk="Pandavapura",
            district="Mandya",
            pickup_address="Melukote Main Road Farm Gate 2",
            image_url="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=800",
            is_collective=False,
            status="active",
            description="Grade-A sweet Yelakki banana bunches. Grown with drip fertigation and protected with blue bunch sleeves. Perfect for wholesale distribution."
        )
        ml6 = MarketListing(
            farmer_id=user6.id,
            crop_id=crop_by_code["TOMATO"].id,
            variety="Shivaji / US-440 Hybrid",
            quantity=60.0,
            unit="quintal",
            price_per_unit=1800.0,
            harvest_date=now + datetime.timedelta(days=3),
            available_from=now,
            available_until=now + datetime.timedelta(days=14),
            village="Guthalu",
            taluk="Mandya",
            district="Mandya",
            pickup_address="Guthalu Vegetable Collection Point",
            image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800",
            is_collective=False,
            status="active",
            description="Firm ripe export-quality hybrid tomatoes. Trellis grown, uniform grading, packed in 25kg plastic crates."
        )
        db.add_all([ml1, ml2, ml3, ml4, ml5, ml6])
        db.commit()

        # Collective Contributions for ml4
        c_contrib1 = GroupListingContribution(
            listing_id=ml4.id,
            farmer_id=user5.id,
            farmer_name=user5.full_name,
            farmer_phone=user5.phone_number,
            farmer_village="Melukote",
            quantity=100.0,
            unit="quintal",
            notes="Acreage 2.5 harvest share"
        )
        c_contrib2 = GroupListingContribution(
            listing_id=ml4.id,
            farmer_id=user6.id,
            farmer_name=user6.full_name,
            farmer_phone=user6.phone_number,
            farmer_village="Guthalu",
            quantity=150.0,
            unit="quintal",
            notes="Acreage 3.0 harvest share"
        )
        db.add_all([c_contrib1, c_contrib2])
        db.commit()

        # Saved Listings for Buyer
        db.add_all([
            SavedListing(user_id=buyer1.id, listing_id=ml2.id),
            SavedListing(user_id=buyer1.id, listing_id=ml4.id),
            SavedListing(user_id=buyer1.id, listing_id=ml5.id),
        ])
        db.commit()

        # Market Enquiries across diverse statuses
        enq1 = MarketEnquiry(
            listing_id=ml2.id,
            buyer_id=buyer1.id,
            quantity_requested=1000.0,
            offered_price=30.0,
            message="We can pick up 1,000 tender coconuts this Saturday morning. Please confirm farm location.",
            status="pending"
        )
        enq2 = MarketEnquiry(
            listing_id=ml4.id,
            buyer_id=buyer1.id,
            quantity_requested=60.0,
            offered_price=2600.0,
            message="Mysore Agro Traders interested in 60 quintals Sona Masoori. Can take delivery at Pandavapura godown.",
            status="accepted"
        )
        enq3 = MarketEnquiry(
            listing_id=ml5.id,
            buyer_id=buyer1.id,
            quantity_requested=50.0,
            offered_price=3900.0,
            message="We need 50 quintals Yelakki banana for Bengaluru retail chain. What is your best bulk pickup price?",
            status="in_negotiation"
        )
        enq4 = MarketEnquiry(
            listing_id=ml6.id,
            buyer_id=buyer1.id,
            quantity_requested=40.0,
            offered_price=1750.0,
            message="Urgent requirement for 40 quintals firm red tomatoes for canning unit.",
            status="completed"
        )
        db.add_all([enq1, enq2, enq3, enq4])
        db.commit()

        # Enquiry Messages
        em1 = EnquiryMessage(
            enquiry_id=enq1.id,
            sender_id=buyer1.id,
            message="We can pick up 1,000 tender coconuts this Saturday morning. Please confirm farm location.",
            proposed_price=30.0
        )
        em2 = EnquiryMessage(
            enquiry_id=enq2.id,
            sender_id=buyer1.id,
            message="Mysore Agro Traders interested in 60 quintals Sona Masoori. Can take delivery at Pandavapura godown.",
            proposed_price=2600.0
        )
        em3 = EnquiryMessage(
            enquiry_id=enq2.id,
            sender_id=user5.id,
            message="Offer accepted! Grain moisture test passed, ready for collection at Pandavapura Raitha Bhavan.",
            proposed_price=2600.0
        )
        em4 = EnquiryMessage(
            enquiry_id=enq3.id,
            sender_id=buyer1.id,
            message="We need 50 quintals Yelakki banana for Bengaluru retail chain. What is your best bulk pickup price?",
            proposed_price=3900.0
        )
        em5 = EnquiryMessage(
            enquiry_id=enq3.id,
            sender_id=user5.id,
            message="Our Yelakki bunches are bagged Grade-A export quality. We can offer ₹4,050/quintal if picked up in 2 days.",
            proposed_price=4050.0
        )
        em6 = EnquiryMessage(
            enquiry_id=enq3.id,
            sender_id=buyer1.id,
            message="Agreed at ₹4,000/quintal for 50 quintals. Dispatching 2 trucks on Friday morning.",
            proposed_price=4000.0
        )
        em7 = EnquiryMessage(
            enquiry_id=enq4.id,
            sender_id=buyer1.id,
            message="Urgent requirement for 40 quintals firm red tomatoes for canning unit.",
            proposed_price=1750.0
        )
        em8 = EnquiryMessage(
            enquiry_id=enq4.id,
            sender_id=user6.id,
            message="Dispatched 40 quintals sorted crates from Guthalu collection center. Thank you!",
            proposed_price=1750.0
        )
        db.add_all([em1, em2, em3, em4, em5, em6, em7, em8])
        db.commit()

    # 13. Notifications with Deep Linking
    if db.query(Notification).count() == 0:
        notifs = [
            Notification(
                user_id=user1.id,
                title_en="New Crop Advisory for Mandya",
                title_kn="ಮಂಡ್ಯ ಜಿಲ್ಲೆಗೆ ನೂತನ ಬೆಳೆ ಸಲಹೆ",
                message_en="Top borer pest alert issued for sugarcane fields in your taluk.",
                message_kn="ನಿಮ್ಮ ತಾಲೂಕಿನ ಕಬ್ಬಿನ ಬೆಳೆಗಳಿಗೆ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ಬಾಧೆಯ ಮುಂಜಾಗ್ರತಾ ಎಚ್ಚರಿಕೆ ಬಿಡುಗಡೆಯಾಗಿದೆ.",
                type="advisory",
                is_read=False,
                related_entity_type="advisory",
                related_entity_id=1
            ),
            Notification(
                user_id=user2.id,
                title_en="Buyer Enquiry Received",
                title_kn="ಹೊಸ ಖರೀದಿ ವಿಚಾರಣೆ ಬಂದಿದೆ",
                message_en="Mysore Agro Traders enquired about 1000 Tender Coconuts.",
                message_kn="ಮೈಸೂರು ಆಗ್ರೋ ಟ್ರೇಡರ್ಸ್ 1000 ಎಳನೀರು ಖರೀದಿಸಲು ವಿಚಾರಣೆ ಕಳುಹಿಸಿದ್ದಾರೆ.",
                type="market",
                is_read=False,
                related_entity_type="enquiry",
                related_entity_id=1
            ),
            Notification(
                user_id=buyer1.id,
                title_en="Enquiry Accepted by Farmer",
                title_kn="ರೈತರಿಂದ ಖರೀದಿ ವಿಚಾರಣೆ ಒಪ್ಪಿಗೆಯಾಗಿದೆ",
                message_en="Pandavapura Union accepted your enquiry for 60 quintals Sona Masoori Paddy.",
                message_kn="ಪಾಂಡವಪುರ ಒಕ್ಕೂಟವು 60 ಕ್ವಿಂಟಾಲ್ ಸೋನಾ ಮಸೂರಿ ಭತ್ತದ ವಿಚಾರಣೆಯನ್ನು ಒಪ್ಪಿಕೊಂಡಿದೆ.",
                type="market",
                is_read=True,
                related_entity_type="enquiry",
                related_entity_id=2
            ),
            Notification(
                user_id=user5.id,
                title_en="Counter Offer on Yelakki Banana",
                title_kn="ಏಲಕ್ಕಿ ಬಾಳೆ ಬೆಳೆಗೆ ಹೊಸ ದರ ಪ್ರಸ್ತಾಪ ಬಂದಿದೆ",
                message_en="Mysore Agro Traders proposed ₹4,000/quintal for 50 quintals.",
                message_kn="ಮೈಸೂರು ಆಗ್ರೋ ಟ್ರೇಡರ್ಸ್ 50 ಕ್ವಿಂಟಾಲ್‌ಗೆ ₹4,000 ದರ ಪ್ರಸ್ತಾಪಿಸಿದ್ದಾರೆ.",
                type="market",
                is_read=False,
                related_entity_type="enquiry",
                related_entity_id=3
            ),
            Notification(
                user_id=user1.id,
                title_en="New Comment on Sugarcane Discussion",
                title_kn="ಕಬ್ಬಿನ ಚರ್ಚೆಗೆ ಹೊಸ ಪ್ರತಿಕ್ರಿಯೆ ಬಂದಿದೆ",
                message_en="Lakshmi Devi replied with drip fertigation advice for 19:19:19.",
                message_kn="ಲಕ್ಷ್ಮಿ ದೇವಿ ಅವರು ಹನಿ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿಗೆ ಸಲಹೆ ನೀಡಿದ್ದಾರೆ.",
                type="community",
                is_read=False,
                related_entity_type="post",
                related_entity_id=1
            ),
            Notification(
                user_id=admin_user.id,
                title_en="New Community Content Report",
                title_kn="ಹೊಸ ಸಮುದಾಯ ವಿಷಯ ವರದಿ ಬಂದಿದೆ",
                message_en="A farmer reported a discussion for misleading dosage advice in Maddur group.",
                message_kn="ಮದ್ದೂರು ಗುಂಪಿನಲ್ಲಿ ತಪ್ಪುದಾರಿಗೆಳೆಯುವ ಸಲಹೆಯ ಬಗ್ಗೆ ವರದಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ.",
                type="system",
                is_read=False,
                related_entity_type="report",
                related_entity_id=1
            )
        ]
        db.add_all(notifs)
        db.commit()

    # 14. Notification Preferences
    if db.query(UserNotificationPreference).count() == 0:
        prefs = [
            UserNotificationPreference(user_id=user1.id, advisory_alerts=True, community_updates=True, market_enquiries=True, system_announcements=True),
            UserNotificationPreference(user_id=user2.id, advisory_alerts=True, community_updates=True, market_enquiries=True, system_announcements=False),
            UserNotificationPreference(user_id=buyer1.id, advisory_alerts=False, community_updates=False, market_enquiries=True, system_announcements=True),
            UserNotificationPreference(user_id=admin_user.id, advisory_alerts=True, community_updates=True, market_enquiries=True, system_announcements=True),
            UserNotificationPreference(user_id=user5.id, advisory_alerts=True, community_updates=True, market_enquiries=True, system_announcements=True),
            UserNotificationPreference(user_id=user6.id, advisory_alerts=True, community_updates=True, market_enquiries=True, system_announcements=True),
        ]
        db.add_all(prefs)
        db.commit()

    # 15. Support Tickets
    if db.query(SupportTicket).count() == 0:
        tickets = [
            SupportTicket(
                user_id=user1.id,
                category="crop_advisory",
                subject="Soil testing facility in Maddur taluk",
                description="Where can I get soil electrical conductivity (EC) and organic carbon tested near Shivapura?",
                status="resolved",
                resolution_notes="Contact Raitha Samparka Kendra (RSK) near Maddur APMC Yard, Monday to Saturday 10 AM to 5 PM. Testing kit available at subsidized ₹50 fee."
            ),
            SupportTicket(
                user_id=buyer1.id,
                category="market_dispute",
                subject="Organic certification document uploads for ragi lots",
                description="We require Jaivik Bharat or PGS-India certificate verification for collective organic finger millet lots.",
                status="open"
            ),
            SupportTicket(
                user_id=user5.id,
                category="app_issue",
                subject="Solar drip irrigation subsidy application in Pandavapura",
                description="How to download the certified crop acreage certificate required for PM-KUSUM solar pump subsidy?",
                status="in_progress",
                resolution_notes="Our extension team has verified your RTC in AgriMitra. You can download the digital copy from Profile > My Land Records."
            )
        ]
        db.add_all(tickets)
        db.commit()

    # 16. Moderation Audit Logs
    if db.query(ModerationAuditLog).count() == 0:
        logs = [
            ModerationAuditLog(
                admin_id=admin_user.id,
                action="assign_badge",
                target_type="user",
                target_id=user1.id,
                details="Awarded Verified Farmer badge based on verified Mandya land records (RTC)."
            ),
            ModerationAuditLog(
                admin_id=admin_user.id,
                action="moderate_group",
                target_type="community_group",
                target_id=1,
                details="Verified guidelines and appointed Lakshmi Devi as co-moderator for Maddur Sugarcane Forum."
            ),
            ModerationAuditLog(
                admin_id=admin_user.id,
                action="resolve_report",
                target_type="content_report",
                target_id=1,
                details="Investigated misleading chemical pesticide dosage. Issued advisory note to post author."
            )
        ]
        db.add_all(logs)
        db.commit()


if __name__ == "__main__":
    from app.core.database import SessionLocal
    reset = "--reset" in sys.argv or "--force" in sys.argv
    db = SessionLocal()
    try:
        print(f"Seeding AgriMitra database (force={reset})...")
        seed_database(db, force=reset)
        print("Database seeded successfully with Mandya pilot dataset!")
    finally:
        db.close()
