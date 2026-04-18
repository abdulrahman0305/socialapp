import { Platform } from 'react-native';

/**
 * Development: emulator/simulator talks to your machine.
 * Production: set PRODUCTION_API_BASE to your HTTPS API (same origin as CDN/API gateway).
 *
 * Example: https://api.yourdomain.com/api
 */
const PRODUCTION_API_BASE = 'https://api.example.com/api';
const PRODUCTION_SOCKET_URL = 'https://api.example.com';

const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEV_API = `http://${DEV_HOST}:4000/api`;
const DEV_SOCKET = `http://${DEV_HOST}:4000`;

export const API_BASE_URL = __DEV__ ? DEV_API : PRODUCTION_API_BASE;
export const SOCKET_URL = __DEV__ ? DEV_SOCKET : PRODUCTION_SOCKET_URL;
