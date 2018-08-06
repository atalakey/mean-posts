import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

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
    this.http.get<{ message: string, posts: any }>('http://localhost:3000/api/posts')
      .pipe(map((res) => {
        console.log(res.message);
        return res.posts.map(post => {
          return {
            id: post._id,
            title: post.title,
            content: post.content
          };
        });
      }))
      .subscribe((posts) => {
        this.posts = posts;
        this.postsUpdated.next(this.posts.slice());
      });
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title: title, content: content };
    this.http.post<{ message: string, postId: string }>('http://localhost:3000/api/posts', post)
      .subscribe((res) => {
        console.log(res.message);
        post.id = res.postId;
        this.posts.push(post);
        this.postsUpdated.next(this.posts.slice());
      });
  }

  deletePost(postId: string) {
    this.http.delete<{ message: string }>('http://localhost:3000/api/posts/' + postId)
      .subscribe((res) => {
        console.log(res.message);
        this.posts = this.posts.filter(post => post.id !== postId);
        this.postsUpdated.next(this.posts.slice());
      });
  }
}
