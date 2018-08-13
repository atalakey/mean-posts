import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Post } from './post.model';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private postsUpdated: Subject<{ postCount: number, posts: Post[] }> = new Subject<{ postCount: number, posts: Post[] }>();
  private posts: Post[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  getPostUpdateListener(): Observable<{ postCount: number, posts: Post[] }> {
    return this.postsUpdated.asObservable();
  }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;

    this.http.get
      <{ message: string, postCount: number, posts: { _id: string, title: string, content: string, imagePath: string, creator: string }[] }>
      (BACKEND_URL + queryParams)
      .pipe(map(response => {
        console.log(response.message);
        return {
          posts: response.posts.map(post => {
            return {
              id: post._id,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          postCount: response.postCount
        };
      }))
      .subscribe((postData) => {
        this.posts = postData.posts;
        this.postsUpdated.next({ postCount: postData.postCount, posts: this.posts.slice() });
      });
  }

  getPost(postId: string): Observable<{ message: string, post: { _id: string, title: string, content: string, imagePath: string, creator: string } }> {
    return this.http.get
      <{ message: string, post: { _id: string, title: string, content: string, imagePath: string, creator: string } }>
      (BACKEND_URL + postId);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post<{ message: string, postId: string , imagePath: string }>(BACKEND_URL, postData)
      .subscribe(response => {
        console.log(response.message);
        this.router.navigate(['/']);
      });
  }

  updatePost(postId: string, title: string, content: string, image: File | string) {
    let post: Post | FormData;
    if (typeof(image) === 'object') {
      post = new FormData();
      post.append('id', postId);
      post.append('title', title);
      post.append('content', content);
      post.append('image', image, title);
    } else {
      post = { id: postId, title: title, content: content, imagePath: image, creator: null };
    }

    this.http.put<{ message: string, imagePath: string }>(BACKEND_URL + postId, post)
      .subscribe(response => {
        console.log(response.message);
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(BACKEND_URL + postId);
  }
}
