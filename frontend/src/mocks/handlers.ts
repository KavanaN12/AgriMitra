import { http, HttpResponse, delay } from 'msw';
import {
  MANDYA_LOCATION_HIERARCHY,
  MANDYA_LOCATIONS,
  MANDYA_CROPS,
  DEMO_USER,
  DEMO_USER_CROPS,
  DEMO_WEATHER,
  DEMO_WEATHER_FORECAST,
  DEMO_ADVISORIES,
  DEMO_ADVISORY_RECOMMENDATIONS,
  DEMO_COMMUNITY_GROUPS,
  DEMO_COMMUNITY_POSTS,
  DEMO_GROUP_MEMBERS,
  DEMO_GROUP_ANNOUNCEMENTS,
  DEMO_POST_COMMENTS,
  DEMO_MARKET_LISTINGS,
  DEMO_MARKET_ENQUIRIES,
  DEMO_GROUP_CONTRIBUTIONS,
  DEMO_ENQUIRY_MESSAGES,
  DEMO_NOTIFICATIONS,
  DEMO_ADMIN_USER,
  DEMO_NOTIFICATION_PREFERENCES,
  DEMO_SUPPORT_TICKETS,
  DEMO_AUDIT_LOGS,
  DEMO_ADMIN_STATS
} from './mandyaData';
import {
  User,
  CommunityGroup,
  CommunityPost,
  GroupMember,
  GroupAnnouncement,
  PostComment,
  MarketListing,
  MarketEnquiry,
  GroupListingContribution,
  EnquiryMessage,
  Notification,
  UserNotificationPreference,
  SupportTicket,
  ModerationAuditLog,
  AdminPlatformStats
} from '../types/api';

