import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';
import { HttpResponse } from './httpResponse.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private postsUpdated: Subject<Post[]> = new Subject<Post[]>();
  private posts: Post[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  getPostUpdateListener(): Observable<Post[]> {
    return this.postsUpdated.asObservable();
  }

  getPosts() {
    this.http.get<HttpResponse>('http://localhost:3000/api/posts')
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

  getPost(postId: string): Observable<HttpResponse> {
    return this.http.get<HttpResponse>('http://localhost:3000/api/posts/' + postId);
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title: title, content: content };
    this.http.post<HttpResponse>('http://localhost:3000/api/posts', post)
      .subscribe((res) => {
        console.log(res.message);
        post.id = res.postId;
        this.posts.push(post);
        this.postsUpdated.next(this.posts.slice());
        this.router.navigate(['/']);
      });
  }

  updatePost(postId: string, title: string, content: string) {
    const updatedPost: Post = { id: postId, title: title, content: content };
    this.http.put<HttpResponse>('http://localhost:3000/api/posts/' + postId, updatedPost)
      .subscribe((res) => {
        console.log(res.message);
        const updatedPostIndex = this.posts.findIndex((post) => post.id === postId);
        this.posts[updatedPostIndex] = updatedPost;
        this.postsUpdated.next(this.posts.slice());
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    this.http.delete<HttpResponse>('http://localhost:3000/api/posts/' + postId)
      .subscribe((res) => {
        console.log(res.message);
        this.posts = this.posts.filter(post => post.id !== postId);
        this.postsUpdated.next(this.posts.slice());
      });
  }
}
