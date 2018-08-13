import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthData } from './auth-data.model';

const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private isAuthenticated = false;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http.post<{ message: string, token: string, expiresIn: number, userId: string }>(BACKEND_URL + '/signup', authData)
      .subscribe(response => {
        this.authenticateUser(response);
      }, error => {
        this.authStatusListener.next(this.isAuthenticated);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http.post<{ message: string, token: string, expiresIn: number, userId: string }>(BACKEND_URL + '/login', authData)
      .subscribe(response => {
        this.authenticateUser(response);
      }, error => {
        this.authStatusListener.next(this.isAuthenticated);
      });
  }

  logout() {
    this.token = null;
    this.userId = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(this.isAuthenticated);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  autoAuthenticateUser() {
    const authDate = this.getAuthData();

    if (!authDate) {
      return;
    }

    const now = new Date();
    const expiresIn = authDate.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authDate.token;
      this.userId = authDate.userId;
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
      this.setAuthTimer(expiresIn / 1000);
    }
  }

  private authenticateUser(response: { message: string, token: string, expiresIn: number, userId: string }) {
    if (response.token) {
      this.token = response.token;
      this.userId = response.userId;
      this.isAuthenticated = true;
      this.authStatusListener.next(this.isAuthenticated);
      const expiresInDuration = response.expiresIn;
      this.setAuthTimer(expiresInDuration);
      const now = new Date();
      const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
      this.saveAuthData(this.token, expirationDate, this.userId);
      this.router.navigate(['/']);
    }
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const expirationDate = localStorage.getItem('expiration');

    if (!token || !userId || !expirationDate) {
      return;
    }

    return {
      token: token,
      userId: userId,
      expirationDate: new Date(expirationDate)
    };
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('expiration');
  }
}
