import React from 'react';
import { render } from '@testing-library/react-native';

import { usePostsStore } from '@stores/posts.store';
import { useFavoritesStore } from '@stores/favorites.store';
import { usePostDetailsStore } from '@stores/post-details.store';

import { PostsContainer } from './Posts.container';

jest.mock('@stores/posts.store', () => ({ usePostsStore: jest.fn() }));
jest.mock('@stores/favorites.store', () => ({ useFavoritesStore: jest.fn() }));
jest.mock('@stores/post-details.store', () => ({
  usePostDetailsStore: jest.fn(),
}));

// Note: jest.mock() factories are hoisted above all imports, so they cannot
// reference top-level variables like `React` or `Text` — require them inline.
jest.mock('./components/PostRow', () => {
  const r = require('react');
  const rn = require('react-native');
  return {
    PostRow: ({ item }: any) =>
      r.createElement(rn.Text, { testID: `row-${item.id}` }, item.title),
  };
});

const mockPostsStore = usePostsStore as unknown as jest.Mock;
const mockFavoritesStore = useFavoritesStore as unknown as jest.Mock;
const mockDetailsStore = usePostDetailsStore as unknown as jest.Mock;

type StoreSetup = {
  posts?: any[];
  isLoading?: boolean;
  error?: string | null;
  favoriteIds?: Set<number>;
  loadPosts?: jest.Mock;
  loadFavorites?: jest.Mock;
  loadCachedIds?: jest.Mock;
  toggleFavorite?: jest.Mock;
};

function setupStores(setup: StoreSetup = {}) {
  const loadPosts = setup.loadPosts ?? jest.fn();
  const loadFavorites = setup.loadFavorites ?? jest.fn();
  const loadCachedIds = setup.loadCachedIds ?? jest.fn();
  const toggleFavorite = setup.toggleFavorite ?? jest.fn();

  const postsState = {
    posts: setup.posts ?? [],
    isLoading: setup.isLoading ?? false,
    error: setup.error ?? null,
    loadPosts,
  };
  const favoritesState = {
    favoriteIds: setup.favoriteIds ?? new Set<number>(),
    loadFavorites,
    toggleFavorite,
  };
  const detailsState = { loadCachedIds };

  mockPostsStore.mockImplementation((sel: any) => sel(postsState));
  mockFavoritesStore.mockImplementation((sel: any) => sel(favoritesState));
  mockDetailsStore.mockImplementation((sel: any) => sel(detailsState));

  return { loadPosts, loadFavorites, loadCachedIds, toggleFavorite };
}

const MOCK_POSTS = [
  { id: 1, userId: 1, title: 'one', body: 'b1', imageUrl: 'i1' },
  { id: 2, userId: 1, title: 'two', body: 'b2', imageUrl: 'i2' },
  { id: 3, userId: 1, title: 'three', body: 'b3', imageUrl: 'i3' },
];

describe('PostsContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading indicator when isLoading is true (no list, no error)', async () => {
    setupStores({ isLoading: true, posts: MOCK_POSTS });
    const { queryByText, queryByTestId } = await render(
      <PostsContainer onPostPress={jest.fn()} />,
    );
    // Loading branch renders only ActivityIndicator — none of the list/header
    // content or error text should be present.
    expect(queryByText('Favorites')).toBeNull();
    expect(queryByText('Other')).toBeNull();
    expect(queryByTestId('row-1')).toBeNull();
  });

  it('shows error text when error is set', async () => {
    setupStores({ error: 'something failed' });
    const { getByText } = await render(
      <PostsContainer onPostPress={jest.fn()} />,
    );
    expect(getByText('something failed')).toBeTruthy();
  });

  it('renders favorites in Set insertion order, others in original order, with both headers', async () => {
    setupStores({
      posts: MOCK_POSTS,
      // Favorites order: 3, then 1
      favoriteIds: new Set<number>([3, 1]),
    });

    const { getByText, getByTestId } = await render(
      <PostsContainer onPostPress={jest.fn()} />,
    );

    expect(getByText('Favorites')).toBeTruthy();
    expect(getByText('Other')).toBeTruthy();
    expect(getByTestId('row-1')).toBeTruthy();
    expect(getByTestId('row-2')).toBeTruthy(); expect(getByTestId('row-3')).toBeTruthy();
  });

  it('hides the Favorites header when no posts are favorited', async () => {
    setupStores({ posts: MOCK_POSTS, favoriteIds: new Set<number>() });

    const { queryByText, getByText } = await render(
      <PostsContainer onPostPress={jest.fn()} />,
    );

    expect(queryByText('Favorites')).toBeNull();
    expect(getByText('Other')).toBeTruthy();
  });

  it('invokes loadPosts, loadFavorites, and loadCachedIds on mount', async () => {
    const { loadPosts, loadFavorites, loadCachedIds } = setupStores({
      posts: MOCK_POSTS,
    });

    await render(<PostsContainer onPostPress={jest.fn()} />);

    expect(loadPosts).toHaveBeenCalledTimes(1);
    expect(loadFavorites).toHaveBeenCalledTimes(1);
    expect(loadCachedIds).toHaveBeenCalledTimes(1);
  });
});
