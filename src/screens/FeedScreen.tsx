import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feed } from '../components/Feed';
import type { FeedVideo } from '../types/video';
import { api } from '../api/client';
import { colors } from '../theme/colors';

const TAB_BAR = 52;
const SEGMENT_ROW = 44;

type FeedMode = 'latest' | 'recommended';

export function FeedScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<FeedMode>('latest');
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    async (p: number, replace: boolean) => {
      const path = mode === 'recommended' ? '/videos/recommended' : '/videos/feed';
      const { data } = await api.get<{
        videos: FeedVideo[];
        hasMore: boolean;
        page: number;
      }>(path, { params: { page: p, limit: 6 } });
      if (replace) setVideos(data.videos);
      else setVideos((prev) => [...prev, ...data.videos]);
      setHasMore(data.hasMore);
      setPage(data.page);
    },
    [mode],
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    load(1, true).finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(1, true);
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const onLoadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    load(page + 1, false)
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [hasMore, load, loadingMore, page]);

  return (
    <View style={styles.root}>
      <View style={[styles.segment, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => setMode('latest')}
          style={[styles.segBtn, mode === 'latest' && styles.segBtnActive]}
        >
          <Text style={[styles.segLabel, mode === 'latest' && styles.segLabelActive]}>Latest</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('recommended')}
          style={[styles.segBtn, mode === 'recommended' && styles.segBtnActive]}
        >
          <Text style={[styles.segLabel, mode === 'recommended' && styles.segLabelActive]}>
            For you
          </Text>
        </Pressable>
      </View>
      <Feed
        videos={videos}
        loading={loading}
        onLoadMore={onLoadMore}
        onRefresh={onRefresh}
        refreshing={refreshing}
        tabBarHeight={TAB_BAR}
        headerOffset={insets.top + SEGMENT_ROW}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  segment: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 8,
    zIndex: 2,
  },
  segBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  segBtnActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(254, 44, 85, 0.12)',
  },
  segLabel: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  segLabelActive: { color: colors.accent },
});
