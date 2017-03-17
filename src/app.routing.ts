/**
 * Created by mariumaskri on 2017-02-22.
 */
import { Routes, RouterModule} from '@angular/router';

// Import our components
import {ModuleWithProviders} from "@angular/core";
import {D3ChartComponent} from "./app/Components/d3chart/d3chart.component";
import {HighchartsComponent} from "./app/Components/highcharts/highcharts.component";
import {HomeComponent} from "./app/Components/home/home.component";
import {AuthGuard} from "./app/Services/auth-guard/auth-guard.service";
import {LoginComponent} from "./app/Components/login/login.component";
const appRoutes: Routes = [
  // Add the redirect
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  // Add our routes
  {
    path: 'd3',
    component: D3ChartComponent
  },
  {
    path: 'highcharts',
    component: HighchartsComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];
export const appRoutingProviders: any[] = [
  AuthGuard
];
// Here we are exporting our routes
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);


