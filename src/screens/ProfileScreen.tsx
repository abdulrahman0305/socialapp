import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Pressable,
  Text,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { Profile } from '../components/Profile';
import { api } from '../api/client';
import { logout } from '../store/authSlice';
import type { FeedVideo } from '../types/video';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export function ProfileScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data } = await api.get<{ videos: FeedVideo[] }>(`/users/${user.id}/videos`);
      setVideos(data.videos || []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) return null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 100 }}>
      <Pressable style={styles.logout} onPress={() => dispatch(logout())}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
      <Profile
        username={user.username}
        bio={user.bio}
        avatarUrl={user.avatarUrl}
        followersCount={user.followersCount}
        followingCount={user.followingCount}
        videos={videos}
        isSelf
        onEdit={() => navigation.navigate('EditProfile')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  logout: { alignSelf: 'flex-end', marginRight: 16, marginTop: 8, padding: 8 },
  logoutText: { color: colors.textMuted, fontWeight: '600' },
});
