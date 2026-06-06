import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PostsScreen from './Posts.screen';
import DetailsScreen from './Details.screen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Posts"
      screenOptions={{
        headerLargeTitleEnabled: true,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="Posts" component={PostsScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}
