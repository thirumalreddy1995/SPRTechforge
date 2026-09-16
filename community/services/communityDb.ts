// Firestore access for Community posts, through the app's cloudService so it
// follows the same realtime-subscription pattern as every staff collection.
// Only logged-in users load this (the page is behind ProtectedRoute).

import { cloudService } from '../../services/cloud';
import { CommunityPost, GalleryImage, ReactionKey, emptyReactions } from '../types';

export const COMMUNITY_COLLECTION = 'community_posts';
export const GALLERY_COLLECTION = 'community_gallery';

// ---------- photo carousel ----------

export const subscribeGallery = (cb: (images: GalleryImage[]) => void): (() => void) =>
  cloudService.subscribe(GALLERY_COLLECTION, (items: any[]) =>
    cb(items
      .map((r: any) => ({ id: r.id, imageUrl: r.imageUrl || '', caption: r.caption || '', order: Number(r.order) || 0, createdAt: r.createdAt || '', createdBy: r.createdBy || '', createdByName: r.createdByName || '' }))
      .filter(i => i.imageUrl)
      .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt))));

export const saveGalleryImage = async (img: GalleryImage): Promise<void> => {
  await cloudService.saveItem(GALLERY_COLLECTION, JSON.parse(JSON.stringify(img)));
};

export const updateGalleryImage = async (id: string, patch: Partial<GalleryImage>): Promise<void> => {
  await cloudService.updateItem(GALLERY_COLLECTION, id, JSON.parse(JSON.stringify(patch)));
};

export const deleteGalleryImage = async (id: string): Promise<void> => {
  await cloudService.deleteItem(GALLERY_COLLECTION, id);
};

const normalize = (raw: any): CommunityPost => ({
  id: raw.id,
  kind: raw.kind || 'announcement',
  title: raw.title || '',
  body: raw.body || '',
  imageUrl: raw.imageUrl || '',
  audience: raw.audience || 'all',
  pinned: !!raw.pinned,
  candidateId: raw.candidateId || '',
  candidateName: raw.candidateName || '',
  linkUrl: raw.linkUrl || '',
  authorId: raw.authorId || '',
  authorName: raw.authorName || '',
  createdAt: raw.createdAt || '',
  updatedAt: raw.updatedAt || raw.createdAt || '',
  expiresAt: raw.expiresAt || '',
  reactions: { ...emptyReactions(), ...(raw.reactions || {}) },
});

export const subscribePosts = (cb: (posts: CommunityPost[]) => void): (() => void) =>
  cloudService.subscribe(COMMUNITY_COLLECTION, (items: any[]) => cb(items.map(normalize)));

export const savePost = async (post: CommunityPost): Promise<void> => {
  await cloudService.saveItem(COMMUNITY_COLLECTION, JSON.parse(JSON.stringify(post)));
};

export const updatePost = async (id: string, patch: Partial<CommunityPost>): Promise<void> => {
  await cloudService.updateItem(COMMUNITY_COLLECTION, id, JSON.parse(JSON.stringify(patch)));
};

export const deletePost = async (id: string): Promise<void> => {
  await cloudService.deleteItem(COMMUNITY_COLLECTION, id);
};

/** Adds or removes the user's reaction; returns the new reactions map. */
export const toggleReaction = async (post: CommunityPost, key: ReactionKey, userId: string): Promise<Record<ReactionKey, string[]>> => {
  const current = post.reactions[key] || [];
  const next = current.includes(userId) ? current.filter(u => u !== userId) : [...current, userId];
  const reactions = { ...post.reactions, [key]: next };
  await updatePost(post.id, { reactions });
  return reactions;
};
