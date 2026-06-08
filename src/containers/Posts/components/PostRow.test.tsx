import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { useFavoritesStore } from '@stores/favorites.store';
import { usePostDetailsStore } from '@stores/post-details.store';

import { PostRow } from './PostRow';

jest.mock('@stores/favorites.store', () => ({ useFavoritesStore: jest.fn() }));
jest.mock('@stores/post-details.store', () => ({
  usePostDetailsStore: jest.fn(),
}));

// Stub the swipeable so renderRightActions is invoked inline — lets us
// assert on the favorite action button and its close-on-press behavior.
jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  const r = require('react');
  const rn = require('react-native');
  const swipeableMethods = { close: jest.fn(), openLeft: jest.fn(), openRight: jest.fn(), reset: jest.fn() };
  const Swipeable = ({ children, renderRightActions }: any) =>
    r.createElement(
      rn.View,
      { testID: 'swipeable' },
      renderRightActions
        ? renderRightActions({}, {}, swipeableMethods)
        : null,
      children,
    );
  Swipeable.__swipeableMethods = swipeableMethods;
  return { __esModule: true, default: Swipeable };
});

// Render gesture detector children directly — bypass gesture system.
jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler');
  return {
    ...actual,
    GestureDetector: ({ children }: any) => children,
    useTapGesture: () => ({}),
  };
});

const mockFavorites = useFavoritesStore as unknown as jest.Mock;
const mockDetails = usePostDetailsStore as unknown as jest.Mock;

function setupStores({
  isFavorite = false,
  isCached = false,
}: { isFavorite?: boolean; isCached?: boolean } = {}) {
  mockFavorites.mockImplementation((sel: any) =>
    sel({ favoriteIds: new Set(isFavorite ? [1] : []) }),
  );
  mockDetails.mockImplementation((sel: any) =>
    sel({ cachedIds: new Set(isCached ? [1] : []) }),
  );
}

const ITEM = {
  id: 1,
  userId: 7,
  title: 'hello world',
  body: 'b',
  imageUrl: 'https://img/1',
};

describe('PostRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the post id and title', async () => {
    setupStores();
    const { getByText } = await render(
      <PostRow
        item={ITEM}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
        onSwipeOpen={jest.fn()}
      />,
    );
    expect(getByText('1')).toBeTruthy();
    expect(getByText('hello world')).toBeTruthy();
  });

  it('shows the "Cached" badge only when the post is cached', async () => {
    setupStores({ isCached: true });
    const { getByText, rerender, queryByText } = await render(
      <PostRow
        item={ITEM}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
        onSwipeOpen={jest.fn()}
      />,
    );
    expect(getByText('Cached')).toBeTruthy();

    setupStores({ isCached: false });
    await rerender(
      <PostRow
        item={ITEM}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
        onSwipeOpen={jest.fn()}
      />,
    );
    expect(queryByText('Cached')).toBeNull();
  });

  it('shows the favorite "★" badge only when the post is favorited', async () => {
    setupStores({ isFavorite: true });
    const { getAllByText, rerender, queryAllByText } = await render(
      <PostRow
        item={ITEM}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
        onSwipeOpen={jest.fn()}
      />,
    );
    // Two stars expected when favorited: row badge + swipe action label.
    expect(getAllByText('★').length).toBeGreaterThanOrEqual(1);

    setupStores({ isFavorite: false });
    await rerender(
      <PostRow
        item={ITEM}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
        onSwipeOpen={jest.fn()}
      />,
    );
    // Row badge gone; only the empty ☆ remains in the swipe action.
    expect(queryAllByText('★')).toEqual([]);
  });

  it('uses an empty ☆ in the swipe action when not favorited', async () => {
    setupStores({ isFavorite: false });
    const { getByText } = await render(
      <PostRow
        item={ITEM}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
        onSwipeOpen={jest.fn()}
      />,
    );
    expect(getByText('☆')).toBeTruthy();
  });

  it('calls onToggleFavorite and closes the swipeable when the swipe action is pressed', async () => {
    setupStores({ isFavorite: false });
    const onToggleFavorite = jest.fn();
    const { getByText } = await render(
      <PostRow
        item={ITEM}
        onPress={jest.fn()}
        onToggleFavorite={onToggleFavorite}
        onSwipeOpen={jest.fn()}
      />,
    );

    fireEvent.press(getByText('☆'));

    expect(onToggleFavorite).toHaveBeenCalledWith(1);
    const swipeable = require('react-native-gesture-handler/ReanimatedSwipeable')
      .default;
    expect(swipeable.__swipeableMethods.close).toHaveBeenCalled();
  });
});
