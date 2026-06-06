import { useLayoutEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { HeaderButton } from '@react-navigation/elements';
import { useFavoritesStore } from '@stores/favorites.store';
import { DetailsContainer } from '@containers/Details.container';

import { DetailsScreenProps } from './types';

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: renderFavoriteHeaderRight(postId),
    });
  }, [navigation, postId]);

  return <DetailsContainer postId={postId} />;
}

const styles = StyleSheet.create({
  headerStar: {
    fontSize: 22,
    color: '#888',
  },
  headerStarOn: {
    color: '#f5a623',
  },
});
