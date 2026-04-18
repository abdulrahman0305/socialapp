export type FeedUser = {
  id: string;
  username: string;
  avatarUrl?: string;
};

export type FeedVideo = {
  id: string;
  videoUrl: string;
  /** Prefer for playback when present (HLS / adaptive) */
  hlsUrl?: string;
  thumbnailUrl?: string;
  caption: string;
  hashtags?: string[];
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  liked?: boolean;
  user: FeedUser | null;
  createdAt?: string;
};
