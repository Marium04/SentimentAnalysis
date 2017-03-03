import {Component, OnInit, ElementRef} from '@angular/core';
import * as _ from "underscore";
import {DataSharingService} from "../../Services/data/data-sharing.service";
import {Router} from "@angular/router";
@Component({
  selector: 'app-highcharts',
  templateUrl: 'highcharts.component.html',
  styleUrls: ['highcharts.component.css']
})
export class HighchartsComponent implements OnInit {
  private negativeReviews =0;
  private positiveReviews =0;
  private totalReviews =0;
  private sentiObjectArray=[];
  private containerWidth:number;
  private nativeElement;
  options: Object;
  constructor(element: ElementRef,private dataService:DataSharingService,private router: Router) {
    this.nativeElement = element.nativeElement;
  }

  ngOnInit() {
    this.containerWidth = this.nativeElement.getBoundingClientRect().width;
    this.getData();
  }
  getData(){
    const  self = this;
    if(_.keys(self.dataService.sharedData).length === 0)
      self.router.navigateByUrl('/');
    else {
      self.sentiObjectArray = self.dataService.sharedData["finalData"];
      self.totalReviews = self.dataService.sharedData["totalReviews"];
      self.positiveReviews = self.dataService.sharedData["positiveReviews"];
      self.negativeReviews = self.dataService.sharedData["negativeReviews"];
      self.createChart();
    }
  }
  createChart(){
    let self = this;
    self.options = {
      colors: ["#ff6666","#66c2ff"],
      chart: {
        type: 'column',
        zoomType:'x',
        width: self.containerWidth,
        height: '606'
      },
      title: {
        text: 'Sentiment Analysis'
      },
      subtitle: {
        text: 'Source: facebook.com/SearsCanada'
      },
      xAxis: {
        categories: _.pluck(self.sentiObjectArray,'name'),
        crosshair: true
      },
      yAxis: {
        min: 0,
        title: {
          text: '# of Reviews'
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      series: [{name:"Negative Reviews",data:_.pluck(self.sentiObjectArray,'negativeCount')},{name:"Positive Reviews",data:_.pluck(self.sentiObjectArray,'positiveCount')}]
    };
  }

}
