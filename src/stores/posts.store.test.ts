import { postsRepository } from '@repositories/posts.repository';
import { fetchPosts, getPostImageUrl } from '../api/posts.api';

import { usePostsStore } from './posts.store';

jest.mock('@repositories/posts.repository', () => ({
  postsRepository: {
    getAll: jest.fn(),
    isEmpty: jest.fn(),
    insertMany: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('../api/posts.api', () => ({
  fetchPosts: jest.fn(),
  getPostImageUrl: jest.fn((id: number) => `https://img/${id}`),
}));

const mockedRepo = postsRepository as jest.Mocked<typeof postsRepository>;
const mockedFetchPosts = fetchPosts as jest.MockedFunction<typeof fetchPosts>;
const mockedGetImageUrl = getPostImageUrl as jest.MockedFunction<
  typeof getPostImageUrl
>;

describe('usePostsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePostsStore.setState({ posts: [], isLoading: false, error: null });
  });

  describe('loadPosts', () => {
    it('loads from repository when DB is not empty and skips the API', async () => {
      const cached = [
        { id: 1, userId: 1, title: 't1', body: 'b1', imageUrl: 'i1' },
      ];
      mockedRepo.isEmpty.mockResolvedValue(false);
      mockedRepo.getAll.mockResolvedValue(cached as any);

      await usePostsStore.getState().loadPosts();

      expect(mockedFetchPosts).not.toHaveBeenCalled();
      expect(mockedRepo.insertMany).not.toHaveBeenCalled();
      const state = usePostsStore.getState();
      expect(state.posts).toEqual(cached);
      expect(state.isLoading).toBe(false);
    });

    it('fetches from API, enriches with image URLs and inserts when DB is empty', async () => {
      mockedRepo.isEmpty.mockResolvedValue(true);
      mockedFetchPosts.mockResolvedValue([
        { id: 1, userId: 10, title: 't1', body: 'b1' },
        { id: 2, userId: 20, title: 't2', body: 'b2' },
      ]);

      await usePostsStore.getState().loadPosts();

      expect(mockedFetchPosts).toHaveBeenCalledTimes(1);
      expect(mockedGetImageUrl).toHaveBeenCalledWith(1, 25);
      expect(mockedGetImageUrl).toHaveBeenCalledWith(2, 25);
      expect(mockedRepo.insertMany).toHaveBeenCalledWith([
        { id: 1, userId: 10, title: 't1', body: 'b1', imageUrl: 'https://img/1' },
        { id: 2, userId: 20, title: 't2', body: 'b2', imageUrl: 'https://img/2' },
      ]);
      const state = usePostsStore.getState();
      expect(state.posts).toHaveLength(2);
      expect(state.posts[0].imageUrl).toBe('https://img/1');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('records error and clears loading on API failure', async () => {
      mockedRepo.isEmpty.mockResolvedValue(true);
      mockedFetchPosts.mockRejectedValue(new Error('network down'));

      await usePostsStore.getState().loadPosts();

      const state = usePostsStore.getState();
      expect(state.error).toBe('network down');
      expect(state.isLoading).toBe(false);
      expect(state.posts).toEqual([]);
    });
  });

  describe('clear', () => {
    it('clears the repository and resets state', async () => {
      usePostsStore.setState({
        posts: [
          { id: 1, userId: 1, title: 't', body: 'b', imageUrl: 'i' } as any,
        ],
        isLoading: false,
        error: 'prev',
      });

      await usePostsStore.getState().clear();

      expect(mockedRepo.clear).toHaveBeenCalledTimes(1);
      expect(usePostsStore.getState()).toMatchObject({
        posts: [],
        isLoading: false,
        error: null,
      });
    });
  });
});
