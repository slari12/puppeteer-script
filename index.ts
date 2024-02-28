import puppeteer, { Page } from "puppeteer";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pause = () => new Promise((resolve) => rl.question("pause... ", resolve));

const click = async (page: Page, selector: string) => {
  const el = await page.waitForSelector(selector);
  await el?.evaluate((__el) => {
    try {
      console.log(__el);
      // @ts-ignore
      __el.dispatchEvent(new Event("click", { bubbles: true }));
    } catch (error) {
      console.log(error);
    }
  });
};

//delay
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const apiEndpoints = [
  "/api/v1/platform/gameList",
  "/api/v1/platform/slotGameList",
  "/api/v1/platform/gameFavorite",
  "/api/v1/platform/platList",
  "/api/v1/platform/startGame",
  "/api/v1/platform/casinoList",
  "/api/v1/platform/hotGameList",
  "/api/v1/platform/gameSlotList",
  "/api/v1/platform/searchGameList",
  "/api/v1/platform/gameClassifyList",
  "/api/v1/platform/details",
  "/api/v1/platform/endingRecommend",
];

const checkNavigation = async (url: string, linkSelectors: string[]) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const [page] = await browser.pages();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const closeButtons = [
      someElementSelector.checkInDailyCloseButton,
      someElementSelector.activityCloseButton,
    ];
    for (const closeButton of closeButtons) {
      await click(page, closeButton);
    }

    for (const selector of linkSelectors) {
      console.log(`Checking navigation for link with selector: ${selector}`);
      await page.click(selector);
      try {
        const response = await page.waitForResponse(`${url}${apiEndpoints}`, {
          timeout: 2000,
        });
        const data = await response.json();
        const isSuccess = data.code === 0;
        console.log(isSuccess ? `Success: ${selector}` : `Failed: ${selector}`);
      } catch (error) {
        console.log(error);
      }
      await wait(2000);
    }

    console.log("All navigations seem to be working fine.");
  } catch (error) {
    console.log("Error during navigation:", error);
  } finally {
    await pause();
    await browser.close();
  }
};

const web_url = "https://filbet-zi-test.com";

const linkSelectorsToCheck = [
  "#id-menu-item-Home",
  "#id-menu-item-Live",
  "#id-menu-item-Slots",
  "#id-menu-item-Fishing",
  "#id-menu-item-Bingo",
  "#id-menu-item-Table",
  "#id-menu-item-Sports",
  "#id-menu-item-Chess",
];

const someElementSelector = {
  activityCloseButton:
    "svg.sprite_id-images-activity-christmas-promotion-close-btn",
  checkInDailyCloseButton: "svg.sprite_id-images-check-in-daily-button-close",
};

checkNavigation(web_url, linkSelectorsToCheck);
