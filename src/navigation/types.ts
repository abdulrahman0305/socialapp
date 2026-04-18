export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Discover: undefined;
  Upload: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  UserProfile: { userId: string };
};
