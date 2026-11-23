import {
  Location,
  LocationHierarchy,
  Crop,
  User,
  UserCrop,
  WeatherRecord,
  AdvisoryItem,
  CommunityGroup,
  GroupMember,
  GroupAnnouncement,
  CommunityPost,
  PostComment,
  MarketListing,
  GroupListingContribution,
  MarketEnquiry,
  EnquiryMessage,
  Notification,
  UserNotificationPreference,
  SupportTicket,
  ModerationAuditLog,
  AdminPlatformStats
} from '../types/api';

export const MANDYA_LOCATION_HIERARCHY: LocationHierarchy = {
  Karnataka: {
    Mandya: {
      Mandya: {
        Kasaba: ['Guthalu', 'Induvalu', 'Bannuru Road', 'Yeliyuru'],
        Dudda: ['Dudda', 'Shivalli', 'Bevinahalli', 'Keelara'],
        Keragodu: ['Keragodu', 'Hulivana', 'Kothathi', 'Basaralu']
      },
      Maddur: {
        Kasaba: ['Shivapura', 'Someshwarapura', 'Kadukothanahalli'],
        Koppa: ['Koppa', 'Besagarahalli', 'Mallenahalli'],
        Athagur: ['Athagur', 'Chikkarasinakere', 'Maraliga']
      },
      Malavalli: {
        Halaguru: ['Halaguru', 'Dalavayi Kodihalli', 'Bannuru'],
        Kirugavalu: ['Kirugavalu', 'Kunduru', 'Mikere'],
        Kasaba: ['Malavalli Town', 'Chottanahalli', 'Marehalli']
      },
      Pandavapura: {
        Melukote: ['Melukote', 'Jakkanahalli', 'Kyathanahalli'],
        Kasaba: ['Pandavapura Town', 'Harohalli', 'Chinya']
      },
      Srirangapatna: {
        Arakere: ['Arakere', 'Tadagavadi', 'Kodiyala'],
        Kasaba: ['Ganjam', 'Pashchimavahini', 'Palahalli']
      },
      Krishnarajpet: {
        Santhebachahalli: ['Santhebachahalli', 'Sindhaghatta', 'Aghalaya'],
        Kasaba: ['K.R. Pet Town', 'Kikkeri', 'Bommenahalli']
      },
      Nagamangala: {
        Belluru: ['Belluru', 'Adichunchanagiri', 'Bindiganavile'],
        Kasaba: ['Nagamangala Town', 'Devalapura', 'Honakere']
      }
    }
  }
};

export const MANDYA_LOCATIONS: Location[] = [
  { id: 1, state: 'Karnataka', district: 'Mandya', taluk: 'Mandya', hobli: 'Kasaba', village: 'Guthalu', pincode: '571403', latitude: 12.5223, longitude: 76.8966 },
  { id: 2, state: 'Karnataka', district: 'Mandya', taluk: 'Maddur', hobli: 'Kasaba', village: 'Shivapura', pincode: '571428', latitude: 12.5833, longitude: 77.0450 },
  { id: 3, state: 'Karnataka', district: 'Mandya', taluk: 'Malavalli', hobli: 'Halaguru', village: 'Halaguru', pincode: '571421', latitude: 12.3872, longitude: 77.1738 },
  { id: 4, state: 'Karnataka', district: 'Mandya', taluk: 'Pandavapura', hobli: 'Melukote', village: 'Melukote', pincode: '571431', latitude: 12.6631, longitude: 76.6548 },
  { id: 5, state: 'Karnataka', district: 'Mandya', taluk: 'Srirangapatna', hobli: 'Arakere', village: 'Arakere', pincode: '571415', latitude: 12.4181, longitude: 76.6947 },
  { id: 6, state: 'Karnataka', district: 'Mandya', taluk: 'Krishnarajpet', hobli: 'Santhebachahalli', village: 'Santhebachahalli', pincode: '571426', latitude: 12.7915, longitude: 76.4950 },
  { id: 7, state: 'Karnataka', district: 'Mandya', taluk: 'Nagamangala', hobli: 'Belluru', village: 'Belluru', pincode: '571418', latitude: 12.8710, longitude: 76.7570 }
];

