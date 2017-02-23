import { Component, OnInit } from '@angular/core';
import {SentimentAnalysisService} from "../../service/sentiment-service/sentiment-analysis.service";

@Component({
  selector: 'app-highcharts',
  templateUrl: 'highcharts.component.html',
  styleUrls: ['highcharts.component.css']
})
export class HighchartsComponent implements OnInit {
  private sentiObject={};
  private finalData=[];
  private keywords=[];
  private positiveCounts= [];
  private negativeCounts= [];
  private filteredKeywords = [];
  options: Object;
  constructor(private sentimentService:SentimentAnalysisService) { }

  ngOnInit() {
    var self = this;
    self.getData();
  }
  getData(){
    let self = this;
    self.sentimentService.getKeyConcerns().then(keywordsArray =>{
      keywordsArray.map(function (word) {
        self.sentiObject[word] = {negativeCount: 0, positiveCount: 0};
        self.keywords.push(word);
      });
    });
    self.sentimentService.getSentimentData().then((data)=>{
      data.map(function (obj) {
        obj.keyPhrases.map(function (phrase) {
          if (obj.sentiment === "Negative")
            self.sentiObject[phrase].negativeCount++;
          if (obj.sentiment === "Positive")
            self.sentiObject[phrase].positiveCount++;
        });
      });
      self.keywords.sort();
      self.keywords.map(function (j) {
        if(self.sentiObject[j].negativeCount === 0 && self.sentiObject[j].positiveCount === 0) {
          return ;
        }
        else {
          self.positiveCounts.push(self.sentiObject[j].positiveCount);
          self.negativeCounts.push(self.sentiObject[j].negativeCount);
          self.filteredKeywords.push(j);
        }
      });
      self.keywords.map(function (p) {
        if(self.sentiObject[p].negativeCount === 0 && self.sentiObject[p].positiveCount === 0) {
          return ;
        }
        else
          self.finalData.push({
            name: p,
            negativeCount: self.sentiObject[p].negativeCount,
            positiveCount: self.sentiObject[p].positiveCount
          });

      });
      self.createChart();
    });
      //var sentiKeys = Object.keys(self.finalData[0]).slice(1);

  }
  createChart(){
    let self = this;
    self.options = {
      chart: {
        type: 'column',
        zoomType:'x'
      },
      title: {
        text: 'Sentiment Analysis'
      },
      subtitle: {
        text: 'Source: facebook.com/SearsCanada'
      },
      xAxis: {
        categories: self.filteredKeywords,
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
      series: [{
        name: 'Negative Reviews',
        data: self.negativeCounts

      }, {
        name: 'Positive Reviews',
        data: self.positiveCounts

      }]
    }
  }

}
