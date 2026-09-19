// Public-website content that admins manage from Admin → Website Content.
// Everything is optional: the marketing page renders its built-in copy and
// simply adds these when they exist (banners replace the default slides).

export interface SiteBanner {
  id: string;
  imageUrl: string;     // hosted URL or inline data: URL
  title: string;
  subtitle: string;
  ctaLabel: string;     // '' = no button
  ctaUrl: string;       // '#contact', '#/events', 'https://…'
  order: number;
  active: boolean;
  createdAt: string;
}

export interface SitePhoto {
  id: string;
  imageUrl: string;
  caption: string;
  order: number;
  createdAt: string;
}

/**
 * A testimonial is one designed image card (student photo, name, package,
 * company) uploaded by the admin. name/role/quote/rating are legacy fields kept
 * for old records and used only as alt text; the website shows photoUrl only.
 */
export interface SiteTestimonial {
  id: string;
  name: string;         // alt text / file name
  role: string;         // legacy, unused on the website
  quote: string;        // legacy, unused on the website
  photoUrl: string;     // the card image — required to be displayed
  rating: number;       // legacy
  order: number;
  approved: boolean;    // only approved ones show on the website
  createdAt: string;
}

/** Numbers shown on the site. 0 hides that stat; the strip hides when all are 0. */
export interface SiteStats {
  studentsTrained: number;
  placements: number;
  batchesCompleted: number;
  yearsExperience: number;
  liveProjects: number;
  hiringPartners: number;
}

export interface SiteSettings {
  linkedinUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  whatsappNumber: string;   // digits with country code, e.g. 918297276500
  whatsappCommunityUrl: string; // https://chat.whatsapp.com/… invite for the learners community ('' = none)
  addressLine1: string;
  addressLine2: string;
  mapUrl: string;           // Google Maps link ('' = none)
}

export const SITE_COLLECTIONS = {
  banners: 'site_banners',
  photos: 'site_photos',
  testimonials: 'site_testimonials',
  content: 'site_content', // docs: 'stats', 'settings'
} as const;

export const CONTACT_DEFAULTS = {
  emails: ['admin@sprtechforge.com', 'hr@sprtechforge.com'],
  /** Google Maps short link for the office. Opens the Maps app on Android/iOS and the website on desktop. */
  mapUrl: 'https://maps.app.goo.gl/diXNusi9LLbdN2ZdA',
  phones: [
    { display: '+91 82972 76500', tel: '+918297276500', wa: '918297276500' },
    { display: '+91 82176 51466', tel: '+918217651466', wa: '918217651466' },
  ],
};

export const defaultSettings = (): SiteSettings => ({
  linkedinUrl: '',
  twitterUrl: '',
  youtubeUrl: 'https://youtube.com/@sprtechforge',
  instagramUrl: 'https://www.instagram.com/sprtechforgepvt',
  whatsappNumber: '918297276500',
  whatsappCommunityUrl: '',
  addressLine1: '202, Above Union Bank, Near Forum Sujana Mall',
  addressLine2: 'KPHB 6th Phase, Kukatpally, Hyderabad 500085',
  mapUrl: CONTACT_DEFAULTS.mapUrl,
});

export const defaultStats = (): SiteStats => ({
  studentsTrained: 0, placements: 0, batchesCompleted: 0, yearsExperience: 0, liveProjects: 0, hiringPartners: 0,
});

export interface SiteContent {
  banners: SiteBanner[];
  photos: SitePhoto[];
  testimonials: SiteTestimonial[];
  stats: SiteStats;
  settings: SiteSettings;
}
