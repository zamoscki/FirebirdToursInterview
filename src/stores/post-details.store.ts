import { create } from 'zustand';
import { fetchPostById, getPostImageUrl } from '../api/posts.api';
import { postDetailsRepository } from '@repositories/post-details.repository';
import type { PostDetails } from '@db/schema';

type PostDetailsState = {
  detailsById: Record<number, PostDetails>;
  cachedIds: Set<number>;
  loadingIds: Set<number>;
  errorById: Record<number, string>;
  loadCachedIds: () => Promise<void>;
  loadPostDetails: (id: number) => Promise<void>;
  clear: () => Promise<void>;
};

export const usePostDetailsStore = create<PostDetailsState>((set, get) => ({
  detailsById: {},
  cachedIds: new Set<number>(),
  loadingIds: new Set<number>(),
  errorById: {},
  loadCachedIds: async () => {
    const rows = await postDetailsRepository.getAllIds();
    set({ cachedIds: new Set<number>(rows.map(r => r.postId)) });
  },
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
      const nextErrors = { ...state.errorById };

      // clear state values for current id (delete error and update set as loading);
      next.add(id);
      delete nextErrors[id];
      return { loadingIds: next, errorById: nextErrors };
    });

    try {
      const response = await fetchPostById(id);

      const details: PostDetails = {
        postId: response.id,
        userId: response.userId,
        title: response.title,
        body: response.body,
        imageUrl: getPostImageUrl(response.id, 300),
        fetchedAt: Date.now(),
      };

      await postDetailsRepository.upsert(details);

      set(state => {
        const nextLoading = new Set(state.loadingIds);
        nextLoading.delete(id);
        const nextCached = new Set(state.cachedIds);
        nextCached.add(id);
        return {
          detailsById: { ...state.detailsById, [id]: details },
          loadingIds: nextLoading,
          cachedIds: nextCached,
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
    set({
      detailsById: {},
      cachedIds: new Set<number>(),
      loadingIds: new Set<number>(),
      errorById: {},
    });
  },
}));