// Mutable in-memory copies for realistic interactivity during demo
let currentUser: User = { ...DEMO_USER };
let communityGroups: CommunityGroup[] = [...DEMO_COMMUNITY_GROUPS];
let posts: CommunityPost[] = [...DEMO_COMMUNITY_POSTS];
let groupMembers: GroupMember[] = [...DEMO_GROUP_MEMBERS];
let announcements: GroupAnnouncement[] = [...DEMO_GROUP_ANNOUNCEMENTS];
let comments: PostComment[] = [...DEMO_POST_COMMENTS];
let savedPostIds = new Set<number>([2]);
let likedPostIds = new Set<number>([1]);
let marketListings: MarketListing[] = [...DEMO_MARKET_LISTINGS];
let marketEnquiries: MarketEnquiry[] = [...DEMO_MARKET_ENQUIRIES];
let groupContributions: GroupListingContribution[] = [...DEMO_GROUP_CONTRIBUTIONS];
let enquiryMessages: EnquiryMessage[] = [...DEMO_ENQUIRY_MESSAGES];
let savedListingIds = new Set<number>([2]);
let notifications = [...DEMO_NOTIFICATIONS];
let userCrops = [...DEMO_USER_CROPS];
let adminUser: User = { ...DEMO_ADMIN_USER };
let notificationPreferences: UserNotificationPreference = { ...DEMO_NOTIFICATION_PREFERENCES };
let supportTickets: SupportTicket[] = [...DEMO_SUPPORT_TICKETS];
let auditLogs: ModerationAuditLog[] = [...DEMO_AUDIT_LOGS];
let allUsers: User[] = [
  currentUser,
  {
    id: 2,
    phone_number: '9845054321',
    full_name: 'Lakshmi Devi',
    preferred_language: 'kn',
    role: 'farmer',
    roles: 'farmer',
    active_role: 'farmer',
    is_admin: false,
    is_verified: true,
    is_expert: true,
    bio: 'Paddy & vegetable organic specialist, Guthalu village leader.',
    email: 'lakshmi@mandya.org',
    text_size: 'normal',
    data_saver: false,
    phone_visible: true,
    is_onboarded: true,
    onboarding_step: 7,
    farm_size_acres: 2.0,
    farming_type: 'Natural / ZBNF',
    irrigation_source: 'Borewell',
    location_id: 1,
    is_active: true,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: 4,
    phone_number: '9900112233',
    full_name: 'Basavaraj (Mysore Agro)',
    preferred_language: 'en',
    role: 'buyer',
    roles: 'buyer',
    active_role: 'buyer',
    is_admin: false,
    is_verified: true,
    is_expert: false,
    buyer_business_name: 'Mysore Agro Traders',
    buyer_type: 'Wholesaler / Processor',
    email: 'basavaraj@mysoreagro.com',
    text_size: 'normal',
    data_saver: false,
    phone_visible: true,
    is_onboarded: true,
    onboarding_step: 7,
    location_id: 1,
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  adminUser
];
let contentReports: any[] = [
  {
    id: 1,
    user_id: 2,
    reporter_name: 'Lakshmi Devi',
    post_id: 2,
    post_title: 'Chemical spray overdose advice query',
    post_content: 'Should I spray triple strength profenofos to eliminate shoot borer immediately?',
    author_name: 'Channapatna Farmer',
    reason: 'Misleading / Harmful chemical advice',
    details: 'Recommending banned chemical concentrations that damage beneficial insect fauna.',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];
let platformCrops = [...MANDYA_CROPS];

function checkAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get('Authorization') || '';
  if (authHeader.includes('admin') || authHeader.includes('user_99')) {
    return true;
  }
  if (currentUser.is_admin || currentUser.role === 'admin') {
    return true;
  }
  return false;
}

export const handlers = [
  // Health check
  http.get('*/api/v1/health', async () => {
    await delay(150);
    return HttpResponse.json({
      status: 'ok',
      app: 'AgriMitra API (MSW Mandya Demo)',
      version: '0.1.0',
      environment: 'demo-msw',
      database: 'connected (in-memory demo)'
    });
  }),

  // Auth Register
  http.post('*/api/v1/auth/register', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    currentUser = {
      ...DEMO_USER,
      id: 2,
      full_name: body.full_name || 'Mandya Farmer',
      phone_number: body.phone_number || '9876543210',
      preferred_language: body.preferred_language || 'kn',
      role: 'farmer',
      roles: 'farmer',
      active_role: 'farmer',
      is_onboarded: false,
      onboarding_step: 1
    };
    return HttpResponse.json({
      access_token: `agrimitra_msw_token_${Date.now()}`,
      token_type: 'bearer',
      user: currentUser
    }, { status: 201 });
  }),

  // Auth Login
  http.post('*/api/v1/auth/login', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    if (body.phone_number === '9845000000') {
      currentUser = { ...adminUser };
      return HttpResponse.json({
        access_token: 'agrimitra_msw_token_admin',
        token_type: 'bearer',
        user: adminUser
      });
    }
    if (body.phone_number) {
      currentUser.phone_number = body.phone_number;
    }
    return HttpResponse.json({
      access_token: `agrimitra_msw_token_${Date.now()}`,
      token_type: 'bearer',
      user: currentUser
    });
  }),

  // Auth Verify OTP
  http.post('*/api/v1/auth/verify-otp', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    if (body.otp !== '123456' && body.otp !== '000000') {
      return HttpResponse.json(
        { detail: 'Invalid demonstration OTP. Please enter 123456.' },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      access_token: `agrimitra_msw_token_${Date.now()}`,
      token_type: 'bearer',
      user: currentUser
    });
  }),

  // Auth Resend OTP
  http.post('*/api/v1/auth/resend-otp', async () => {
    await delay(200);
    return HttpResponse.json({
      status: 'success',
      message: 'Demonstration OTP sent (SMS simulated)',
      demo_otp: '123456'
    });
  }),

  // Auth Forgot Password
  http.post('*/api/v1/auth/forgot-password', async () => {
    await delay(250);
    return HttpResponse.json({
      status: 'success',
      message: 'Demonstration reset OTP sent (SMS simulated)',
      demo_otp: '123456'
    });
  }),

  // Auth Reset Password
  http.post('*/api/v1/auth/reset-password', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    if (body.otp !== '123456') {
      return HttpResponse.json(
        { detail: 'Invalid OTP. For demonstration, use 123456.' },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      status: 'success',
      message: 'Password reset successfully'
    });
  }),

  // Auth Onboarding Update
  http.put('*/api/v1/auth/onboarding', async ({ request }) => {
    await delay(350);
    const body = await request.json() as any;

    // Match or create location
    let matchedLocation = currentUser.location;
    if (body.location) {
      matchedLocation = {
        id: 10,
        state: body.location.state || 'Karnataka',
        district: body.location.district || 'Mandya',
        taluk: body.location.taluk || 'Mandya',
        hobli: body.location.hobli || 'Kasaba',
        village: body.location.village || 'Guthalu',
        pincode: body.location.pincode || '571401'
      };
    }

    const updatedRole = body.role || currentUser.role;
    currentUser = {
      ...currentUser,
      role: updatedRole,
      roles: updatedRole,
      active_role: updatedRole === 'both' ? 'farmer' : updatedRole,
      location: matchedLocation,
      location_id: matchedLocation?.id || currentUser.location_id,
      farm_size_acres: body.farm_size_acres ?? currentUser.farm_size_acres,
      farming_type: body.farming_type ?? currentUser.farming_type,
      irrigation_source: body.irrigation_source ?? currentUser.irrigation_source,
      profile_photo_url: body.profile_photo_url ?? currentUser.profile_photo_url,
      buyer_business_name: body.buyer_business_name ?? currentUser.buyer_business_name,
      buyer_type: body.buyer_type ?? currentUser.buyer_type,
      buyer_license_no: body.buyer_license_no ?? currentUser.buyer_license_no,
      interested_crops: body.interested_crops ? JSON.stringify(body.interested_crops) : currentUser.interested_crops,
      is_onboarded: body.is_completed ?? true,
      onboarding_step: body.step || 7
    };

    return HttpResponse.json(currentUser);
  }),

  // Switch Role
  http.post('*/api/v1/auth/switch-role', async ({ request }) => {
    await delay(150);
    const body = await request.json() as any;
    currentUser = {
      ...currentUser,
      active_role: body.active_role
    };
    return HttpResponse.json(currentUser);
  }),

  // Auth Me
  http.get('*/api/v1/auth/me', async ({ request }) => {
    await delay(150);
    const authHeader = request.headers.get('Authorization') || '';
    if (authHeader.includes('admin') || authHeader.includes('user_99')) {
      return HttpResponse.json(adminUser);
    }
    return HttpResponse.json(currentUser);
  }),

  // Locations Hierarchy
  http.get('*/api/v1/locations/hierarchy', async () => {
    await delay(150);
    return HttpResponse.json(MANDYA_LOCATION_HIERARCHY);
  }),

  // Locations
  http.get('*/api/v1/locations', async () => {
    await delay(200);
    return HttpResponse.json(MANDYA_LOCATIONS);
  }),

  // Crops List & Detail
  http.get('*/api/v1/crops', async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    let result = [...MANDYA_CROPS];
    if (category) {
      result = result.filter(c => c.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c =>
        c.name_en.toLowerCase().includes(s) ||
        c.name_kn.toLowerCase().includes(s) ||
        c.code.toLowerCase().includes(s)
      );
    }
    return HttpResponse.json(result);
  }),

  // User Crops CRUD (defined before :id to prevent 'my' matching as an id)
  http.get('*/api/v1/crops/my', async () => {
    await delay(150);
    return HttpResponse.json(userCrops);
  }),

  http.post('*/api/v1/crops/my', async ({ request }) => {
    await delay(250);
    const body = await request.json() as any;
    const cropObj = MANDYA_CROPS.find(c => c.id === Number(body.crop_id)) || MANDYA_CROPS[0];
    const newUc = {
      id: userCrops.length > 0 ? Math.max(...userCrops.map(u => u.id)) + 1 : 1,
      user_id: 1,
      crop_id: Number(body.crop_id),
      acreage: Number(body.acreage) || 1.0,
      stage: body.stage || 'growing',
      soil_type: body.soil_type || 'red sandy loam',
      irrigation_type: body.irrigation_type || 'canal',
      sowing_date: body.sowing_date || new Date().toISOString(),
      crop: cropObj
    };
    userCrops.unshift(newUc);
    return HttpResponse.json(newUc, { status: 201 });
  }),

  http.put('*/api/v1/crops/my/:id', async ({ params, request }) => {
    await delay(250);
    const id = Number(params.id);
    const body = await request.json() as any;
    const ucIndex = userCrops.findIndex(u => u.id === id);
    if (ucIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    userCrops[ucIndex] = {
      ...userCrops[ucIndex],
      acreage: body.acreage !== undefined ? Number(body.acreage) : userCrops[ucIndex].acreage,
      stage: body.stage || userCrops[ucIndex].stage,
      sowing_date: body.sowing_date || userCrops[ucIndex].sowing_date,
      soil_type: body.soil_type || userCrops[ucIndex].soil_type,
      irrigation_type: body.irrigation_type || userCrops[ucIndex].irrigation_type
    };
    return HttpResponse.json(userCrops[ucIndex]);
  }),

  http.delete('*/api/v1/crops/my/:id', async ({ params }) => {
    await delay(200);
    const id = Number(params.id);
    userCrops = userCrops.filter(u => u.id !== id);
    return HttpResponse.json({ status: 'success', message: 'Crop enrollment removed successfully' });
  }),

  http.get('*/api/v1/crops/:id', async ({ params }) => {
    await delay(150);
    if (params.id === 'my') return;
    const crop = MANDYA_CROPS.find(c => c.id === Number(params.id));
    if (!crop) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(crop);
  }),

  // Weather: Current & 7-Day Forecast
  http.get('*/api/v1/weather/current', async () => {
    await delay(150);
    return HttpResponse.json(DEMO_WEATHER);
  }),

  http.get('*/api/v1/weather/forecast', async () => {
    await delay(200);
    return HttpResponse.json(DEMO_WEATHER_FORECAST);
  }),

  // Advisories: List, Detail, Recommendations & Disease Diagnosis
  http.get('*/api/v1/advisory', async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const cropId = url.searchParams.get('crop_id');
    const severity = url.searchParams.get('severity');
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    let result = [...DEMO_ADVISORIES];
    if (cropId) {
      result = result.filter(a => a.crop_id === Number(cropId));
    }
    if (severity) {
      result = result.filter(a => a.severity === severity);
    }
    if (category) {
      result = result.filter(a => a.category === category);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a =>
        a.title_en.toLowerCase().includes(s) ||
        a.title_kn.toLowerCase().includes(s) ||
        a.message_en.toLowerCase().includes(s) ||
        a.message_kn.toLowerCase().includes(s)
      );
    }
    return HttpResponse.json(result);
  }),

  http.get('*/api/v1/advisory/recommendations', async () => {
    await delay(200);
    return HttpResponse.json(DEMO_ADVISORY_RECOMMENDATIONS);
  }),

  http.post('*/api/v1/advisory/diagnose', async ({ request }) => {
    await delay(350);
    const body = await request.json() as any;
    const symptoms = (body.symptoms || '').toLowerCase();

    if (symptoms.includes('blast') || body.crop_id === 2) {
      return HttpResponse.json({
        suspected_disease_en: 'Paddy Leaf Blast (Pyricularia oryzae)',
        suspected_disease_kn: 'ಭತ್ತದ ಎಲೆ ಬೆಂಕಿ ರೋಗ (ಪೈರಿಕ್ಯುಲೇರಿಯಾ)',
        confidence_score: 0.92,
        is_ai_preview: true,
        severity: 'warning',
        symptoms_analysis_en: 'Spindle-shaped elliptical lesions with grayish-white centers and brownish margins detected on leaf blade, characteristic of fungal blast infection in humid conditions.',
        symptoms_analysis_kn: 'ಎಲೆಯ ಮೇಲೆ ಕಣ್ಣಿನಾಕಾರದ ಕಂದು ಬಣ್ಣದ ಅಂಚು ಹಾಗೂ ಬೂದು ಬಣ್ಣದ ಮಧ್ಯಭಾಗದ ಚುಕ್ಕೆಗಳು ಕಂಡುಬಂದಿದ್ದು, ಇದು ಶಿಲೀಂಧ್ರದಿಂದ ಬರುವ ಭತ್ತದ ಬೆಂಕಿ ರೋಗದ ಲಕ್ಷಣವಾಗಿದೆ.',
        immediate_remedies_en: [
          'Foliar spray of Pseudomonas fluorescens @ 10g/litre of water in the morning',
          'Withhold top-dressing of urea / nitrogen fertilizers until new leaves emerge clean',
          'Maintain 2-3 cm shallow water layer; avoid deep submergence'
        ],
        immediate_remedies_kn: [
          'ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 10 ಗ್ರಾಂ ಸ್ಯೂಡೋಮೊನಾಸ್ ಫ್ಲೋರೊಸೆಂಟ್ಸ್ ಬೆರೆಸಿ ಬೆಳಿಗ್ಗೆ ಸಿಂಪಡಿಸಿ',
          'ಹೊಸ ಎಲೆಗಳು ರೋಗಮುಕ್ತವಾಗಿ ಬರುವವರೆಗೂ ಯೂರಿಯಾ ಗೊಬ್ಬರ ನೀಡುವುದನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ',
          'ಗದ್ದೆಯಲ್ಲಿ 2-3 ಸೆಂ.ಮೀ ಮಾತ್ರ ನೀರು ನಿಲ್ಲಿಸಿ, ಅತಿಯಾದ ನೀರು ನಿಲ್ಲಿಸಬೇಡಿ'
        ],
        preventive_measures_en: [
          'Use certified blast-tolerant varieties (e.g. Tanu, Jyothi, KMP 175) in upcoming season',
          'Seed treatment with Trichoderma viride @ 4g/kg seed'
        ],
        preventive_measures_kn: [
          'ಮುಂದಿನ ಹಂಗಾಮಿನಲ್ಲಿ ರೋಗ ನಿರೋಧಕ ತಳಿಗಳನ್ನು (ತನು, ಜ್ಯೋತಿ) ಬಳಸಿ',
          'ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಬೀಜೋಪಚಾರವನ್ನು ಟ್ರೈಕೋಗ್ರಾಮ (4 ಗ್ರಾಂ/ಕೆಜಿ) ಯಿಂದ ಮಾಡಿ'
        ],
        reference_source: 'ICAR-KVK Mandya / UAS Bangalore Department of Plant Pathology',
        disclaimer_en: 'Demonstration & AI Field Preview: This analysis is an educational aid based on verified ICAR Mandya guidelines. Consult your local Raitha Samparka Kendra (RSK) agricultural officer before purchasing or applying commercial chemical inputs.',
        disclaimer_kn: 'ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಮತ್ತು AI ಮುನ್ನೋಟ: ಈ ವಿಶ್ಲೇಷಣೆಯು ಐ.ಸಿ.ಎ.ಆರ್ ಮಂಡ್ಯ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ಆಧರಿಸಿದ ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿಯಾಗಿದೆ. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಔಷಧಿಗಳನ್ನು ಖರೀದಿಸುವ ಅಥವಾ ಸಿಂಪಡಿಸುವ ಮುನ್ನ ನಿಮ್ಮ ಸ್ಥಳೀಯ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರದ (RSK) ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.'
      });
    }

    return HttpResponse.json({
      suspected_disease_en: 'Sugarcane Red Rot (Colletotrichum falcatum)',
      suspected_disease_kn: 'ಕಬ್ಬಿನ ಕೆಂಪು ಕೊಳೆ ರೋಗ (ರೆಡ್ ರಾಟ್)',
      confidence_score: 0.88,
      is_ai_preview: true,
      severity: 'critical',
      symptoms_analysis_en: 'Third or fourth leaf from crown shows yellowing and wilting. Longitudinal splitting reveals reddened internal pith tissues with cross-wise white bands.',
      symptoms_analysis_kn: 'ಸುಳಿಯ 3-4 ನೇ ಎಲೆಗಳು ಹಳದಿಯಾಗಿ ಒಣಗಲಾರಂಭಿಸಿವೆ. ಕಬ್ಬಿನ ದಂಟನ್ನು ಸೀಳಿದಾಗ ಒಳಭಾಗ ಕೆಂಪಾಗಿ ಅಡ್ಡಲಾಗಿ ಬಿಳಿ ಪಟ್ಟಿಗಳು ಕಂಡುಬಂದಿವೆ.',
      immediate_remedies_en: [
        'Uproot and immediately destroy infected clumps to prevent fungal spread to adjacent stools',
        'Sterilize cutting sickles with 1% potassium permanganate solution before touching healthy canes',
        'Ensure proper surface drainage so water does not carry spores across furrows'
      ],
      immediate_remedies_kn: [
        'ರೋಗಪೀಡಿತ ಕಬ್ಬಿನ ಬುಡಗಳನ್ನು ತಕ್ಷಣ ಕಿತ್ತು ಸುಟ್ಟುಹಾಕಿ, ಪಕ್ಕದ ಗಿಡಗಳಿಗೆ ಹರಡುವುದನ್ನು ತಪ್ಪಿಸಿ',
        'ಕಟಾವು ಕೊಡುಗೋಲುಗಳನ್ನು ಪೊಟ್ಯಾಸಿಯಂ ಪರ್ಮಾಂಗನೇಟ್ ದ್ರಾವಣದಲ್ಲಿ ಅದ್ದಿ ಕ್ರಿಮಿಮುಕ್ತಗೊಳಿಸಿ',
        'ಕಾಲುವೆ ನೀರು ರೋಗಪೀಡಿತ ಸಾಲಿನಿಂದ ಆರೋಗ್ಯವಂತ ಸಾಲಿಗೆ ಹರಿಯದಂತೆ ಬಸಿಗಾಲುವೆ ಮಾಡಿ'
      ],
      preventive_measures_en: [
        'Plant resistant cultivars (Co 86032, VSI 434) from disease-free nursery plots',
        'Dip setts in Trichoderma viride slurry before planting'
      ],
      preventive_measures_kn: [
        'ರೋಗ ನಿರೋಧಕ ತಳಿಗಳನ್ನು (ಕೋ 86032, ವಿಎಸ್‌ಐ 434) ಮಾತ್ರ ನಾಟಿ ಮಾಡಿ',
        'ನಾಟಿ ಮಾಡುವ ಮುನ್ನ ಕಬ್ಬಿನ ತುಂಡುಗಳನ್ನು ಟ್ರೈಕೋಡರ್ಮಾದಲ್ಲಿ ಅದ್ದಿ'
      ],
      reference_source: 'ICAR - Sugarcane Breeding Institute & KVK Mandya',
      disclaimer_en: 'Demonstration & AI Field Preview: This analysis is an educational aid based on verified ICAR Mandya guidelines. Consult your local Raitha Samparka Kendra (RSK) agricultural officer before purchasing or applying commercial chemical inputs.',
      disclaimer_kn: 'ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಮತ್ತು AI ಮುನ್ನೋಟ: ಈ ವಿಶ್ಲೇಷಣೆಯು ಐ.ಸಿ.ಎ.ಆರ್ ಮಂಡ್ಯ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ಆಧರಿಸಿದ ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿಯಾಗಿದೆ. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಔಷಧಿಗಳನ್ನು ಖರೀದಿಸುವ ಅಥವಾ ಸಿಂಪಡಿಸುವ ಮುನ್ನ ನಿಮ್ಮ ಸ್ಥಳೀಯ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರದ (RSK) ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.'
    });
  }),

  http.get('*/api/v1/advisory/:id', async ({ params }) => {
    await delay(150);
    const item = DEMO_ADVISORIES.find(a => a.id === Number(params.id));
    if (!item) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(item);
  }),

  // ======================================================================
  // Community Forum & Groups (F3)
  // ======================================================================

  // Group join request approve / reject
  http.post('*/api/v1/community/groups/:id/requests/:requestId/approve', async ({ params }) => {
    await delay(200);
    const reqId = Number(params.requestId);
    const req = groupMembers.find(m => m.id === reqId && m.group_id === Number(params.id));
    if (!req) return new HttpResponse(null, { status: 404 });
    req.status = 'approved';
    const grp = communityGroups.find(g => g.id === Number(params.id));
    if (grp) grp.member_count += 1;
    return HttpResponse.json(req);
  }),

  http.post('*/api/v1/community/groups/:id/requests/:requestId/reject', async ({ params }) => {
    await delay(200);
    const reqId = Number(params.requestId);
    const req = groupMembers.find(m => m.id === reqId && m.group_id === Number(params.id));
    if (!req) return new HttpResponse(null, { status: 404 });
    req.status = 'rejected';
    return HttpResponse.json(req);
  }),

  // Group pending join requests
  http.get('*/api/v1/community/groups/:id/requests', async ({ params }) => {
    await delay(200);
    const reqs = groupMembers.filter(m => m.group_id === Number(params.id) && m.status === 'pending');
    return HttpResponse.json(reqs);
  }),

  // Group member role update
  http.post('*/api/v1/community/groups/:id/members/:userId/role', async ({ params, request }) => {
    await delay(200);
    const body = await request.json() as any;
    const m = groupMembers.find(x => x.group_id === Number(params.id) && x.user_id === Number(params.userId));
    if (m) m.role = body.role;
    return HttpResponse.json({ status: 'success', message: `Member role updated to ${body.role}` });
  }),

  // Group member remove
  http.delete('*/api/v1/community/groups/:id/members/:userId', async ({ params }) => {
    await delay(200);
    const idx = groupMembers.findIndex(x => x.group_id === Number(params.id) && x.user_id === Number(params.userId));
    if (idx !== -1) groupMembers.splice(idx, 1);
    const grp = communityGroups.find(g => g.id === Number(params.id));
    if (grp && grp.member_count > 0) grp.member_count -= 1;
    return HttpResponse.json({ status: 'success', message: 'Member removed successfully' });
  }),

  // Group approved members
  http.get('*/api/v1/community/groups/:id/members', async ({ params }) => {
    await delay(200);
    const members = groupMembers.filter(m => m.group_id === Number(params.id) && m.status === 'approved');
    return HttpResponse.json(members);
  }),

  // Group announcements
  http.get('*/api/v1/community/groups/:id/announcements', async ({ params }) => {
    await delay(200);
    const res = announcements.filter(a => a.group_id === Number(params.id));
    return HttpResponse.json(res);
  }),

  http.post('*/api/v1/community/groups/:id/announcements', async ({ params, request }) => {
    await delay(250);
    const body = await request.json() as any;
    const newAnn: GroupAnnouncement = {
      id: announcements.length + 1,
      group_id: Number(params.id),
      author_id: currentUser.id,
      author_name: `${currentUser.full_name || 'Ramesh Gowda'} (Admin)`,
      title: body.title,
      content: body.content,
      priority: body.priority || 'normal',
      created_at: new Date().toISOString()
    };
    announcements.unshift(newAnn);
    return HttpResponse.json(newAnn, { status: 201 });
  }),

  // Join group request
  http.post('*/api/v1/community/groups/:id/join', async ({ params }) => {
    await delay(250);
    const groupId = Number(params.id);
    const existing = groupMembers.find(m => m.group_id === groupId && m.user_id === currentUser.id);
    if (existing) {
      return HttpResponse.json({ status: existing.status, message: `Status: ${existing.status}` });
    }
    const newMember: GroupMember = {
      id: groupMembers.length + 1,
      group_id: groupId,
      user_id: currentUser.id,
      user_name: currentUser.full_name || 'Ramesh Gowda',
      user_phone: currentUser.phone_number || '9845012345',
      user_village: currentUser.location?.village || 'Shivapura',
      role: 'member',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    groupMembers.push(newMember);
    const grp = communityGroups.find(g => g.id === groupId);
    if (grp) grp.membership_status = 'pending';
    return HttpResponse.json({ status: 'pending', message: 'Join request submitted for moderator approval' });
  }),

  // Group detail
  http.get('*/api/v1/community/groups/:id', async ({ params }) => {
    await delay(200);
    const g = communityGroups.find(x => x.id === Number(params.id));
    if (!g) return new HttpResponse(null, { status: 404 });
    const m = groupMembers.find(mem => mem.group_id === g.id && mem.user_id === currentUser.id);
    return HttpResponse.json({
      ...g,
      membership_status: m ? (m.status === 'approved' ? m.role : m.status) : null
    });
  }),

  // Group list & discover
  http.get('*/api/v1/community/groups', async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const taluk = url.searchParams.get('taluk');
    const village = url.searchParams.get('village');
    const cropId = url.searchParams.get('crop_id');
    const search = url.searchParams.get('search');

    let result = communityGroups.map(g => {
      const m = groupMembers.find(mem => mem.group_id === g.id && mem.user_id === currentUser.id);
      return {
        ...g,
        membership_status: m ? (m.status === 'approved' ? m.role : m.status) : null
      };
    });

    if (taluk) {
      const t = taluk.toLowerCase();
      result = result.filter(g => g.taluk.toLowerCase().includes(t));
    }
    if (village) {
      const v = village.toLowerCase();
      result = result.filter(g => g.village && g.village.toLowerCase().includes(v));
    }
    if (cropId) {
      result = result.filter(g => g.crop_id === Number(cropId));
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(g =>
        g.name_en.toLowerCase().includes(s) ||
        g.name_kn.toLowerCase().includes(s) ||
        (g.description_en && g.description_en.toLowerCase().includes(s)) ||
        (g.description_kn && g.description_kn.toLowerCase().includes(s))
      );
    }
    return HttpResponse.json(result);
  }),

  // Create group
  http.post('*/api/v1/community/groups', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    const crop = MANDYA_CROPS.find(c => c.id === Number(body.crop_id));
    const newGroup: CommunityGroup = {
      id: communityGroups.length + 1,
      name_en: body.name_en,
      name_kn: body.name_kn,
      taluk: body.taluk,
      village: body.village,
      district: body.district || 'Mandya',
      crop_id: body.crop_id ? Number(body.crop_id) : null,
      crop_name_en: crop?.name_en,
      crop_name_kn: crop?.name_kn,
      creator_id: currentUser.id,
      description_en: body.description_en || null,
      description_kn: body.description_kn || null,
      rules_en: body.rules_en || null,
      rules_kn: body.rules_kn || null,
      image_url: body.image_url || null,
      member_count: 1,
      is_active: true,
      membership_status: 'admin',
      created_at: new Date().toISOString()
    };
    communityGroups.unshift(newGroup);
    groupMembers.push({
      id: groupMembers.length + 1,
      group_id: newGroup.id,
      user_id: currentUser.id,
      user_name: currentUser.full_name || 'Ramesh Gowda',
      user_phone: currentUser.phone_number || '9845012345',
      user_village: currentUser.location?.village || 'Shivapura',
      role: 'admin',
      status: 'approved',
      created_at: new Date().toISOString()
    });
    return HttpResponse.json(newGroup, { status: 201 });
  }),

  // Post comments list
  http.get('*/api/v1/community/posts/:id/comments', async ({ params }) => {
    await delay(150);
    const res = comments.filter(c => c.post_id === Number(params.id));
    return HttpResponse.json(res);
  }),

  // Post comment create
  http.post('*/api/v1/community/posts/:id/comments', async ({ params, request }) => {
    await delay(250);
    const body = await request.json() as any;
    const newComment: PostComment = {
      id: comments.length + 1,
      post_id: Number(params.id),
      author_id: currentUser.id,
      author_name: currentUser.full_name || 'Ramesh Gowda',
      author_village: currentUser.location?.village || 'Shivapura',
      parent_id: body.parent_id ? Number(body.parent_id) : null,
      content: body.content,
      likes_count: 0,
      created_at: new Date().toISOString()
    };
    comments.push(newComment);
    const p = posts.find(x => x.id === Number(params.id));
    if (p) p.comments_count += 1;
    return HttpResponse.json(newComment, { status: 201 });
  }),

  // Post like toggle
  http.post('*/api/v1/community/posts/:id/like', async ({ params }) => {
    await delay(150);
    const postId = Number(params.id);
    const post = posts.find(p => p.id === postId);
    if (!post) return new HttpResponse(null, { status: 404 });
    let is_liked = false;
    if (likedPostIds.has(postId)) {
      likedPostIds.delete(postId);
      post.likes_count = Math.max(0, post.likes_count - 1);
      is_liked = false;
    } else {
      likedPostIds.add(postId);
      post.likes_count += 1;
      is_liked = true;
    }
    post.is_liked = is_liked;
    return HttpResponse.json({ is_liked, likes_count: post.likes_count });
  }),

  // Post save toggle
  http.post('*/api/v1/community/posts/:id/save', async ({ params }) => {
    await delay(150);
    const postId = Number(params.id);
    const post = posts.find(p => p.id === postId);
    if (!post) return new HttpResponse(null, { status: 404 });
    let is_saved = false;
    if (savedPostIds.has(postId)) {
      savedPostIds.delete(postId);
      is_saved = false;
    } else {
      savedPostIds.add(postId);
      is_saved = true;
    }
    post.is_saved = is_saved;
    return HttpResponse.json({
      is_saved,
      message: is_saved ? 'Post saved to your bookmarks' : 'Post removed from saved bookmarks'
    });
  }),

  // Post report
  http.post('*/api/v1/community/posts/:id/report', async ({ params, request }) => {
    await delay(250);
    const postId = Number(params.id);
    const body = await request.json() as any;
    return HttpResponse.json({
      id: Date.now(),
      user_id: currentUser.id,
      post_id: postId,
      comment_id: body.comment_id || null,
      reason: body.reason,
      details: body.details || null,
      status: 'pending',
      created_at: new Date().toISOString()
    }, { status: 201 });
  }),

  // Post detail
  http.get('*/api/v1/community/posts/:id', async ({ params }) => {
    await delay(200);
    const post = posts.find(p => p.id === Number(params.id));
    if (!post) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({
      ...post,
      is_liked: likedPostIds.has(post.id),
      is_saved: savedPostIds.has(post.id)
    });
  }),

  // Community Posts feed
  http.get('*/api/v1/community/posts', async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const cropId = url.searchParams.get('crop_id');
    const topic = url.searchParams.get('topic');
    const taluk = url.searchParams.get('taluk');
    const village = url.searchParams.get('village');
    const groupId = url.searchParams.get('group_id');
    const filterType = url.searchParams.get('filter_type');
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 20);

    let result = posts.map(p => ({
      ...p,
      is_liked: likedPostIds.has(p.id),
      is_saved: savedPostIds.has(p.id)
    }));

    if (groupId) {
      result = result.filter(p => p.group_id === Number(groupId));
    }
    if (cropId) {
      result = result.filter(p => p.crop_id === Number(cropId));
    }
    if (topic && topic !== 'all') {
      result = result.filter(p => p.topic === topic);
    }
    if (filterType === 'my') {
      result = result.filter(p => p.author_id === currentUser.id);
    } else if (filterType === 'saved') {
      result = result.filter(p => savedPostIds.has(p.id));
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(s) ||
        p.content.toLowerCase().includes(s)
      );
    }
    if (taluk) {
      const t = taluk.toLowerCase();
      result = result.filter(p => p.author_taluk && p.author_taluk.toLowerCase().includes(t));
    }
    if (village) {
      const v = village.toLowerCase();
      result = result.filter(p => p.author_village && p.author_village.toLowerCase().includes(v));
    }

    const offset = (page - 1) * limit;
    const paginated = result.slice(offset, offset + limit);
    return HttpResponse.json(paginated);
  }),

  // Create post
  http.post('*/api/v1/community/posts', async ({ request }) => {
    await delay(300);
    const body = await request.json() as any;
    const crop = MANDYA_CROPS.find(c => c.id === Number(body.crop_id));
    const group = communityGroups.find(g => g.id === Number(body.group_id));
    const newPost: CommunityPost = {
      id: posts.length + 1,
      group_id: body.group_id ? Number(body.group_id) : null,
      group_name: group ? (group.name_kn || group.name_en) : null,
      author_id: currentUser.id,
      author_name: currentUser.full_name || 'Ramesh Gowda',
      author_village: currentUser.location?.village || 'Shivapura',
      author_taluk: currentUser.location?.taluk || 'Maddur',
      author_role: currentUser.role || 'farmer',
      crop_id: body.crop_id ? Number(body.crop_id) : null,
      crop_name_en: crop?.name_en,
      crop_name_kn: crop?.name_kn,
      title: body.title,
      content: body.content,
      image_url: body.image_url || null,
      topic: body.topic || 'general',
      language: body.language || currentUser.preferred_language || 'kn',
      likes_count: 0,
      comments_count: 0,
      is_pinned: false,
      is_liked: false,
      is_saved: false,
      created_at: new Date().toISOString()
    };
    posts.unshift(newPost);
    return HttpResponse.json(newPost, { status: 201 });
  }),

  // Market Listings
  http.get('*/api/v1/market/listings', async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const cropId = url.searchParams.get('crop_id');
    const variety = url.searchParams.get('variety');
    const taluk = url.searchParams.get('taluk');
    const status = url.searchParams.get('status');
    const isCollective = url.searchParams.get('is_collective');
    const filterType = url.searchParams.get('filter_type');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sort_by');

    let result = [...marketListings];

    // Status filter
    if (status && status !== 'all') {
      if (status === 'available' || status === 'active') {
        result = result.filter(l => l.status === 'active' || (l.status as string) === 'available');
      } else {
        result = result.filter(l => l.status === status);
      }
    } else if (!status && filterType !== 'my') {
      result = result.filter(l => l.status === 'active' || (l.status as string) === 'available');
    }

    if (cropId) {
      result = result.filter(l => l.crop_id === Number(cropId));
    }
    if (variety) {
      result = result.filter(l => l.variety?.toLowerCase().includes(variety.toLowerCase()));
    }
    if (taluk) {
      result = result.filter(l => l.taluk?.toLowerCase() === taluk.toLowerCase());
    }
    if (isCollective !== null && isCollective !== undefined && isCollective !== '') {
      const isColBool = isCollective === 'true';
      result = result.filter(l => l.is_collective === isColBool);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(l =>
        l.variety?.toLowerCase().includes(s) ||
        l.description?.toLowerCase().includes(s) ||
        l.village?.toLowerCase().includes(s) ||
        l.taluk?.toLowerCase().includes(s) ||
        l.farmer_name?.toLowerCase().includes(s) ||
        l.crop_name_en?.toLowerCase().includes(s) ||
        l.crop_name_kn?.toLowerCase().includes(s)
      );
    }
    if (filterType === 'my') {
      result = result.filter(l => l.farmer_id === currentUser.id);
    }
    if (filterType === 'saved') {
      result = result.filter(l => savedListingIds.has(l.id));
    }

    // Sorting
    if (sortBy === 'price_asc' || sortBy === 'price_low') {
      result.sort((a, b) => a.price_per_unit - b.price_per_unit);
    } else if (sortBy === 'price_desc' || sortBy === 'price_high') {
      result.sort((a, b) => b.price_per_unit - a.price_per_unit);
    } else if (sortBy === 'harvest_soon') {
      result.sort((a, b) => {
        const da = a.harvest_date ? new Date(a.harvest_date).getTime() : Infinity;
        const db = b.harvest_date ? new Date(b.harvest_date).getTime() : Infinity;
        return da - db;
      });
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Attach computed attributes
    const formatted = result.map(l => {
      const relatedContribs = groupContributions.filter(c => c.listing_id === l.id);
      const relatedEnquiries = marketEnquiries.filter(e => e.listing_id === l.id);
      return {
        ...l,
        is_saved: savedListingIds.has(l.id),
        enquiries_count: relatedEnquiries.length,
        contributions_count: relatedContribs.length,
        contributions: l.is_collective ? relatedContribs : undefined
      };
    });

    return HttpResponse.json(formatted);
  }),

  // Create Produce Listing
  http.post('*/api/v1/market/listings', async ({ request }) => {
    await delay(350);
    const body = await request.json() as any;
    const cropObj = MANDYA_CROPS.find(c => c.id === Number(body.crop_id));
    const isCol = Boolean(body.is_collective);
    const group = isCol && body.group_id ? communityGroups.find(g => g.id === Number(body.group_id)) : null;

    const newId = marketListings.length > 0 ? Math.max(...marketListings.map(l => l.id)) + 1 : 1;
    const newListing: MarketListing = {
      id: newId,
      farmer_id: currentUser.id,
      group_id: isCol ? Number(body.group_id) : undefined,
      crop_id: Number(body.crop_id),
      variety: body.variety || 'Local Mandya Selection',
      quantity: Number(body.quantity),
      unit: body.unit || 'quintal',
      price_per_unit: Number(body.price_per_unit),
      harvest_date: body.harvest_date || new Date().toISOString(),
      available_from: body.available_from || new Date().toISOString(),
      available_until: body.available_until || undefined,
      village: body.village || currentUser.location?.village || 'Shivapura',
      taluk: body.taluk || currentUser.location?.taluk || 'Maddur',
      district: body.district || 'Mandya',
      pickup_address: body.pickup_address || `${currentUser.location?.village || 'Shivapura'} Farm Gate`,
      image_url: body.image_url || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800',
      is_collective: isCol,
      status: 'active',
      description: body.description || '',
      created_at: new Date().toISOString(),
      farmer_name: currentUser.full_name,
      farmer_phone: currentUser.phone_number,
      farmer_village: currentUser.location?.village || 'Shivapura',
      group_name: group ? (group.name_kn || group.name_en) : undefined,
      crop_name_en: cropObj?.name_en || 'Farm Produce',
      crop_name_kn: cropObj?.name_kn || 'ಕೃಷಿ ಉತ್ಪನ್ನ',
      is_saved: false,
      enquiries_count: 0,
      contributions_count: isCol ? 1 : 0
    };

    if (isCol) {
      const contribId = groupContributions.length > 0 ? Math.max(...groupContributions.map(c => c.id)) + 1 : 1;
      const initialContrib: GroupListingContribution = {
        id: contribId,
        listing_id: newId,
        farmer_id: currentUser.id,
        farmer_name: currentUser.full_name,
        farmer_phone: currentUser.phone_number,
        farmer_village: currentUser.location?.village || 'Shivapura',
        quantity: Number(body.quantity),
        unit: body.unit || 'quintal',
        notes: 'Initial collective listing contribution',
        created_at: new Date().toISOString()
      };
      groupContributions.unshift(initialContrib);
      newListing.contributions = [initialContrib];
    }

    marketListings.unshift(newListing);
    return HttpResponse.json(newListing, { status: 201 });
  }),

  // Get Single Produce Listing Detail
  http.get('*/api/v1/market/listings/:id', async ({ params }) => {
    await delay(150);
    const listingId = Number(params.id);
    const listing = marketListings.find(l => l.id === listingId);
    if (!listing) {
      return HttpResponse.json({ detail: 'Produce listing not found.' }, { status: 404 });
    }
    const relatedContribs = groupContributions.filter(c => c.listing_id === listing.id);
    const relatedEnquiries = marketEnquiries.filter(e => e.listing_id === listing.id);
    return HttpResponse.json({
      ...listing,
      is_saved: savedListingIds.has(listing.id),
      enquiries_count: relatedEnquiries.length,
      contributions_count: relatedContribs.length,
      contributions: listing.is_collective ? relatedContribs : undefined
    });
  }),

  // Update Produce Listing Details
  http.put('*/api/v1/market/listings/:id', async ({ params, request }) => {
    await delay(250);
    const listingId = Number(params.id);
    const listingIndex = marketListings.findIndex(l => l.id === listingId);
    if (listingIndex === -1) {
      return HttpResponse.json({ detail: 'Produce listing not found.' }, { status: 404 });
    }
    const body = await request.json() as any;
    marketListings[listingIndex] = {
      ...marketListings[listingIndex],
      ...body,
      updated_at: new Date().toISOString()
    };
    return HttpResponse.json(marketListings[listingIndex]);
  }),

  // Update Produce Listing Status (Pause, Reactivate, Mark Sold)
  http.patch('*/api/v1/market/listings/:id/status', async ({ params, request }) => {
    await delay(200);
    const listingId = Number(params.id);
    const url = new URL(request.url);
    const newStatus = url.searchParams.get('status') as 'active' | 'paused' | 'reserved' | 'sold';
    const listing = marketListings.find(l => l.id === listingId);
    if (!listing) {
      return HttpResponse.json({ detail: 'Produce listing not found.' }, { status: 404 });
    }
    listing.status = newStatus;
    listing.updated_at = new Date().toISOString();
    return HttpResponse.json({
      status: 'success',
      listing_status: newStatus,
      message: `Listing status updated to ${newStatus}`
    });
  }),

  // Delete Produce Listing
  http.delete('*/api/v1/market/listings/:id', async ({ params }) => {
    await delay(250);
    const listingId = Number(params.id);
    marketListings = marketListings.filter(l => l.id !== listingId);
    return HttpResponse.json({ status: 'success', message: 'Listing deleted successfully' });
  }),

  // Toggle Save Produce Listing
  http.post('*/api/v1/market/listings/:id/save', async ({ params }) => {
    await delay(150);
    const listingId = Number(params.id);
    const listing = marketListings.find(l => l.id === listingId);
    if (!listing) {
      return HttpResponse.json({ detail: 'Produce listing not found.' }, { status: 404 });
    }
    if (savedListingIds.has(listingId)) {
      savedListingIds.delete(listingId);
      return HttpResponse.json({ is_saved: false, message: 'Removed from saved listings' });
    } else {
      savedListingIds.add(listingId);
      return HttpResponse.json({ is_saved: true, message: 'Added to saved listings' });
    }
  }),

  // Contribute to Collective Group Listing
  http.post('*/api/v1/market/listings/:id/contribute', async ({ params, request }) => {
    await delay(300);
    const listingId = Number(params.id);
    const listing = marketListings.find(l => l.id === listingId);
    if (!listing) {
      return HttpResponse.json({ detail: 'Listing not found.' }, { status: 404 });
    }
    const body = await request.json() as any;
    const contribId = groupContributions.length > 0 ? Math.max(...groupContributions.map(c => c.id)) + 1 : 1;
    const contrib: GroupListingContribution = {
      id: contribId,
      listing_id: listingId,
      farmer_id: currentUser.id,
      farmer_name: currentUser.full_name,
      farmer_phone: currentUser.phone_number,
      farmer_village: currentUser.location?.village || 'Shivapura',
      quantity: Number(body.quantity),
      unit: body.unit || listing.unit,
      notes: body.notes || 'Group member harvest contribution',
      created_at: new Date().toISOString()
    };
    groupContributions.unshift(contrib);
    listing.quantity += Number(body.quantity);
    listing.contributions_count = (listing.contributions_count || 0) + 1;
    if (listing.contributions) {
      listing.contributions.unshift(contrib);
    }
    return HttpResponse.json(contrib, { status: 201 });
  }),

  // Market Enquiries List
  http.get('*/api/v1/market/enquiries', async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');

    let result = [...marketEnquiries];
    if (role === 'farmer') {
      result = result.filter(e => e.farmer_id === currentUser.id);
    } else if (role === 'buyer') {
      result = result.filter(e => e.buyer_id === currentUser.id);
    } else {
      result = result.filter(e => e.farmer_id === currentUser.id || e.buyer_id === currentUser.id);
    }

    if (status && status !== 'all') {
      result = result.filter(e => e.status === status);
    }

    // Attach messages
    result = result.map(e => ({
      ...e,
      messages: enquiryMessages.filter(m => m.enquiry_id === e.id)
    }));

    return HttpResponse.json(result);
  }),

  // Create Enquiry
  http.post('*/api/v1/market/enquiries', async ({ request }) => {
    await delay(350);
    const body = await request.json() as any;
    const listing = marketListings.find(l => l.id === Number(body.listing_id));
    if (!listing) {
      return HttpResponse.json({ detail: 'Produce listing not found.' }, { status: 404 });
    }

    const newEnquiryId = marketEnquiries.length > 0 ? Math.max(...marketEnquiries.map(e => e.id)) + 1 : 1;
    const initialMessage: EnquiryMessage = {
      id: enquiryMessages.length > 0 ? Math.max(...enquiryMessages.map(m => m.id)) + 1 : 1,
      enquiry_id: newEnquiryId,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_role: currentUser.active_role || currentUser.role || 'buyer',
      message: body.message || 'Direct purchase enquiry from buyer.',
      proposed_price: body.offered_price ? Number(body.offered_price) : listing.price_per_unit,
      created_at: new Date().toISOString()
    };
    enquiryMessages.push(initialMessage);

    const newEnquiry: MarketEnquiry = {
      id: newEnquiryId,
      listing_id: listing.id,
      buyer_id: currentUser.id,
      quantity_requested: Number(body.quantity_requested),
      offered_price: body.offered_price ? Number(body.offered_price) : listing.price_per_unit,
      message: body.message || '',
      status: 'pending',
      created_at: new Date().toISOString(),
      buyer_name: currentUser.full_name,
      buyer_phone: currentUser.phone_number,
      buyer_village: currentUser.location?.village || 'Mandya',
      listing_title: `${listing.crop_name_en || 'Produce'} (${listing.variety})`,
      listing_crop_en: listing.crop_name_en,
      listing_crop_kn: listing.crop_name_kn,
      listing_price: listing.price_per_unit,
      listing_unit: listing.unit,
      farmer_id: listing.farmer_id,
      farmer_name: listing.farmer_name,
      messages: [initialMessage]
    };
    marketEnquiries.unshift(newEnquiry);

    // Create Notification
    notifications.unshift({
      id: notifications.length + 1,
      user_id: listing.farmer_id,
      title_en: `New Buyer Enquiry for ${listing.crop_name_en || 'Produce'}`,
      title_kn: `${listing.crop_name_kn || 'ಬೆಳೆ'} ಬೆಳೆಗೆ ಹೊಸ ಖರೀದಿ ವಿಚಾರಣೆ`,
      message_en: `${currentUser.full_name} sent a purchase enquiry for ${body.quantity_requested} ${listing.unit} at ₹${body.offered_price || listing.price_per_unit}/${listing.unit}.`,
      message_kn: `${currentUser.full_name} ಅವರು ${body.quantity_requested} ${listing.unit} ಪ್ರಮಾಣಕ್ಕೆ ವಿಚಾರಣೆ ಕಳುಹಿಸಿದ್ದಾರೆ.`,
      type: 'market',
      is_read: false,
      created_at: new Date().toISOString()
    });

    return HttpResponse.json(newEnquiry, { status: 201 });
  }),

  // Get Enquiry Detail
  http.get('*/api/v1/market/enquiries/:id', async ({ params }) => {
    await delay(150);
    const enquiryId = Number(params.id);
    const enquiry = marketEnquiries.find(e => e.id === enquiryId);
    if (!enquiry) {
      return HttpResponse.json({ detail: 'Enquiry not found.' }, { status: 404 });
    }
    return HttpResponse.json({
      ...enquiry,
      messages: enquiryMessages.filter(m => m.enquiry_id === enquiryId)
    });
  }),

  // Update Enquiry Status (Accept, Decline, Cancel, Close)
  http.patch('*/api/v1/market/enquiries/:id/status', async ({ params, request }) => {
    await delay(250);
    const enquiryId = Number(params.id);
    const enquiry = marketEnquiries.find(e => e.id === enquiryId);
    if (!enquiry) {
      return HttpResponse.json({ detail: 'Enquiry not found.' }, { status: 404 });
    }
    const body = await request.json() as any;
    enquiry.status = body.status;
    enquiry.updated_at = new Date().toISOString();

    // Create Notification
    notifications.unshift({
      id: notifications.length + 1,
      user_id: enquiry.buyer_id,
      title_en: `Produce Enquiry ${body.status.charAt(0).toUpperCase() + body.status.slice(1)}`,
      title_kn: `ಖರೀದಿ ವಿಚಾರಣೆ ${body.status}`,
      message_en: `Your enquiry for ${enquiry.listing_crop_en || 'produce'} has been updated to ${body.status}.`,
      message_kn: `ನಿಮ್ಮ ಖರೀದಿ ವಿಚಾರಣೆಯು ${body.status} ಸ್ಥಿತಿಗೆ ಬದಲಾಗಿದೆ.`,
      type: 'market',
      is_read: false,
      created_at: new Date().toISOString()
    });

    return HttpResponse.json(enquiry);
  }),

  // Send Message in Enquiry Thread
  http.post('*/api/v1/market/enquiries/:id/messages', async ({ params, request }) => {
    await delay(250);
    const enquiryId = Number(params.id);
    const enquiry = marketEnquiries.find(e => e.id === enquiryId);
    if (!enquiry) {
      return HttpResponse.json({ detail: 'Enquiry not found.' }, { status: 404 });
    }
    const body = await request.json() as any;
    const newMsgId = enquiryMessages.length > 0 ? Math.max(...enquiryMessages.map(m => m.id)) + 1 : 1;
    const newMsg: EnquiryMessage = {
      id: newMsgId,
      enquiry_id: enquiryId,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_role: currentUser.active_role || currentUser.role || 'farmer',
      message: body.message,
      proposed_price: body.proposed_price ? Number(body.proposed_price) : undefined,
      created_at: new Date().toISOString()
    };
    enquiryMessages.push(newMsg);

    if (body.proposed_price) {
      enquiry.offered_price = Number(body.proposed_price);
    }
    enquiry.updated_at = new Date().toISOString();

    return HttpResponse.json(newMsg, { status: 201 });
  }),

  // --- Profile Endpoints (F5) ---
  http.get('*/api/v1/profile', async ({ request }) => {
    await delay(150);
    const authHeader = request.headers.get('Authorization') || '';
    if (authHeader.includes('admin') || authHeader.includes('user_99')) {
      return HttpResponse.json(adminUser);
    }
    return HttpResponse.json(currentUser);
  }),

  http.put('*/api/v1/profile', async ({ request }) => {
    await delay(250);
    const body = await request.json() as any;
    const authHeader = request.headers.get('Authorization') || '';
    const isAdmin = authHeader.includes('admin') || authHeader.includes('user_99');
    const targetUser = isAdmin ? adminUser : currentUser;

    if (body.full_name !== undefined) targetUser.full_name = body.full_name;
    if (body.email !== undefined) targetUser.email = body.email;
    if (body.bio !== undefined) targetUser.bio = body.bio;
    if (body.preferred_language !== undefined) targetUser.preferred_language = body.preferred_language;
    if (body.farm_size_acres !== undefined) targetUser.farm_size_acres = body.farm_size_acres;
    if (body.farming_type !== undefined) targetUser.farming_type = body.farming_type;
    if (body.irrigation_source !== undefined) targetUser.irrigation_source = body.irrigation_source;
    if (body.profile_photo_url !== undefined) targetUser.profile_photo_url = body.profile_photo_url;
    if (body.buyer_business_name !== undefined) targetUser.buyer_business_name = body.buyer_business_name;
    if (body.buyer_type !== undefined) targetUser.buyer_type = body.buyer_type;
    if (body.buyer_license_no !== undefined) targetUser.buyer_license_no = body.buyer_license_no;
    if (body.text_size !== undefined) targetUser.text_size = body.text_size;
    if (body.data_saver !== undefined) targetUser.data_saver = body.data_saver;
    if (body.phone_visible !== undefined) targetUser.phone_visible = body.phone_visible;
    if (body.location_id !== undefined) {
      targetUser.location_id = body.location_id;
      targetUser.location = MANDYA_LOCATIONS.find(l => l.id === body.location_id) || targetUser.location;
    }

    // Keep allUsers in sync
    const idx = allUsers.findIndex(u => u.id === targetUser.id);
    if (idx !== -1) {
      allUsers[idx] = { ...targetUser };
    }

    return HttpResponse.json(targetUser);
  }),

  // --- Notification Center (F5) ---
  http.get('*/api/v1/notifications', async ({ request }) => {
    await delay(150);
    const url = new URL(request.url);
    const typeFilter = url.searchParams.get('type');
    const unreadOnly = url.searchParams.get('unread_only') === 'true';

    let result = [...notifications];
    if (typeFilter && typeFilter !== 'all') {
      result = result.filter(n => n.type === typeFilter);
    }
    if (unreadOnly) {
      result = result.filter(n => !n.is_read);
    }
    return HttpResponse.json(result);
  }),

  http.patch('*/api/v1/notifications/:id/read', async ({ params }) => {
    const notif = notifications.find(n => n.id === Number(params.id));
    if (notif) {
      notif.is_read = true;
    }
    return HttpResponse.json(notif);
  }),

  http.patch('*/api/v1/notifications/read-all', async () => {
    await delay(150);
    notifications.forEach(n => {
      n.is_read = true;
    });
    return HttpResponse.json({ message: 'All notifications marked as read', count: notifications.length });
  }),

  http.get('*/api/v1/notifications/preferences', async () => {
    await delay(150);
    return HttpResponse.json(notificationPreferences);
  }),

  http.put('*/api/v1/notifications/preferences', async ({ request }) => {
    await delay(200);
    const body = await request.json() as any;
    notificationPreferences = {
      ...notificationPreferences,
      ...body,
      updated_at: new Date().toISOString()
    };
    return HttpResponse.json(notificationPreferences);
  }),

  // --- Help & Support Tickets (F5) ---
  http.post('*/api/v1/support/tickets', async ({ request }) => {
    await delay(250);
    const body = await request.json() as any;
    const newId = supportTickets.length > 0 ? Math.max(...supportTickets.map(t => t.id)) + 1 : 1;
    const newTicket: SupportTicket = {
      id: newId,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_phone: currentUser.phone_number,
      category: body.category || 'General',
      subject: body.subject,
      description: body.description,
      status: 'open',
      created_at: new Date().toISOString()
    };
    supportTickets.unshift(newTicket);
    return HttpResponse.json(newTicket, { status: 201 });
  }),

  http.get('*/api/v1/support/tickets', async () => {
    await delay(150);
    return HttpResponse.json(supportTickets);
  }),

  // --- Platform Administration Endpoints (F5) ---
  http.get('*/api/v1/admin/stats', async ({ request }) => {
    await delay(150);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    const stats: AdminPlatformStats = {
      total_users: allUsers.length,
      total_farmers: allUsers.filter(u => u.role === 'farmer' || u.roles?.includes('farmer')).length,
      total_buyers: allUsers.filter(u => u.role === 'buyer' || u.roles?.includes('buyer')).length,
      total_listings: marketListings.length,
      total_groups: communityGroups.length,
      pending_reports_count: contentReports.filter(r => r.status === 'pending').length,
      open_tickets_count: supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
      total_advisories_count: DEMO_ADVISORIES.length
    };
    return HttpResponse.json(stats);
  }),

  http.get('*/api/v1/admin/users', async ({ request }) => {
    await delay(150);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    const url = new URL(request.url);
    const roleFilter = url.searchParams.get('role');
    const statusFilter = url.searchParams.get('status');
    const search = url.searchParams.get('search')?.toLowerCase();

    let users = [...allUsers];
    if (roleFilter && roleFilter !== 'all') {
      users = users.filter(u => u.role === roleFilter || u.roles?.includes(roleFilter));
    }
    if (statusFilter === 'active') {
      users = users.filter(u => u.is_active);
    } else if (statusFilter === 'suspended') {
      users = users.filter(u => !u.is_active);
    }
    if (search) {
      users = users.filter(u =>
        u.full_name?.toLowerCase().includes(search) ||
        u.phone_number?.includes(search) ||
        u.bio?.toLowerCase().includes(search)
      );
    }
    return HttpResponse.json(users);
  }),

  http.patch('*/api/v1/admin/users/:id/status', async ({ params, request }) => {
    await delay(200);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    const userId = Number(params.id);
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
      return HttpResponse.json({ detail: 'User not found.' }, { status: 404 });
    }
    const body = await request.json() as any;
    user.is_active = body.is_active;

    auditLogs.unshift({
      id: auditLogs.length + 1,
      admin_id: 99,
      admin_name: 'Mandya Krishi Admin',
      action: user.is_active ? 'reinstate_user' : 'suspend_user',
      target_type: 'user',
      target_id: userId,
      details: `User status changed to ${user.is_active ? 'active' : 'suspended'}`,
      created_at: new Date().toISOString()
    });

    return HttpResponse.json(user);
  }),

  http.patch('*/api/v1/admin/users/:id/badges', async ({ params, request }) => {
    await delay(200);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    const userId = Number(params.id);
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
      return HttpResponse.json({ detail: 'User not found.' }, { status: 404 });
    }
    const body = await request.json() as any;
    if (body.is_verified !== undefined) user.is_verified = body.is_verified;
    if (body.is_expert !== undefined) user.is_expert = body.is_expert;

    auditLogs.unshift({
      id: auditLogs.length + 1,
      admin_id: 99,
      admin_name: 'Mandya Krishi Admin',
      action: 'update_badges',
      target_type: 'user',
      target_id: userId,
      details: `Badges updated: verified=${user.is_verified}, expert=${user.is_expert}`,
      created_at: new Date().toISOString()
    });

    return HttpResponse.json(user);
  }),

  http.get('*/api/v1/admin/reports', async ({ request }) => {
    await delay(150);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    let reports = [...contentReports];
    if (status && status !== 'all') {
      reports = reports.filter(r => r.status === status);
    }
    return HttpResponse.json(reports);
  }),

  http.patch('*/api/v1/admin/reports/:id/resolve', async ({ params, request }) => {
    await delay(250);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    const reportId = Number(params.id);
    const report = contentReports.find(r => r.id === reportId);
    if (!report) {
      return HttpResponse.json({ detail: 'Report not found.' }, { status: 404 });
    }
    const body = await request.json() as any;
    report.status = 'reviewed';

    if (body.action === 'take_down' && report.post_id) {
      posts = posts.filter(p => p.id !== report.post_id);
    }

    auditLogs.unshift({
      id: auditLogs.length + 1,
      admin_id: 99,
      admin_name: 'Mandya Krishi Admin',
      action: `report_${body.action || 'resolved'}`,
      target_type: 'post',
      target_id: report.post_id || reportId,
      details: body.notes || `Report resolved via ${body.action}`,
      created_at: new Date().toISOString()
    });

    return HttpResponse.json({
      message: 'Report resolved successfully.',
      report_id: reportId,
      action: body.action
    });
  }),

  http.patch('*/api/v1/admin/reports/:id/dismiss', async ({ params, request }) => {
    await delay(200);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    const reportId = Number(params.id);
    const report = contentReports.find(r => r.id === reportId);
    if (!report) {
      return HttpResponse.json({ detail: 'Report not found.' }, { status: 404 });
    }
    report.status = 'dismissed';

    auditLogs.unshift({
      id: auditLogs.length + 1,
      admin_id: 99,
      admin_name: 'Mandya Krishi Admin',
      action: 'report_dismissed',
      target_type: 'report',
      target_id: reportId,
      details: 'Report dismissed after review; content found compliant.',
      created_at: new Date().toISOString()
    });

    return HttpResponse.json({ message: 'Report dismissed.' });
  }),

  http.get('*/api/v1/admin/groups', async ({ request }) => {
    await delay(150);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    return HttpResponse.json(communityGroups);
  }),

  http.patch('*/api/v1/admin/groups/:id/status', async ({ params, request }) => {
    await delay(200);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    const groupId = Number(params.id);
    const grp = communityGroups.find(g => g.id === groupId);
    if (!grp) {
      return HttpResponse.json({ detail: 'Group not found.' }, { status: 404 });
    }
    const body = await request.json() as any;
    grp.is_active = body.is_active;

    auditLogs.unshift({
      id: auditLogs.length + 1,
      admin_id: 99,
      admin_name: 'Mandya Krishi Admin',
      action: grp.is_active ? 'activate_group' : 'deactivate_group',
      target_type: 'group',
      target_id: groupId,
      details: `Group ${grp.name_en} status changed to ${grp.is_active ? 'active' : 'inactive'}`,
      created_at: new Date().toISOString()
    });

    return HttpResponse.json(grp);
  }),

  http.get('*/api/v1/admin/crops', async ({ request }) => {
    await delay(150);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    return HttpResponse.json(platformCrops);
  }),

  http.post('*/api/v1/admin/crops', async ({ request }) => {
    await delay(250);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    const body = await request.json() as any;
    const newCrop = {
      id: platformCrops.length + 1,
      code: body.code.toUpperCase(),
      name_en: body.name_en,
      name_kn: body.name_kn,
      category: body.category || 'cereal',
      seasonality: body.seasonality || 'All seasons',
      typical_duration_days: body.typical_duration_days || 90,
      description_en: `${body.name_en} cultivated in Mandya agro-climatic region.`,
      description_kn: `ಮಂಡ್ಯ ವಲಯದಲ್ಲಿ ಬೆಳೆಯಲಾಗುವ ${body.name_kn}.`
    };
    platformCrops.push(newCrop as any);

    auditLogs.unshift({
      id: auditLogs.length + 1,
      admin_id: 99,
      admin_name: 'Mandya Krishi Admin',
      action: 'crop_added',
      target_type: 'crop',
      target_id: newCrop.id,
      details: `Added new crop ${newCrop.name_en} (${newCrop.code})`,
      created_at: new Date().toISOString()
    });

    return HttpResponse.json(newCrop, { status: 201 });
  }),

  http.put('*/api/v1/admin/crops/:id', async ({ params, request }) => {
    await delay(200);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    const cropId = Number(params.id);
    const crop = platformCrops.find(c => c.id === cropId);
    if (!crop) {
      return HttpResponse.json({ detail: 'Crop not found.' }, { status: 404 });
    }
    const body = await request.json() as any;
    if (body.name_en !== undefined) crop.name_en = body.name_en;
    if (body.name_kn !== undefined) crop.name_kn = body.name_kn;
    if (body.category !== undefined) crop.category = body.category;
    if (body.seasonality !== undefined) crop.seasonality = body.seasonality;
    if (body.typical_duration_days !== undefined) crop.typical_duration_days = body.typical_duration_days;

    auditLogs.unshift({
      id: auditLogs.length + 1,
      admin_id: 99,
      admin_name: 'Mandya Krishi Admin',
      action: 'crop_updated',
      target_type: 'crop',
      target_id: cropId,
      details: `Updated crop metadata for ${crop.name_en}`,
      created_at: new Date().toISOString()
    });

    return HttpResponse.json(crop);
  }),

  http.get('*/api/v1/admin/support-tickets', async ({ request }) => {
    await delay(150);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    return HttpResponse.json(supportTickets);
  }),

  http.patch('*/api/v1/admin/support-tickets/:id', async ({ params, request }) => {
    await delay(200);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    const ticketId = Number(params.id);
    const ticket = supportTickets.find(t => t.id === ticketId);
    if (!ticket) {
      return HttpResponse.json({ detail: 'Support ticket not found.' }, { status: 404 });
    }
    const body = await request.json() as any;
    ticket.status = body.status;
    if (body.resolution_notes !== undefined) {
      ticket.resolution_notes = body.resolution_notes;
    }
    ticket.updated_at = new Date().toISOString();

    auditLogs.unshift({
      id: auditLogs.length + 1,
      admin_id: 99,
      admin_name: 'Mandya Krishi Admin',
      action: 'ticket_status_update',
      target_type: 'support_ticket',
      target_id: ticketId,
      details: `Ticket status set to ${ticket.status}`,
      created_at: new Date().toISOString()
    });

    return HttpResponse.json(ticket);
  }),

  http.get('*/api/v1/admin/audit-logs', async ({ request }) => {
    await delay(150);
    if (!checkAdminAuth(request)) {
      return HttpResponse.json({ detail: 'Forbidden. Administrator privileges required.' }, { status: 403 });
    }
    return HttpResponse.json(auditLogs);
  })
];
