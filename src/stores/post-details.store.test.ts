import { postDetailsRepository } from '@repositories/post-details.repository';
import { fetchPostById, getPostImageUrl } from '../api/posts.api';

import { usePostDetailsStore } from './post-details.store';

jest.mock('@repositories/post-details.repository', () => ({
  postDetailsRepository: {
    getById: jest.fn(),
    getAllIds: jest.fn(),
    upsert: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('../api/posts.api', () => ({
  fetchPostById: jest.fn(),
  getPostImageUrl: jest.fn((id: number) => `https://img/${id}`),
}));

const mockedRepo = postDetailsRepository as jest.Mocked<
  typeof postDetailsRepository
>;
const mockedFetch = fetchPostById as jest.MockedFunction<typeof fetchPostById>;
const mockedImage = getPostImageUrl as jest.MockedFunction<
  typeof getPostImageUrl
>;

function resetStore() {
  usePostDetailsStore.setState({
    detailsById: {},
    cachedIds: new Set<number>(),
    loadingIds: new Set<number>(),
    errorById: {},
  });
}

describe('usePostDetailsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  describe('loadPostDetails', () => {
    it('returns early when the id is already in memory (no DB/API access)', async () => {
      const cached = {
        postId: 1,
        userId: 1,
        title: 't',
        body: 'b',
        imageUrl: 'i',
        fetchedAt: 1,
      };
      usePostDetailsStore.setState({ detailsById: { 1: cached as any } });

      await usePostDetailsStore.getState().loadPostDetails(1);

      expect(mockedRepo.getById).not.toHaveBeenCalled();
      expect(mockedFetch).not.toHaveBeenCalled();
    });

    it('hydrates from DB cache without calling the API', async () => {
      const cached = {
        postId: 5,
        userId: 2,
        title: 'cached',
        body: 'body',
        imageUrl: 'i',
        fetchedAt: 1,
      };
      mockedRepo.getById.mockResolvedValue(cached as any);

      await usePostDetailsStore.getState().loadPostDetails(5);

      expect(mockedFetch).not.toHaveBeenCalled();
      expect(usePostDetailsStore.getState().detailsById[5]).toEqual(cached);
    });

    it('fetches from API on miss, upserts, and transitions loading -> cached', async () => {
      mockedRepo.getById.mockResolvedValue(undefined as any);
      mockedFetch.mockResolvedValue({
        id: 3,
        userId: 9,
        title: 'fresh',
        body: 'b',
      });

      await usePostDetailsStore.getState().loadPostDetails(3);

      expect(mockedImage).toHaveBeenCalledWith(3, 300);
      expect(mockedRepo.upsert).toHaveBeenCalledTimes(1);
      const state = usePostDetailsStore.getState();
      expect(state.detailsById[3]).toMatchObject({
        postId: 3,
        userId: 9,
        title: 'fresh',
        body: 'b',
        imageUrl: 'https://img/3',
      });
      expect(state.cachedIds.has(3)).toBe(true);
      expect(state.loadingIds.has(3)).toBe(false);
      expect(state.errorById[3]).toBeUndefined();
    });

    it('records per-id error and removes from loadingIds on API failure', async () => {
      mockedRepo.getById.mockResolvedValue(undefined as any);
      mockedFetch.mockRejectedValue(new Error('boom'));

      await usePostDetailsStore.getState().loadPostDetails(8);

      const state = usePostDetailsStore.getState();
      expect(state.errorById[8]).toBe('boom');
      expect(state.loadingIds.has(8)).toBe(false);
      expect(state.detailsById[8]).toBeUndefined();
      expect(state.cachedIds.has(8)).toBe(false);
    });
  });

  describe('loadCachedIds', () => {
    it('populates cachedIds Set from the repository', async () => {
      mockedRepo.getAllIds.mockResolvedValue([
        { postId: 1 },
        { postId: 2 },
      ] as any);

      await usePostDetailsStore.getState().loadCachedIds();

      const ids = usePostDetailsStore.getState().cachedIds;
      expect(ids.has(1)).toBe(true);
      expect(ids.has(2)).toBe(true);
      expect(ids.size).toBe(2);
    });
  });

  describe('clear', () => {
    it('clears the repository and resets all state', async () => {
      usePostDetailsStore.setState({
        detailsById: { 1: { postId: 1 } as any },
        cachedIds: new Set([1]),
        loadingIds: new Set([2]),
        errorById: { 3: 'e' },
      });

      await usePostDetailsStore.getState().clear();

      expect(mockedRepo.clear).toHaveBeenCalledTimes(1);
      const state = usePostDetailsStore.getState();
      expect(state.detailsById).toEqual({});
      expect(state.cachedIds.size).toBe(0);
      expect(state.loadingIds.size).toBe(0);
      expect(state.errorById).toEqual({});
    });
  });
});