export const MANDYA_CROPS: Crop[] = [
  {
    id: 1,
    code: 'SUGARCANE',
    name_en: 'Sugarcane',
    name_kn: 'ಕಬ್ಬು (Kabbu)',
    category: 'commercial',
    seasonality: 'Perennial (10-12 months)',
    typical_duration_days: 360,
    description_en: 'Primary cash crop in the Cauvery basin of Mandya district. High biomass producer requiring good drainage and deep loamy soil.',
    description_kn: 'ಮಂಡ್ಯ ಕಾವೇರಿ ಅಚ್ಚುಕಟ್ಟು ಪ್ರದೇಶದ ಪ್ರಮುಖ ವಾಣಿಜ್ಯ ಬೆಳೆ. ಅಧಿಕ ಇಳುವರಿಗಾಗಿ ಉತ್ತಮ ಬಸಿಗಾಲುವೆ ಹಾಗೂ ಆಳವಾದ ಗೋಡು ಮಣ್ಣು ಅವಶ್ಯಕ.',
    soil_requirements_en: 'Deep well-drained loamy soils, pH 6.5 to 7.5. Avoid waterlogged alkaline soils.',
    soil_requirements_kn: 'ಆಳವಾದ ಗೋಡು ಮಣ್ಣು, ಪಿ.ಎಚ್ 6.5 ರಿಂದ 7.5. ಜೌಗು ಮತ್ತು ಕ್ಷಾರಯುಕ್ತ ಮಣ್ಣು ಸೂಕ್ತವಲ್ಲ.',
    water_requirements_en: '1800 - 2200 mm total requirement. Peak water need during Tillering and Grand Growth phases.',
    water_requirements_kn: 'ಒಟ್ಟು 1800 - 2200 ಮಿ.ಮೀ ನೀರು ಬೇಕಾಗುತ್ತದೆ. ಕವಲೊಡೆಯುವ ಹಾಗೂ ತೀವ್ರ ಬೆಳವಣಿಗೆಯ ಹಂತದಲ್ಲಿ ನೀರಾವರಿ ನಿರ್ಣಾಯಕ.',
    irrigation_guidance_en: 'Alternate furrow irrigation or drip irrigation saves 35-40% water. Maintain 7-10 days interval in summer and 12-15 days in winter.',
    irrigation_guidance_kn: 'ಬೆರೆತ ಸಾಲು ಅಥವಾ ಹನಿ ನೀರಾವರಿ ಪದ್ಧತಿಯಿಂದ 35-40% ನೀರು ಉಳಿತಾಯವಾಗುತ್ತದೆ. ಬೇಸಿಗೆಯಲ್ಲಿ 7-10 ದಿನಕ್ಕೊಮ್ಮೆ ನೀರು ಹಾಯಿಸಿ.',
    growth_stages_json: JSON.stringify([
      { stage: 'Germination', stage_kn: 'ಮೊಳಕೆ ಒಡೆಯುವಿಕೆ', duration_days: 35, water_need: 'Moderate', key_practices: 'Ensure light irrigation and weed-free field.' },
      { stage: 'Tillering', stage_kn: 'ಕವಲೊಡೆಯುವ ಹಂತ', duration_days: 65, water_need: 'High', key_practices: 'First top dressing of nitrogen and earthing up.' },
      { stage: 'Grand Growth', stage_kn: 'ತೀವ್ರ ಬೆಳವಣಿಗೆ ಹಂತ', duration_days: 150, water_need: 'Critical High', key_practices: 'Adequate irrigation, detrashing, and propping against lodging.' },
      { stage: 'Maturity', stage_kn: 'ಕಟಾವಿಗೆ ಸಿದ್ಧ', duration_days: 110, water_need: 'Low', key_practices: 'Withhold water 15 days before harvest to build sucrose concentration.' }
    ]),
    pests_diseases_json: JSON.stringify([
      { pest_name: 'Early Shoot Borer', pest_kn: 'ಸುಳಿ ಕೊರೆಯುವ ಹುಳು', symptoms: 'Dead hearts in 1-3 month canes.', management: 'Release Trichogramma chilonis egg parasitoids (50,000/ha), trash mulching.' },
      { pest_name: 'Red Rot', pest_kn: 'ಕೆಂಪು ಕೊಳೆ ರೋಗ', symptoms: 'Third or fourth leaf yellowing, reddened internal tissues.', management: 'Use certified disease-free setts, treat with Trichoderma viride.' }
    ])
  },
  {
    id: 2,
    code: 'PADDY',
    name_en: 'Paddy / Rice',
    name_kn: 'ಭತ್ತ (Bhatta)',
    category: 'cereal',
    seasonality: 'Kharif / Rabi',
    typical_duration_days: 135,
    description_en: 'Staple cereal crop of Mandya cultivated under canal and borewell commands. Varieties include Jaya, Jyothi, Tanu, and BPT 5204 (Sona Masoori).',
    description_kn: 'ಮಂಡ್ಯ ಕಾಲುವೆ ಮತ್ತು ಬೋರ್‌ವೆಲ್ ಅಚ್ಚುಕಟ್ಟಿನಲ್ಲಿ ವ್ಯಾಪಕವಾಗಿ ಬೆಳೆಯುವ ಪ್ರಮುಖ ಆಹಾರ ಧಾನ್ಯ. ಜಯ, ಜ್ಯೋತಿ, ತನು ಹಾಗೂ ಸೋನಾ ಮಸೂರಿ ಪ್ರಮುಖ ತಳಿಗಳು.',
    soil_requirements_en: 'Heavy clayey or clay-loam soils capable of holding standing water. pH 5.5 to 7.0.',
    soil_requirements_kn: 'ನೀರನ್ನು ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುವ ಜೇಡಿ ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು ಸೂಕ್ತ. ಪಿ.ಎಚ್ 5.5 ರಿಂದ 7.0.',
    water_requirements_en: '1200 - 1400 mm total. Critical stages: Panicle Initiation, Flowering and Milking stage.',
    water_requirements_kn: 'ಒಟ್ಟು 1200 - 1400 ಮಿ.ಮೀ ನೀರು. ಹೂ ಬಿಡುವ ಮತ್ತು ಕಾಳು ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ ನೀರಿನ ಕೊರತೆ ಇರಬಾರದು.',
    irrigation_guidance_en: 'Adopt Alternate Wetting and Drying (AWD) after tillering. Stop irrigation 10-12 days before harvest.',
    irrigation_guidance_kn: 'ಕವಲೊಡೆದ ನಂತರ ಪರ್ಯಾಯ ಒಣಗಿಸುವಿಕೆ ಮತ್ತು ನೆನೆಸುವಿಕೆ (AWD) ವಿಧಾನ ಅನುಸರಿಸಿ. ಕಟಾವಿಗೆ 10-12 ದಿನ ಮುಂಚಿತವಾಗಿ ನೀರು ನಿಲ್ಲಿಸಿ.',
    growth_stages_json: JSON.stringify([
      { stage: 'Nursery', stage_kn: 'ಸಸಿ ಮಡಿ', duration_days: 25, water_need: 'Moderate', key_practices: 'Protect seedlings from gall midge and thrips.' },
      { stage: 'Tillering', stage_kn: 'ಕವಲೊಡೆಯುವಿಕೆ', duration_days: 30, water_need: 'High', key_practices: 'Maintain 2-3 cm water depth, apply zinc sulfate.' },
      { stage: 'Panicle Initiation', stage_kn: 'ತೆನೆ ಮೂಡುವ ಹಂತ', duration_days: 20, water_need: 'Critical High', key_practices: 'Do not let soil crack, apply potash top dressing.' },
      { stage: 'Flowering & Milking', stage_kn: 'ಹೂವಾಡುವ & ಹಾಲು ತುಂಬುವ ಹಂತ', duration_days: 20, water_need: 'Critical High', key_practices: 'Maintain standing water, monitor for blast and BPH.' },
      { stage: 'Maturity', stage_kn: 'ಕಾಳು ಮಾಗುವಿಕೆ', duration_days: 40, water_need: 'Low', key_practices: 'Drain standing water 10 days before harvest for uniform ripening.' }
    ]),
    pests_diseases_json: JSON.stringify([
      { pest_name: 'Leaf Blast', pest_kn: 'ಬೆಂಕಿ ರೋಗ', symptoms: 'Spindle-shaped brown lesions on leaves.', management: 'Foliar spray of Pseudomonas fluorescens (10g/L), avoid excessive urea application.' },
      { pest_name: 'Brown Plant Hopper (BPH)', pest_kn: 'ಕಂದು ಜಿಗಿಹುಳು', symptoms: 'Hopper burn, drying patches in circular spots.', management: 'Form 30 cm alleyways every 2m, drain water temporarily.' }
    ])
  },
  {
    id: 3,
    code: 'RAGI',
    name_en: 'Finger Millet (Ragi)',
    name_kn: 'ರಾಗಿ (Ragi)',
    category: 'cereal',
    seasonality: 'Kharif',
    typical_duration_days: 110,
    description_en: "Drought-resilient nutritious millet extensively grown in Mandya's drylands and rainfed taluks (Nagamangala, KR Pet). Varieties: GPU 28, ML 365, KMR 301.",
    description_kn: 'ಮಂಡ್ಯದ ಒಣಭೂಮಿ ಮತ್ತು ಮಳೆಯಾಶ್ರಿತ ಪ್ರದೇಶಗಳ (ನಾಗಮಂಗಲ, ಕೆ.ಆರ್. ಪೇಟೆ) ಪೌಷ್ಟಿಕ ಸಿರಿಧಾನ್ಯ ಬೆಳೆ. ಜಿ.ಪಿ.ಯು 28, ಎಂ.ಎಲ್ 365, ಕೆ.ಎಂ.ಆರ್ 301 ಪ್ರಮುಖ ತಳಿಗಳು.',
    soil_requirements_en: 'Red sandy loam and light gravelly soils with good porosity. Tolerates poor fertility. pH 5.0 to 7.5.',
    soil_requirements_kn: 'ಕೆಂಪು ಮರಳು ಗೋಡು ಮತ್ತು ಹಗುರವಾದ ಮಣ್ಣು. ಕಡಿಮೆ ಫಲವತ್ತತೆಯಲ್ಲೂ ಬೆಳೆಯುತ್ತದೆ. ಪಿ.ಎಚ್ 5.0 ರಿಂದ 7.5.',
    water_requirements_en: '350 - 500 mm. Highly drought-hardy with deep fibrous root system.',
    water_requirements_kn: '350 - 500 ಮಿ.ಮೀ ನೀರು ಸಾಕು. ತೀವ್ರ ಬರ ಸಹಿಷ್ಣು ಬೆಳೆ.',
    irrigation_guidance_en: 'Requires only 2-3 protective irrigations during dry spells, especially at flowering and grain filling.',
    irrigation_guidance_kn: 'ಮಳೆಯಾಶ್ರಿತ ಬೆಳೆ. ದೀರ್ಘ ಮಳೆ ಬಿಡುವಿನ ವೇಳೆಯಲ್ಲಿ ತೆನೆ ಕಟ್ಟುವಾಗ 2 ಬಾರಿ ರಕ್ಷಣಾತ್ಮಕ ನೀರು ಕೊಡಿ.',
    growth_stages_json: JSON.stringify([
      { stage: 'Sowing & Establishment', stage_kn: 'ಬಿತ್ತನೆ ಮತ್ತು ನಾಟಿ', duration_days: 20, water_need: 'Low', key_practices: 'Line sowing or transplanting with 22.5 x 10 cm spacing.' },
      { stage: 'Tillering', stage_kn: 'ಕವಲೊಡೆಯುವ ಹಂತ', duration_days: 25, water_need: 'Moderate', key_practices: 'Intercultivation and weeding at 20 and 35 days.' },
      { stage: 'Booting & Flowering', stage_kn: 'ತೆನೆ ಹೊರಡುವ ಹಂತ', duration_days: 25, water_need: 'High', key_practices: 'Give protective irrigation if rain fails for >12 days.' },
      { stage: 'Grain Filling', stage_kn: 'ಕಾಳು ತುಂಬುವ ಹಂತ', duration_days: 40, water_need: 'Moderate', key_practices: 'Harvest when earheads turn brown.' }
    ]),
    pests_diseases_json: JSON.stringify([
      { pest_name: 'Ragi Blast', pest_kn: 'ರಾಗಿ ಬೆಂಕಿ ರೋಗ', symptoms: 'Diamond-shaped lesions on neck and fingers.', management: 'Seed treatment with Trichoderma (4g/kg seed), avoid high nitrogen in cloudy weather.' }
    ])
  },
  {
    id: 4,
    code: 'BANANA',
    name_en: 'Banana (Yelakki)',
    name_kn: 'ಬಾಳೆ (Baale)',
    category: 'horticulture',
    seasonality: 'Perennial',
    typical_duration_days: 300,
    description_en: 'High-value horticulture crop in riverine plains of Maddur and Srirangapatna. Yelakki bale is renowned for its sweet aroma and high market value.',
    description_kn: 'ಮದ್ದೂರು ಮತ್ತು ಶ್ರೀರಂಗಪಟ್ಟಣ ನದೀಮುಖ ಪ್ರದೇಶಗಳ ಪ್ರಮುಖ ತೋಟಗಾರಿಕಾ ಬೆಳೆ. ಏಲಕ್ಕಿ ಬಾಳೆ ತನ್ನ ಸುವಾಸನೆ ಹಾಗೂ ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆಗೆ ಪ್ರಸಿದ್ಧಿ.',
    soil_requirements_en: 'Rich clayey loam or alluvial soils, minimum 1 meter depth. pH 6.0 to 7.5.',
    soil_requirements_kn: 'ಫಲವತ್ತಾದ ಗೋಡು ಅಥವಾ ನದಿ ಮೆಕ್ಕಲು ಮಣ್ಣು, ಕನಿಷ್ಠ 1 ಮೀಟರ್ ಆಳ. ಪಿ.ಎಚ್ 6.0 ರಿಂದ 7.5.',
    water_requirements_en: '1500 - 1800 mm. Requires continuous uniform moisture without stagnant water.',
    water_requirements_kn: '1500 - 1800 ಮಿ.ಮೀ. ನಿರಂತರ ತೇವಾಂಶ ಅಗತ್ಯ, ಆದರೆ ಬಸಿಗಾಲುವೆ ಉತ್ತಮವಾಗಿರಬೇಕು.',
    irrigation_guidance_en: 'Drip irrigation (15-20 liters/plant/day) with fertigation ensures uniform bunches and high yield.',
    irrigation_guidance_kn: 'ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ಗಿಡಕ್ಕೆ ದಿನಕ್ಕೆ 15-20 ಲೀಟರ್ ನೀರು ನೀಡುವುದು ಅತ್ಯಂತ ಪರಿಣಾಮಕಾರಿ.',
    growth_stages_json: JSON.stringify([
      { stage: 'Vegetative', stage_kn: 'ಸಸ್ಯಾಭಿವೃದ್ಧಿ ಹಂತ', duration_days: 120, water_need: 'Moderate', key_practices: 'Desuckering every 45 days, retain only mother plant.' },
      { stage: 'Shooting', stage_kn: 'ಗೊನೆ ಬಿಡುವ ಹಂತ', duration_days: 60, water_need: 'Critical High', key_practices: 'Provide propping with bamboo poles to prevent wind damage.' },
      { stage: 'Bunch Maturation', stage_kn: 'ಗೊನೆ ಮಾಗುವ ಹಂತ', duration_days: 120, water_need: 'High', key_practices: 'Bag bunches with blue perforated polythene sleeves.' }
    ]),
    pests_diseases_json: JSON.stringify([
      { pest_name: 'Sigatoka Leaf Spot', pest_kn: 'ಸಿಗಟೋಕ ಎಲೆ ಚುಕ್ಕೆ', symptoms: 'Dark brown oval spots with grey center on older leaves.', management: 'Deleaf severely infected leaves, spray Bordeaux mixture 1%.' }
    ])
  },
  {
    id: 5,
    code: 'COCONUT',
    name_en: 'Tender Coconut',
    name_kn: 'ಎಳನೀರು / ತೆಂಗು (Elaneeru)',
    category: 'horticulture',
    seasonality: 'Perennial',
    typical_duration_days: 365,
    description_en: 'Perennial plantation crop famous across Mandya (Maddur Tender Coconut Market is the largest in Asia). Varieties include Gangabondam, Tiptur Tall, and hybrids.',
    description_kn: 'ಮದ್ದೂರು ಏಷ್ಯಾದಲ್ಲೇ ಅತಿ ದೊಡ್ಡ ಎಳನೀರು ಮಾರುಕಟ್ಟೆಯಾಗಿದೆ. ಮಂಡ್ಯದ ಬಹುಮುಖ್ಯ ತೋಟಗಾರಿಕೆ ಬೆಳೆ. ತಿಪಟೂರು ಟಾಲ್ ಮತ್ತು ಗಂಗಾಬೊಂಡಂ ಪ್ರಮುಖ ತಳಿಗಳು.',
    soil_requirements_en: 'Deep sandy loam or red loams, free from hard subsoil pan. pH 5.2 to 8.0.',
    soil_requirements_kn: 'ಆಳವಾದ ಮರಳು ಗೋಡು ಅಥವಾ ಕೆಂಪು ಗೋಡು ಮಣ್ಣು. ಪಿ.ಎಚ್ 5.2 ರಿಂದ 8.0.',
    water_requirements_en: '50-80 liters per adult palm per day in winter, 100-120 liters in hot summer.',
    water_requirements_kn: 'ಚಳಿಗಾಲದಲ್ಲಿ ದಿನಕ್ಕೆ 50-80 ಲೀಟರ್, ಬೇಸಿಗೆಯಲ್ಲಿ ಪ್ರತಿ ಮರಕ್ಕೆ 100-120 ಲೀಟರ್ ನೀರು ಅಗತ್ಯ.',
    irrigation_guidance_en: 'Drip irrigation in ring basin around the palm canopy perimeter. Apply coir pith mulching to conserve moisture.',
    irrigation_guidance_kn: 'ಮರದ ಬುಡದಿಂದ 1.5 ಮೀಟರ್ ದೂರದಲ್ಲಿ ವೃತ್ತಾಕಾರವಾಗಿ ಹನಿ ನೀರಾವರಿ ಅಳವಡಿಸಿ. ಕೊಳೆತ ತೆಂಗಿನ ನಾರಿನ ತ್ಯಾಜ್ಯದಿಂದ ಮಣ್ಣು ಮುಚ್ಚಿ ತೇವಾಂಶ ಕಾಪಾಡಿ.',
    growth_stages_json: JSON.stringify([
      { stage: 'Vegetative & Inflorescence', stage_kn: 'ಹೂಗೊಂಚಲು ಹೊರಡುವಿಕೆ', duration_days: 90, water_need: 'Moderate', key_practices: 'Apply organic manure and neem cake around basin.' },
      { stage: 'Nut Setting & Water Filling', stage_kn: 'ಎಳನೀರು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ', duration_days: 180, water_need: 'High', key_practices: 'Ensure regular drip irrigation, monitor for eriophyid mite.' },
      { stage: 'Tender Harvest Stage', stage_kn: 'ಎಳನೀರು ಕೊಯ್ಲು ಹಂತ', duration_days: 95, water_need: 'Moderate', key_practices: 'Harvest at 7-8 months stage for sweet water.' }
    ]),
    pests_diseases_json: JSON.stringify([
      { pest_name: 'Rhinoceros Beetle', pest_kn: 'ಖಡ್ಗಮೃಗ ದುಂಬಿ', symptoms: 'V-shaped cuts on fronds, bore holes in crown.', management: 'Hook out beetles with wire, fill leaf axils with neem cake + sand (1:2).' }
    ])
  },
  {
    id: 6,
    code: 'TOMATO',
    name_en: 'Tomato',
    name_kn: 'ಟೊಮೆಟೊ (Tomato)',
    category: 'vegetable',
    seasonality: 'Kharif / Rabi',
    typical_duration_days: 90,
    description_en: 'Short-duration, high-return vegetable crop grown in Mandya, Malavalli and KR Pet. Heavy fruit load requires trellis staking.',
    description_kn: 'ಮಂಡ್ಯ, ಮಳವಳ್ಳಿ ಹಾಗೂ ಕೆ.ಆರ್. ಪೇಟೆಯಲ್ಲಿ ಬೆಳೆಯುವ ಪ್ರಮುಖ ತರಕಾರಿ ಬೆಳೆ. ಗಿಡಗಳು ನೆಲಕ್ಕೆ ಬೀಳದಂತೆ ಕೋಲು ಕಟ್ಟುವುದು (ಸ್ಟೇಕಿಂಗ್) ಮುಖ್ಯ.',
    soil_requirements_en: 'Well-drained sandy loam with rich organic matter. pH 6.0 to 7.0.',
    soil_requirements_kn: 'ಸಾವಯವ ಸಮೃದ್ಧವಾದ ಮರಳು ಗೋಡು ಮಣ್ಣು. ಪಿ.ಎಚ್ 6.0 ರಿಂದ 7.0.',
    water_requirements_en: '400 - 600 mm. Highly sensitive to water stress during flowering and fruit setting.',
    water_requirements_kn: '400 - 600 ಮಿ.ಮೀ. ಹೂ ಬಿಡುವ ಮತ್ತು ಕಾಯಿ ಕಚ್ಚುವ ಹಂತದಲ್ಲಿ ನೀರಿನ ವ್ಯತ್ಯಯವಾಗಬಾರದು.',
    irrigation_guidance_en: 'Furrow or drip irrigation. Avoid overhead sprinkling to prevent foliar fungal diseases. Mulch beds.',
    irrigation_guidance_kn: 'ಹನಿ ನೀರಾವರಿ ಪದ್ಧತಿ ಅತ್ಯುತ್ತಮ. ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಬೀಳದಂತೆ ನೋಡಿಕೊಳ್ಳಿ, ಇದರಿಂದ ಶಿಲೀಂಧ್ರ ರೋಗಗಳು ತಡೆಯಲ್ಪಡುತ್ತವೆ.',
    growth_stages_json: JSON.stringify([
      { stage: 'Transplanting', stage_kn: 'ನಾಟಿ ಹಂತ', duration_days: 20, water_need: 'Moderate', key_practices: 'Transplant 25-day seedlings in evening, drench with bio-fungicide.' },
      { stage: 'Vegetative & Flowering', stage_kn: 'ಬೆಳವಣಿಗೆ ಮತ್ತು ಹೂ ಬಿಡುವಿಕೆ', duration_days: 25, water_need: 'High', key_practices: 'Staking with bamboo poles, install yellow sticky traps for whiteflies.' },
      { stage: 'Fruit Setting & Maturation', stage_kn: 'ಕಾಯಿ ಕಟ್ಟುವುದು & ಮಾಗುವಿಕೆ', duration_days: 45, water_need: 'High', key_practices: 'Apply calcium nitrate to prevent blossom end rot, pick at breaker stage.' }
    ]),
    pests_diseases_json: JSON.stringify([
      { pest_name: 'Early Blight', pest_kn: 'ಮುಂಚಿನ ಅಂಗಮಾರಿ ರೋಗ', symptoms: 'Concentric ring spots (target-like) on lower leaves.', management: 'Mulch soil surface, prune infected lower leaves, spray Trichoderma viride.' }
    ])
  }
];

