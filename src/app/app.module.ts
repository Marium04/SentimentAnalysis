import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {HttpModule, Http, RequestOptions} from '@angular/http';
import { AppComponent } from './app.component';
import { D3ChartComponent } from './Components/d3chart/d3chart.component';
import {D3Service} from 'd3-ng2-service';
import {SentimentAnalysisService} from "./Services/sentiment/sentiment-analysis.service";
import {ChartModule} from "angular2-highcharts";
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
export function highchartsFactory() {
  return require('highcharts');
}
import {routing, appRoutingProviders} from "../app.routing";
import { HighchartsComponent } from './Components/highcharts/highcharts.component';
import { HomeComponent } from './Components/home/home.component';
import {DataSharingService} from "./Services/data/data-sharing.service";
export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig({
    tokenName: 'token',
    tokenGetter: (() => localStorage.getItem('token')),
    globalHeaders: [{'Content-Type':'application/json'}],
  }), http, options);
}

import {AuthConfig, AuthHttp} from "angular2-jwt";
import {AuthService} from "./Services/login/auth.service";
import { LoginComponent } from './Components/login/login.component';
import {Ng2PaginationModule} from "ng2-pagination";
@NgModule({
  declarations: [
    AppComponent,
    D3ChartComponent,
    HighchartsComponent,
    HomeComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    routing,
    FormsModule,
    HttpModule,
    ChartModule,
    Ng2PaginationModule
  ],
  providers: [appRoutingProviders,{
    provide: AuthHttp,
    useFactory: authHttpServiceFactory,
    deps: [Http, RequestOptions]
  },AuthService,DataSharingService,D3Service,SentimentAnalysisService,{
    provide: HighchartsStatic,
    useFactory: highchartsFactory
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
