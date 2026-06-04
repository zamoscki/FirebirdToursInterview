import { create } from 'zustand';
import { favoritesRepository } from '../repositories/favorites.repository';

type FavoritesState = {
  // Ordered most-recently-favorited first; Set preserves insertion order
  // and gives O(1) `.has()` lookup for per-row subscribers.
  favoriteIds: Set<number>;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (postId: number) => Promise<void>;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set<number>(),
  loadFavorites: async () => {
    const rows = await favoritesRepository.getAllOrderedByRecent();
    set({ favoriteIds: new Set(rows.map(r => r.postId)) });
  },
  toggleFavorite: async (postId: number) => {
    const current = get().favoriteIds;
    if (current.has(postId)) {
      const next = new Set(current);
      next.delete(postId);
      set({ favoriteIds: next });
      await favoritesRepository.remove(postId);
    } else {
      // Prepend so newly-favorited items are at the front of the Set's
      // insertion order.
      const next = new Set<number>([postId, ...current]);
      set({ favoriteIds: next });
      await favoritesRepository.add(postId, Date.now());
    }
  },
}));
