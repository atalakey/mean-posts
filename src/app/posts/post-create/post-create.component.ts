import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { PostsService } from '../posts.service';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  isLoading = false;
  private mode = 'create';
  private postId: string;
  post: Post;

  constructor(private postsService: PostsService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId)
          .subscribe((res) => {
            console.log(res.message);
            this.isLoading = false;
            this.post = {
              id: res.post._id,
              title: res.post.title,
              content: res.post.content
            };
          });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      if (this.mode === 'create') {
        this.postsService.addPost(form.value.title, form.value.content);
      } else if (this.mode === 'edit') {
        this.postsService.updatePost(this.postId, form.value.title, form.value.content);
      }
      form.resetForm();
    }
  }
}
