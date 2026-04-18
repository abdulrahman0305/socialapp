import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { setUser } from '../store/authSlice';
import { api } from '../api/client';
import { colors } from '../theme/colors';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

export function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const u = useAppSelector((s) => s.auth.user);
  const [username, setUsername] = useState(u?.username || '');
  const [bio, setBio] = useState(u?.bio || '');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!u) return;
    setBusy(true);
    try {
      const { data } = await api.patch('/users/me', { username: username.trim(), bio });
      dispatch(setUser({ ...u, ...data }));
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.bio]}
        value={bio}
        onChangeText={setBio}
        multiline
        placeholderTextColor={colors.textMuted}
        placeholder="Tell people about you"
      />
      <Pressable style={styles.btn} onPress={save} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnLabel}>Save</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  label: { color: colors.textMuted, marginBottom: 8, fontSize: 13 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  bio: { minHeight: 100, textAlignVertical: 'top' },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnLabel: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
