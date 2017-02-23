/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SentimentAnalysisService} from './sentiment-analysis.service';

describe('SentimentAnalysisService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SentimentAnalysisService]
    });
  });

  it('should ...', inject([SentimentAnalysisService], (service: SentimentAnalysisService) => {
    expect(service).toBeTruthy();
  }));
});
