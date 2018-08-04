import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Post } from './post.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private postsUpdated: Subject<Post[]> = new Subject<Post[]>();
  private posts: Post[] = [];

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPosts(): Post[] {
    return this.posts.slice();
  }

  addPost(title: string, content: string) {
    const post: Post = {title: title, content: content};
    this.posts.push(post);
    this.postsUpdated.next(this.posts.slice());
  }

  deletePost(index: number) {
    this.posts.splice(index, 1);
    this.postsUpdated.next(this.posts.slice());
  }
}
