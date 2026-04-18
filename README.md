# socialapp — TikTok-style short video client

React Native CLI app with **Redux Toolkit**, **React Navigation**, **Reanimated**, **react-native-video**, and **lucide-react-native** icons.

## Backend

Run [`../social-server`](../social-server) (Express + MongoDB + JWT + Socket.io). Copy `social-server/.env.example` to `.env`, start MongoDB, then:

```bash
cd ../social-server
npm install
npm run seed:admin
npm run dev
```

## App

```bash
npm install
npm start
# other terminal
npm run android
# or
npm run ios
```

### API URL

Edit `src/config/env.ts`: set **`PRODUCTION_API_BASE`** and **`PRODUCTION_SOCKET_URL`** to your **HTTPS** API (no cleartext in release). In development, Android emulator uses `10.0.2.2`, iOS simulator uses `localhost`. On a **physical device**, use your machine’s LAN IP for dev or your production API host for release builds.

## Folder layout

```
src/
  api/client.ts          # Axios + AsyncStorage JWT
  config/env.ts
  navigation/
    AppNavigator.tsx
    types.ts
  store/
    store.ts
    authSlice.ts
  screens/               # Auth, Feed, Discover, Upload, Notifications, Profile, EditProfile
  components/
    VideoCard.tsx        # Full-bleed player + actions
    Feed.tsx             # Vertical FlatList + comments sheet
    Profile.tsx          # Header + video grid
  theme/colors.ts
  types/video.ts
```

## Admin web

Moderation and analytics live in [`../socialadmin`](../socialadmin) (`/admin/...`), using the same API with an admin JWT.
