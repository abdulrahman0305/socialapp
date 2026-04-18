import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoCard } from './VideoCard';
import type { FeedVideo } from '../types/video';
import { api } from '../api/client';
import { colors } from '../theme/colors';
import { X } from 'lucide-react-native';

type Props = {
  videos: FeedVideo[];
  loading: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  tabBarHeight: number;
  /** Pixels to subtract for UI above the feed (e.g. segment + safe area). */
  headerOffset?: number;
};

export function Feed({
  videos,
  loading,
  onLoadMore,
  onRefresh,
  refreshing,
  tabBarHeight,
  headerOffset = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: winH } = Dimensions.get('window');
  const itemHeight = winH - tabBarHeight - headerOffset;
  const [active, setActive] = useState(0);
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 80 }).current;

  const onViewable = useCallback(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActive(viewableItems[0].index);
      }
    },
    [],
  );

  const [commentVideo, setCommentVideo] = useState<FeedVideo | null>(null);
  const [comments, setComments] = useState<
    { id: string; text: string; user: { username: string } | null }[]
  >([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const openComments = useCallback((v: FeedVideo) => {
    setCommentVideo(v);
    setLoadingComments(true);
    api
      .get(`/videos/${v.id}/comments`)
      .then((res) => {
        setComments(res.data.comments || []);
      })
      .finally(() => setLoadingComments(false));
  }, []);

  const sendComment = useCallback(async () => {
    if (!commentVideo || !commentText.trim()) return;
    try {
      const { data } = await api.post(`/videos/${commentVideo.id}/comments`, {
        text: commentText.trim(),
      });
      setComments((c) => [data.comment, ...c]);
      setCommentText('');
    } catch {
      /* ignore */
    }
  }, [commentVideo, commentText]);

  const renderItem: ListRenderItem<FeedVideo> = useCallback(
    ({ item, index }) => (
      <VideoCard
        item={item}
        isActive={index === active}
        height={itemHeight}
        onOpenComments={() => openComments(item)}
      />
    ),
    [active, itemHeight, openComments],
  );

  const keyExtractor = useCallback((item: FeedVideo) => item.id, []);

  if (loading && videos.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.4}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={viewConfig}
        refreshing={refreshing}
        onRefresh={onRefresh}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        removeClippedSubviews
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={2}
      />
      {videos.length === 0 && !loading ? (
        <View
          style={[
            styles.empty,
            { paddingBottom: tabBarHeight + insets.bottom + headerOffset },
          ]}
        >
          <Text style={styles.emptyText}>No videos yet. Upload one from the + tab.</Text>
        </View>
      ) : null}

      <Modal visible={!!commentVideo} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Comments</Text>
              <Pressable onPress={() => setCommentVideo(null)} hitSlop={12}>
                <X color={colors.text} size={24} />
              </Pressable>
            </View>
            {loadingComments ? (
              <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(c) => c.id}
                style={styles.commentList}
                renderItem={({ item }) => (
                  <View style={styles.commentRow}>
                    <Text style={styles.commentUser}>@{item.user?.username || 'user'}</Text>
                    <Text style={styles.commentText}>{item.text}</Text>
                  </View>
                )}
              />
            )}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Add comment..."
                placeholderTextColor={colors.textMuted}
                value={commentText}
                onChangeText={setCommentText}
                onSubmitEditing={sendComment}
              />
              <Pressable onPress={sendComment} style={styles.sendBtn}>
                <Text style={styles.sendLabel}>Post</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  empty: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: { color: colors.textMuted, textAlign: 'center', fontSize: 15 },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  commentList: { maxHeight: 280 },
  commentRow: { marginBottom: 14 },
  commentUser: { color: colors.accentSoft, fontWeight: '600', fontSize: 13 },
  commentText: { color: colors.text, marginTop: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    backgroundColor: colors.bg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  sendLabel: { color: colors.accent, fontWeight: '700' },
});
