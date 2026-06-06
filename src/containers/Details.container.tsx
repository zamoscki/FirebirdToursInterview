import { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CachedImage } from '../components/CachedImage';
import { usePostsStore } from '@stores/posts.store';
import { usePostDetailsStore } from '@stores/post-details.store';

type DetailsContainerProps = {
  postId: number;
};

export function DetailsContainer({ postId }: DetailsContainerProps) {
  const listPost = usePostsStore(s => s.posts.find(p => p.id === postId));
  const details = usePostDetailsStore(s => s.detailsById[postId]);
  const isLoading = usePostDetailsStore(s => s.loadingIds.has(postId));
  const error = usePostDetailsStore(s => s.errorById[postId]);
  const loadPostDetails = usePostDetailsStore(s => s.loadPostDetails);

  useEffect(() => {
    loadPostDetails(postId);
  }, [loadPostDetails, postId]);

  if (!listPost) {
    return (
      <View style={styles.centered}>
        <Text>Post not found.</Text>
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

  if (!details || isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      contentInsetAdjustmentBehavior="automatic">
      {details.imageUrl && (
        <CachedImage source={{ uri: details.imageUrl }} style={styles.image} />
      )}
      <View style={styles.description}>
        <Text style={styles.title}>{details.title}</Text>
        <Text style={styles.body}>{details.body}</Text>
      </View>
    </ScrollView>
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
  container: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  description: {
    padding: 16,
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 12,
    alignSelf: 'center',
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
});
