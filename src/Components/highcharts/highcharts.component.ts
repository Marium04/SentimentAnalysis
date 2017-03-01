import {Component, OnInit, ElementRef} from '@angular/core';
import {SentimentAnalysisService} from "../../service/sentiment-service/sentiment-analysis.service";
import * as _ from "underscore";
import {DataSharingService} from "../../service/data/data-sharing.service";
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
  constructor(private sentimentService:SentimentAnalysisService,element: ElementRef,private dataService:DataSharingService) {
    this.nativeElement = element.nativeElement;
  }

  ngOnInit() {
    this.containerWidth = this.nativeElement.getBoundingClientRect().width;
    this.getData();
  }
  getData(){
    const  self = this;
    self.sentiObjectArray = self.dataService.sharedData["finalData"];
    self.totalReviews = self.dataService.sharedData["totalReviews"];
    self.positiveReviews = self.dataService.sharedData["positiveReviews"];
    self.negativeReviews = self.dataService.sharedData["negativeReviews"];
    self.createChart();


    /*self.sentimentService.getKeyConcerns().then(keywordsArray =>{
      keywordsArray.map(function (word) {
        self.sentiObjectArray.push({negativeCount: 0, positiveCount: 0,name:word});
        self.keywords.push(word);

      });
    }).then(function(){
      self.sentimentService.getSentimentData().then((data)=>{
        data.map(function (obj) {
          if (obj.sentiment === "Negative")
            self.negativeReviews++;
          if (obj.sentiment === "Positive")
            self.positiveReviews ++;
          self.totalReviews++;
          if(obj.keyPhrases.length===0)
            return;
          obj.keyPhrases.map(function (phrase) {
            if (obj.sentiment === "Negative") {
              self.sentiObjectArray[_.findLastIndex(self.sentiObjectArray, {
                name: phrase
              })].negativeCount++;
            }
            if (obj.sentiment === "Positive") {
              self.sentiObjectArray[_.findLastIndex(self.sentiObjectArray, {
                name: phrase
              })].positiveCount++;
            }
          });
        });
        self.sentiObjectArray = _.sortBy(self.sentiObjectArray,"negativeCount").reverse();
        self.keywords.sort();
        self.createChart();
      });
    });*/
  }
  createChart(){
    let self = this;
    self.options = {
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
