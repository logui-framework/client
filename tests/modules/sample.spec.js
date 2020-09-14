const chai = require('chai');
const expect = chai.expect;
const http = require('http-server');
const playwright = require('playwright');

const HEADLESS = true;
const BROWSER = 'chromium';
const SERVER_PORT = '8081';
const BASE_URL = `http://127.0.0.1:${SERVER_PORT}/env/landing.html`;
const BASE_SCREENSHOTS = './tests/screenshots/';

let page, browser, context;

let server = http.createServer({
    root: './tests/',
    silent: true,
});

describe('SUITE DESCRIPTION', () => {

    beforeEach(async() => {
        server.listen(SERVER_PORT);
        browser = await playwright[BROWSER].launch({headless: HEADLESS});
        context = await browser.newContext();
        page = await context.newPage(BASE_URL);

        await page.goto(BASE_URL);
    });

    afterEach(async function() {
        await page.screenshot({path: `${BASE_SCREENSHOTS}sample.png`});
        await browser.close();
        server.close();
    });

    it('Example test (checking header tag innerHTML)', async() => {
        let headerElement = await page.$('h1');
        let innerHTML = await headerElement.innerHTML();

        expect(innerHTML).to.equal('LogUI Test Environment');
    });

});