import { create } from 'zustand';
import { fetchPosts, getPostImageUrl } from '../api/posts.api';
import { postsRepository } from '@repositories/posts.repository';
import type { Post } from '@db/schema';

type PostsState = {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  loadPosts: () => Promise<void>;
  clear: () => Promise<void>;
};

export const usePostsStore = create<PostsState>(set => ({
  posts: [],
  isLoading: false,
  error: null,
  loadPosts: async () => {
    set({ isLoading: true, error: null });

    try {
      if (!(await postsRepository.isEmpty())) {
        set({ posts: await postsRepository.getAll(), isLoading: false });
        return;
      }

      const apiPosts = await fetchPosts();
      const toInsert = apiPosts.map(p => ({
        ...p,
        imageUrl: getPostImageUrl(p.id, 25),
      }));

      await postsRepository.insertMany(toInsert);
      set({ posts: toInsert, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
  clear: async () => {
    await postsRepository.clear();
    set({ posts: [], isLoading: false, error: null });
  },
}));
