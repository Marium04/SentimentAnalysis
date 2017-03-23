import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';
// Import our authentication service

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate() {
    // If user is not logged in we'll send them to the login page
    if (!localStorage.getItem("id_token")) {
      this.router.navigateByUrl('/login');
      return false;
    }
    else
      return true;
  }

}
