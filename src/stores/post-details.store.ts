import { create } from 'zustand';
import { fetchPostById, getPostImageUrl } from '../api/posts.api';
import { postDetailsRepository } from '@repositories/post-details.repository';
import type { PostDetails } from '@db/schema';

type PostDetailsState = {
  detailsById: Record<number, PostDetails>;
  loadingIds: Set<number>;
  errorById: Record<number, string>;
  loadPostDetails: (id: number) => Promise<void>;
  clear: () => Promise<void>;
};

export const usePostDetailsStore = create<PostDetailsState>((set, get) => ({
  detailsById: {},
  loadingIds: new Set<number>(),
  errorById: {},
  loadPostDetails: async (id: number) => {
    if (get().detailsById[id]) {
      return;
    }

    const cached = await postDetailsRepository.getById(id);

    if (cached) {
      set(state => ({ detailsById: { ...state.detailsById, [id]: cached } }));
      return;
    }

    set(state => {
      const next = new Set(state.loadingIds);
      next.add(id);
      const nextErrors = { ...state.errorById };
      delete nextErrors[id];
      return { loadingIds: next, errorById: nextErrors };
    });

    try {
      const apiPost = await fetchPostById(id);

      const row: PostDetails = {
        postId: apiPost.id,
        userId: apiPost.userId,
        title: apiPost.title,
        body: apiPost.body,
        imageUrl: getPostImageUrl(apiPost.id, 300),
        fetchedAt: Date.now(),
      };

      await postDetailsRepository.upsert(row);

      set(state => {
        const nextLoading = new Set(state.loadingIds);
        nextLoading.delete(id);
        return {
          detailsById: { ...state.detailsById, [id]: row },
          loadingIds: nextLoading,
        };
      });

    } catch (err) {
      set(state => {
        const nextLoading = new Set(state.loadingIds);
        nextLoading.delete(id);
        return {
          loadingIds: nextLoading,
          errorById: { ...state.errorById, [id]: (err as Error).message },
        };
      });
    }
  },
  clear: async () => {
    await postDetailsRepository.clear();
    set({ detailsById: {}, loadingIds: new Set<number>(), errorById: {} });
  },
}));
