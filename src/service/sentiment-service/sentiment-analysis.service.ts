import { Injectable } from '@angular/core';
import {Http} from "@angular/http";
import 'rxjs/add/operator/toPromise';

@Injectable()
export class SentimentAnalysisService {
  private keyPhrasesUrl: string = "http://localhost:3433/api/keyConcerns/";
  private sentimentAnalysisUrl: string = "http://localhost:3433/api/sentimentAnalysis/";
  constructor(private http:Http) { }
  getKeyConcerns(){
    return this.http.get(this.keyPhrasesUrl).toPromise().then(response => response.json()).catch(SentimentAnalysisService.handleError);
  }
  getSentimentData(){
    return this.http.get(this.sentimentAnalysisUrl).toPromise().then(response => response.json()).catch(SentimentAnalysisService.handleError);
  }
  public static handleError(error: any):  Promise<any>{
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
