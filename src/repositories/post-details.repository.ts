import { eq } from 'drizzle-orm';
import { db } from '@db/index';
import { postDetails } from '@db/schema';
import type { NewPostDetails } from '@db/schema';

export const postDetailsRepository = {
  getById: (postId: number) => db.select()
    .from(postDetails)
    .where(eq(postDetails.postId, postId))
    .get(),
  upsert: (row: NewPostDetails) => db.insert(postDetails)
    .values(row)
    .onConflictDoUpdate({ target: postDetails.postId, set: row })
    .run(),
  clear: () => db.delete(postDetails).run(),
};
