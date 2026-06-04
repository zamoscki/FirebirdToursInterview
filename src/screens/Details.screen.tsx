import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { posts } from '../db/schema';
import { DetailsScreenProps } from '../navigation/types';

export default function DetailsScreen({ route }: DetailsScreenProps) {
  const post = useMemo(
    () =>
      db
        .select()
        .from(posts)
        .where(eq(posts.id, route.params.postId))
        .get(),
    [route.params.postId],
  );

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Post not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: post.imageUrl }} style={styles.image} />
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'flex-start',
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
});
