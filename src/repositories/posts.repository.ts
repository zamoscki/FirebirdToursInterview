import {eq} from 'drizzle-orm';
import {db} from '../db';
import {posts} from '../db/schema';
import type {NewPost} from '../db/schema';

export const postsRepository = {
  getAll: () => db.select().from(posts).all(),
  getById: (id: number) => db.select().from(posts).where(eq(posts.id, id)).get(),
  insertMany: (data: NewPost[]) => db.insert(posts).values(data).run(),
  isEmpty: async () => !(await db.select().from(posts).limit(1).get()),
};
