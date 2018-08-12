import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { PostsService } from '../posts.service';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  isLoading = false;
  form: FormGroup;
  post: Post;
  imagePreview: string;
  private authSubscription: Subscription;
  private mode = 'create';
  private postId: string;

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private route: ActivatedRoute) {}

  ngOnInit() {
    this.authSubscription = this.authService
      .getAuthStatusListener()
      .subscribe(() => {
        this.isLoading = false;
      });

    this.form = new FormGroup({
      title: new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] })
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.isLoading = true;
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.postsService.getPost(this.postId)
          .subscribe(response => {
            console.log(response.message);
            this.isLoading = false;
            this.post = {
              id: response.post._id,
              title: response.post.title,
              content: response.post.content,
              imagePath: response.post.imagePath,
              creator: response.post.creator
            };
            this.form.setValue({
              title: this.post.title,
              content: this.post.content,
              image: this.post.imagePath
            });
            this.imagePreview = this.post.imagePath;
          });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => { this.imagePreview = reader.result; };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.valid) {
      this.isLoading = true;
      if (this.mode === 'create') {
        this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
      } else if (this.mode === 'edit') {
        this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
      }
      this.form.reset();
    }
  }
}
