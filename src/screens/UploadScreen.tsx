import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { api } from '../api/client';
import { colors } from '../theme/colors';
import { Clapperboard } from 'lucide-react-native';

export function UploadScreen() {
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbUri, setThumbUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pickVideo = () => {
    launchImageLibrary({ mediaType: 'video', selectionLimit: 1 }, (res) => {
      const a = res.assets?.[0];
      if (a?.uri) setVideoUri(a.uri);
    });
  };

  const pickThumb = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 }, (res) => {
      const a = res.assets?.[0];
      if (a?.uri) setThumbUri(a.uri);
    });
  };

  const upload = async () => {
    if (!videoUri) {
      Alert.alert('Pick a video first');
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('caption', caption);
      const tagList = tags
        .split(/[,\s]+/)
        .map((t) => t.replace(/^#/, ''))
        .filter(Boolean);
      form.append('hashtags', JSON.stringify(tagList));
      form.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: 'upload.mp4',
      } as unknown as Blob);
      if (thumbUri) {
        form.append('thumbnail', {
          uri: thumbUri,
          type: 'image/jpeg',
          name: 'thumb.jpg',
        } as unknown as Blob);
      }
      await api.post('/videos', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Uploaded', 'Your video is live on the feed.');
      setCaption('');
      setTags('');
      setVideoUri(null);
      setThumbUri(null);
    } catch (e: unknown) {
      Alert.alert('Upload failed', String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>New clip</Text>
      <Text style={styles.hint}>Choose a vertical clip for best results.</Text>
      <Pressable style={styles.pickBtn} onPress={pickVideo}>
        <Clapperboard color={colors.accent} size={22} />
        <Text style={styles.pickLabel}>{videoUri ? 'Video selected' : 'Pick video'}</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={pickThumb}>
        <Text style={styles.secondaryLabel}>{thumbUri ? 'Thumbnail OK' : 'Optional thumbnail'}</Text>
      </Pressable>
      <TextInput
        style={styles.input}
        placeholder="Caption"
        placeholderTextColor={colors.textMuted}
        value={caption}
        onChangeText={setCaption}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Hashtags (comma separated)"
        placeholderTextColor={colors.textMuted}
        value={tags}
        onChangeText={setTags}
      />
      <Pressable style={styles.uploadBtn} onPress={upload} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadLabel}>Post</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  hint: { color: colors.textMuted, marginTop: 8, marginBottom: 20 },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pickLabel: { color: colors.text, fontWeight: '600' },
  secondary: { marginTop: 10, padding: 12 },
  secondaryLabel: { color: colors.accentSoft, fontWeight: '600' },
  input: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    minHeight: 48,
  },
  uploadBtn: {
    marginTop: 24,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  uploadLabel: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
