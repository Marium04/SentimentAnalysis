import { SentimentAnalysisPage } from './app.po';

describe('sentiment-analysis App', function() {
  let page: SentimentAnalysisPage;

  beforeEach(() => {
    page = new SentimentAnalysisPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
