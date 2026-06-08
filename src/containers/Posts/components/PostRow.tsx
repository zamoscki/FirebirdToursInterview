import { memo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-worklets';
import { useFavoritesStore } from '@stores/favorites.store';
import { usePostDetailsStore } from '@stores/post-details.store';
import { CachedImage } from '@components/CachedImage';
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
  const isCached = usePostDetailsStore(s => s.cachedIds.has(item.id));
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
          <View style={styles.idBox}>
            <Text style={styles.id}>{item.id}</Text>
          </View>
          <View style={styles.descBox}>
            <CachedImage source={{ uri: item.imageUrl }} style={styles.thumbnail} />
            <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
            {isCached && <Text style={styles.cachedBadge}>Cached</Text>}
            {isFavorite && <Text style={styles.favoriteBadge}>★</Text>}
          </View>
        </View>
      </GestureDetector>
    </ReanimatedSwipeable>
  );
}

export const PostRow = memo(PostRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  descBox: {
    flex: 1,
    gap: 16,
    alignItems: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  thumbnail: {
    width: 25,
    height: 25,
    borderRadius: 25,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  idBox: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#ccc',
  },
  id: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cachedBadge: {
    fontSize: 12,
    color: '#8e8e93',
    textTransform: 'uppercase',
    marginLeft: 8,
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
