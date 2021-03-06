import * as $ from 'jquery';
import * as assert from 'assert';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as clipboardy from 'clipboardy';
import {extension_id} from '../utils';


let browser;
let page;
//check if the page redirects
let wasRedirected = false;

const pageErrors = [];
const secondsForExtensionToLoad = 1;
const CRX_PATH = '/crx';

// in this environment some things need to pause
async function waitSeconds(seconds) {
  function delay(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
  await delay(seconds);
}

// https://stackoverflow.com/a/17306971/133514
function clearArray<T>(array: T[]) {
    while (array.length) {
        array.pop();
    }
}

beforeAll(async () => {
  browser = await puppeteer.launch({
    // Use maximum available resolution.
    defaultViewport: null,
    // Use the fake display.
    headless: false,
    // show devtools
    devtools: true,
      // ignoreDefaultArgs: true,
    ignoreHTTPSErrors: true,
    // Use the actual chrome installation.
    executablePath: "/usr/bin/google-chrome-unstable",
    args: [
      // Required for Docker version of Puppeteer.
      "--no-sandbox",
      // https://github.com/puppeteer/puppeteer/issues/3339#issuecomment-609101772
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      "--disable-setuid-sandbox",
      // This will write shared memory files into /tmp instead of /dev/shm,
      // because Docker’s default for /dev/shm is 64MB.
      "--disable-dev-shm-usage",
      // Size of the fake display when starting chrome.
      "--window-size=1024,768",
      '--remote-debugging-port=9223',
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`
      // '--enable-devtools-experiments' # useful for sniffing the chrome devtools protocol
    ]
  });

  await waitSeconds(secondsForExtensionToLoad); // give extension time to load
  const browserVersion = await browser.version();
  console.log(`Started ${browserVersion}`);
});

afterAll(async () => {
    if(!browser) {
        // https://basarat.gitbook.io/typescript/type-system/exceptions
        throw new Error("browser is undefined, is puppeteer installed?");
    }
    await browser.close();
});

describe("Extension popup", () => {
    // eslint-disable-next-line no-console
    // tslint-disable-next-line no-console
    console.log(`\n✨Make sure extension is in ${CRX_PATH}!`);

    beforeEach(async () => {
        page = await browser.newPage(); // this starts a blank page with about:blank

        // Prevent certain pages from not delivering the content
        // i.e. videos, images etc.
        page.setUserAgent("Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A403 Safari/8536.25");

        // Simple tags for formatting the output.
        const tagIndentation = "    ";
        const tagError = tagIndentation + "ERROR ";
        const tagRequest = tagIndentation + "REQUEST ";
        const tagResponse = tagIndentation + "RESPONSE ";

        await page.on("error", err => {
            console.error(tagError + "err: " + err);
        });

        await page.on("pageerror", pageerr => {
            console.error(tagError + "pageerr: " + pageerr);
            pageErrors.push(pageerr);
        });

        await page.on("requestfailed", rf => {
            console.error(tagError + "requestfailed: " + rf);
        });

        await page.on("request", (request) => {
            console.log(tagRequest + request.url());
        });

        await page.on("response", response => {
            const status = response.status()
            const url = response.url();
            //[301, 302, 303, 307, 308]
            if ((status >= 300) && (status <= 399)) {
                wasRedirected = true;
            }

            response.buffer().then(
                buffer => {
                    if (response.status() != 200) {
                        console.log(tagResponse + url + " : " + response.status());
                    }
                },
                error => {
                    console.error(tagResponse + "ERROR " + url + " : " + response.status());
                }
            );
        });

        await page.on("console", (event: puppeteer.ConsoleMessage, ...args: any[]) => {
            console.log(event.text(), event.type(), event.location());
            for (let i = 0; i < args.length; ++i) console.log(`${i}: ${args[i]}`);
        });

    })

    afterEach(async () => {
        await page.close();
        clearArray(pageErrors);
        wasRedirected = false;
    });


    test("Go to popup.html", async () => {
        await page.goto(
            `chrome-extension://${extension_id(CRX_PATH)}/popup.html`, {
                timeout: 0,
                waitUntil: 'networkidle2'
            });
        if (wasRedirected) {
            //if page redireced , we wait for navigation end
            await page.waitForNavigation({
                waitUntil: 'domcontentloaded'
            })
        };


        const el = await page.$("#list");
        const textArea = await page.evaluate(node => node.innerHTML, el);
        await el.dispose();

        /*
          The expected behavior here is there is at least one tab open for the
          browser to remain open.

          If you use await browser.pages upon launching the browser, that will
          return all the pages open currently, which should be 1 about:blank page.
          https://github.com/puppeteer/puppeteer/issues/2040#issuecomment-366295221
        */
        let textAreas: string[] = textArea.split('\n');
        assert.equal(textAreas.length, 2);
        assert.equal(pageErrors.length, 0);

        expect(textAreas[0])
            .toBe(`about:blank`);
        expect(textAreas[1])
            .toBe(`chrome-extension://${extension_id(CRX_PATH)}/popup.html`);
    }, 10000);

    test("Copy button", async () => {
        await page.goto(
            `chrome-extension://${extension_id(CRX_PATH)}/popup.html`, {
                timeout: 0,
                waitUntil: 'networkidle2'
            });
        if (wasRedirected) {
            //if page redireced , we wait for navigation end
            await page.waitForNavigation({
                waitUntil: 'domcontentloaded'
            })
        };

        await page.evaluate(() => document.querySelector('#copyButton').scrollIntoView());
        await page.waitForSelector('.jsloaded');
        await click('#copyButton');

        const clipboardText = clipboardy.readSync();
        console.log(clipboardText);

        let textAreas: string[] = clipboardText.split('\n');
        assert.equal(textAreas.length, 2);

        expect(textAreas[0])
            .toBe(`about:blank`);
        expect(textAreas[1])
            .toBe(`chrome-extension://${extension_id(CRX_PATH)}/popup.html`);


    }, 10000);
});

async function click(selector, within='') {
    const cssSelector = within ? `${within} ${selector}`: selector;
    const element = await page.waitForSelector(cssSelector, {visible: true});
    return await page.evaluate(el => el.click(), element);  // <---- this
}
