// Community module types — the staff/student home feed: announcements,
// birthday wishes, celebrations, achievements and learning posts.
// Self-contained (like events/ and seminar/); stored in `community_posts`.

export type PostKind = 'announcement' | 'birthday' | 'celebration' | 'achievement' | 'learning';

/** Who can see a post. Staff always see everything; students see 'all' + 'candidates'. */
export type PostAudience = 'all' | 'staff' | 'candidates';

export type ReactionKey = 'party' | 'clap' | 'heart' | 'bulb';

export interface CommunityPost {
  id: string;
  kind: PostKind;
  title: string;
  body: string;
  imageUrl: string;        // hosted URL or inline data: URL ('' when none)
  audience: PostAudience;
  pinned: boolean;
  /** Optional link to a candidate the post is about (birthday, placement, ...). */
  candidateId: string;
  candidateName: string;
  /** Optional external link (blog, video, certificate). */
  linkUrl: string;
  authorId: string;
  authorName: string;
  createdAt: string;       // ISO
  updatedAt: string;       // ISO
  /** Hide from the feed after this date ('' = never). Used for time-boxed announcements. */
  expiresAt: string;
  /** reaction → user ids */
  reactions: Record<ReactionKey, string[]>;
}

export const POST_KIND_META: Record<PostKind, { label: string; emoji: string; tint: string }> = {
  announcement: { label: 'Announcement', emoji: '📢', tint: 'bg-blue-50 text-blue-700 border-blue-100' },
  birthday: { label: 'Birthday', emoji: '🎂', tint: 'bg-pink-50 text-pink-700 border-pink-100' },
  celebration: { label: 'Celebration', emoji: '🎉', tint: 'bg-amber-50 text-amber-700 border-amber-100' },
  achievement: { label: 'Achievement', emoji: '🏆', tint: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  learning: { label: 'Learning', emoji: '💡', tint: 'bg-violet-50 text-violet-700 border-violet-100' },
};

export const REACTIONS: { key: ReactionKey; emoji: string; label: string }[] = [
  { key: 'party', emoji: '🎉', label: 'Celebrate' },
  { key: 'clap', emoji: '👏', label: 'Applaud' },
  { key: 'heart', emoji: '❤️', label: 'Love' },
  { key: 'bulb', emoji: '💡', label: 'Insightful' },
];

export const emptyReactions = (): Record<ReactionKey, string[]> => ({ party: [], clap: [], heart: [], bulb: [] });

/** One slide of the photo carousel on the home page (`community_gallery`). */
export interface GalleryImage {
  id: string;
  imageUrl: string;      // hosted URL or inline data: URL
  caption: string;
  /** Lower first. New photos get max+1. */
  order: number;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}
