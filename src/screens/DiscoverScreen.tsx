import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../api/client';
import type { FeedVideo } from '../types/video';
import { colors } from '../theme/colors';
import { Search } from 'lucide-react-native';
import type { MainStackParamList } from '../navigation/types';

export function DiscoverScreen() {
  const navigation = useNavigation();
  const [q, setQ] = useState('');
  const [trending, setTrending] = useState<FeedVideo[]>([]);
  const [recommended, setRecommended] = useState<FeedVideo[]>([]);
  const [results, setResults] = useState<FeedVideo[]>([]);
  const [users, setUsers] = useState<{ id: string; username: string; avatarUrl?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/videos/trending', { params: { limit: 12 } }),
      api.get('/videos/recommended', { params: { limit: 10 } }),
    ])
      .then(([tRes, rRes]) => {
        setTrending(tRes.data.videos || []);
        setRecommended(rRes.data.videos || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const search = useCallback(async (text: string) => {
    setQ(text);
    if (!text.trim()) {
      setResults([]);
      setUsers([]);
      return;
    }
    const [vRes, uRes] = await Promise.all([
      api.get('/videos/search', { params: { q: text.trim() } }),
      api.get('/users/search', { params: { q: text.trim() } }),
    ]);
    setResults(vRes.data.videos || []);
    setUsers(uRes.data.users || []);
  }, []);

  const openUser = (userId: string) => {
    const parent = navigation.getParent<NativeStackNavigationProp<MainStackParamList>>();
    parent?.navigate('UserProfile', { userId });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.searchRow}>
        <Search size={20} color={colors.textMuted} />
        <TextInput
          style={styles.search}
          placeholder="Search users, captions, tags"
          placeholderTextColor={colors.textMuted}
          value={q}
          onChangeText={search}
        />
      </View>

      {!q.trim() && (
        <>
          <Text style={styles.section}>For you</Text>
          {recommended.length === 0 ? (
            <Text style={styles.emptyHint}>
              Sign in and watch clips to personalize recommendations.
            </Text>
          ) : null}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hRow}
          >
            {recommended.map((item) => (
              <View key={item.id} style={styles.tCard}>
                {item.thumbnailUrl ? (
                  <Image source={{ uri: item.thumbnailUrl }} style={styles.tImg} />
                ) : (
                  <View style={[styles.tImg, styles.ph]} />
                )}
                <Text style={styles.tCap} numberOfLines={2}>
                  {item.caption}
                </Text>
              </View>
            ))}
          </ScrollView>
          <Text style={styles.section}>Trending</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {trending.map((item) => (
              <View key={item.id} style={styles.tCard}>
                {item.thumbnailUrl ? (
                  <Image source={{ uri: item.thumbnailUrl }} style={styles.tImg} />
                ) : (
                  <View style={[styles.tImg, styles.ph]} />
                )}
                <Text style={styles.tCap} numberOfLines={2}>
                  {item.caption}
                </Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {q.trim() ? (
        <>
          <Text style={styles.section}>Users</Text>
          {users.map((u) => (
            <Pressable key={u.id} style={styles.uRow} onPress={() => openUser(u.id)}>
              <Text style={styles.uName}>@{u.username}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
          <Text style={styles.section}>Videos</Text>
          {results.map((v) => (
            <Pressable key={v.id} style={styles.vRow}>
              {v.thumbnailUrl ? (
                <Image source={{ uri: v.thumbnailUrl }} style={styles.vThumb} />
              ) : (
                <View style={[styles.vThumb, styles.ph]} />
              )}
              <Text style={styles.vCap} numberOfLines={2}>
                {v.caption}
              </Text>
            </Pressable>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 12 },
  center: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  search: { flex: 1, color: colors.text, fontSize: 15 },
  section: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 17,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  emptyHint: { color: colors.textMuted, paddingHorizontal: 12, fontSize: 13, marginBottom: 8 },
  hRow: { gap: 10, paddingHorizontal: 12, paddingBottom: 4 },
  tCard: { width: 120 },
  tImg: { width: 120, height: 160, borderRadius: 10, backgroundColor: '#222' },
  ph: { backgroundColor: colors.surface },
  tCap: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  uRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  uName: { color: colors.text, fontWeight: '600' },
  chevron: { color: colors.textMuted, fontSize: 22 },
  vRow: { flexDirection: 'row', padding: 12, gap: 12, alignItems: 'center' },
  vThumb: { width: 64, height: 86, borderRadius: 8, backgroundColor: '#222' },
  vCap: { flex: 1, color: colors.text },
});
