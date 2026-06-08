import { render } from '@testing-library/react-native';

import { usePostsStore } from '@stores/posts.store';
import { usePostDetailsStore } from '@stores/post-details.store';

import { DetailsContainer } from './Details.container';

jest.mock('@stores/posts.store', () => ({ usePostsStore: jest.fn() }));
jest.mock('@stores/post-details.store', () => ({
  usePostDetailsStore: jest.fn(),
}));

jest.mock('@components/CachedImage', () => ({
  CachedImage: () => null,
}));

const mockPostsStore = usePostsStore as unknown as jest.Mock;
const mockDetailsStore = usePostDetailsStore as unknown as jest.Mock;

type Setup = {
  posts?: any[];
  detailsById?: Record<number, any>;
  loadingIds?: Set<number>;
  errorById?: Record<number, string>;
  loadPostDetails?: jest.Mock;
};

function setupStores(s: Setup = {}) {
  const loadPostDetails = s.loadPostDetails ?? jest.fn();
  const postsState = { posts: s.posts ?? [] };
  const detailsState = {
    detailsById: s.detailsById ?? {},
    loadingIds: s.loadingIds ?? new Set<number>(),
    errorById: s.errorById ?? {},
    loadPostDetails,
  };
  mockPostsStore.mockImplementation((sel: any) => sel(postsState));
  mockDetailsStore.mockImplementation((sel: any) => sel(detailsState));
  return { loadPostDetails };
}

const POST = { id: 1, userId: 1, title: 'list title', body: 'b', imageUrl: 'i' };
const DETAILS = {
  postId: 1,
  userId: 1,
  title: 'details title',
  body: 'details body',
  imageUrl: 'i',
  fetchedAt: 1,
};

describe('DetailsContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows "Post not found." when the list does not contain the id', async () => {
    setupStores({ posts: [] });
    const { getByText } = await render(<DetailsContainer postId={42} />);
    expect(getByText('Post not found.')).toBeTruthy();
  });

  it('renders the error message when errorById[postId] is set', async () => {
    setupStores({
      posts: [POST],
      errorById: { 1: 'fetch failed' },
    });
    const { getByText } = await render(<DetailsContainer postId={1} />);
    expect(getByText('fetch failed')).toBeTruthy();
  });

  it('shows a loading indicator when details are loading (no body, no error)', async () => {
    setupStores({
      posts: [POST],
      loadingIds: new Set<number>([1]),
    });
    const { queryByText } = await render(<DetailsContainer postId={1} />);
    // Loading branch renders only ActivityIndicator — no list/error text.
    expect(queryByText('list title')).toBeNull();
    expect(queryByText('details title')).toBeNull();
    expect(queryByText('Post not found.')).toBeNull();
  });

  it('renders title and body from details when data is available', async () => {
    setupStores({ posts: [POST], detailsById: { 1: DETAILS } });
    const { getByText } = await render(<DetailsContainer postId={1} />);
    expect(getByText('details title')).toBeTruthy();
    expect(getByText('details body')).toBeTruthy();
  });

  it('calls loadPostDetails(postId) on mount', async () => {
    const { loadPostDetails } = setupStores({
      posts: [POST],
      detailsById: { 1: DETAILS },
    });
    await render(<DetailsContainer postId={1} />);
    expect(loadPostDetails).toHaveBeenCalledWith(1);
  });
});
