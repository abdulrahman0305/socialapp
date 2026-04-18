import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import type { FeedVideo } from '../types/video';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const GAP = 2;
const COLS = 3;
const TILE = (width - GAP * (COLS - 1)) / COLS;

type Props = {
  username: string;
  bio: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  videos: Pick<FeedVideo, 'id' | 'thumbnailUrl' | 'videoUrl'>[];
  isSelf: boolean;
  onEdit?: () => void;
  onFollowToggle?: () => void;
  following?: boolean;
};

export function Profile({
  username,
  bio,
  avatarUrl,
  followersCount,
  followingCount,
  videos,
  isSelf,
  onEdit,
  onFollowToggle,
  following,
}: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPh]} />
        )}
        <Text style={styles.name}>@{username}</Text>
        <Text style={styles.bio}>{bio || 'No bio yet'}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
        {isSelf ? (
          <Pressable style={styles.primaryBtn} onPress={onEdit}>
            <Text style={styles.primaryLabel}>Edit profile</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.primaryBtn} onPress={onFollowToggle}>
            <Text style={styles.primaryLabel}>{following ? 'Following' : 'Follow'}</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.gridTitle}>Videos</Text>
      <View style={styles.grid}>
        {videos.map((item) => (
          <Pressable key={item.id} style={styles.tile}>
            {item.thumbnailUrl ? (
              <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPh]} />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, alignItems: 'center' },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 12 },
  avatarPh: { backgroundColor: colors.surface },
  name: { color: colors.text, fontSize: 20, fontWeight: '800' },
  bio: { color: colors.textMuted, marginTop: 8, textAlign: 'center' },
  stats: { flexDirection: 'row', gap: 32, marginTop: 16 },
  stat: { alignItems: 'center' },
  statNum: { color: colors.text, fontSize: 18, fontWeight: '700' },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  primaryLabel: { color: colors.text, fontWeight: '700' },
  gridTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: 12,
  },
  tile: { width: TILE, height: TILE * 1.35 },
  thumb: { width: '100%', height: '100%', backgroundColor: '#222' },
  thumbPh: { backgroundColor: colors.surface },
});
