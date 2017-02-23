import { CaSearsSentimentAnalysisPage } from './app.po';

describe('ca-sears-sentiment-analysis App', function() {
  let page: CaSearsSentimentAnalysisPage;

  beforeEach(() => {
    page = new CaSearsSentimentAnalysisPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
