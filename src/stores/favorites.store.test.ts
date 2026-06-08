import { favoritesRepository } from '@repositories/favorites.repository';
import { useFavoritesStore } from './favorites.store';

jest.mock('@repositories/favorites.repository', () => ({
  favoritesRepository: {
    getAllOrderedByRecent: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
}));

const mockedRepo = favoritesRepository as jest.Mocked<typeof favoritesRepository>;

describe('useFavoritesStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFavoritesStore.setState({ favoriteIds: new Set<number>() });
  });

  describe('loadFavorites', () => {
    it('populates the Set preserving the repository order (most-recent-first)', async () => {
      mockedRepo.getAllOrderedByRecent.mockResolvedValue([
        { postId: 7, createdAt: 300 },
        { postId: 3, createdAt: 200 },
        { postId: 1, createdAt: 100 },
      ] as any);

      await useFavoritesStore.getState().loadFavorites();

      const ids = Array.from(useFavoritesStore.getState().favoriteIds);
      expect(ids).toEqual([7, 3, 1]);
    });
  });

  describe('toggleFavorite', () => {
    it('prepends a new id (newest-first) and persists via repository.add', async () => {
      useFavoritesStore.setState({ favoriteIds: new Set<number>([2, 1]) });

      await useFavoritesStore.getState().toggleFavorite(9);

      const ids = Array.from(useFavoritesStore.getState().favoriteIds);
      expect(ids).toEqual([9, 2, 1]);
      expect(mockedRepo.add).toHaveBeenCalledWith(9, expect.any(Number));
      expect(mockedRepo.remove).not.toHaveBeenCalled();
    });

    it('removes an existing id and persists via repository.remove', async () => {
      useFavoritesStore.setState({ favoriteIds: new Set<number>([2, 1]) });

      await useFavoritesStore.getState().toggleFavorite(2);

      const ids = Array.from(useFavoritesStore.getState().favoriteIds);
      expect(ids).toEqual([1]);
      expect(mockedRepo.remove).toHaveBeenCalledWith(2);
      expect(mockedRepo.add).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('empties the Set and clears the repository', async () => {
      useFavoritesStore.setState({ favoriteIds: new Set<number>([1, 2, 3]) });

      await useFavoritesStore.getState().clear();

      expect(mockedRepo.clear).toHaveBeenCalledTimes(1);
      expect(useFavoritesStore.getState().favoriteIds.size).toBe(0);
    });
  });
});
