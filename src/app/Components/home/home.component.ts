import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {DataSharingService} from "../../Services/data/data-sharing.service";
import {SentimentAnalysisService} from "../../Services/sentiment/sentiment-analysis.service";
import * as _ from "underscore";
import {AuthService} from "../../Services/login/auth.service";
@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit {
  private buttonClicked: boolean = false;
  private noData: boolean = false;
  private serverMessage: string = '';
  ngOnInit() {
    this.noData = false;
    this.serverMessage = '';
  }

  constructor(private router: Router,private dataService:DataSharingService,private sentimentService:SentimentAnalysisService,private authService:AuthService) {
    this.dataService.sharedData={};
    /*this.buttonClicked = false;*/
  }

  generateGraph(dataSource, pageSource, from, to, fromMessage, toMessage) {

    if (from.value === "" && to.value === "" ) {
      from.parentNode.setAttribute("class", " form-group has-danger");
      from.setAttribute("class", "form-control form-control-danger");
      fromMessage.innerHTML = "Please enter a valid date.";
      to.parentNode.setAttribute("class", " form-group has-danger");
      to.setAttribute("class", "form-control form-control-danger");
      toMessage.innerHTML = "Please enter a valid date.";
      return;
    }
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

    if(fromDate.toString() === "Invalid Date" && toDate.toString() === "Invalid Date"){
      to.parentNode.setAttribute("class", " form-group has-danger");
      to.setAttribute("class", "form-control form-control-danger");
      toMessage.innerHTML = "Please enter a valid date.";
      from.parentNode.setAttribute("class", " form-group has-danger");
      from.setAttribute("class", "form-control form-control-danger");
      fromMessage.innerHTML = "Please enter a valid date.";
      return;
    }
    if(fromDate.toString() === "Invalid Date"){
      from.parentNode.setAttribute("class", " form-group has-danger");
      from.setAttribute("class", "form-control form-control-danger");
      fromMessage.innerHTML = "Please enter a valid date.";
      return
    }
    if(toDate.toString() === "Invalid Date"){
      to.parentNode.setAttribute("class", " form-group has-danger");
      to.setAttribute("class", "form-control form-control-danger");
      toMessage.innerHTML = "Please enter a valid date.";
      return;
    }



    if(!this.isValidDateFormat(from.value.toString()) && !this.isValidDateFormat(to.value.toString())){
      to.parentNode.setAttribute("class", " form-group has-danger");
      to.setAttribute("class", "form-control form-control-danger");
      toMessage.innerHTML = "Please enter date in the format of yyyy-mm-dd.";
      from.parentNode.setAttribute("class", " form-group has-danger");
      from.setAttribute("class", "form-control form-control-danger");
      fromMessage.innerHTML = "Please enter date in the format of yyyy-mm-dd.";
      return;
    }
    if(!this.isValidDateFormat(from.value.toString())) {
      from.parentNode.setAttribute("class", " form-group has-danger");
      from.setAttribute("class", "form-control form-control-danger");
      fromMessage.innerHTML = "Please enter date in the format of yyyy-mm-dd.";
      return;
    }
    if(!this.isValidDateFormat(to.value.toString())) {
      to.parentNode.setAttribute("class", " form-group has-danger");
      to.setAttribute("class", "form-control form-control-danger");
      toMessage.innerHTML = "Please enter date in the format of yyyy-mm-dd.";
      return;
    }

    if (fromDate >= toDate) {
      from.parentNode.setAttribute("class", " form-group has-danger");
      from.setAttribute("class", "form-control form-control-danger");
      fromMessage.innerHTML = "From date should be less than the to date.";
      return;
    }
    let diffDays = Math.abs((fromDate.getTime() - toDate.getTime()) / (24 * 60 * 60 * 1000));
    if(diffDays>20){
      from.parentNode.setAttribute("class", " form-group has-danger");
      from.setAttribute("class", "form-control form-control-danger");
      fromMessage.innerHTML = "The difference between from and to date should be less than 20 days.";
      return;
    }
    if(fromDate>new Date()){
      from.parentNode.setAttribute("class", " form-group has-danger");
      from.setAttribute("class", "form-control form-control-danger");
      fromMessage.innerHTML = "Please don't select future date ";
      return;
    }
    if(toDate>new Date()){
      to.parentNode.setAttribute("class", " form-group has-danger");
      to.setAttribute("class", "form-control form-control-danger");
      toMessage.innerHTML = "Please don't select future date ";
      return;
    }
    this.buttonClicked = true;
    this.fetchData(dataSource,pageSource,from.value,to.value)

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
    self.sentimentService.getSentimentData(ds,ps,from,to).then((data)=>{
      data.keyConcerns.map(function (word) {
        sentiObject[word] = {negativeCount: 0, positiveCount: 0};
        keywords.push(word);
      });
      if(data.data.length === 0) {
        self.buttonClicked = false;
        self.noData = true;
        self.serverMessage = data.message;
        return;
      }
      data.data.map(function (obj) {
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
      if(_.keys(self.dataService.sharedData).length !== 0)
        self.router.navigateByUrl('/d3');
    });
  }
  isValidDateFormat(dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    return dateString.match(regEx) != null;
  }

}
