import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Profile } from '../components/Profile';
import { api } from '../api/client';
import type { FeedVideo } from '../types/video';
import { colors } from '../theme/colors';
import { useAppSelector } from '../hooks/useAppDispatch';
import type { MainStackParamList } from '../navigation/types';

export function UserProfileScreen({
  route,
}: NativeStackScreenProps<MainStackParamList, 'UserProfile'>) {
  const { userId } = route.params;
  const me = useAppSelector((s) => s.auth.user);
  const [profile, setProfile] = useState<{
    username: string;
    bio: string;
    avatarUrl?: string;
    followersCount: number;
    followingCount: number;
    isFollowing?: boolean;
  } | null>(null);
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, vRes] = await Promise.all([
        api.get<{
          username: string;
          bio: string;
          avatarUrl?: string;
          followersCount: number;
          followingCount: number;
          isFollowing?: boolean;
        }>(`/users/${userId}`),
        api.get<{ videos: FeedVideo[] }>(`/users/${userId}/videos`),
      ]);
      setProfile(uRes.data);
      setVideos(vRes.data.videos || []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const isSelf = me?.id === userId;

  const onFollowToggle = async () => {
    if (!profile || isSelf) return;
    try {
      if (profile.isFollowing) {
        await api.delete(`/users/${userId}/follow`);
        setProfile((p) =>
          p
            ? {
                ...p,
                isFollowing: false,
                followersCount: Math.max(0, p.followersCount - 1),
              }
            : p,
        );
      } else {
        await api.post(`/users/${userId}/follow`);
        setProfile((p) =>
          p
            ? {
                ...p,
                isFollowing: true,
                followersCount: p.followersCount + 1,
              }
            : p,
        );
      }
    } catch {
      /* ignore */
    }
  };

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <Profile
        username={profile.username}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
        followersCount={profile.followersCount}
        followingCount={profile.followingCount}
        videos={videos}
        isSelf={isSelf}
        following={profile.isFollowing}
        onFollowToggle={isSelf ? undefined : onFollowToggle}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
});
