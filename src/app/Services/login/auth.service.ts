import { Injectable } from '@angular/core';
import {Router} from "@angular/router";
import {tokenNotExpired} from "angular2-jwt";

let Auth0Lock = require('auth0-lock').default;
@Injectable()
export class AuthService {
  lock = new Auth0Lock('hqA2VSPhhT61bteOVOYTDdNXLN27WPY0', 'maskri.auth0.com',{
    rememberLastLogin: false,
    allowedConnections: ['google-oauth2'],
    container: 'auth-login-container',
    languageDictionary: {
      title: "",
    }
  });
  private authorizationError: string ="";
  constructor(private router:Router) {
    const self = this;
    this.lock.on('authenticated', (authResult: any) => {
      console.log(authResult.idToken);
      localStorage.setItem('id_token', authResult.idToken);
      this.lock.getProfile(authResult.idToken, (error: any, profile: any) => {
        if (error) {
          console.log(error);
        }
        localStorage.setItem('profile', JSON.stringify(profile));
        //self.router.navigateByUrl('/home');
      });
      self.authorizationError="";
    });
    this.lock.on('authorization_error', function(authError) {
      self.authorizationError = authError;
    });
  }
  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }
  loggedIn(){
    return tokenNotExpired();
  }
  checkAuthorizationError(){
    return this.authorizationError;
  }
}
