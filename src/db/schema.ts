import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  imageUrl: text('image_url').notNull(),
});

export const favorites = sqliteTable('favorites', {
  postId: integer('post_id').primaryKey(),
  createdAt: integer('created_at').notNull(),
});

/**
  * Why?
  *
  * Creation of this table was intentional, because
  * for now post list item and post details data structure are
  * identical, in real world applications often it's not the case.
  * In most cases Post details has much more information,
  * so, we can't cache details just caching only post list. We also
  * should cache details information separatly.
*/
export const postDetails = sqliteTable('post_details', {
  postId: integer('post_id')
    .primaryKey()
    .references(() => posts.id),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  imageUrl: text('image_url'),
  fetchedAt: integer('fetched_at').notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostDetails = typeof postDetails.$inferSelect;
export type NewPostDetails = typeof postDetails.$inferInsert;
