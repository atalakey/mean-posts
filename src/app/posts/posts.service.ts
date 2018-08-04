import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { Post } from './post.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private postsUpdated: Subject<Post[]> = new Subject<Post[]>();
  private posts: Post[] = [];

  constructor(private http: HttpClient) {}

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPosts() {
    this.http.get<{message: string, posts: Post[]}>('http://localhost:3000/api/posts')
      .subscribe((res) => {
        this.posts = res.posts;
        this.postsUpdated.next(this.posts.slice());
      });
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title: title, content: content };
    this.http.post<{message: string}>('http://localhost:3000/api/posts', post)
      .subscribe((res) => {
        console.log(res.message);
        this.posts.push(post);
        this.postsUpdated.next(this.posts.slice());
      });
  }

  deletePost(index: number) {
    this.posts.splice(index, 1);
    this.postsUpdated.next(this.posts.slice());
  }
}
