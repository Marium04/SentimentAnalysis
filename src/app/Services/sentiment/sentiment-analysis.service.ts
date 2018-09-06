import { Injectable } from '@angular/core';
import {Http, URLSearchParams, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class SentimentAnalysisService {
  private sentimentAnalysisUrl = '/fb';
  public static handleError(error: any):  Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
  constructor(private http: Http) { }
  getSentimentData(dataSource, pageSource, from, to) {
    const params: URLSearchParams = new URLSearchParams();
    params.set('dataSource', dataSource);
    params.set('pageSource', pageSource);
    params.set('from', from);
    params.set('to', to);
    const headers = new Headers({'Authorization': 'Bearer ' + localStorage.getItem('token')});
    const options = new RequestOptions({headers: headers, search: params});
    return this.http.get(this.sentimentAnalysisUrl, options).toPromise()
      .then(response => response.json()).catch(SentimentAnalysisService.handleError);
  }
}
