export type ApiPost = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

export async function fetchPosts(): Promise<ApiPost[]> {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }
  return response.json() as Promise<ApiPost[]>;
}
