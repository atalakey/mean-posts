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
  private postsUpdated: Subject<Post[]> = new Subject<Post[]>();
  private posts: Post[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  getPostUpdateListener(): Observable<Post[]> {
    return this.postsUpdated.asObservable();
  }

  getPosts() {
    this.http.get<{ message: string, posts: { _id: string, title: string, content: string, imagePath: string }[] }>('http://localhost:3000/api/posts')
      .pipe(map((res) => {
        console.log(res.message);
        return res.posts.map(post => {
          return {
            id: post._id,
            title: post.title,
            content: post.content,
            imagePath: post.imagePath
          };
        });
      }))
      .subscribe((posts) => {
        this.posts = posts;
        this.postsUpdated.next(this.posts.slice());
      });
  }

  getPost(postId: string): Observable<{ message: string, post?: { _id: string, title: string, content: string, imagePath: string } }> {
    return this.http.get<{ message: string, post?: { _id: string, title: string, content: string, imagePath: string } }>('http://localhost:3000/api/posts/' + postId);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post<{ message: string, postId: string , imagePath: string }>('http://localhost:3000/api/posts', postData)
      .subscribe((res) => {
        console.log(res.message);
        const post: Post = { id: res.postId, title: title, content: content, imagePath: res.imagePath };
        this.posts.push(post);
        this.postsUpdated.next(this.posts.slice());
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
      postData = { id: postId, title: title, content: content, imagePath: image };
    }
    this.http.put<{ message: string, imagePath: string }>('http://localhost:3000/api/posts/' + postId, postData)
      .subscribe((res) => {
        console.log(res.message);
        const updatedPost = { id: postId, title: title, content: content, imagePath: res.imagePath };
        const updatedPostIndex = this.posts.findIndex((post) => post.id === postId);
        this.posts[updatedPostIndex] = updatedPost;
        this.postsUpdated.next(this.posts.slice());
        this.router.navigate(['/']);
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
