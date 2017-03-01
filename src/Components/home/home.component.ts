import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {DataSharingService} from "../../service/data/data-sharing.service";
import {SentimentAnalysisService} from "../../service/sentiment-service/sentiment-analysis.service";
import * as _ from "underscore";
@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit {
  private buttonClicked: boolean = false;
  private chartType: string;
  ngOnInit() {
  }

  constructor(private router: Router,private dataService:DataSharingService,private sentimentService:SentimentAnalysisService) {
  }

  generateGraph(dataSource, pageSource, chartType, from, to, fromMessage, toMessage) {
    if (from.value === "") {
      from.parentNode.setAttribute("class", " form-group has-danger");
      from.setAttribute("class", "form-control form-control-danger");
      fromMessage.innerHTML = "Please enter a valid date.";
      return;
    }
    if (to.value === "") {
      to.parentNode.setAttribute("class", " form-group has-danger");
      to.setAttribute("class", "form-control form-control-danger");
      toMessage.innerHTML = "Please enter a valid date.";
      return;
    }
    let fromDate = new Date(from.value.toString() + "T00:00:00");
    let toDate = new Date(to.value.toString() + "T00:00:00");
    if (fromDate >= toDate) {
      from.parentNode.setAttribute("class", " form-group has-danger");
      from.setAttribute("class", "form-control form-control-danger");
      fromMessage.innerHTML = "From date should be less than the to date.";
      return;
    }
    this.buttonClicked = true;
    this.chartType = chartType;
    this.fetchData(dataSource,pageSource,from.value,to.value)

  }

  valueChanged(event, message) {
    event.target.parentNode.setAttribute("class", "form-group");
    message.innerHTML = "";
  }


  fetchData(ds,ps,from,to){
    const self = this;
    let sentiObject ={};
    let keywords= [];
    let negativeReviews = 0;
    let positiveReviews = 0;
    let totalReviews = 0;
    let finalData = [];
    let sentiKeys = [];
    self.sentimentService.getKeyConcerns().then(keywordsArray =>{
      keywordsArray.map(function (word) {
        sentiObject[word] = {negativeCount: 0, positiveCount: 0};
        keywords.push(word);
      });
    });
    self.sentimentService.getSentimentData(ds,ps,from,to).then((data)=>{
      data.map(function (obj) {
        if (obj.sentiment === "Negative")
          negativeReviews++;
        if (obj.sentiment === "Positive")
          positiveReviews ++;
        totalReviews++;
        if(obj.keyPhrases.length===0)
          return;
        obj.keyPhrases.map(function (phrase) {
          if (obj.sentiment === "Negative")
            sentiObject[phrase].negativeCount++;
          if (obj.sentiment === "Positive")
            sentiObject[phrase].positiveCount++;
        });
      });
      keywords.sort();
      keywords.map(function (p) {
        if(sentiObject[p].negativeCount === 0 && sentiObject[p].positiveCount === 0) {
          return ;
        }
        else
          finalData.push({
            name: p,
            negativeCount: sentiObject[p].negativeCount,
            positiveCount: sentiObject[p].positiveCount
          });

      });

      finalData = _.sortBy(finalData,"negativeCount").reverse();
      sentiKeys = Object.keys(finalData[0]).slice(1);
      keywords = _.pluck(finalData,"name");
      self.dataService.sharedData={
        finalData:finalData,
        sentiKeys:sentiKeys,
        keywords:keywords,
        totalReviews:totalReviews,
        positiveReviews: positiveReviews,
        negativeReviews: negativeReviews
      }
    }).then(function(){
      if (self.chartType === "High Charts") {
        self.router.navigateByUrl('/highcharts');
      }
      else if (self.chartType === "D3") {
        self.router.navigateByUrl('/d3');
      }
    });
  }

}
