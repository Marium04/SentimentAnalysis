import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {tokenNotExpired} from 'angular2-jwt';

const Auth0Lock = require('auth0-lock').default;
@Injectable()
export class AuthService {
  lock = new Auth0Lock('4VBQKJRQfYEpUeX5h2m9wr1T9gTVhKi7', 'askmarium.auth0.com', {
    rememberLastLogin: false,
    allowedConnections: ['google-oauth2'],
    container: 'auth-login-container',
    languageDictionary: {
      title: '',
    }
  });
  private authorizationError = '';
  constructor(private router: Router) {
    const self = this;
    self.lock.on('authenticated', (authResult: any) => {
      localStorage.setItem('token', authResult.accessToken);
      self.authorizationError = '';
      self.lock.getProfile(authResult.accessToken, (error: any, profile: any) => {
        if (error) {
          console.log(error);
        }
        localStorage.setItem('profile', JSON.stringify(profile));
        self.lock.hide();
        self.router.navigateByUrl('');
      });
    });
    self.lock.on('authorization_error', function(authError) {
      self.authorizationError = authError;
    });
  }
  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }
  loggedIn() {
    return tokenNotExpired();
  }
  checkAuthorizationError() {
    return this.authorizationError;
  }
}
