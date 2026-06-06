import { eq } from 'drizzle-orm';
import { db } from '@db/index';
import { postDetails } from '@db/schema';
import type { NewPostDetails } from '@db/schema';

export const postDetailsRepository = {
  getById: (postId: number) => db.select()
    .from(postDetails)
    .where(eq(postDetails.postId, postId))
    .get(),
  getAllIds: () => db.select({ postId: postDetails.postId })
    .from(postDetails)
    .all(),
  upsert: (details: NewPostDetails) => db.insert(postDetails)
    .values(details)
    .onConflictDoUpdate({ target: postDetails.postId, set: details })
    .run(),
  clear: () => db.delete(postDetails).run(),
};
