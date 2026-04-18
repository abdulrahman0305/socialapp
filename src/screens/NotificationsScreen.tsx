import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { getStoredToken } from '../api/client';
import { SOCKET_URL } from '../config/env';
import { api } from '../api/client';
import { colors } from '../theme/colors';
import { Bell } from 'lucide-react-native';

type Row = {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  fromUser: { username: string } | null;
};

export function NotificationsScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let socket: Socket | null = null;
    (async () => {
      try {
        const { data } = await api.get<{ notifications: Row[] }>('/notifications');
        setRows(data.notifications || []);
        await api.post('/notifications/read-all');
      } finally {
        setLoading(false);
      }
      const token = await getStoredToken();
      if (!token) return;
      socket = io(SOCKET_URL, { auth: { token } });
      socket.on('notification', () => {
        api.get('/notifications').then((res) => setRows(res.data.notifications || []));
      });
    })();
    return () => {
      socket?.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Bell color={colors.textMuted} size={40} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>
              <Text style={styles.bold}>@{item.fromUser?.username || 'user'}</Text>
              {item.type === 'like' && ' liked your video'}
              {item.type === 'comment' && ' commented'}
              {item.type === 'follow' && ' started following you'}
            </Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowText: { color: colors.text, fontSize: 15 },
  bold: { fontWeight: '700' },
  time: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: colors.textMuted },
});
