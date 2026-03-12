// backend/utils/domainChecks.js

const axios = require("axios");
const whois = require("whois-json");
const { weights } = require("../config/riskWeights");

// Check if link uses HTTPS
function checkHttps(url) {
  if (!url) return { score: 0, indicators: [] };

  if (!url.startsWith("https://")) {
    return {
      score: weights.nonSecureHttp,
      indicators: ["Website is not using HTTPS (non-secure connection)"],
    };
  }

  return { score: 0, indicators: [] };
}

// Check if link is reachable
async function checkLinkReachable(url) {
  if (!url) return { score: 0, indicators: [] };

  try {
    await axios.get(url, { timeout: 5000 });
    return { score: 0, indicators: [] };
  } catch (error) {
    return {
      score: weights.linkUnreachable,
      indicators: ["Job application link is unreachable or broken"],
    };
  }
}

// Check domain age (recently registered domains are risky)
async function checkDomainAge(url) {
  if (!url) return { score: 0, indicators: [] };

  try {
    const domain = new URL(url).hostname;
    const data = await whois(domain);

    if (!data.creationDate) return { score: 0, indicators: [] };

    const creationDate = new Date(data.creationDate);
    const ageInDays =
      (Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays < 180) {
      return {
        score: weights.domainRecentlyRegistered,
        indicators: ["Website domain was registered recently"],
      };
    }

    return { score: 0, indicators: [] };
  } catch (error) {
    return { score: 0, indicators: [] };
  }
}

module.exports = {
  checkHttps,
  checkLinkReachable,
  checkDomainAge,
};