import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { usePostsStore } from '@stores/posts.store';
import { useFavoritesStore } from '@stores/favorites.store';
import { usePostDetailsStore } from '@stores/post-details.store';
import type { Post } from '@db/schema';

import { PostRow } from './components/PostRow';

type PostsContainerProps = {
  onPostPress: (id: number) => void;
};

export function PostsContainer({ onPostPress }: PostsContainerProps) {
  const posts = usePostsStore(s => s.posts);
  const isLoading = usePostsStore(s => s.isLoading);
  const error = usePostsStore(s => s.error);
  const favoriteIds = useFavoritesStore(s => s.favoriteIds);

  const loadPosts = usePostsStore(s => s.loadPosts);
  const loadFavorites = useFavoritesStore(s => s.loadFavorites);
  const loadCachedIds = usePostDetailsStore(s => s.loadCachedIds);
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite);

  const openSwipeableRef = useRef<SwipeableMethods | null>(null);

  const sections = useMemo(() => {
    const postById = new Map(posts.map(p => [p.id, p]));
    const favoritePosts: Post[] = [];
    for (const id of favoriteIds) {
      const post = postById.get(id);
      if (post) {
        favoritePosts.push(post);
      }
    }
    const otherPosts = posts.filter(p => !favoriteIds.has(p.id));
    return [
      { title: 'Favorites', data: favoritePosts },
      { title: 'Other', data: otherPosts },
    ];
  }, [posts, favoriteIds]);

  const handleSwipeOpen = useCallback((methods: SwipeableMethods) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== methods) {
      openSwipeableRef.current.close();
    }
    openSwipeableRef.current = methods;
  }, []);

  const closeOpenSwipeable = useCallback(() => {
    openSwipeableRef.current?.close();
    openSwipeableRef.current = null;
  }, []);

  useEffect(() => {
    console.log('EFFECT');
    loadPosts();
    loadFavorites();
    loadCachedIds();
  }, [loadPosts, loadFavorites, loadCachedIds]);

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostRow
        item={item}
        onPress={onPostPress}
        onToggleFavorite={toggleFavorite}
        onSwipeOpen={handleSwipeOpen}
      />
    ),
    [onPostPress, toggleFavorite, handleSwipeOpen],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      contentInsetAdjustmentBehavior="automatic"
      keyExtractor={item => String(item.id)}
      onScrollBeginDrag={closeOpenSwipeable}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      stickySectionHeadersEnabled={false}
      renderItem={renderItem}
      renderSectionHeader={({ section }) =>
        section.data.length === 0 ? null : (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
        )
      }
    />
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b6b70',
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
  },
});
