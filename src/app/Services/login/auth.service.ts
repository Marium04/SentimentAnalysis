// app/auth.service.ts

import { Injectable }      from '@angular/core';
import { tokenNotExpired } from 'angular2-jwt';

// Avoid name not found warnings
let Auth0Lock = require('auth0-lock').default;

@Injectable()
export class AuthService {
  // Configure Auth0
  lock = new Auth0Lock('RkzGriRSWEGksemcJri1FTXDtUhn3NwY', 'maskri.auth0.com');

  constructor() {
    // Add callback for lock `authenticated` event
    this.lock.on("authenticated", (authResult) => {
      console.log(authResult);
      //localStorage.setItem('id_token', authResult.idToken);
      // Fetch profile information
      // this.lock.getProfile(authResult.idToken, (error, profile) => {
      //   if (error) {
      //     // Handle error
      //     //alert(error);
      //     return;
      //   }
      //
      //   localStorage.setItem('profile', JSON.stringify(profile));
      //   console.log(profile);
      // });

    });
  }

  public login() {
    // Call the show method to display the widget.
    this.lock.show();
  }

  public authenticated() {
    // Check if there's an unexpired JWT
    // This searches for an item in localStorage with key == 'id_token'
    return tokenNotExpired();
  }

  public logout() {
    // Remove token from localStorage
    localStorage.removeItem('id_token');
  }
}
