/**
 * AgriMitra Crop Image Mapping & Verification System
 * Provides visually distinct, realistic agricultural photographs for all Mandya crops.
 * Prioritizes custom listing images, with verified local and online crop-specific fallbacks.
 */

export interface CropVisualMetadata {
  cropId: number;
  code: string;
  nameEn: string;
  nameKn: string;
  localUrl: string;
  fallbackUrl: string;
  description: string;
}

export const CROP_METADATA: Record<string, CropVisualMetadata> = {
  sugarcane: {
    cropId: 1,
    code: 'SUGARCANE',
    nameEn: 'Sugarcane',
    nameKn: 'ಕಬ್ಬು',
    localUrl: '/images/crops/sugarcane.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800',
    description: 'Co 86032 & VCF 0517 sugarcane stalks & canal command harvest'
  },
  paddy: {
    cropId: 2,
    code: 'PADDY',
    nameEn: 'Paddy / Rice',
    nameKn: 'ಭತ್ತ',
    localUrl: '/images/crops/paddy.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    description: 'Golden ripe BPT 5204 (Sona Masoori) paddy grain & harvest'
  },
  ragi: {
    cropId: 3,
    code: 'RAGI',
    nameEn: 'Finger Millet (Ragi)',
    nameKn: 'ರಾಗಿ',
    localUrl: '/images/crops/ragi.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
    description: 'Cleaned ML-365 finger millet / ragi seed grain'
  },
  banana: {
    cropId: 4,
    code: 'BANANA',
    nameEn: 'Banana (Yelakki / Robusta)',
    nameKn: 'ಬಾಳೆ',
    localUrl: '/images/crops/banana.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=800',
    description: 'Fresh Yelakki banana bunch & riverine plantation'
  },
  coconut: {
    cropId: 5,
    code: 'COCONUT',
    nameEn: 'Tender Coconut',
    nameKn: 'ಎಳನೀರು / ತೆಂಗು',
    localUrl: '/images/crops/coconut.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
    description: 'Fresh Mandya green tender coconuts & palms'
  },
  tomato: {
    cropId: 6,
    code: 'TOMATO',
    nameEn: 'Tomato',
    nameKn: 'ಟೊಮೆಟೊ',
    localUrl: '/images/crops/tomato.jpg',
    fallbackUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800',
    description: 'Vine-ripened red greenhouse & field tomatoes'
  }
};

const OLD_GENERIC_FALLBACK_PATTERN = 'photo-1592982537447-7440770cbfc9';

/**
 * Returns the visually appropriate, distinct photograph URL for a marketplace produce listing.
 * 
 * Rules:
 * 1. If an individual listing has a legitimate custom image that does NOT match the old generic
 *    fallback across all crops, use the listing's own image.
 * 2. If the listing image is missing or is the old generic fallback applied to non-sugarcane crops,
 *    resolve to the crop-specific verified photograph based on crop_id or crop name/variety keywords.
 */
export function getListingImageUrl(listing: {
  image_url?: string | null;
  crop_id?: number | null;
  crop_name_en?: string | null;
  variety?: string | null;
}): string {
  const cropKey = getCropKey(listing);

  // 1. If listing has a custom uploaded image that is NOT the old generic sugarcane fallback (unless it is sugarcane)
  if (listing.image_url && listing.image_url.trim().length > 0) {
    const isOldGeneric = listing.image_url.includes(OLD_GENERIC_FALLBACK_PATTERN);
    if (!isOldGeneric || cropKey === 'sugarcane') {
      return listing.image_url;
    }
  }

  // 2. Return crop-specific local image asset
  return CROP_METADATA[cropKey].localUrl;
}

/**
 * Returns the reliable fallback online URL if a local image fails to load.
 */
export function getListingFallbackUrl(listing: {
  crop_id?: number | null;
  crop_name_en?: string | null;
  variety?: string | null;
}): string {
  const cropKey = getCropKey(listing);
  return CROP_METADATA[cropKey].fallbackUrl;
}

/**
 * Resolves the canonical crop key from crop_id, crop name, or variety string.
 */
export function getCropKey(listing: {
  crop_id?: number | null;
  crop_name_en?: string | null;
  variety?: string | null;
}): keyof typeof CROP_METADATA {
  if (listing.crop_id) {
    switch (listing.crop_id) {
      case 1: return 'sugarcane';
      case 2: return 'paddy';
      case 3: return 'ragi';
      case 4: return 'banana';
      case 5: return 'coconut';
      case 6: return 'tomato';
    }
  }

  const text = `${listing.crop_name_en || ''} ${listing.variety || ''}`.toLowerCase();
  if (text.includes('banana') || text.includes('bale') || text.includes('yelakki') || text.includes('robusta')) {
    return 'banana';
  }
  if (text.includes('paddy') || text.includes('rice') || text.includes('bpt') || text.includes('masoori') || text.includes('bhatta')) {
    return 'paddy';
  }
  if (text.includes('ragi') || text.includes('millet') || text.includes('ml-365')) {
    return 'ragi';
  }
  if (text.includes('coconut') || text.includes('elaneeru') || text.includes('tengu')) {
    return 'coconut';
  }
  if (text.includes('tomato') || text.includes('tometo')) {
    return 'tomato';
  }
  if (text.includes('sugar') || text.includes('cane') || text.includes('kabbu') || text.includes('86032')) {
    return 'sugarcane';
  }

  return 'sugarcane';
}
