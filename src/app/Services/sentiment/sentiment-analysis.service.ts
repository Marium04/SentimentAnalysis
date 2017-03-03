import { Injectable } from '@angular/core';
import {Http, URLSearchParams} from "@angular/http";
import 'rxjs/add/operator/toPromise';

@Injectable()
export class SentimentAnalysisService {
  private sentimentAnalysisUrl: string = "/fb";
  constructor(private http:Http) { }
  getSentimentData(dataSource,pageSource,from,to){
    let params: URLSearchParams = new URLSearchParams();
    params.set("dataSource",dataSource);
    params.set("pageSource",pageSource);
    params.set("from",from);
    params.set("to",to);
    return this.http.get(this.sentimentAnalysisUrl,{search:params}).toPromise().then(response => response.json()).catch(SentimentAnalysisService.handleError);
  }
  public static handleError(error: any):  Promise<any>{
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