export const DEMO_USER: User = {
  id: 1,
  phone_number: '9845012345',
  full_name: 'Ramesh Gowda',
  preferred_language: 'kn',
  role: 'farmer',
  roles: 'farmer',
  active_role: 'farmer',
  is_admin: false,
  is_verified: true,
  is_expert: false,
  bio: 'Natural farming advocate cultivating organic sugarcane and ragi in Shivapura, Maddur.',
  email: 'ramesh.gowda@mandyafarms.in',
  text_size: 'normal',
  data_saver: false,
  phone_visible: true,
  is_onboarded: true,
  onboarding_step: 7,
  farm_size_acres: 3.5,
  farming_type: 'Mixed / Traditional',
  irrigation_source: 'Canal (Cauvery)',
  location_id: 2,
  is_active: true,
  created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  location: MANDYA_LOCATIONS[1]
};

export const DEMO_ADMIN_USER: User = {
  id: 99,
  phone_number: '9845000000',
  full_name: 'Mandya Krishi Admin',
  preferred_language: 'kn',
  role: 'admin',
  roles: 'admin',
  active_role: 'admin',
  is_admin: true,
  is_verified: true,
  is_expert: true,
  bio: 'Platform Administrator & Mandya Agriculture Extension Office Support Lead',
  email: 'admin@agrimitra.kar.gov.in',
  text_size: 'normal',
  data_saver: false,
  phone_visible: true,
  is_onboarded: true,
  onboarding_step: 7,
  is_active: true,
  location_id: 1,
  location: MANDYA_LOCATIONS[0],
  created_at: new Date(Date.now() - 180 * 86400000).toISOString()
};

