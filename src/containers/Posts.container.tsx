import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CachedImage } from '../components/CachedImage';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-worklets';
import { usePostsStore } from '@stores/posts.store';
import { useFavoritesStore } from '@stores/favorites.store';
import type { Post } from '@db/schema';

type PostRowProps = {
  item: Post;
  onPress: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onSwipeOpen: (methods: SwipeableMethods) => void;
};

function PostRowComponent({
  item,
  onPress,
  onToggleFavorite,
  onSwipeOpen,
}: PostRowProps) {
  const isFavorite = useFavoritesStore(s => s.favoriteIds.has(item.id));
  const swipeableRef = useRef<SwipeableMethods>(null);

  const handlePress = () => onPress(item.id);
  const handleToggle = () => onToggleFavorite(item.id);

  const renderRightActions = (
    _progress: unknown,
    _translation: unknown,
    swipeableMethods: SwipeableMethods,
  ) => (
    <Pressable
      style={styles.favoriteAction}
      onPress={() => {
        handleToggle();
        swipeableMethods.close();
      }}>
      <Text style={styles.favoriteActionText}>{isFavorite ? '★' : '☆'}</Text>
    </Pressable>
  );

  const tapGesture = useTapGesture({
    onActivate: () => {
      'worklet';
      runOnJS(handlePress)();
    },
  });

  // console.log(`render item: ${item.id}`);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => {
        if (swipeableRef.current) {
          onSwipeOpen(swipeableRef.current);
        }
      }}>
      <GestureDetector gesture={tapGesture}>
        <View style={styles.row}>
          <CachedImage source={{ uri: item.imageUrl }} style={styles.thumbnail} />
          <Text style={styles.title}>{item.title}</Text>
          {isFavorite && <Text style={styles.favoriteBadge}>★</Text>}
        </View>
      </GestureDetector>
    </ReanimatedSwipeable>
  );
}

const PostRow = memo(PostRowComponent);

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
    loadPosts();
    loadFavorites();
  }, [loadPosts, loadFavorites]);

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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  thumbnail: {
    width: 25,
    height: 25,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  favoriteBadge: {
    fontSize: 18,
    color: '#f5a623',
  },
  favoriteAction: {
    backgroundColor: '#f5a623',
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
  },
  favoriteActionText: {
    fontSize: 28,
    color: '#fff',
  },
});
