import { useState, useEffect } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { db } from '../db';
import { posts, Post } from '../db/schema';
import { PostsScreenProps } from '../navigation/types';

export default function PostsScreen({ navigation }: PostsScreenProps) {
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  useEffect(() => {
    setAllPosts(db.select().from(posts).all());
  }, []);

  return (
    <FlatList
      data={allPosts}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Details', { postId: item.id })}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.thumbnail}
          />
          <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
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
});