export const DEMO_USER_CROPS: UserCrop[] = [
  {
    id: 1,
    user_id: 1,
    crop_id: 1,
    acreage: 3.5,
    sowing_date: new Date(Date.now() - 90 * 86400000).toISOString(),
    stage: 'vegetative',
    crop: MANDYA_CROPS[0]
  },
  {
    id: 2,
    user_id: 1,
    crop_id: 2,
    acreage: 2.0,
    sowing_date: new Date(Date.now() - 60 * 86400000).toISOString(),
    stage: 'flowering',
    crop: MANDYA_CROPS[1]
  }
];

export const DEMO_WEATHER: WeatherRecord = {
  id: 1,
  location_id: 1,
  temperature_c: 28.5,
  humidity_percent: 68.0,
  rainfall_mm: 2.5,
  wind_speed_kmh: 12.0,
  uv_index: 5.2,
  precipitation_probability: 30.0,
  source: 'Open-Meteo (Live / Cached Mandya Agro-Weather)',
  forecast_summary_en: 'Partly cloudy with scattered evening showers expected across Mandya sugar belt.',
  forecast_summary_kn: 'ಭಾಗಶಃ ಮೋಡ ಕವಿದ ವಾತಾವರಣ, ಸಂಜೆ ಮಂಡ್ಯ ಸಕ್ಕರೆ ಕಣಿವೆಯ ಸುತ್ತ ಸಾಧಾರಣ ಮಳೆಯ ಮುನ್ಸೂಚನೆ.',
  recorded_at: new Date().toISOString()
};

export const DEMO_WEATHER_FORECAST = {
  location_id: 1,
  location_name: 'Mandya Pilot Zone',
  latitude: 12.5223,
  longitude: 76.8966,
  source: 'Mandya Regional Agro-Weather (KSNMDC / Open-Meteo)',
  is_live: true,
  forecast_days: [
    { date: new Date().toISOString().split('T')[0], day_name_en: 'Today', day_name_kn: 'ಇಂದು', temp_max_c: 29.5, temp_min_c: 20.0, rainfall_mm: 2.5, precipitation_probability: 35, condition_en: 'Partly Cloudy', condition_kn: 'ಭಾಗಶಃ ಮೋಡ', weather_code: 2, wind_speed_kmh: 12.0 },
    { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], day_name_en: 'Tomorrow', day_name_kn: 'ನಾಳೆ', temp_max_c: 28.0, temp_min_c: 19.5, rainfall_mm: 14.0, precipitation_probability: 75, condition_en: 'Moderate Showers', condition_kn: 'ಸಾಧಾರಣ ಮಳೆ', weather_code: 61, wind_speed_kmh: 15.0 },
    { date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], day_name_en: 'Day 3', day_name_kn: '3ನೇ ದಿನ', temp_max_c: 28.5, temp_min_c: 19.0, rainfall_mm: 3.5, precipitation_probability: 40, condition_en: 'Scattered Rain', condition_kn: 'ಚದುರಿದ ಮಳೆ', weather_code: 80, wind_speed_kmh: 13.0 },
    { date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], day_name_en: 'Day 4', day_name_kn: '4ನೇ ದಿನ', temp_max_c: 30.0, temp_min_c: 20.0, rainfall_mm: 0.0, precipitation_probability: 10, condition_en: 'Mainly Clear', condition_kn: 'ಹೆಚ್ಚಾಗಿ ಸ್ಪಷ್ಟ', weather_code: 1, wind_speed_kmh: 10.0 },
    { date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], day_name_en: 'Day 5', day_name_kn: '5ನೇ ದಿನ', temp_max_c: 31.5, temp_min_c: 20.5, rainfall_mm: 0.0, precipitation_probability: 5, condition_en: 'Sunny & Warm', condition_kn: 'ಸ್ವಚ್ಛ ಬಿಸಿಲು', weather_code: 0, wind_speed_kmh: 9.0 },
    { date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], day_name_en: 'Day 6', day_name_kn: '6ನೇ ದಿನ', temp_max_c: 30.0, temp_min_c: 20.0, rainfall_mm: 1.0, precipitation_probability: 20, condition_en: 'Partly Cloudy', condition_kn: 'ಭಾಗಶಃ ಮೋಡ', weather_code: 2, wind_speed_kmh: 11.0 },
    { date: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0], day_name_en: 'Day 7', day_name_kn: '7ನೇ ದಿನ', temp_max_c: 27.5, temp_min_c: 19.0, rainfall_mm: 18.0, precipitation_probability: 80, condition_en: 'Heavy Showers', condition_kn: 'ಭಾರೀ ಮಳೆ', weather_code: 63, wind_speed_kmh: 16.0 }
  ]
};

