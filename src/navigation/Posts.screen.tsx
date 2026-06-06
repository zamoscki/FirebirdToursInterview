import { useCallback, useLayoutEffect } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { HeaderButton } from '@react-navigation/elements';
import { PostsContainer } from '@containers/Posts/Posts.container';
import { usePostsStore } from '@stores/posts.store';
import { usePostDetailsStore } from '@stores/post-details.store';
import { useFavoritesStore } from '@stores/favorites.store';

import { PostsScreenProps } from './types';

async function clearAllCaches() {
  // post_details first — its post_id FK references posts(id).
  await usePostDetailsStore.getState().clear();
  await useFavoritesStore.getState().clear();
  await usePostsStore.getState().clear();
}

function promptClearCache() {
  Alert.alert(
    'Clear cached data?',
    'This removes all posts, details, and favorites stored locally.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearAllCaches },
    ],
  );
}

function ClearHeaderButton() {
  return (
    <HeaderButton accessibilityLabel="Clear cache" onPress={promptClearCache}>
      <Text style={styles.label}>Clear</Text>
    </HeaderButton>
  );
}

const renderClearHeaderRight = () => <ClearHeaderButton />;

export default function PostsScreen({ navigation }: PostsScreenProps) {
  const handlePostPress = useCallback(
    (id: number) => navigation.navigate('Details', { postId: id }),
    [navigation],
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: renderClearHeaderRight });
  }, [navigation]);

  return <PostsContainer onPostPress={handlePostPress} />;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: '#ff3b30',
  },
});
