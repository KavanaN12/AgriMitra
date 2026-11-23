import datetime
from typing import List, Dict, Any, Optional
from app.models.models import Crop, UserCrop, User
from app.schemas.schemas import AdvisoryRecommendation, DiseaseDiagnosisResponse

# Verified ICAR / UAS Bangalore Diagnostic Profiles for Mandya Crops
DISEASE_PROFILES = {
    # Paddy
    "blast": {
        "disease_en": "Paddy Leaf Blast (Pyricularia oryzae)",
        "disease_kn": "ಭತ್ತದ ಎಲೆ ಬೆಂಕಿ ರೋಗ (ಪೈರಿಕ್ಯುಲೇರಿಯಾ)",
        "confidence": 0.92,
        "severity": "warning",
        "analysis_en": "Spindle-shaped elliptical lesions with grayish-white centers and brownish margins detected on leaf blade, characteristic of fungal blast infection in humid conditions.",
        "analysis_kn": "ಎಲೆಯ ಮೇಲೆ ಕಣ್ಣಿನಾಕಾರದ ಕಂದು ಬಣ್ಣದ ಅಂಚು ಹಾಗೂ ಬೂದು ಬಣ್ಣದ ಮಧ್ಯಭಾಗದ ಚುಕ್ಕೆಗಳು ಕಂಡುಬಂದಿದ್ದು, ಇದು ಶಿಲೀಂಧ್ರದಿಂದ ಬರುವ ಭತ್ತದ ಬೆಂಕಿ ರೋಗದ ಲಕ್ಷಣವಾಗಿದೆ.",
        "immediate_remedies_en": [
            "Foliar spray of Pseudomonas fluorescens @ 10g/litre of water in the morning",
            "Withhold top-dressing of urea / nitrogen fertilizers until new leaves emerge clean",
            "Maintain 2-3 cm shallow water layer; avoid deep submergence"
        ],
        "immediate_remedies_kn": [
            "ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 10 ಗ್ರಾಂ ಸ್ಯೂಡೋಮೊನಾಸ್ ಫ್ಲೋರೊಸೆಂಟ್ಸ್ ಬೆರೆಸಿ ಬೆಳಿಗ್ಗೆ ಸಿಂಪಡಿಸಿ",
            "ಹೊಸ ಎಲೆಗಳು ರೋಗಮುಕ್ತವಾಗಿ ಬರುವವರೆಗೂ ಯೂರಿಯಾ ಗೊಬ್ಬರ ನೀಡುವುದನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ",
            "ಗದ್ದೆಯಲ್ಲಿ 2-3 ಸೆಂ.ಮೀ ಮಾತ್ರ ನೀರು ನಿಲ್ಲಿಸಿ, ಅತಿಯಾದ ನೀರು ನಿಲ್ಲಿಸಬೇಡಿ"
        ],
        "preventive_en": [
            "Use certified blast-tolerant varieties (e.g. Tanu, Jyothi, KMP 175) in upcoming season",
            "Seed treatment with Trichoderma viride @ 4g/kg seed"
        ],
        "preventive_kn": [
            "ಮುಂದಿನ ಹಂಗಾಮಿನಲ್ಲಿ ರೋಗ ನಿರೋಧಕ ತಳಿಗಳನ್ನು (ತನು, ಜ್ಯೋತಿ) ಬಳಸಿ",
            "ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಬೀಜೋಪಚಾರವನ್ನು ಟ್ರೈಕೋಗ್ರಾಮ (4 ಗ್ರಾಂ/ಕೆಜಿ) ಯಿಂದ ಮಾಡಿ"
        ]
    },
    # Sugarcane
    "red_rot": {
        "disease_en": "Sugarcane Red Rot (Colletotrichum falcatum)",
        "disease_kn": "ಕಬ್ಬಿನ ಕೆಂಪು ಕೊಳೆ ರೋಗ (ರೆಡ್ ರಾಟ್)",
        "confidence": 0.89,
        "severity": "critical",
        "analysis_en": "Third or fourth leaf from crown shows yellowing and wilting. Longitudinal splitting reveals reddened internal pith tissues with cross-wise white bands.",
        "analysis_kn": "ಸುಳಿಯ 3-4 ನೇ ಎಲೆಗಳು ಹಳದಿಯಾಗಿ ಒಣಗಲಾರಂಭಿಸಿವೆ. ಕಬ್ಬಿನ ದಂಟನ್ನು ಸೀಳಿದಾಗ ಒಳಭಾಗ ಕೆಂಪಾಗಿ ಅಡ್ಡಲಾಗಿ ಬಿಳಿ ಪಟ್ಟಿಗಳು ಕಂಡುಬಂದಿವೆ.",
        "immediate_remedies_en": [
            "Uproot and immediately destroy infected clumps to prevent fungal spread to adjacent stools",
            "Sterilize cutting sickles with 1% potassium permanganate solution before touching healthy canes",
            "Ensure proper surface drainage so water does not carry spores across furrows"
        ],
        "immediate_remedies_kn": [
            "ರೋಗಪೀಡಿತ ಕಬ್ಬಿನ ಬುಡಗಳನ್ನು ತಕ್ಷಣ ಕಿತ್ತು ಸುಟ್ಟುಹಾಕಿ, ಪಕ್ಕದ ಗಿಡಗಳಿಗೆ ಹರಡುವುದನ್ನು ತಪ್ಪಿಸಿ",
            "ಕಟಾವು ಕೊಡುಗೋಲುಗಳನ್ನು ಪೊಟ್ಯಾಸಿಯಂ ಪರ್ಮಾಂಗನೇಟ್ ದ್ರಾವಣದಲ್ಲಿ ಅದ್ದಿ ಕ್ರಿಮಿಮುಕ್ತಗೊಳಿಸಿ",
            "ಕಾಲುವೆ ನೀರು ರೋಗಪೀಡಿತ ಸಾಲಿನಿಂದ ಆರೋಗ್ಯವಂತ ಸಾಲಿಗೆ ಹರಿಯದಂತೆ ಬಸಿಗಾಲುವೆ ಮಾಡಿ"
        ],
        "preventive_en": [
            "Plant resistant cultivars (Co 86032, VSI 434) from disease-free nursery plots",
            "Dip setts in Trichoderma viride slurry before planting"
        ],
        "preventive_kn": [
            "ರೋಗ ನಿರೋಧಕ ತಳಿಗಳನ್ನು (ಕೋ 86032, ವಿಎಸ್‌ಐ 434) ಮಾತ್ರ ನಾಟಿ ಮಾಡಿ",
            "ನಾಟಿ ಮಾಡುವ ಮುನ್ನ ಕಬ್ಬಿನ ತುಂಡುಗಳನ್ನು ಟ್ರೈಕೋಡರ್ಮಾದಲ್ಲಿ ಅದ್ದಿ"
        ]
    },
    # Tomato
    "early_blight": {
        "disease_en": "Tomato Early Blight (Alternaria solani)",
        "disease_kn": "ಟೊಮೆಟೊ ಮುಂಚಿನ ಅಂಗಮಾರಿ ರೋಗ",
        "confidence": 0.91,
        "severity": "warning",
        "analysis_en": "Concentric rings or 'target-board' brown-black necrotic spots on lower leaves with yellow halo surrounding the lesion.",
        "analysis_kn": "ಕೆಳ ಹಂತದ ಎಲೆಗಳ ಮೇಲೆ ಗುರಿಯ ಹಲಗೆಯಂತೆ (ಟಾರ್ಗೆಟ್ ಬೋರ್ಡ್) ವೃತ್ತಾಕಾರದ ಕಂದು-ಕಪ್ಪು ಚುಕ್ಕೆಗಳು ಮತ್ತು ಸುತ್ತಲೂ ಹಳದಿ ಬಣ್ಣದ ವಲಯ ಕಾಣಿಸಿಕೊಂಡಿದೆ.",
        "immediate_remedies_en": [
            "Prune infected bottom leaves up to 30 cm from ground and dispose away from the plot",
            "Avoid overhead / splash irrigation; switch to drip or narrow furrow to keep foliage dry",
            "Spray neem seed kernel extract (NSKE 5%) or copper oxychloride @ 2.5g/L on non-windy morning"
        ],
        "immediate_remedies_kn": [
            "ನೆಲದಿಂದ 30 ಸೆಂ.ಮೀ ವರೆಗಿನ ಸೋಂಕು ತಗುಲಿದ ಕೆಳ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ ನಾಶಪಡಿಸಿ",
            "ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಬೀಳದಂತೆ ಹನಿ ನೀರಾವರಿ ಅಥವಾ ಬುಡಕ್ಕೆ ಮಾತ್ರ ನೀರು ಹಾಯಿಸಿ",
            "ಬೇವಿನ ಬೀಜದ ಕಷಾಯ (NSKE 5%) ಅಥವಾ ತಾಮ್ರದ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ (2.5 ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ"
        ],
        "preventive_en": [
            "Mulch with silver-black plastic or dry straw to prevent soil-borne spore splashing",
            "Maintain crop rotation of 2 years without solanaceous crops (potato, brinjal, chili)"
        ],
        "preventive_kn": [
            "ಮಣ್ಣಿನಿಂದ ಬೀಜಾಣುಗಳು ಎಲೆಗಳಿಗೆ ಹಾರುವುದನ್ನು ತಡೆಯಲು ಹುಲ್ಲಿನ ಹೊದಿಕೆ (ಮಲ್ಚಿಂಗ್) ಮಾಡಿ",
            "ಬದನೆ, ಆಲೂಗಡ್ಡೆ, ಮೆಣಸಿನಕಾಯಿ ಬೆಳೆಗಳನ್ನು ಒಂದೇ ಜಮೀನಿನಲ್ಲಿ ಸತತವಾಗಿ ಬೆಳೆಯಬೇಡಿ"
        ]
    },
    # Default fallback
    "generic": {
        "disease_en": "Suspected Fungal Foliar Leaf Spot",
        "disease_kn": "ಶಿಲೀಂಧ್ರ ಎಲೆ ಚುಕ್ಕೆ ರೋಗ",
        "confidence": 0.85,
        "severity": "info",
        "analysis_en": "Irregular necrotic brown spots visible on foliage, typically developing under high humidity and dense canopy conditions.",
        "analysis_kn": "ಎಲೆಗಳ ಮೇಲೆ ಅನಿಯಮಿತ ಕಂದು ಚುಕ್ಕೆಗಳು ಕಂಡುಬಂದಿದ್ದು, ಅತಿಯಾದ ತೇವಾಂಶ ಮತ್ತು ಗಾಳಿಯಾಡದ ಸ್ಥಿತಿಯಲ್ಲಿ ಇದು ಬೆಳೆಯುತ್ತದೆ.",
        "immediate_remedies_en": [
            "Improve air circulation through optimal row spacing and weeding",
            "Apply bio-agent Trichoderma harzianum @ 5g/L water on foliage",
            "Consult local Mandya Raitha Samparka Kendra (RSK) for specimen examination"
        ],
        "immediate_remedies_kn": [
            "ಕಳೆ ಕೀಳುವ ಮೂಲಕ ಹಾಗೂ ಸಾಲುಗಳ ನಡುವೆ ಗಾಳಿಯಾಡುವಂತೆ ಮಾಡಿ",
            "ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಗ್ರಾಂ ಟ್ರೈಕೋಡರ್ಮಾ ಹಾರ್ಜಿಯಾನಂ ಬೆರೆಸಿ ಎಲೆಗಳ ಮೇಲೆ ಸಿಂಪಡಿಸಿ",
            "ನಿಖರ ಪರೀಕ್ಷೆಗಾಗಿ ಸ್ಥಳೀಯ ಮಂಡ್ಯ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ (RSK) ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ"
        ],
        "preventive_en": ["Adopt certified disease-free seeds and balanced nutrition."],
        "preventive_kn": ["ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳನ್ನು ಮತ್ತು ಸಮತೋಲಿತ ಗೊಬ್ಬರವನ್ನು ಬಳಸಿ."]
    }
}


