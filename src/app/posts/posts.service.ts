import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';

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
    this.http.get<{ message: string, postCount: number, posts: { _id: string, title: string, content: string, imagePath: string, creator: string }[] }>('http://localhost:3000/api/posts' + queryParams)
      .pipe(map((res) => {
        console.log(res.message);
        return {
          posts: res.posts.map(post => {
            return {
              id: post._id,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          postCount: res.postCount
        };
      }))
      .subscribe((postData) => {
        this.posts = postData.posts;
        this.postsUpdated.next({ postCount: postData.postCount, posts: this.posts.slice() });
      });
  }

  getPost(postId: string): Observable<{ message: string, post?: { _id: string, title: string, content: string, imagePath: string, creator: string } }> {
    return this.http.get<{ message: string, post?: { _id: string, title: string, content: string, imagePath: string, creator: string } }>('http://localhost:3000/api/posts/' + postId);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post<{ message: string, postId: string , imagePath: string }>('http://localhost:3000/api/posts', postData)
      .subscribe((res) => {
        console.log(res.message);
        this.router.navigate(['/']);
      });
  }

  updatePost(postId: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', postId);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = { id: postId, title: title, content: content, imagePath: image, creator: null };
    }
    this.http.put<{ message: string, imagePath: string }>('http://localhost:3000/api/posts/' + postId, postData)
      .subscribe((res) => {
        console.log(res.message);
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>('http://localhost:3000/api/posts/' + postId);
  }
}
