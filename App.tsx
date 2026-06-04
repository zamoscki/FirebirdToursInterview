import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { useMigrations } from 'drizzle-orm/op-sqlite/migrator';
import { db } from './src/db';
import migrations from './src/db/migrations/migrations.ts';
import RootNavigator from './src/navigation/Root.navigator';

enableScreens();

export default function App() {
  const { success, error } = useMigrations(db, migrations);
  const isDarkMode = useColorScheme() === 'dark';

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Migration failed: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginHorizontal: 24,
  },
});
