import { faker } from '@faker-js/faker';

export type ApiPost = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

export function getPostImageUrl(postId: number, size: number): string {
  faker.seed(postId);
  return faker.image.urlPicsumPhotos({ width: size, height: size });
}

export async function fetchPosts(): Promise<ApiPost[]> {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }

  return response.json() as Promise<ApiPost[]>;
}

export async function fetchPostById(id: number): Promise<ApiPost> {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }

  return response.json() as Promise<ApiPost>;
}
