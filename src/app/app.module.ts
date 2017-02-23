import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { D3ChartComponent } from '../Components/d3chart/d3chart.component';
import {D3Service} from 'd3-ng2-service';
import {SentimentAnalysisService} from "../service/sentiment-service/sentiment-analysis.service";
import {ChartModule} from "angular2-highcharts";
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
export function highchartsFactory() {
  return require('highcharts');
}
import {routing} from "../app.routing";
import { HighchartsComponent } from '../Components/highcharts/highcharts.component';
@NgModule({
  declarations: [
    AppComponent,
    D3ChartComponent,
    HighchartsComponent,

  ],
  imports: [
    BrowserModule,
    routing,
    FormsModule,
    HttpModule,
    ChartModule
  ],
  providers: [D3Service,SentimentAnalysisService,{
    provide: HighchartsStatic,
    useFactory: highchartsFactory
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
