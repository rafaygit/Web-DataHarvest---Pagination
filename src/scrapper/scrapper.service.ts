import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
import userPrefs from 'puppeteer-extra-plugin-user-preferences';
import puppeteerExtra from 'puppeteer-extra';
import path from 'path';

@Injectable()
export class ScrapperService {
  // method to access page
  async getdataViaPuppeteer() {
    const path = require('path');
    const downloadPath = path.resolve('D:/Rafay/scrapper RESOURCES/downloads');
    puppeteerExtra.use(
      require('puppeteer-extra-plugin-user-preferences')({
        userPrefs: {
          download: {
            prompt_for_download: false,
            open_pdf_in_system_reader: true,
          },
          plugins: {
            always_open_pdf_externally: true,
          },
        },
      }),
    );
    const browser = await puppeteerExtra.launch({
      headless: 'new',
      // devtools: false,
      // executablePath: 'C:/Program Files/Google/Chrome/Application/Chrome',
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);
    // Change this to the URL of the website you want to scrape
    const url = 'https://bettercotton.org/document-library/';
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
    });
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',

      downloadPath: downloadPath, // Specify the directory where the file should be downloaded
    });

    // const allLinks = await page.$$('[class="btn btn-outline-primary btn-sm"]');

    console.log(url);
    await new Promise((resolve) => setTimeout(resolve, 6000));
    const checkCookie = await page.$('[aria-label="I Agree"]');

    if (checkCookie !== null) {
      console.log('Cookie click');
      await checkCookie.click();
      // await page.setCookie(checkCookie, chec);
    }
    let hasNextPage: boolean = true;
    let counterPage: number = 1;
    // let linksToClick = [];
    // let result = [];
    let totalExcelLinks = 0;
    let totalWordLinks = 0;
    while (hasNextPage) {
      const pageNext = await page.$$('[class="nextpostslink"]');
      const pdfLinks = await page.$$(
        'a[class= "btn btn-outline-primary btn-sm"][href$=".pdf"] > i[class = "fas fa-download"]',
      );
      const wordLinks = await page.$$(
        'a[class= "btn btn-outline-primary btn-sm"][href$=".docx"] > i[class = "fas fa-download"]',
      );
      const excelLinks = await page.$$(
        'a[class= "btn btn-outline-primary btn-sm"][href$=".xlsx"] > i[class = "fas fa-download"]',
      );
      totalExcelLinks += excelLinks.length;
      totalWordLinks += wordLinks.length;
      const allLinks = pdfLinks.concat(wordLinks, excelLinks);
      if (allLinks.length === 0) {
        console.log('Download links exists on this url: NONE');
      } else {
        // linksToClick.push(...allLinks);
        console.log('Download links exists on this url:', allLinks.length);
        await new Promise((resolve) => setTimeout(resolve, 6000));

        for (const link of allLinks) {
          console.log('check');
          await link.click();
        }
      }
      // linksToClick.length = 0;

      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log('Clicking pageNext...');
      console.log('Page number: ', counterPage);
      console.log('pagenext: ', pageNext.length);

      if (pageNext.length === 0) {
        hasNextPage = false;
      } else {
        counterPage++;
        await pageNext[0].click();
        await page.waitForNavigation();
      }
    }
    console.log('excel: ', totalExcelLinks);
    console.log('word:', totalWordLinks);

    //     await pdfLink
    //       .click()
    //       .then(
    //         async (func) =>
    //           await page
    //             .click('[class = "fas fa-download"]' || '[title*="Download"]')
    //             .then((func) => console.log('downloaded!')),
    //       );

    await browser.close();
  }
}
