import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { favorites } from '../db/schema';

export const favoritesRepository = {
  getAllOrderedByRecent: () =>
    db.select().from(favorites).orderBy(desc(favorites.createdAt)).all(),
  isFavorite: (postId: number) =>
    db.select().from(favorites).where(eq(favorites.postId, postId)).get(),
  add: (postId: number, createdAt: number) =>
    db.insert(favorites).values({ postId, createdAt }).run(),
  remove: (postId: number) =>
    db.delete(favorites).where(eq(favorites.postId, postId)).run(),
};
