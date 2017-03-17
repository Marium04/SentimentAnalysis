import {Component, OnInit, ElementRef} from '@angular/core';
import {AuthService} from "../../Services/login/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(private authService: AuthService,private router:Router,private elRef:ElementRef) {
  }

  ngOnInit() {
  }
  ngAfterViewInit(){
    if(!this.authService.loggedIn())
      this.authService.lock.show();
    else{
      this.router.navigateByUrl('/home');
    }
    if(this.elRef.nativeElement.querySelector('.auth0-lock-header') && this.elRef.nativeElement.querySelector('.auth0-lock-header') !== 'undefined')
      this.elRef.nativeElement.querySelector('.auth0-lock-header').style.display ='none';
    /*{
    console.log("ngAfter -- redirect");
    this.router.navigateByUrl('/home');
  }*/
    //console.log(this.elRef.nativeElement.querySelector('.auth0-lock-header'))//.style.display ='none';
    //document.getElementsByClassName('auth0-lock-header')[0];//.display ='none';
  }
}
