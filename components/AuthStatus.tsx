import { memo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';

import { useAuthContext } from '../context/AuthContext';

const AuthStatus = () => {
  const { initializing, user, error, signInAnonymously, signOut } = useAuthContext();

  if (initializing) {
    return (
      <View className="w-full items-center justify-center rounded-lg bg-gray-800/80 px-4 py-2">
        <ActivityIndicator size="small" color="#ffffff" />
        <Text className="mt-1 text-xs text-white">Bağlanıyor...</Text>
      </View>
    );
  }

  return (
    <View className="w-full rounded-lg bg-gray-800/80 px-4 py-2">
      {error && <Text className="mb-2 text-xs text-red-400">{error}</Text>}

      {user ? (
        <View className="w-full flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-white">
              <Text className="font-bold">Durum:</Text> Anonim Kullanıcı
            </Text>
            <Text className="text-xs text-white/70">ID: {user.uid.substring(0, 8)}...</Text>
          </View>
          <TouchableOpacity
            onPress={signOut}
            className="ml-2 rounded-full bg-red-700 px-3 py-1"
            accessibilityLabel="Çıkış Yap"
            accessibilityRole="button">
            <Text className="text-xs text-white">Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="w-full flex-row items-center justify-between">
          <Text className="text-xs text-white">Giriş yapılmadı</Text>
          <TouchableOpacity
            onPress={signInAnonymously}
            className="ml-2 rounded-full bg-green-700 px-3 py-1"
            accessibilityLabel="Giriş Yap"
            accessibilityRole="button">
            <Text className="text-xs text-white">Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Component'i memo ile wrap ederek gereksiz render'ları önlüyoruz
export default memo(AuthStatus);