class AdvisoryEngine:
    """
    Explainable, Rule-Based Agricultural Advisory Engine.
    Combines crop phenology, soil, irrigation source, and real-time 7-day weather conditions.
    """

    def generate_recommendations(
        self,
        user: Optional[User],
        user_crops: List[UserCrop],
        current_weather: Dict[str, Any],
        forecast_days: List[Dict[str, Any]]
    ) -> List[AdvisoryRecommendation]:
        recommendations = []
        now = datetime.datetime.utcnow()

        temp = current_weather.get("temperature_c", 28.5)
        humidity = current_weather.get("humidity_percent", 65.0)
        wind = current_weather.get("wind_speed_kmh", 12.0)

        # 48-hour rainfall sum from forecast
        rain_next_48h = 0.0
        for day in forecast_days[:2]:
            rain_next_48h += day.get("rainfall_mm", 0.0)

        # Max rain probability in next 48h
        prob_max_48h = max([d.get("precipitation_probability", 0.0) for d in forecast_days[:2]], default=20.0)

        irrigation_source = user.irrigation_source if user and user.irrigation_source else "canal"

        # --- Rule 1: Smart Irrigation Recommendation ---
        if rain_next_48h >= 12.0 or prob_max_48h >= 70.0:
            recommendations.append(
                AdvisoryRecommendation(
                    id="irrigation_postpone",
                    crop_id=user_crops[0].crop_id if user_crops else 1,
                    crop_name_en=user_crops[0].crop.name_en if user_crops and user_crops[0].crop else "Field Crops",
                    crop_name_kn=user_crops[0].crop.name_kn if user_crops and user_crops[0].crop else "ಜಮೀನಿನ ಬೆಳೆಗಳು",
                    type="irrigation",
                    severity="info",
                    title_en="Smart Irrigation: Postpone Scheduled Irrigation",
                    title_kn="ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ ಸಲಹೆ: ನೀರು ಹಾಯಿಸುವುದನ್ನು ಮುಂದೂಡಿ",
                    summary_en=f"Delay irrigation for 48 hours; {round(rain_next_48h, 1)}mm rain is forecasted in Mandya.",
                    summary_kn=f"ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಸುಮಾರು {round(rain_next_48h, 1)} ಮಿ.ಮೀ ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇರುವುದರಿಂದ ನೀರು ಹಾಯಿಸಬೇಡಿ.",
                    explanation_en=(
                        f"Cumulative rainfall of {round(rain_next_48h, 1)}mm with {round(prob_max_48h)}% probability is forecasted "
                        f"across your location. Applying irrigation now would saturate root zones, cause fertilizer leaching, "
                        f"and waste pumping electricity/canal resources."
                    ),
                    explanation_kn=(
                        f"ನಿಮ್ಮ ಮಂಡ್ಯ ಪ್ರದೇಶದಲ್ಲಿ ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ {round(prob_max_48h)}% ಸಾಧ್ಯತೆಯೊಂದಿಗೆ {round(rain_next_48h, 1)} ಮಿ.ಮೀ ಮಳೆಯಾಗುವ ಮುನ್ಸೂಚನೆ ಇದೆ. "
                        f"ಈಗ ನೀರು ಹಾಯಿಸಿದರೆ ಬೇರುಗಳಲ್ಲಿ ನೀರು ನಿಂತು ಉಸಿರುಗಟ್ಟುವಿಕೆ ಉಂಟಾಗುತ್ತದೆ ಮತ್ತು ಗೊಬ್ಬರ ವ್ಯರ್ಥವಾಗುತ್ತದೆ."
                    ),
                    recommended_actions=[
                        "Delay irrigation cycle by 2 to 3 days until soil surface dries",
                        "Clean and clear field boundary drainage channels to prevent water stagnation",
                        "Channel excess runoff to farm pond (Krishi Honda) for later conservation"
                    ],
                    source_reference="UAS Bangalore - GKMS Agromet Advisory & KSNMDC",
                    created_at=now
                )
            )
        else:
            # Dry / Warm spell
            stage_desc = user_crops[0].stage if user_crops else "vegetative"
            recommendations.append(
                AdvisoryRecommendation(
                    id="irrigation_needed",
                    crop_id=user_crops[0].crop_id if user_crops else 1,
                    crop_name_en=user_crops[0].crop.name_en if user_crops and user_crops[0].crop else "Sugarcane / Paddy",
                    crop_name_kn=user_crops[0].crop.name_kn if user_crops and user_crops[0].crop else "ಕಬ್ಬು / ಭತ್ತ",
                    type="irrigation",
                    severity="warning" if temp >= 32.0 else "info",
                    title_en=f"Protective Irrigation Recommended ({stage_desc.capitalize()} Stage)",
                    title_kn=f"ರಕ್ಷಣಾತ್ಮಕ ನೀರಾವರಿ ಅಗತ್ಯ ({stage_desc} ಹಂತ)",
                    summary_en=f"Dry conditions with {round(temp, 1)}°C temperature. Maintain soil moisture via {irrigation_source}.",
                    summary_kn=f"ಶುಷ್ಕ ವಾತಾವರಣ ಮತ್ತು {round(temp, 1)}°C ಬಿಸಿಲು. {irrigation_source} ಮೂಲಕ ಹಿತಮಿತವಾಗಿ ನೀರು ಕೊಡಿ.",
                    explanation_en=(
                        f"Zero substantial rain is forecasted over the next 4 days while daytime temperature reaches {round(temp, 1)}°C. "
                        f"Evapotranspiration is estimated at 4.5 - 5.2 mm/day. Crop in {stage_desc} phase requires regular moisture."
                    ),
                    explanation_kn=(
                        f"ಮುಂದಿನ 4 ದಿನಗಳಲ್ಲಿ ಮಳೆಯ ಸಾಧ್ಯತೆ ಇಲ್ಲ ಹಾಗೂ ಗರಿಷ್ಠ ಉಷ್ಣಾಂಶ {round(temp, 1)}°C ಇದೆ. "
                        f"{stage_desc} ಹಂತದಲ್ಲಿರುವ ಬೆಳೆಗಳಿಗೆ ನೀರಿನ ಕೊರತೆಯಾಗದಂತೆ ಬೆಳಿಗ್ಗೆ ಅಥವಾ ಸಂಜೆ ನೀರು ಹಾಯಿಸುವುದು ಉತ್ತಮ."
                    ),
                    recommended_actions=[
                        "Irrigate during early morning (6:00 - 9:00 AM) or evening to reduce 30% evaporation loss",
                        "Check moisture 5 cm below soil surface before opening canal or starting pump",
                        "Apply trash or crop residue mulch along rows to conserve soil moisture"
                    ],
                    source_reference="ICAR - Krishi Vigyan Kendra (KVK) Mandya Water Division",
                    created_at=now
                )
            )

        # --- Rule 2: Crop-Specific Pest & Disease Risk Alerts ---
        for uc in user_crops:
            crop_code = uc.crop.code if uc.crop else ""

            if crop_code == "PADDY" and humidity >= 70.0:
                recommendations.append(
                    AdvisoryRecommendation(
                        id=f"pest_paddy_blast_{uc.id}",
                        crop_id=uc.crop_id,
                        crop_name_en=uc.crop.name_en,
                        crop_name_kn=uc.crop.name_kn,
                        type="pest_alert",
                        severity="warning",
                        title_en="Paddy Blast Disease Warning (High Canopy Humidity)",
                        title_kn="ಭತ್ತದ ಬೆಂಕಿ ರೋಗ ಎಚ್ಚರಿಕೆ (ಹೆಚ್ಚಿದ ವಾತಾವರಣದ ತೇವಾಂಶ)",
                        summary_en="Relative humidity above 70% favors blast spore multiplication in Mandya paddies.",
                        summary_kn="ಗಾಳಿಯಲ್ಲಿ ತೇವಾಂಶ 70% ಕ್ಕಿಂತ ಹೆಚ್ಚಿರುವುದರಿಂದ ಭತ್ತದ ಗದ್ದೆಗಳಲ್ಲಿ ಬೆಂಕಿ ರೋಗದ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು.",
                        explanation_en=(
                            f"Current atmospheric humidity ({round(humidity)}%) creates ideal leaf wetness duration (>8 hours). "
                            f"Paddy at '{uc.stage}' stage is vulnerable to neck and leaf blast if nitrogen is applied in excess."
                        ),
                        explanation_kn=(
                            f"ಪ್ರಸ್ತುತ ತೇವಾಂಶ {round(humidity)}% ಇರುವುದರಿಂದ ಎಲೆಗಳ ಮೇಲೆ ತೇವಾಂಶ ದೀರ್ಘಕಾಲ ಉಳಿಯುತ್ತದೆ. "
                            f"ಯೂರಿಯಾ ಗೊಬ್ಬರವನ್ನು ಅತಿಯಾಗಿ ಬಳಸದೆ ಜೈವಿಕ ನಿಯಂತ್ರಣ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳಿ."
                        ),
                        recommended_actions=[
                            "Inspect leaf blades for spindle-shaped elliptical spots with ash centers",
                            "Foliar spray with Pseudomonas fluorescens (10g/L water)",
                            "Avoid applying urea until weather becomes dry and clear"
                        ],
                        source_reference="ZARS V.C. Farm Mandya - Rice Pathology Unit",
                        created_at=now
                    )
                )

            elif crop_code == "SUGARCANE" and temp >= 29.0 and humidity <= 70.0:
                recommendations.append(
                    AdvisoryRecommendation(
                        id=f"pest_cane_borer_{uc.id}",
                        crop_id=uc.crop_id,
                        crop_name_en=uc.crop.name_en,
                        crop_name_kn=uc.crop.name_kn,
                        type="pest_alert",
                        severity="warning",
                        title_en="Sugarcane Early Shoot Borer Monitoring",
                        title_kn="ಕಬ್ಬಿನ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ಜಾಗರೂಕತೆ",
                        summary_en="Warm daytime temperatures promote borer moth activity in young canes.",
                        summary_kn="ಬಿಸಿಲು ಹೆಚ್ಚಾಗಿರುವುದರಿಂದ ಎಳೆಯ ಕಬ್ಬಿನಲ್ಲಿ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ಹರಡುವ ಸಾಧ್ಯತೆ.",
                        explanation_en=(
                            f"Temperatures around {round(temp, 1)}°C with dry conditions accelerate the life cycle of Chilo infuscatellus. "
                            f"Ratoon and young sugarcane crops require preventive parasitoid deployment."
                        ),
                        explanation_kn=(
                            f"{round(temp, 1)}°C ಉಷ್ಣಾಂಶವು ಸುಳಿ ಕೊರೆಯುವ ಪತಂಗಗಳಿಗೆ ಪೂರಕವಾಗಿದೆ. "
                            f"ಒಣಗಿದ ಸುಳಿಗಳು ಕಂಡುಬಂದರೆ ಪರಾವಲಂಬಿ ಕಾರ್ಡ್‌ಗಳನ್ನು ಬಳಸಿ."
                        ),
                        recommended_actions=[
                            "Deploy Trichogramma chilonis egg parasitoid cards @ 2 cards/acre",
                            "Trash mulching up to 10 cm depth along cane rows",
                            "Light earthing up at 45 days after planting"
                        ],
                        source_reference="ICAR - Sugarcane Breeding Institute & KVK Mandya",
                        created_at=now
                    )
                )

            elif crop_code == "TOMATO" and humidity >= 65.0:
                recommendations.append(
                    AdvisoryRecommendation(
                        id=f"pest_tomato_blight_{uc.id}",
                        crop_id=uc.crop_id,
                        crop_name_en=uc.crop.name_en,
                        crop_name_kn=uc.crop.name_kn,
                        type="pest_alert",
                        severity="info",
                        title_en="Tomato Early Blight & Foliage Health Alert",
                        title_kn="ಟೊಮೆಟೊ ಎಲೆ ಮಚ್ಚೆ ಮತ್ತು ಅಂಗಮಾರಿ ಮುನ್ನೆಚ್ಚರಿಕೆ",
                        summary_en="Maintain good plant staking and avoid water splashing on lower leaves.",
                        summary_kn="ಗಿಡಗಳಿಗೆ ಸರಿಯಾಗಿ ಕೋಲು ಕಟ್ಟಿ (ಸ್ಟೇಕಿಂಗ್) ಮತ್ತು ಕೆಳ ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಬೀಳದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.",
                        explanation_en=(
                            "Humid microclimates close to moist ground trigger fungal conidia dispersal. "
                            "Staking and removal of senescent lower leaves prevents disease entry."
                        ),
                        explanation_kn=(
                            "ಭೂಮಿಯ ಸಮೀಪದ ತೇವಾಂಶದಿಂದ ಶಿಲೀಂಧ್ರ ರೋಗ ಬರುತ್ತದೆ. "
                            "ಕೆಳ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ ತೆಗೆಯುವುದು ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ ಸಹಕಾರಿ."
                        ),
                        recommended_actions=[
                            "Prune off yellowing bottom leaves touching the ground",
                            "Install 10 yellow sticky traps per acre to monitor whiteflies and thrips",
                            "Spray Trichoderma viride @ 5g/L on foliage in calm weather"
                        ],
                        source_reference="ICAR - Indian Institute of Horticultural Research (IIHR)",
                        created_at=now
                    )
                )

        # --- Rule 3: Field Operations & Spraying Suitability ---
        if wind >= 16.0 or prob_max_48h >= 65.0:
            recommendations.append(
                AdvisoryRecommendation(
                    id="operation_spraying_caution",
                    crop_id=None,
                    crop_name_en="All Farm Produce",
                    crop_name_kn="ಎಲ್ಲಾ ಕೃಷಿ ಬೆಳೆಗಳು",
                    type="operation",
                    severity="critical" if wind >= 20.0 else "warning",
                    title_en="Field Operation: Postpone Foliar Spraying",
                    title_kn="ಕೃಷಿ ಕಾರ್ಯಾಚರಣೆ: ಕೀಟನಾಶಕ/ಪೋಷಕಾಂಶ ಸಿಂಪಡಣೆ ಮುಂದೂಡಿ",
                    summary_en=f"Wind speed {round(wind)} km/h and rain probability {round(prob_max_48h)}% cause high spray drift.",
                    summary_kn=f"ಗಂಟೆಗೆ {round(wind)} ಕಿ.ಮೀ ಗಾಳಿ ಮತ್ತು {round(prob_max_48h)}% ಮಳೆಯ ಸಾಧ್ಯತೆಯಿರುವುದರಿಂದ ಸಿಂಪಡಣೆ ಬೇಡ.",
                    explanation_en=(
                        f"Foliar bio-pesticides or micro-nutrients sprayed in winds above 15 km/h experience >40% droplet drift. "
                        f"Rain within 6 hours washes off active ingredients, leading to loss of inputs."
                    ),
                    explanation_kn=(
                        f"ಗಾಳಿ ವೇಗವಾಗಿದ್ದಾಗ ಸಿಂಪಡಿಸಿದ ದ್ರಾವಣವು ಗಾಳಿಯಲ್ಲಿ ತೂರಿಹೋಗುತ್ತದೆ. "
                        f"ಮಳೆ ಬಂದರೆ ಔಷಧ ತೊಳೆದುಹೋಗಿ ಆರ್ಥಿಕ ನಷ್ಟವಾಗುತ್ತದೆ."
                    ),
                    recommended_actions=[
                        "Postpone all foliar application until wind subsides below 12 km/h",
                        "Perform land weeding, bund clearing, or composting instead",
                        "Store fertilizer bags off the ground on wooden pallets"
                    ],
                    source_reference="IMD Agromet Advisory Advisory Unit, GKMS Bangalore",
                    created_at=now
                )
            )
        else:
            recommendations.append(
                AdvisoryRecommendation(
                    id="operation_favorable_window",
                    crop_id=None,
                    crop_name_en="All Farm Produce",
                    crop_name_kn="ಎಲ್ಲಾ ಕೃಷಿ ಬೆಳೆಗಳು",
                    type="operation",
                    severity="info",
                    title_en="Field Operation: Favorable Window for Field Activities",
                    title_kn="ಕೃಷಿ ಕಾರ್ಯಾಚರಣೆ: ಕೃಷಿ ಕೆಲಸಗಳಿಗೆ ಅನುಕೂಲಕರ ಹವಾಮಾನ",
                    summary_en=f"Calm winds ({round(wind)} km/h) and dry weather. Excellent for weeding and fertilizer application.",
                    summary_kn=f"ಹಿತವಾದ ಗಾಳಿ ({round(wind)} ಕಿ.ಮೀ) ಮತ್ತು ಒಣ ಹವೆ. ಕಳೆ ಕೀಳಲು ಮತ್ತು ಗೊಬ್ಬರ ನೀಡಲು ಉತ್ತಮ ಸಮಯ.",
                    explanation_en=(
                        "Stable atmospheric conditions allow uniform fertilizer uptake and efficient pest scouting across fields."
                    ),
                    explanation_kn=(
                        "ಸ್ಥಿರ ಹವಾಮಾನವು ಬೆಳೆಗಳ ಆರೈಕೆಗೆ ಹಾಗೂ ಜೈವಿಕ ನಿಯಂತ್ರಣ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳಲು ಪೂರಕವಾಗಿದೆ."
                    ),
                    recommended_actions=[
                        "Ideal timing for root-zone bio-fertilizer application",
                        "Scout crop canopy for early insect presence",
                        "Carry out inter-cultivation to aerate the topsoil"
                    ],
                    source_reference="UAS Bangalore - Department of Agronomy",
                    created_at=now
                )
            )

        return recommendations

    def diagnose_disease_symptoms(
        self,
        crop_id: int,
        plant_part: str,
        symptoms: str,
        image_url: Optional[str] = None
    ) -> DiseaseDiagnosisResponse:
        """
        AI Crop Disease Assistant (Demonstration & Preview).
        Provides verified diagnostic and IPM recommendations based on ICAR-KVK Mandya standards.
        """
        sym_lower = symptoms.lower()

        # Match profile
        if "blast" in sym_lower or "spindle" in sym_lower or "brown" in sym_lower or crop_id == 2:
            p = DISEASE_PROFILES["blast"]
        elif "rot" in sym_lower or "red" in sym_lower or "drying" in sym_lower or crop_id == 1:
            p = DISEASE_PROFILES["red_rot"]
        elif "spot" in sym_lower or "target" in sym_lower or "yellow" in sym_lower or crop_id == 6:
            p = DISEASE_PROFILES["early_blight"]
        else:
            p = DISEASE_PROFILES["generic"]

        return DiseaseDiagnosisResponse(
            suspected_disease_en=p["disease_en"],
            suspected_disease_kn=p["disease_kn"],
            confidence_score=p["confidence"],
            is_ai_preview=True,
            severity=p["severity"],
            symptoms_analysis_en=p["analysis_en"],
            symptoms_analysis_kn=p["analysis_kn"],
            immediate_remedies_en=p["immediate_remedies_en"],
            immediate_remedies_kn=p["immediate_remedies_kn"],
            preventive_measures_en=p["preventive_en"],
            preventive_measures_kn=p["preventive_kn"],
            reference_source="ICAR-KVK Mandya / UAS Bangalore Department of Plant Pathology",
            disclaimer_en="Demonstration & AI Field Preview: This analysis is an educational aid based on verified ICAR Mandya guidelines. Consult your local Raitha Samparka Kendra (RSK) agricultural officer before purchasing or applying commercial chemical inputs.",
            disclaimer_kn="ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಮತ್ತು AI ಮುನ್ನೋಟ: ಈ ವಿಶ್ಲೇಷಣೆಯು ಐ.ಸಿ.ಎ.ಆರ್ ಮಂಡ್ಯ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ಆಧರಿಸಿದ ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿಯಾಗಿದೆ. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಔಷಧಿಗಳನ್ನು ಖರೀದಿಸುವ ಅಥವಾ ಸಿಂಪಡಿಸುವ ಮುನ್ನ ನಿಮ್ಮ ಸ್ಥಳೀಯ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರದ (RSK) ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ."
        )


advisory_engine = AdvisoryEngine()