export const DEMO_ADVISORIES: AdvisoryItem[] = [
  {
    id: 1,
    crop_id: 1,
    location_id: 2,
    title_en: 'Sugarcane Top Borer Alert - Early Monitoring in Maddur',
    title_kn: 'ಕಬ್ಬಿನ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ಎಚ್ಚರಿಕೆ - ಮದ್ದೂರು ತಾಲೂಕು',
    severity: 'warning',
    category: 'pest',
    message_en: 'Farmers in Maddur and Malavalli taluks are advised to inspect 2-3 month old sugarcane ratoon crops for central shoot drying (dead hearts). Apply Trichogramma chilonis egg parasitoids at 50,000/ha.',
    message_kn: 'ಮದ್ದೂರು ಮತ್ತು ಮಳವಳ್ಳಿ ಭಾಗದಲ್ಲಿ 2-3 ತಿಂಗಳ ಕಬ್ಬಿನ ಬೆಳೆಗಳಲ್ಲಿ ಸುಳಿ ಕೊರೆಯುವ ಹುಳುವಿನ ಬಾಧೆ ಕಂಡುಬಂದಿದೆ. ಸುಳಿ ಒಣಗುವುದನ್ನು ತಡೆಗಟ್ಟಲು ಎಕರೆಗೆ ಟ್ರೈಕೋಗ್ರಾಮ ಪರಾವಲಂಬಿ ಕಾರ್ಡ್‌ಗಳನ್ನು ಅಳವಡಿಸಿ.',
    action_items_en: '1. Inspect field for dried central spindles.\n2. Release Trichogramma parasitoids.\n3. Avoid excessive nitrogen fertilizer.',
    action_items_kn: '1. ಒಣಗಿದ ಸುಳಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ತೆಗೆಯಿರಿ.\n2. ಟ್ರೈಕೋಗ್ರಾಮ ಕಾರ್ಡ್ ಅಳವಡಿಸಿ.\n3. ಯೂರಿಯಾ ರಸಗೊಬ್ಬರವನ್ನು ಮಿತವಾಗಿ ಬಳಸಿ.',
    explanation_en: 'Warm temperatures (29-32°C) combined with dry canopy conditions favor moth egg-laying on young cane spindles.',
    explanation_kn: 'ಪ್ರಸ್ತುತ ಮಂಡ್ಯದಲ್ಲಿ ಉಷ್ಣಾಂಶ 29-32°C ಇದ್ದು ಒಣ ಹವೆ ಇರುವುದರಿಂದ ಪತಂಗಗಳು ಮೊಟ್ಟೆ ಇಡಲು ಪ್ರಶಸ್ತವಾಗಿದೆ.',
    source_reference: 'ICAR - Sugarcane Breeding Institute & KVK Mandya',
    trigger_condition: 'Temperature > 29°C & Humidity < 65%',
    is_personalized: true,
    valid_until: new Date(Date.now() + 10 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    crop: MANDYA_CROPS[0]
  },
  {
    id: 2,
    crop_id: 3,
    location_id: 1,
    title_en: 'Ragi Blast Disease Prevention during High Humidity',
    title_kn: 'ಹೆಚ್ಚಿನ ತೇವಾಂಶದಲ್ಲಿ ರಾಗಿ ಬೆಂಕಿರೋಗ ನಿಯಂತ್ರಣ ಮಾರ್ಗಸೂಚಿ',
    severity: 'info',
    category: 'disease',
    message_en: 'With relative humidity hovering above 70% in southern Mandya, spray Mancozeb 75 WP @ 2g/litre water if spindle-shaped brown lesions appear on leaves.',
    message_kn: 'ವಾತಾವರಣದಲ್ಲಿ ತೇವಾಂಶ 70% ಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿರುವುದರಿಂದ, ರಾಗಿ ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಮಚ್ಚೆಗಳು ಕಂಡುಬಂದರೆ ಮ್ಯಾಂಕೋಜೆಬ್ 75 ಡಬ್ಲ್ಯೂ.ಪಿ 2 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.',
    action_items_en: '1. Maintain proper water drainage in fields.\n2. Spray recommended fungicide during dry morning hours.',
    action_items_kn: '1. ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆ ಮಾಡಿ.\n2. ಬೆಳಿಗ್ಗೆ ಶುಷ್ಕ ವಾತಾವರಣದಲ್ಲಿ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ.',
    explanation_en: 'High atmospheric humidity (>70%) provides optimal conditions for fungal blast spore dissemination.',
    explanation_kn: 'ಗಾಳಿಯಲ್ಲಿ ತೇವಾಂಶ 70% ಕ್ಕಿಂತ ಹೆಚ್ಚಿದ್ದಾಗ ಶಿಲೀಂಧ್ರ ಬೀಜಾಣುಗಳು ವೇಗವಾಗಿ ಹರಡುತ್ತವೆ.',
    source_reference: 'UAS Bangalore - Department of Millets & ZARS Mandya',
    trigger_condition: 'Relative Humidity > 70%',
    is_personalized: true,
    valid_until: new Date(Date.now() + 7 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    crop: MANDYA_CROPS[2]
  },
  {
    id: 3,
    crop_id: 2,
    location_id: 5,
    title_en: 'Smart Irrigation: Postpone Irrigation Due to Rain Forecast',
    title_kn: 'ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ ಸಲಹೆ: ಮಳೆ ನಿರೀಕ್ಷೆಯಿರುವುದರಿಂದ ನೀರು ಹಾಯಿಸುವುದನ್ನು ಮುಂದೂಡಿ',
    severity: 'info',
    category: 'irrigation',
    message_en: 'Scattered precipitation of 14-18mm is forecasted over the next 48 hours in Mandya and Maddur. Postpone canal watering to prevent root hypoxia and nutrient wash-off.',
    message_kn: 'ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ 14-18 ಮಿ.ಮೀ ಮಳೆಯಾಗುವ ಮುನ್ಸೂಚನೆ ಇದೆ. ಬೇರುಗಳು ಕೊಳೆಯುವುದನ್ನು ತಪ್ಪಿಸಲು ನೀರಾವರಿ ಚಕ್ರವನ್ನು 2-3 ದಿನ ಮುಂದೂಡಿ.',
    action_items_en: '1. Postpone irrigation cycle for 48 hours.\n2. Clean field drainage paths.\n3. Direct excess runoff into Krishi Honda.',
    action_items_kn: '1. ನಿಗದಿತ ನೀರು ಹಾಯಿಸುವುದನ್ನು 2 ದಿನ ಮುಂದೂಡಿ.\n2. ಬಸಿಗಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ.\n3. ಕೃಷಿ ಹೊಂಡಕ್ಕೆ ಮಳೆನೀರು ಹರಿಸಿ.',
    explanation_en: 'Cumulative 16mm rain forecasted with 75% probability naturally replenishes topsoil moisture requirements.',
    explanation_kn: '75% ಮಳೆಯ ಸಂಭವನೀಯತೆಯೊಂದಿಗೆ 16 ಮಿ.ಮೀ ಮಳೆಯು ಮಣ್ಣಿನ ತೇವಾಂಶದ ಅಗತ್ಯವನ್ನು ಪೂರೈಸುತ್ತದೆ.',
    source_reference: 'IMD Agromet Advisory Service & KSNMDC Karnataka',
    trigger_condition: 'Rainfall forecast > 12mm in 48h',
    is_personalized: false,
    valid_until: new Date(Date.now() + 15 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    crop: MANDYA_CROPS[1]
  }
];

export const DEMO_ADVISORY_RECOMMENDATIONS = [
  {
    id: 'rec_irrigation_1',
    crop_id: 1,
    crop_name_en: 'Sugarcane',
    crop_name_kn: 'ಕಬ್ಬು',
    type: 'irrigation',
    severity: 'info',
    title_en: 'Smart Irrigation: Postpone Scheduled Irrigation',
    title_kn: 'ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ ಸಲಹೆ: ನೀರು ಹಾಯಿಸುವುದನ್ನು ಮುಂದೂಡಿ',
    summary_en: 'Delay irrigation cycle for next 48 hours; 16.5mm rain is forecasted in Mandya.',
    summary_kn: 'ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಸುಮಾರು 16.5 ಮಿ.ಮೀ ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಇರುವುದರಿಂದ ನೀರು ಹಾಯಿಸಬೇಡಿ.',
    explanation_en: 'Cumulative rainfall of 16.5mm with 75% probability is forecasted across your Mandya location. Applying irrigation now would saturate root zones and cause fertilizer leaching.',
    explanation_kn: 'ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ 16.5 ಮಿ.ಮೀ ಮಳೆಯಾಗುವ ಮುನ್ಸೂಚನೆ ಇದೆ. ಬೇರುಗಳು ಕೊಳೆಯುವುದನ್ನು ಮತ್ತು ರಸಗೊಬ್ಬರ ಕೊಚ್ಚಿಹೋಗುವುದನ್ನು ತಪ್ಪಿಸಲು ನೀರು ಹಾಯಿಸಬೇಡಿ.',
    recommended_actions: [
      'Delay irrigation cycle by 2 to 3 days until soil surface dries',
      'Clean and clear field boundary drainage channels to prevent water stagnation',
      'Channel excess runoff to farm pond (Krishi Honda) for later conservation'
    ],
    source_reference: 'UAS Bangalore - GKMS Agromet Advisory & KSNMDC',
    created_at: new Date().toISOString()
  },
  {
    id: 'rec_pest_1',
    crop_id: 2,
    crop_name_en: 'Paddy / Rice',
    crop_name_kn: 'ಭತ್ತ',
    type: 'pest_alert',
    severity: 'warning',
    title_en: 'Paddy Blast Warning (Humid Canopy Alert)',
    title_kn: 'ಭತ್ತದ ಬೆಂಕಿ ರೋಗ ಎಚ್ಚರಿಕೆ (ಹೆಚ್ಚಿದ ವಾತಾವರಣದ ತೇವಾಂಶ)',
    summary_en: 'Relative humidity above 70% favors blast spore multiplication in Mandya paddies.',
    summary_kn: 'ಗಾಳಿಯಲ್ಲಿ ತೇವಾಂಶ 70% ಕ್ಕಿಂತ ಹೆಚ್ಚಿರುವುದರಿಂದ ಭತ್ತದ ಗದ್ದೆಗಳಲ್ಲಿ ಬೆಂಕಿ ರೋಗದ ಸಾಧ್ಯತೆ ಹೆಚ್ಚು.',
    explanation_en: 'Current atmospheric humidity (68-75%) creates ideal leaf wetness duration (>8 hours). Paddy at flowering stage is vulnerable to neck blast if nitrogen is applied in excess.',
    explanation_kn: 'ಪ್ರಸ್ತುತ ತೇವಾಂಶದಿಂದ ಎಲೆಗಳ ಮೇಲೆ ತೇವಾಂಶ ದೀರ್ಘಕಾಲ ಉಳಿಯುತ್ತದೆ. ಯೂರಿಯಾ ಗೊಬ್ಬರವನ್ನು ಅತಿಯಾಗಿ ಬಳಸದೆ ಜೈವಿಕ ನಿಯಂತ್ರಣ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳಿ.',
    recommended_actions: [
      'Inspect leaf blades for spindle-shaped elliptical spots with ash centers',
      'Foliar spray with Pseudomonas fluorescens (10g/L water)',
      'Avoid applying urea until weather becomes dry and clear'
    ],
    source_reference: 'ZARS V.C. Farm Mandya - Rice Pathology Unit',
    created_at: new Date().toISOString()
  },
  {
    id: 'rec_operation_1',
    crop_id: null,
    crop_name_en: 'All Crops',
    crop_name_kn: 'ಎಲ್ಲಾ ಬೆಳೆಗಳು',
    type: 'operation',
    severity: 'info',
    title_en: 'Field Operation: Favorable Window for Morning Activities',
    title_kn: 'ಕೃಷಿ ಕಾರ್ಯಾಚರಣೆ: ಬೆಳಗಿನ ಕೃಷಿ ಕೆಲಸಗಳಿಗೆ ಅನುಕೂಲಕರ ಹವಾಮಾನ',
    summary_en: 'Calm morning winds (10-12 km/h) and moderate temperature. Ideal for weeding.',
    summary_kn: 'ಹಿತವಾದ ಗಾಳಿ ಮತ್ತು ಹಿತಕರ ಬಿಸಿಲು. ಕಳೆ ಕೀಳಲು ಮತ್ತು ಗದ್ದೆ ಬದು ಸರಿಪಡಿಸಲು ಉತ್ತಮ ಸಮಯ.',
    explanation_en: 'Stable morning atmospheric conditions allow efficient field inspection and bio-fertilizer placement.',
    explanation_kn: 'ಸ್ಥಿರ ಹವಾಮಾನವು ಬೆಳೆಗಳ ಆರೈಕೆಗೆ ಹಾಗೂ ಜೈವಿಕ ಗೊಬ್ಬರ ನೀಡಲು ಪೂರಕವಾಗಿದೆ.',
    recommended_actions: [
      'Ideal timing for root-zone bio-fertilizer application',
      'Scout crop canopy for early insect presence',
      'Carry out inter-cultivation to aerate the topsoil'
    ],
    source_reference: 'UAS Bangalore - Department of Agronomy',
    created_at: new Date().toISOString()
  }
];

export const DEMO_COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    id: 1,
    name_en: 'Maddur Sugarcane Growers Forum',
    name_kn: 'ಮದ್ದೂರು ಕಬ್ಬು ಬೆಳೆಗಾರರ ವೇದಿಕೆ',
    taluk: 'Maddur',
    village: 'Shivapura',
    district: 'Mandya',
    crop_id: 1,
    crop_name_en: 'Sugarcane',
    crop_name_kn: 'ಕಬ್ಬು',
    creator_id: 1,
    description_en: 'Cultivation practices, mill cutting orders, and drip subsidies in Maddur taluk.',
    description_kn: 'ಮದ್ದೂರು ತಾಲೂಕಿನ ಕಬ್ಬು ಬೆಳೆಗಾರರ ಚರ್ಚಾ ವೇದಿಕೆ - ಕಟಾವು, ರಸಗೊಬ್ಬರ ಮತ್ತು ಹನಿ ನೀರಾವರಿ ಮಾಹಿತಿ.',
    rules_en: 'Respect fellow growers; only share verified agronomic practices; strictly no commercial advertisements.',
    rules_kn: 'ರೈತ ಬಾಂಧವರೊಂದಿಗೆ ಸೌಹಾರ್ದಯುತವಾಗಿ ವರ್ತಿಸಿ; ಸರಿಯಾದ ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ಹಂಚಿಕೊಳ್ಳಿ.',
    member_count: 142,
    is_active: true,
    membership_status: 'admin',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString()
  },
  {
    id: 2,
    name_en: 'Mandya Organic & Natural Farming Sangha',
    name_kn: 'ಮಂಡ್ಯ ಸಾವಯವ ಮತ್ತು ನೈಸರ್ಗಿಕ ಕೃಷಿ ಸಂಘ',
    taluk: 'Mandya',
    village: 'Guthalu',
    district: 'Mandya',
    crop_id: 3,
    crop_name_en: 'Finger Millet (Ragi)',
    crop_name_kn: 'ರಾಗಿ',
    creator_id: 2,
    description_en: 'Jeevamrutha, desi cow manure, and pesticide-free food cultivation.',
    description_kn: 'ಜೀವಾಮೃತ ತಯಾರಿ, ದೇಸಿ ಗೋವಿನ ಗೊಬ್ಬರ ಮತ್ತು ನೈಸರ್ಗಿಕ ಕೃಷಿ ಪದ್ಧತಿಗಳ ವಿನಿಮಯ ವೇದಿಕೆ.',
    rules_en: 'Promote organic and natural farming inputs; support peer seed-saving and barter.',
    rules_kn: 'ನೈಸರ್ಗಿಕ ಕೃಷಿಗೆ ಪ್ರೋತ್ಸಾಹ ನೀಡಿ; ಬೀಜ ಸಂರಕ್ಷಣೆ ಮತ್ತು ವಿನಿಮಯಕ್ಕೆ ಬೆಂಬಲ ನೀಡಿ.',
    member_count: 88,
    is_active: true,
    membership_status: 'moderator',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 3,
    name_en: 'Malavalli Horticulture & Sericulture Union',
    name_kn: 'ಮಳವಳ್ಳಿ ತೋಟಗಾರಿಕೆ ಮತ್ತು ರೇಷ್ಮೆ ಬೆಳೆಗಾರರ ಒಕ್ಕೂಟ',
    taluk: 'Malavalli',
    village: 'Halaguru',
    district: 'Mandya',
    crop_id: 5,
    crop_name_en: 'Tender Coconut',
    crop_name_kn: 'ಎಳನೀರು ತೆಂಗು',
    creator_id: 3,
    description_en: 'Tender coconut, banana, and mulberry cultivation tips and market prices.',
    description_kn: 'ಎಳನೀರು, ಬಾಳೆ ಮತ್ತು ಹಿಪ್ಪುನೇರಳೆ ರೇಷ್ಮೆ ಕೃಷಿ ಸಲಹೆಗಳು ಮತ್ತು ದರಗಳ ಮಾಹಿತಿ.',
    rules_en: 'Focus on horticulture and sericulture produce; share genuine market rates.',
    rules_kn: 'ತೋಟಗಾರಿಕೆ ಬೆಳೆಗಳು ಮತ್ತು ರೇಷ್ಮೆ ಕೃಷಿಗೆ ಸಂಬಂಧಿಸಿದ ವಿಷಯಗಳನ್ನು ಮಾತ್ರ ಚರ್ಚಿಸಿ.',
    member_count: 64,
    is_active: true,
    membership_status: null,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: 4,
    name_en: 'Pandavapura Paddy Cultivators Union',
    name_kn: 'ಪಾಂಡವಪುರ ಭತ್ತ ಬೆಳೆಗಾರರ ಒಕ್ಕೂಟ',
    taluk: 'Pandavapura',
    village: 'Haravu',
    district: 'Mandya',
    crop_id: 2,
    crop_name_en: 'Paddy / Rice',
    crop_name_kn: 'ಭತ್ತ',
    creator_id: 1,
    description_en: 'Canal water timing, combine harvester sharing, and direct mill price discussion.',
    description_kn: 'ಕಾಲುವೆ ನೀರು ಬಿಡುಗಡೆ, ಕಟಾವು ಯಂತ್ರಗಳ ಹಂಚಿಕೆ ಹಾಗೂ ನೇರ ಗಿರಣಿ ದರಗಳ ಸಮಾಲೋಚನೆ.',
    rules_en: 'Cooperative equipment sharing; respectful communication.',
    rules_kn: 'ಸಹಕಾರಿ ತತ್ತ್ವದಡಿ ಯಂತ್ರೋಪಕರಣ ಹಂಚಿಕೆ; ಎಲ್ಲರಿಗೂ ಸಮಾನ ಗೌರವ.',
    member_count: 115,
    is_active: true,
    membership_status: 'admin',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

export const DEMO_GROUP_MEMBERS: GroupMember[] = [
  { id: 1, group_id: 1, user_id: 1, user_name: 'Ramesh Gowda', user_phone: '9845012345', user_village: 'Shivapura', role: 'admin', status: 'approved', created_at: new Date(Date.now() - 90 * 86400000).toISOString() },
  { id: 2, group_id: 1, user_id: 2, user_name: 'Lakshmi Devi', user_phone: '9845098765', user_village: 'Halaguru', role: 'member', status: 'approved', created_at: new Date(Date.now() - 75 * 86400000).toISOString() },
  { id: 3, group_id: 1, user_id: 3, user_name: 'Basavaraj (Trader)', user_phone: '9900112233', user_village: 'Guthalu', role: 'member', status: 'pending', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 4, group_id: 2, user_id: 2, user_name: 'Lakshmi Devi', user_phone: '9845098765', user_village: 'Guthalu', role: 'admin', status: 'approved', created_at: new Date(Date.now() - 60 * 86400000).toISOString() },
  { id: 5, group_id: 2, user_id: 1, user_name: 'Ramesh Gowda', user_phone: '9845012345', user_village: 'Shivapura', role: 'moderator', status: 'approved', created_at: new Date(Date.now() - 50 * 86400000).toISOString() },
  { id: 6, group_id: 4, user_id: 1, user_name: 'Ramesh Gowda', user_phone: '9845012345', user_village: 'Shivapura', role: 'admin', status: 'approved', created_at: new Date(Date.now() - 30 * 86400000).toISOString() }
];

export const DEMO_GROUP_ANNOUNCEMENTS: GroupAnnouncement[] = [
  {
    id: 1,
    group_id: 1,
    author_id: 1,
    author_name: 'Ramesh Gowda (Admin)',
    title: 'Cauvery Canal Water Release Update for Sugarcane',
    content: 'ಮದ್ದೂರು ತಾಲೂಕಿನ ಎಲ್ಲಾ ಕಬ್ಬು ಬೆಳೆಗಾರರಿಗೆ ಮಾಹಿತಿ: ಈ ವಾರ ವಿಶ್ವೇಶ್ವರಯ್ಯ ನಾಲೆಯಲ್ಲಿ ನೀರು ಹರಿಸಲಾಗುತ್ತಿದೆ. ಎಲ್ಲಾ ರೈತರು ಕಳೆ ಕೀಳುವಿಕೆ ಮುಗಿಸಿ ನೀರು ಹಾಯಿಸಲು ಸಿದ್ಧತೆ ಮಾಡಿಕೊಳ್ಳಿ.',
    priority: 'urgent',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 2,
    group_id: 2,
    author_id: 2,
    author_name: 'Lakshmi Devi (Admin)',
    title: 'Weekly Jeevamrutha Workshop at Guthalu Community Hall',
    content: 'Sunday 10 AM practical demonstration on Ghanajeevamrutha preparation using indigenous Hallikar cow dung at Guthalu community hall. All welcome.',
    priority: 'normal',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

export const DEMO_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 1,
    group_id: 1,
    group_name: 'ಮದ್ದೂರು ಕಬ್ಬು ಬೆಳೆಗಾರರ ವೇದಿಕೆ',
    author_id: 1,
    author_name: 'Ramesh Gowda',
    author_village: 'Shivapura',
    author_taluk: 'Maddur',
    author_role: 'farmer',
    crop_id: 1,
    crop_name_en: 'Sugarcane',
    crop_name_kn: 'ಕಬ್ಬು',
    title: 'Best drip fertigation schedule for VSI-434 sugarcane?',
    content: 'ನಮಸ್ಕಾರ ಸ್ನೇಹಿತರೆ, ಮದ್ದೂರು ಶಿವಪುರದಲ್ಲಿ 2 ತಿಂಗಳ ಕಬ್ಬಿಗೆ ಹನಿ ನೀರಾವರಿ ಮೂಲಕ 19:19:19 ಗೊಬ್ಬರ ಎಷ್ಟು ದಿನಕ್ಕೊಮ್ಮೆ ಕೊಡಬೇಕು? ಅನುಭವಸ್ಥ ರೈತರು ತಿಳಿಸಿ.',
    topic: 'cultivation',
    language: 'kn',
    likes_count: 14,
    comments_count: 2,
    is_pinned: true,
    is_liked: true,
    is_saved: false,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 2,
    group_id: 2,
    group_name: 'ಮಂಡ್ಯ ಸಾವಯವ ಮತ್ತು ನೈಸರ್ಗಿಕ ಕೃಷಿ ಸಂಘ',
    author_id: 2,
    author_name: 'Lakshmi Devi',
    author_village: 'Guthalu',
    author_taluk: 'Mandya',
    author_role: 'farmer',
    crop_id: 3,
    crop_name_en: 'Finger Millet (Ragi)',
    crop_name_kn: 'ರಾಗಿ',
    title: 'Desi neem-cake recipe for soil-borne grub control in Ragi',
    content: 'ರಾಗಿ ಬೆಳೆಯ ಬೇರು ಹುಳುಗಳಿಗೆ ಬೇವಿನ ಹಿಂಡಿ ಮತ್ತು ಹರಳೆಣ್ಣೆ ಹಿಂಡಿ ಮಿಶ್ರಣ ಬಳಸಿ ಅತ್ಯುತ್ತಮ ಫಲಿತಾಂಶ ಸಿಕ್ಕಿದೆ. ರಾಸಾಯನಿಕ ಕ್ರಿಮಿನಾಶಕ ಬೇಕಾಗಿಲ್ಲ.',
    topic: 'pest_control',
    language: 'kn',
    likes_count: 22,
    comments_count: 1,
    is_pinned: false,
    is_liked: false,
    is_saved: true,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 3,
    group_id: null,
    group_name: null,
    author_id: 1,
    author_name: 'Ramesh Gowda',
    author_village: 'Shivapura',
    author_taluk: 'Maddur',
    author_role: 'farmer',
    crop_id: 2,
    crop_name_en: 'Paddy / Rice',
    crop_name_kn: 'ಭತ್ತ',
    title: 'Combined paddy harvester availability in Maddur & Mandya',
    content: 'Does anyone have direct contact numbers for combine harvesters with rubber tracks available next week near Shivapura? Please share rates per hour.',
    topic: 'machinery',
    language: 'en',
    likes_count: 9,
    comments_count: 1,
    is_pinned: false,
    is_liked: false,
    is_saved: false,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 4,
    group_id: 3,
    group_name: 'ಮಳವಳ್ಳಿ ತೋಟಗಾರಿಕೆ ಮತ್ತು ರೇಷ್ಮೆ ಬೆಳೆಗಾರರ ಒಕ್ಕೂಟ',
    author_id: 2,
    author_name: 'Lakshmi Devi',
    author_village: 'Halaguru',
    author_taluk: 'Malavalli',
    author_role: 'farmer',
    crop_id: 5,
    crop_name_en: 'Tender Coconut',
    crop_name_kn: 'ಎಳನೀರು ತೆಂಗು',
    title: 'Mandya Mandi price trends for large green tender coconuts',
    content: 'Halaguru roadside wholesale merchants are offering ₹32-₹34 per piece for grade-A sweet tender coconuts. Are Mysore markets offering higher rates this week?',
    topic: 'market_trend',
    language: 'en',
    likes_count: 18,
    comments_count: 2,
    is_pinned: false,
    is_liked: false,
    is_saved: false,
    created_at: new Date(Date.now() - 36 * 3600000).toISOString()
  }
];

export const DEMO_POST_COMMENTS: PostComment[] = [
  {
    id: 1,
    post_id: 1,
    author_id: 2,
    author_name: 'Lakshmi Devi',
    author_village: 'Guthalu',
    parent_id: null,
    content: 'ರಮೇಶ್ ಅವರೇ, ಪ್ರತಿ 8-10 ದಿನಕ್ಕೊಮ್ಮೆ ಬೆಳಿಗ್ಗೆ ವೇಳೆ 3 ಕೆಜಿ 19:19:19 ಕರಗಿಸಿ ವೆಂಚುರಿ ಮೂಲಕ ಕೊಡಿ. ಸಂಜೆ ಬೇಡ.',
    likes_count: 5,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 2,
    post_id: 1,
    author_id: 1,
    author_name: 'Ramesh Gowda',
    author_village: 'Shivapura',
    parent_id: 1,
    content: 'ಧನ್ಯವಾದಗಳು ಲಕ್ಷ್ಮಿ ಅಕ್ಕ, ನಾಳೆಯಿಂದಲೇ ಈ ವೇಳಾಪಟ್ಟಿ ಅನುಸರಿಸುತ್ತೇನೆ.',
    likes_count: 2,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 3,
    post_id: 2,
    author_id: 1,
    author_name: 'Ramesh Gowda',
    author_village: 'Shivapura',
    parent_id: null,
    content: 'ಬೇವಿನ ಹಿಂಡಿ ಎಕರೆಗೆ ಎಷ್ಟು ಪ್ರಮಾಣದಲ್ಲಿ ಹಾಕಬೇಕು ಮೇಡಂ?',
    likes_count: 3,
    created_at: new Date(Date.now() - 10 * 3600000).toISOString()
  },
  {
    id: 4,
    post_id: 3,
    author_id: 2,
    author_name: 'Lakshmi Devi',
    author_village: 'Halaguru',
    parent_id: null,
    content: 'Contact Sri Manjunatha Harvesters in Maddur: ₹2,400 per hour with operator and transport included.',
    likes_count: 4,
    created_at: new Date(Date.now() - 20 * 3600000).toISOString()
  },
  {
    id: 5,
    post_id: 4,
    author_id: 1,
    author_name: 'Ramesh Gowda',
    author_village: 'Shivapura',
    parent_id: null,
    content: 'Bangalore traders picking up from Maddur gate are offering ₹35 for selected sizes above 2.5kg water content.',
    likes_count: 6,
    created_at: new Date(Date.now() - 30 * 3600000).toISOString()
  }
];

export const DEMO_GROUP_CONTRIBUTIONS: GroupListingContribution[] = [
  {
    id: 1,
    listing_id: 4,
    farmer_id: 1,
    farmer_name: 'Ramesh Gowda',
    farmer_phone: '9845012345',
    farmer_village: 'Shivapura',
    quantity: 100.0,
    unit: 'quintal',
    notes: 'Acreage 2.0 harvest contribution',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 2,
    listing_id: 4,
    farmer_id: 2,
    farmer_name: 'Lakshmi Devi',
    farmer_phone: '9845098765',
    farmer_village: 'Guthalu',
    quantity: 150.0,
    unit: 'quintal',
    notes: 'Acreage 3.0 harvest contribution',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

export const DEMO_MARKET_LISTINGS: MarketListing[] = [
  {
    id: 1,
    farmer_id: 1,
    crop_id: 1,
    variety: 'Co 86032 (Nayana)',
    quantity: 45.0,
    unit: 'ton',
    price_per_unit: 3150.0,
    harvest_date: new Date(Date.now() + 25 * 86400000).toISOString(),
    available_from: new Date().toISOString(),
    available_until: new Date(Date.now() + 40 * 86400000).toISOString(),
    village: 'Shivapura',
    taluk: 'Maddur',
    district: 'Mandya',
    pickup_address: 'Maddur-Malavalli Main Road, Farm Gate 4',
    image_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800',
    is_collective: false,
    status: 'active',
    description: 'Fresh healthy 11-month standing sugarcane crop near Maddur-Malavalli road. High brix sugar content, suitable for jaggery or mill.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    farmer_name: 'Ramesh Gowda',
    farmer_phone: '9845012345',
    farmer_village: 'Shivapura',
    crop_name_en: 'Sugarcane',
    crop_name_kn: 'ಕಬ್ಬು (Kabbu)',
    is_saved: false,
    enquiries_count: 0,
    contributions_count: 0
  },
  {
    id: 2,
    farmer_id: 2,
    crop_id: 5,
    variety: 'Mandya Local Green Tender Coconut',
    quantity: 2500.0,
    unit: 'piece',
    price_per_unit: 32.0,
    harvest_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    available_from: new Date().toISOString(),
    available_until: new Date(Date.now() + 20 * 86400000).toISOString(),
    village: 'Halaguru',
    taluk: 'Malavalli',
    district: 'Mandya',
    pickup_address: 'Halaguru Roadside Farm Gate, Near Canal Bridge',
    image_url: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    is_collective: false,
    status: 'active',
    description: 'Sweet tender coconuts directly from Halaguru farm. 500ml+ sweet water yield per nut. Direct vehicle and truck access to farm.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    farmer_name: 'Lakshmi Devi',
    farmer_phone: '9845098765',
    farmer_village: 'Halaguru',
    crop_name_en: 'Tender Coconut',
    crop_name_kn: 'ಎಳನೀರು (Elaneeru)',
    is_saved: true,
    enquiries_count: 1,
    contributions_count: 0
  },
  {
    id: 3,
    farmer_id: 1,
    crop_id: 3,
    variety: 'GPU 28 Certified Organic',
    quantity: 80.0,
    unit: 'quintal',
    price_per_unit: 3850.0,
    harvest_date: new Date(Date.now() + 12 * 86400000).toISOString(),
    available_from: new Date().toISOString(),
    available_until: new Date(Date.now() + 60 * 86400000).toISOString(),
    village: 'Shivapura',
    taluk: 'Maddur',
    district: 'Mandya',
    pickup_address: 'Shivapura Primary Agricultural Society Godown',
    image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
    is_collective: false,
    status: 'active',
    description: 'Naturally grown GPU 28 finger millet with zero chemical pesticides. Cleaned and sun-dried in 50kg gunny bags.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    farmer_name: 'Ramesh Gowda',
    farmer_phone: '9845012345',
    farmer_village: 'Shivapura',
    crop_name_en: 'Finger Millet (Ragi)',
    crop_name_kn: 'ರಾಗಿ (Ragi)',
    is_saved: false,
    enquiries_count: 0,
    contributions_count: 0
  },
  {
    id: 4,
    farmer_id: 1,
    group_id: 4,
    crop_id: 2,
    variety: 'BPT 5204 (Sona Masoori)',
    quantity: 250.0,
    unit: 'quintal',
    price_per_unit: 2650.0,
    harvest_date: new Date(Date.now() + 15 * 86400000).toISOString(),
    available_from: new Date().toISOString(),
    available_until: new Date(Date.now() + 45 * 86400000).toISOString(),
    village: 'Haravu',
    taluk: 'Pandavapura',
    district: 'Mandya',
    pickup_address: 'Pandavapura Raitha Bhavan Community Collection Center',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    is_collective: true,
    status: 'active',
    description: 'Collective pooled paddy lot from 3 verified farmers of Pandavapura Paddy Union. Moisture 13%, combine harvested, graded lot.',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    farmer_name: 'Ramesh Gowda',
    farmer_phone: '9845012345',
    farmer_village: 'Shivapura',
    group_name: 'ಪಾಂಡವಪುರ ಭತ್ತ ಬೆಳೆಗಾರರ ಒಕ್ಕೂಟ',
    crop_name_en: 'Paddy / Rice',
    crop_name_kn: 'ಭತ್ತ (Bhatta)',
    is_saved: false,
    enquiries_count: 1,
    contributions_count: 2,
    contributions: DEMO_GROUP_CONTRIBUTIONS
  }
];

export const DEMO_ENQUIRY_MESSAGES: EnquiryMessage[] = [
  {
    id: 1,
    enquiry_id: 1,
    sender_id: 4,
    sender_name: 'Mysore Agro Traders (Basavaraj)',
    sender_role: 'buyer',
    message: 'We can arrange pickup of 1,000 tender coconuts this Saturday morning. Please confirm farm location.',
    proposed_price: 30.0,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString()
  },
  {
    id: 2,
    enquiry_id: 2,
    sender_id: 4,
    sender_name: 'Mysore Agro Traders (Basavaraj)',
    sender_role: 'buyer',
    message: 'Interested in 60 quintals Sona Masoori Paddy. Can take delivery at Pandavapura godown.',
    proposed_price: 2600.0,
    created_at: new Date(Date.now() - 14 * 3600000).toISOString()
  },
  {
    id: 3,
    enquiry_id: 2,
    sender_id: 1,
    sender_name: 'Ramesh Gowda',
    sender_role: 'farmer',
    message: 'Offer accepted! Grain moisture test passed, ready for collection at Pandavapura Raitha Bhavan.',
    proposed_price: 2600.0,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString()
  }
];

export const DEMO_MARKET_ENQUIRIES: MarketEnquiry[] = [
  {
    id: 1,
    listing_id: 2,
    buyer_id: 4,
    quantity_requested: 1000.0,
    offered_price: 30.0,
    message: 'We can arrange pickup of 1,000 tender coconuts this Saturday morning. Please confirm farm location.',
    status: 'pending',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    buyer_name: 'Mysore Agro Traders (Basavaraj)',
    buyer_phone: '9900112233',
    buyer_village: 'Guthalu',
    listing_title: 'Tender Coconut (Mandya Local Green)',
    listing_crop_en: 'Tender Coconut',
    listing_crop_kn: 'ಎಳನೀರು',
    listing_price: 32.0,
    listing_unit: 'piece',
    farmer_id: 2,
    farmer_name: 'Lakshmi Devi',
    messages: [DEMO_ENQUIRY_MESSAGES[0]]
  },
  {
    id: 2,
    listing_id: 4,
    buyer_id: 4,
    quantity_requested: 60.0,
    offered_price: 2600.0,
    message: 'Interested in 60 quintals Sona Masoori Paddy. Can take delivery at Pandavapura godown.',
    status: 'accepted',
    created_at: new Date(Date.now() - 14 * 3600000).toISOString(),
    buyer_name: 'Mysore Agro Traders (Basavaraj)',
    buyer_phone: '9900112233',
    buyer_village: 'Guthalu',
    listing_title: 'Paddy / Rice (BPT 5204)',
    listing_crop_en: 'Paddy / Rice',
    listing_crop_kn: 'ಭತ್ತ',
    listing_price: 2650.0,
    listing_unit: 'quintal',
    farmer_id: 1,
    farmer_name: 'Ramesh Gowda',
    messages: [DEMO_ENQUIRY_MESSAGES[1], DEMO_ENQUIRY_MESSAGES[2]]
  }
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    user_id: 1,
    title_en: 'New Advisory for Mandya Sugarcane',
    title_kn: 'ಮಂಡ್ಯ ಕಬ್ಬು ಬೆಳೆಗೆ ನೂತನ ಸಲಹೆ',
    message_en: 'Top borer pest alert issued for your taluk.',
    message_kn: 'ನಿಮ್ಮ ತಾಲೂಕಿನ ಕಬ್ಬಿನ ಬೆಳೆಗೆ ಸುಳಿ ಕೊರೆಯುವ ಹುಳು ಬಾಧೆಯ ಎಚ್ಚರಿಕೆ ಬಿಡುಗಡೆಯಾಗಿದೆ.',
    type: 'advisory',
    is_read: false,
    related_entity_type: 'advisory',
    related_entity_id: 1,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 2,
    user_id: 1,
    title_en: 'Direct Buyer Enquiry Received',
    title_kn: 'ಹೊಸ ಖರೀದಿ ವಿಚಾರಣೆ ಬಂದಿದೆ',
    message_en: 'Mysore Agro Traders enquired about 1,000 Tender Coconuts.',
    message_kn: 'ಮೈಸೂರು ಆಗ್ರೋ ಟ್ರೇಡರ್ಸ್ 1000 ಎಳನೀರು ಖರೀದಿಸಲು ವಿಚಾರಣೆ ಕಳುಹಿಸಿದ್ದಾರೆ.',
    type: 'market',
    is_read: false,
    related_entity_type: 'listing',
    related_entity_id: 2,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: 3,
    user_id: 4,
    title_en: 'Enquiry Accepted by Farmer',
    title_kn: 'ರೈತರಿಂದ ಖರೀದಿ ವಿಚಾರಣೆ ಒಪ್ಪಿಗೆಯಾಗಿದೆ',
    message_en: 'Ramesh Gowda accepted your enquiry for 60 quintals Sona Masoori Paddy.',
    message_kn: 'ರಮೇಶ್ ಗೌಡ ಅವರು 60 ಕ್ವಿಂಟಾಲ್ ಸೋನಾ ಮಸೂರಿ ಭತ್ತದ ವಿಚಾರಣೆಯನ್ನು ಒಪ್ಪಿಕೊಂಡಿದ್ದಾರೆ.',
    type: 'market',
    is_read: false,
    related_entity_type: 'enquiry',
    related_entity_id: 2,
    created_at: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    id: 4,
    user_id: 1,
    title_en: 'New reply to your post',
    title_kn: 'ನಿಮ್ಮ ಪೋಸ್ಟ್‌ಗೆ ಹೊಸ ಪ್ರತಿಕ್ರಿಯೆ ಬಂದಿದೆ',
    message_en: 'Lakshmi Devi replied on organic pest management for sugarcane.',
    message_kn: 'ಲಕ್ಷ್ಮೀ ದೇವಿ ಕಬ್ಬಿನ ಸಾವಯವ ಕೀಟ ನಿರ್ವಹಣೆಗೆ ಪ್ರತಿಕ್ರಿಯಿಸಿದ್ದಾರೆ.',
    type: 'community',
    is_read: true,
    related_entity_type: 'post',
    related_entity_id: 1,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

export const DEMO_NOTIFICATION_PREFERENCES: UserNotificationPreference = {
  id: 1,
  user_id: 1,
  advisory_alerts: true,
  community_updates: true,
  market_enquiries: true,
  system_announcements: true,
  updated_at: new Date().toISOString()
};

export const DEMO_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 1,
    user_id: 1,
    user_name: 'Ramesh Gowda',
    user_phone: '9845012345',
    category: 'Marketplace',
    subject: 'Unable to update listing quantity',
    description: 'Tried reducing coconut stock from 1000 to 500 pieces after offline sale, but page showed an error.',
    status: 'resolved',
    resolution_notes: 'Resolved in patch update v1.4. Farmer confirmed listing updated.',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 2,
    user_id: 1,
    user_name: 'Ramesh Gowda',
    user_phone: '9845012345',
    category: 'Advisory',
    subject: 'Request soil testing camp details for Maddur taluk',
    description: 'Need schedule for mobile soil testing laboratory visit to Shivapura village.',
    status: 'open',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export const DEMO_AUDIT_LOGS: ModerationAuditLog[] = [
  {
    id: 1,
    admin_id: 99,
    admin_name: 'Mandya Krishi Admin',
    action: 'take_down',
    target_type: 'post',
    target_id: 4,
    details: 'Spam chemical fertilizer commercial promotion removed',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 2,
    admin_id: 99,
    admin_name: 'Mandya Krishi Admin',
    action: 'badge_assigned',
    target_type: 'user',
    target_id: 1,
    details: 'Assigned verified badge to model farmer Ramesh Gowda',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

export const DEMO_ADMIN_STATS: AdminPlatformStats = {
  total_users: 148,
  total_farmers: 122,
  total_buyers: 26,
  total_listings: 18,
  total_groups: 6,
  pending_reports_count: 1,
  open_tickets_count: 2,
  total_advisories_count: 12
};
