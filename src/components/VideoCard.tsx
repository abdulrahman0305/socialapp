import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Share,
  ActivityIndicator,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Heart, MessageCircle, Share2, UserPlus, UserCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import type { FeedVideo } from '../types/video';
import { api } from '../api/client';

const { height: SCREEN_H } = Dimensions.get('window');

type Props = {
  item: FeedVideo;
  isActive: boolean;
  height: number;
  onOpenComments: () => void;
  onFollowChange?: (userId: string, following: boolean) => void;
};

export function VideoCard({
  item,
  isActive,
  height,
  onOpenComments,
  onFollowChange,
}: Props) {
  const [liked, setLiked] = useState(!!item.liked);
  const [likes, setLikes] = useState(item.likesCount);
  const [following, setFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const scale = useSharedValue(1);

  useEffect(() => {
    setLiked(!!item.liked);
    setLikes(item.likesCount);
  }, [item.id, item.liked, item.likesCount]);

  useEffect(() => {
    if (!item.user?.id) return;
    let cancelled = false;
    api
      .get(`/users/${item.user.id}`)
      .then((res) => {
        if (!cancelled) setFollowing(!!res.data.isFollowing);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [item.user?.id]);

  useEffect(() => {
    if (isActive && item.id) {
      api.post(`/videos/${item.id}/view`).catch(() => {});
    }
  }, [isActive, item.id]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const playbackUri = item.hlsUrl || item.videoUrl;
  const isHls =
    !!(item.hlsUrl && item.hlsUrl.length > 0) || /\.m3u8(\?|$)/i.test(playbackUri);

  const toggleLike = useCallback(async () => {
    scale.value = withSpring(1.25, {}, () => {
      scale.value = withSpring(1);
    });
    const next = !liked;
    setLiked(next);
    setLikes((c) => c + (next ? 1 : -1));
    try {
      if (next) await api.post(`/videos/${item.id}/like`);
      else await api.delete(`/videos/${item.id}/like`);
    } catch {
      setLiked(!next);
      setLikes((c) => c + (next ? -1 : 1));
    }
  }, [item.id, liked, scale]);

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${item.caption}\n${playbackUri}`,
        url: playbackUri,
      });
    } catch {
      /* ignore */
    }
  }, [item.caption, playbackUri]);

  const toggleFollow = useCallback(async () => {
    if (!item.user?.id || loadingFollow) return;
    setLoadingFollow(true);
    const uid = item.user.id;
    try {
      if (following) {
        await api.delete(`/users/${uid}/follow`);
        setFollowing(false);
        onFollowChange?.(uid, false);
      } else {
        await api.post(`/users/${uid}/follow`);
        setFollowing(true);
        onFollowChange?.(uid, true);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingFollow(false);
    }
  }, [following, item.user?.id, loadingFollow, onFollowChange]);

  return (
    <View style={[styles.wrap, { height }]}>
      <Video
        source={
          isHls
            ? { uri: playbackUri, type: 'm3u8' }
            : { uri: playbackUri }
        }
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        repeat
        paused={!isActive}
        muted={false}
        ignoreSilentSwitch="ignore"
        playInBackground={false}
        poster={item.thumbnailUrl}
        posterResizeMode="cover"
      />
      <View style={styles.gradient} pointerEvents="none" />
      <View style={styles.rightRail}>
        <Pressable onPress={toggleLike} style={styles.railBtn}>
          <Animated.View style={heartStyle}>
            <Heart
              size={34}
              color={liked ? colors.accent : '#fff'}
              fill={liked ? colors.accent : 'transparent'}
            />
          </Animated.View>
          <Text style={styles.railCount}>{likes}</Text>
        </Pressable>
        <Pressable onPress={onOpenComments} style={styles.railBtn}>
          <MessageCircle size={32} color="#fff" />
          <Text style={styles.railCount}>{item.commentsCount}</Text>
        </Pressable>
        <Pressable onPress={onShare} style={styles.railBtn}>
          <Share2 size={30} color="#fff" />
          <Text style={styles.railLabel}>Share</Text>
        </Pressable>
        {item.user?.id ? (
          <Pressable onPress={toggleFollow} style={styles.avatarRing} disabled={loadingFollow}>
            {item.user.avatarUrl ? (
              <Image source={{ uri: item.user.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarImg, styles.avatarPlaceholder]} />
            )}
            <View style={styles.followBadge}>
              {loadingFollow ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : following ? (
                <UserCheck size={16} color="#fff" />
              ) : (
                <UserPlus size={16} color="#fff" />
              )}
            </View>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.bottomMeta}>
        <Text style={styles.username}>@{item.user?.username || 'user'}</Text>
        <Text style={styles.caption} numberOfLines={3}>
          {item.caption}
        </Text>
        {item.hashtags && item.hashtags.length > 0 ? (
          <Text style={styles.tags} numberOfLines={2}>
            {item.hashtags.map((t) => (
              <Text key={t} style={styles.tag}>
                #{t}{' '}
              </Text>
            ))}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  gradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  rightRail: {
    position: 'absolute',
    right: 10,
    bottom: 100,
    alignItems: 'center',
    gap: 18,
  },
  railBtn: { alignItems: 'center' },
  railCount: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  railLabel: { color: '#fff', fontSize: 11, marginTop: 4 },
  avatarRing: {
    marginTop: 8,
    alignItems: 'center',
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: '#333',
  },
  followBadge: {
    marginTop: -10,
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 4,
  },
  bottomMeta: {
    position: 'absolute',
    left: 14,
    right: 72,
    bottom: 88,
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  caption: {
    color: '#f3f4f6',
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tags: { marginTop: 6 },
  tag: { color: colors.accentSoft, fontWeight: '600' },
});

export const FEED_ITEM_HEIGHT = SCREEN_H;
