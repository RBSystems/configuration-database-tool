import { DbToolPage } from './app.po';

describe('db-tool App', () => {
  let page: DbToolPage;

  beforeEach(() => {
    page = new DbToolPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
