/**
 * Created by mariumaskri on 2017-02-22.
 */
import { Routes, RouterModule} from '@angular/router';

// Import our components
import {ModuleWithProviders} from "@angular/core";
import {D3ChartComponent} from "./Components/d3chart/d3chart.component";
import {HighchartsComponent} from "./Components/highcharts/highcharts.component";

const appRoutes: Routes = [
  // Add the redirect
  {
    path: '',
    redirectTo: '/',
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
  }
];
export const appRoutingProviders: any[] = [

];
// Here we are exporting our routes
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);


