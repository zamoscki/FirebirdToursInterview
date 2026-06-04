import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  imageUrl: text('image_url').notNull(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export const favorites = sqliteTable('favorites', {
  postId: integer('post_id').primaryKey(),
  createdAt: integer('created_at').notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
