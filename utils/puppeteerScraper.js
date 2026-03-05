const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteerExtra.use(StealthPlugin());

let browserInstance = null;
let sharedPage = null;
let nkparam = "";

/**
 * Detects if the current environment is serverless (Vercel/AWS Lambda)
 */
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

/**
 * Get the appropriate browser options for the environment
 */
const getBrowserOptions = async () => {
  if (isServerless) {
    // Optimized for Serverless (Vercel/AWS Lambda)
    const chromium = require("@sparticuz/chromium");
    console.log("Using serverless chromium configuration.");
    return {
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    };
  } else {
    // Standard Local Configuration
    console.log("Using local configuration.");
    return {
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };
  }
};

const getSharedPage = async (forceRefresh = false) => {
  // In serverless, sessions might be cut short, so we're more careful
  if (
    browserInstance &&
    sharedPage &&
    !sharedPage.isClosed() &&
    !forceRefresh
  ) {
    return sharedPage;
  }

  // Cleanup old state before fresh launch
  if (sharedPage && !sharedPage.isClosed()) {
    await sharedPage.close().catch(() => {});
  }
  if (
    browserInstance &&
    (!sharedPage || sharedPage.isClosed() || forceRefresh)
  ) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }

  // Launch browser with appropriate options
  const options = await getBrowserOptions();

  // Note: We use puppeteerExtra which is wrapped with Stealth but requires
  // an underlying puppeteer library. On local, it finds 'puppeteer'.
  // On Vercel, we have 'puppeteer-core' installed as a dependency.
  browserInstance = await puppeteerExtra.launch(options);
  sharedPage = await browserInstance.newPage();

  // Reset captured nkparam
  nkparam = "";

  await sharedPage.setRequestInterception(true);
  sharedPage.on("request", (request) => {
    const resourceType = request.resourceType();
    const headers = request.headers();

    if (headers["nkparam"]) {
      nkparam = headers["nkparam"];
    }

    // Performance optimization: block images/media
    if (["image", "media", "font"].includes(resourceType)) {
      request.abort();
    } else {
      request.continue();
    }
  });

  await sharedPage.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  );

  console.log("Navigating to establish session...");
  await sharedPage.goto("https://www.naukri.com/freshers-jobs-in-chennai", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  // Brief polling for nkparam
  if (!nkparam) {
    let attempts = 0;
    while (!nkparam && attempts < 5) {
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
    }
  }

  // Fallback to cookies
  if (!nkparam) {
    const cookies = await sharedPage.cookies();
    const nkCookie = cookies.find((c) => c.name === "nkparam");
    if (nkCookie) {
      nkparam = nkCookie.value;
      console.log("Captured nkparam from cookies.");
    }
  }

  if (nkparam) {
    console.log("Session established. nkparam captured.");
  } else {
    console.log("Warning: Could not capture nkparam.");
  }

  return sharedPage;
};

const fetchWithPuppeteer = async (url, retryCount = 0) => {
  try {
    const page = await getSharedPage();

    const data = await page.evaluate(
      async (apiUrl, nk) => {
        const response = await fetch(apiUrl, {
          headers: {
            accept: "application/json",
            appid: "109",
            systemid: "Naukri",
            clientid: "d3skt0p",
            nkparam: nk,
            referer: "https://www.naukri.com/",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      },
      url,
      nkparam,
    );

    return data;
  } catch (error) {
    console.error(`Scraper Error (${retryCount}):`, error.message);

    // Auto-retry once on 406 or closed target
    if (
      (error.message.includes("406") ||
        error.message.includes("Target closed")) &&
      retryCount < 1
    ) {
      console.log("Refreshing session and retrying...");
      await getSharedPage(true);
      return fetchWithPuppeteer(url, retryCount + 1);
    }

    if (
      error.message.includes("disconnected") ||
      error.message.includes("Target closed")
    ) {
      browserInstance = null;
      sharedPage = null;
    }

    throw error;
  }
};

module.exports = { fetchWithPuppeteer };
