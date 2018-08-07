export interface HttpResponse {
  message: string;
  posts?: Post[];
  post?: Post;
  postId?: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
}
