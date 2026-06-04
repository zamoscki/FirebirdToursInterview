import { useLayoutEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HeaderButton } from '@react-navigation/elements';
import { usePostsStore } from '../stores/posts.store';
import { useFavoritesStore } from '../stores/favorites.store';
import { DetailsScreenProps } from '../navigation/types';

function FavoriteHeaderButton({ postId }: { postId: number }) {
  const isFavorite = useFavoritesStore(s => s.favoriteIds.has(postId));
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite);

  return (
    <HeaderButton
      accessibilityLabel={isFavorite ? 'Unfavorite' : 'Favorite'}
      onPress={() => toggleFavorite(postId)}>
      <Text style={[styles.headerStar, isFavorite && styles.headerStarOn]}>
        {isFavorite ? '★' : '☆'}
      </Text>
    </HeaderButton>
  );
}

const renderFavoriteHeaderRight =
  (postId: number) => () => <FavoriteHeaderButton postId={postId} />;

export default function DetailsScreen({ route, navigation }: DetailsScreenProps) {
  const { postId } = route.params;
  const post = usePostsStore(s => s.posts.find(p => p.id === postId));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: renderFavoriteHeaderRight(postId),
    });
  }, [navigation, postId]);

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text>Post not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      contentInsetAdjustmentBehavior="automatic">
      <Image source={{ uri: post.imageUrl }} style={styles.image} />
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 16,
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 16

  },
  image: {
    width: 25,
    height: 25,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  headerStar: {
    fontSize: 22,
    color: '#888',
  },
  headerStarOn: {
    color: '#f5a623',
  },
});
