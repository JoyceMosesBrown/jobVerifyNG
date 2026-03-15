const express = require("express");
const crypto = require("crypto");
const multer = require("multer");

const Verification = require("../models/Verification");
const Blacklist = require("../models/Blacklist");
const VerificationLimit = require("../models/VerificationLimit");
const { protect } = require("../middleware/auth");
const riskWeights = require("../config/riskWeights");

const cheerio = require("cheerio");

const router = express.Router();

// Multer: store uploaded document in memory
const upload = multer({ storage: multer.memoryStorage() });

const PAYMENT_KEYWORDS = [
  // Scam-specific payment request phrases
  "pay a fee",
  "pay a deposit",
  "pay to apply",
  "pay to start",
  "pay to secure",
  "pay before",
  "pay upfront",
  "pay for training",
  "pay for materials",
  "pay for your",
  "you must pay",
  "you need to pay",
  "applicants must pay",
  "candidates must pay",
  "required to pay",
  // Fee-specific scam phrases
  "registration fee",
  "processing fee",
  "training fee",
  "application fee",
  "onboarding fee",
  "equipment fee",
  "background check fee",
  "fee required",
  "upfront fee",
  // Deposit scam phrases
  "deposit required",
  "deposit before",
  // Payment/transfer scam phrases
  "advance payment",
  "upfront payment",
  "payment required",
  "send money",
  "send payment",
  "transfer money",
  "wire money",
  "bank transfer before",
  "transfer before",
  // Scam payment methods
  "western union",
  "moneygram",
  "bitcoin",
  "crypto",
  // Nigerian-specific scam indicators
  "naira upfront",
];

const PROCUREMENT_CONTEXT_KEYWORDS = [
  "tender",
  "proposal",
  "procurement",
  "bid",
  "rfp",
  "request for proposal",
  "request for quotation",
  "rfq",
  "invitation to bid",
  "itb",
  "expression of interest",
  "eoi",
  "government",
  "ministry",
  "federal",
  "state government",
  "local government",
  "development bank",
  "central bank",
  "public sector",
  "official",
  "sealed bid",
];

const OFFICIAL_DOMAIN_PATTERNS = [
  /\.gov\.ng$/i,
  /\.gov$/i,
  /\.edu\.ng$/i,
  /\.org\.ng$/i,
  /bank.*\.com$/i,
  /\.ac\.ng$/i,
  /@.*bank/i,
  /@.*ministry/i,
  /@.*government/i,
  /development.*bank/i,
  /central.*bank/i,
];

const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "mail.com",
  "ymail.com",
  "live.com",
  "icloud.com",
  "protonmail.com",
];

const NO_INTERVIEW_KEYWORDS = [
  "no interview",
  "without interview",
  "skip interview",
  "interview not required",
  "no interview needed",
  "direct hiring",
  "hired immediately",
];

const INSTANT_HIRING_KEYWORDS = [
  "start immediately",
  "immediate start",
  "start today",
  "start tomorrow",
  "instant hiring",
  "hired on spot",
  "immediate employment",
  "urgent hiring",
  "same day hiring",
  "start asap",
];

const INFORMAL_CONTACT_PATTERNS = [
  /whatsapp\s*only/i,
  /telegram\s*only/i,
  /contact\s*via\s*(telegram|whatsapp)\s*only/i,
  /reach\s*(me|us)\s*on\s*whatsapp/i,
  /dm\s*(me|us)\s*on\s*telegram/i,
  /only\s*on\s*(whatsapp|telegram)/i,
];

const UNREALISTIC_SALARY_PATTERNS = [
  /₦\s*[5-9]\d{5,}/i,
  /\$\s*[5-9]\d{3,}/i,
  /earn\s+\d+k\s*(monthly|weekly|daily)/i,
  /monthly.*[5-9]\d{5}/i,
  /work\s*from\s*home.*earn\s*\$?\d+k/i,
  /make\s*\$?\d{4,}\s*(per|a)\s*(day|week)/i,
  /guaranteed\s*income\s*of\s*\$?\d{4,}/i,
];

const URGENCY_KEYWORDS = [
  "act fast",
  "don't miss",
  "hurry",
  "last chance",
  "only few slots",
  "closing soon",
  "apply now before",
  "limited slots",
  "today only",
  "urgent hiring",
  "urgently needed",
  "limited time offer",
];

const COMPANY_NAME_INDICATORS = [
  "ltd",
  "limited",
  "inc",
  "incorporated",
  "corp",
  "corporation",
  "bank",
  "university",
  "agency",
  "company",
  "plc",
  "llc",
  "co.",
  "enterprise",
  "solutions",
  "services ltd",
  "nigeria limited",
];

const URL_SHORTENERS = [
  "bit.ly",
  "tinyurl",
  "cutt.ly",
  "shorturl",
  "goo.gl",
  "t.co",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "adf.ly",
  "short.link",
  "tiny.cc",
];

const SUSPICIOUS_TLDS = [
  ".xyz",
  ".top",
  ".click",
  ".live",
  ".work",
  ".site",
  ".online",
  ".buzz",
  ".club",
  ".loan",
  ".win",
  ".stream",
  ".gq",
  ".ml",
  ".cf",
  ".tk",
];

const GENERIC_DESCRIPTION_PHRASES = [
  "easy money",
  "no experience needed",
  "no experience required",
  "anyone can apply",
  "simple tasks",
  "data entry",
  "copy paste",
  "online job",
  "home based job",
  "be your own boss",
  "unlimited income",
  "unlimited earning",
  "work at your convenience",
  "part time job from home",
  "earn from your phone",
  "just follow instructions",
  "typing job",
  "ad posting job",
  "click and earn",
  "survey job",
];

const GRAMMAR_ERROR_PATTERNS = [
  /\bi\s+is\b/i,
  /\byou\s+is\b/i,
  /\bthey\s+is\b/i,
  /\bwe\s+is\b/i,
  /\bhe\s+are\b/i,
  /\bshe\s+are\b/i,
  /\bit\s+are\b/i,
  /\bdoes\s+not\s+has\b/i,
  /\bdo\s+not\s+has\b/i,
  /\byou\s+was\b/i,
  /\bthey\s+was\b/i,
  /\bwe\s+was\b/i,
  /\bcan\s+able\b/i,
  /\bkindly\s+revert\s+back\b/i,
  /\bdo\s+the\s+needful\b/i,
  /\bplease\s+to\s+contact\b/i,
  /\bwe\s+needs\b/i,
  /\bapplicants\s+is\b/i,
  /\byour\s+are\b/i,
  /\btheir\s+is\b/i,
  /\bits\s+a\s+great\s+oppurtunity\b/i,
  /\boppertunity\b/i,
  /\brecieve\b/i,
  /\bgaruntee\b/i,
  /\bimmidiate\b/i,
  /\bpossition\b/i,
  /\bmanagment\b/i,
  /\bemployement\b/i,
  /\bsalery\b/i,
  /\bbenifits\b/i,
  /\brequirment\b/i,
  /\bqualifcation\b/i,
];

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
}

function normalizeText(s) {
  return String(s || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function makeAdvertKey(advertText, advertLink) {
  const payload = `${normalizeText(advertText)}|${normalizeText(advertLink)}`;
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 24);
}

async function enforceVerificationLimit({ identifierBase, advertKey }) {
  const identifier = `${identifierBase}:${advertKey}`;
  const existing = await VerificationLimit.findOne({ identifier });

  if (!existing) {
    await VerificationLimit.create({ identifier, count: 1 });
    return { allowed: true };
  }

  if (existing.count >= 3) {
    return {
      allowed: false,
      status: 429,
      body: {
        error: "Verification limit reached",
        message: "You cannot verify a job advert more than 3 times. Thank you.",
      },
    };
  }

  existing.count += 1;
  await existing.save();
  return { allowed: true };
}

const INDICATOR_EXPLANATIONS = {
  freeEmail: "Professional companies typically use their own domain for email (e.g., hr@company.com). Free email services like Gmail or Yahoo are easy to create anonymously and are commonly used in scam postings.",
  noCompanyName: "Legitimate job adverts usually mention the hiring company by name. Missing company identification makes it difficult to verify the employer.",
  companyMismatch: "When the recruiter's email domain doesn't match the company mentioned in the advert, it may indicate impersonation or a fraudulent posting.",
  noInterview: "Legitimate employers conduct interviews to assess candidates. Skipping the interview process entirely is a common tactic in employment scams.",
  instantHiring: "Promises of immediate hiring without proper evaluation are designed to pressure applicants into acting quickly before they can verify the opportunity.",
  urgencyLanguage: "Creating a false sense of urgency is a classic manipulation tactic used by scammers to prevent applicants from taking time to research the opportunity.",
  unrealisticSalary: "Salary offers that are significantly above market rates for the role and experience level are often used to lure victims into scam schemes.",
  urlShortener: "URL shorteners hide the actual destination website, making it impossible to verify where a link leads before clicking. Scammers use them to disguise malicious sites.",
  suspiciousTLD: "Certain domain extensions (.xyz, .tk, .buzz, etc.) are frequently associated with fraudulent websites due to their low cost and minimal registration requirements.",
  nonsecureWebsite: "Websites using HTTP instead of HTTPS do not encrypt data in transit. Legitimate employers use secure connections to protect applicant information.",
  newDomain: "Websites registered less than 6 months ago may have been created specifically for a scam. Established companies typically have older domains.",
  blacklistedEntity: "This email, phone number, or domain has been reported and added to our blacklist database by administrators based on previous scam reports.",
};

function scoreIfFound({ found, weightKey, customIndicator, explanationKey }) {
  if (!found) return { score: 0, indicators: [] };
  const indicatorText =
    customIndicator || weightKey.description || "Risk indicator detected";
  return {
    score: weightKey.weight || 0,
    indicators: [{
      title: indicatorText,
      matches: [],
      explanation: INDICATOR_EXPLANATIONS[explanationKey] || "This indicator was flagged based on automated analysis of the job advert content.",
    }],
  };
}

function extractMatchContext(text, keyword) {
  // Find the keyword in the text and return the surrounding phrase
  const lowerText = text.toLowerCase();
  const idx = lowerText.indexOf(keyword);
  if (idx === -1) return keyword;

  // Expand left to the start of the word/phrase
  let start = idx;
  while (start > 0 && lowerText[start - 1] !== '.' && lowerText[start - 1] !== '\n' && lowerText[start - 1] !== ',') {
    start--;
  }
  // Expand right to the end of the word/phrase
  let end = idx + keyword.length;
  while (end < lowerText.length && lowerText[end] !== '.' && lowerText[end] !== '\n' && lowerText[end] !== ',') {
    end++;
  }

  return text.slice(start, end).trim();
}

function checkPaymentRisk(text, isProcurement, hasOfficialDomain) {
  const lowerText = text.toLowerCase();
  const matchedKeywords = [];
  for (const keyword of PAYMENT_KEYWORDS) {
    if (lowerText.includes(keyword)) matchedKeywords.push(keyword);
  }
  if (matchedKeywords.length === 0) return { score: 0, indicators: [] };
  if (isProcurement || hasOfficialDomain) return { score: 0, indicators: [] };

  // Remove substring overlaps: if "bank transfer before" matched, don't also show "transfer before"
  const filtered = matchedKeywords.filter((kw) => {
    return !matchedKeywords.some((other) => other !== kw && other.includes(kw));
  });

  // Extract actual phrases from the submitted text around each keyword
  const contextMatches = filtered.map((kw) => extractMatchContext(text, kw));

  return {
    score: riskWeights.financialRequests.paymentRequest.weight || 0,
    indicators: [{
      title: `${riskWeights.financialRequests.paymentRequest.description} ("${filtered[0]}")`,
      matches: contextMatches,
      explanation: "Legitimate employers never ask job applicants to pay money upfront. Requests for fees, deposits, or payments before starting work are a major red flag for employment scams.",
    }],
  };
}

function checkFreeEmailDomain(email) {
  if (!email) return { score: 0, indicators: [] };
  const domain = email.split("@")[1]?.toLowerCase();
  const isFree = domain && FREE_EMAIL_DOMAINS.includes(domain);

  return scoreIfFound({
    found: !!isFree,
    weightKey: riskWeights.recruiterIdentity.freeEmail,
    customIndicator: `${riskWeights.recruiterIdentity.freeEmail.description} (${domain})`,
    explanationKey: "freeEmail",
  });
}

function checkNoCompanyName(text) {
  const lowerText = text.toLowerCase();
  // Look for company names that appear as "Name Ltd", "Name Inc", etc.
  // Use patterns that indicate an actual company name, not just the word in a sentence
  const companyNamePatterns = [
    // Legal suffixes: "Piyata Ltd", "Google Inc"
    /\b\w+\s+(ltd|limited|inc|incorporated|corp|corporation|plc|llc)\b/i,
    // Business type words: "Access Bank", "Lagos University"
    /\b\w+\s+(bank|university|agency|enterprise|solutions|technologies|consulting|group|foundation|studios|labs|digital|tech|international)\b/i,
    // Explicit labels: "Company: Piyata"
    /\bcompany:\s*\w+/i,
    /\bcompany\s+name:\s*\w+/i,
    /\b(nigeria|services)\s+limited\b/i,
    // Brand name contexts: "at Piyata", "join Piyata", "about Piyata"
    /\b(at|join|about|with|from)\s+[A-Z][a-zA-Z]{2,}\b/,
    // Standalone capitalized brand on its own line (like "Piyata" on a flyer)
    // Exclude common section headers like "Requirements", "Responsibilities", "Description"
    /(?:^|\n)\s*(?!Requirements|Responsibilities|Description|Qualifications|Benefits|Summary|Experience|Skills|About|Location|Salary|Apply|Contact|Duties|Overview)[A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]+)*\s*(?:\n|$)/,
    // Company email domain (not free email)
    /\b\w+@(?!gmail|yahoo|hotmail|outlook|aol|mail|proton|icloud)[a-z]+\.(com|co|org|io|ng|net)\b/i,
  ];
  const hasCompanyName = companyNamePatterns.some((p) => p.test(text));

  return scoreIfFound({
    found: !hasCompanyName,
    weightKey: riskWeights.recruiterIdentity.noCompanyName,
    customIndicator: riskWeights.recruiterIdentity.noCompanyName.description,
    explanationKey: "noCompanyName",
  });
}

function checkNoInterview(text) {
  const lowerText = text.toLowerCase();
  const found = NO_INTERVIEW_KEYWORDS.some((k) => lowerText.includes(k));

  return scoreIfFound({
    found,
    weightKey: riskWeights.contentBased.noInterview,
    customIndicator: riskWeights.contentBased.noInterview.description,
    explanationKey: "noInterview",
  });
}

function checkInstantHiring(text) {
  const lowerText = text.toLowerCase();
  const matched = INSTANT_HIRING_KEYWORDS.find((k) => lowerText.includes(k));

  return scoreIfFound({
    found: !!matched,
    weightKey: riskWeights.contentBased.instantHiring,
    customIndicator: matched ? `${riskWeights.contentBased.instantHiring.description} ("${matched}")` : riskWeights.contentBased.instantHiring.description,
    explanationKey: "instantHiring",
  });
}

function checkUrgency(text) {
  const lowerText = text.toLowerCase();
  const matched = URGENCY_KEYWORDS.find((k) => lowerText.includes(k));

  return scoreIfFound({
    found: !!matched,
    weightKey: riskWeights.contentBased.urgencyLanguage,
    customIndicator: matched ? `${riskWeights.contentBased.urgencyLanguage.description} ("${matched}")` : riskWeights.contentBased.urgencyLanguage.description,
    explanationKey: "urgencyLanguage",
  });
}

function checkUnrealisticSalary(text) {
  const found = UNREALISTIC_SALARY_PATTERNS.some((p) => p.test(text));

  return scoreIfFound({
    found,
    weightKey: riskWeights.contentBased.unrealisticSalary,
    customIndicator: riskWeights.contentBased.unrealisticSalary.description,
    explanationKey: "unrealisticSalary",
  });
}

function checkUrlShortener(text, link) {
  const combinedText = `${text} ${link || ""}`.toLowerCase();
  const found = URL_SHORTENERS.some((shortener) => {
    const escaped = shortener.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(https?:\\/\\/)?${escaped}(\\/|\\s|$)`, "i");
    return regex.test(combinedText);
  });

  return scoreIfFound({
    found,
    weightKey: riskWeights.technicalIndicators.urlShortener,
    customIndicator: riskWeights.technicalIndicators.urlShortener.description,
    explanationKey: "urlShortener",
  });
}

function checkSuspiciousTLD(text, link) {
  const combinedText = `${text} ${link || ""}`.toLowerCase();
  // Only match TLDs when they appear as part of a URL or domain (e.g., "example.xyz" not "the xyz company")
  const found = SUSPICIOUS_TLDS.some((tld) => {
    const escaped = tld.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`[a-z0-9]${escaped}(\\s|$|\\/)`, "i");
    return regex.test(combinedText);
  });

  return scoreIfFound({
    found,
    weightKey: riskWeights.technicalIndicators.suspiciousTLD,
    customIndicator: riskWeights.technicalIndicators.suspiciousTLD.description,
    explanationKey: "suspiciousTLD",
  });
}

function checkInformalContact(text) {
  const found = INFORMAL_CONTACT_PATTERNS.some((p) => p.test(text));
  if (!found) return { score: 0, indicators: [] };
  return { score: 0, indicators: [{
    title: "Contact via WhatsApp/Telegram only",
    matches: [],
    explanation: "Legitimate employers use official communication channels like company email. Relying solely on messaging apps like WhatsApp or Telegram makes it harder to verify the recruiter's identity.",
  }] };
}

function checkGenericDescription(text) {
  const lowerText = text.toLowerCase();
  const matchedPhrases = [];
  for (const phrase of GENERIC_DESCRIPTION_PHRASES) {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(lowerText)) matchedPhrases.push(phrase);
  }
  // Flag if 2+ generic phrases found
  if (matchedPhrases.length < 2) return { score: 0, indicators: [] };
  return {
    score: riskWeights.contentBased.genericDescription.weight || 0,
    indicators: [{
      title: `${riskWeights.contentBased.genericDescription.description} (${matchedPhrases.length} vague phrases detected)`,
      matches: matchedPhrases,
      explanation: "These phrases are commonly used in fraudulent job adverts to attract victims with vague promises. Legitimate jobs typically provide specific responsibilities and requirements.",
    }],
  };
}

function checkPoorGrammar(text) {
  const matchedErrors = [];
  for (const pattern of GRAMMAR_ERROR_PATTERNS) {
    const match = text.match(pattern);
    if (match) matchedErrors.push(match[0]);
  }
  // Flag if 3+ grammar errors found
  if (matchedErrors.length < 3) return { score: 0, indicators: [] };
  return {
    score: riskWeights.contentBased.poorGrammar.weight || 0,
    indicators: [{
      title: `${riskWeights.contentBased.poorGrammar.description} (${matchedErrors.length} errors found)`,
      matches: matchedErrors,
      explanation: "Multiple spelling and grammar errors are a common sign of fraudulent job postings, as scammers often operate from different regions and may not use professional language.",
    }],
  };
}

function checkNonsecureWebsite(link) {
  if (!link) return { score: 0, indicators: [] };
  const lowerLink = link.toLowerCase().trim();
  const isHttp = lowerLink.startsWith("http://");
  return scoreIfFound({
    found: isHttp,
    weightKey: riskWeights.technicalIndicators.nonsecureWebsite,
    customIndicator: riskWeights.technicalIndicators.nonsecureWebsite.description,
    explanationKey: "nonsecureWebsite",
  });
}

function checkCompanyMismatch(text, email) {
  if (!email || !email.includes("@")) return { score: 0, indicators: [] };
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return { score: 0, indicators: [] };

  // Skip free email domains (already caught by freeEmail check)
  if (FREE_EMAIL_DOMAINS.includes(domain)) return { score: 0, indicators: [] };

  // Extract company name from domain (e.g., "acme" from "acme.com")
  const domainName = domain.split(".")[0];
  if (!domainName || domainName.length < 3) return { score: 0, indicators: [] };

  const lowerText = text.toLowerCase();

  // Check if the domain company name appears anywhere in the advert text
  const domainInText = lowerText.includes(domainName);

  return scoreIfFound({
    found: !domainInText,
    weightKey: riskWeights.recruiterIdentity.companyMismatch,
    customIndicator: `${riskWeights.recruiterIdentity.companyMismatch.description} (email domain: ${domain})`,
    explanationKey: "companyMismatch",
  });
}

async function checkDomainAge(link) {
  if (!link) return { score: 0, indicators: [] };
  try {
    let hostname;
    try {
      hostname = new URL(link.startsWith("http") ? link : `https://${link}`).hostname;
    } catch {
      return { score: 0, indicators: [] };
    }

    // Use RDAP (free, no API key needed) to check domain registration date
    const https = require("https");
    const data = await new Promise((resolve, reject) => {
      const req = https.get(`https://rdap.org/domain/${hostname}`, { timeout: 5000 }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try { resolve(JSON.parse(body)); } catch { resolve(null); }
        });
      });
      req.on("error", () => resolve(null));
      req.on("timeout", () => { req.destroy(); resolve(null); });
    });

    if (!data || !data.events) return { score: 0, indicators: [] };

    const regEvent = data.events.find((e) => e.eventAction === "registration");
    if (!regEvent || !regEvent.eventDate) return { score: 0, indicators: [] };

    const regDate = new Date(regEvent.eventDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const isNew = regDate > sixMonthsAgo;
    return scoreIfFound({
      found: isNew,
      weightKey: riskWeights.technicalIndicators.newDomain,
      customIndicator: `${riskWeights.technicalIndicators.newDomain.description} (registered: ${regDate.toISOString().split("T")[0]})`,
      explanationKey: "newDomain",
    });
  } catch {
    // If lookup fails, don't penalize
    return { score: 0, indicators: [] };
  }
}

async function checkBlacklist(email, phone, link) {
  const blacklist = await Blacklist.find();
  let score = 0;
  const indicators = [];

  for (const item of blacklist) {
    if (item.type === "email" && email?.toLowerCase().includes(item.value.toLowerCase())) {
      indicators.push({
        title: `${riskWeights.technicalIndicators.blacklistedEntity.description}: ${item.value}`,
        matches: [item.value],
        explanation: INDICATOR_EXPLANATIONS.blacklistedEntity,
      });
      score += riskWeights.technicalIndicators.blacklistedEntity.weight;
    }
    if (item.type === "phone" && phone?.includes(item.value)) {
      indicators.push({
        title: `${riskWeights.technicalIndicators.blacklistedEntity.description}: ${item.value}`,
        matches: [item.value],
        explanation: INDICATOR_EXPLANATIONS.blacklistedEntity,
      });
      score += riskWeights.technicalIndicators.blacklistedEntity.weight;
    }
    if (item.type === "domain") {
      const emailDomain = email?.split("@")[1]?.toLowerCase();
      const linkLower = link?.toLowerCase();
      if (emailDomain?.includes(item.value) || linkLower?.includes(item.value)) {
        indicators.push({
          title: `${riskWeights.technicalIndicators.blacklistedEntity.description}: ${item.value}`,
          matches: [item.value],
          explanation: INDICATOR_EXPLANATIONS.blacklistedEntity,
        });
        score += riskWeights.technicalIndicators.blacklistedEntity.weight;
      }
    }
  }

  return { score, indicators };
}

function decideVerdictByFramework(score) {
  const bands = [...riskWeights.riskBands].sort((a, b) => b.min - a.min);
  for (const band of bands) {
    if (score >= band.min) return band.verdict;
  }
  return "likely_legit";
}

async function loadPdfJsLegacy() {
  try {
    return await import("pdfjs-dist/legacy/build/pdf.mjs");
  } catch (e1) {
    const mod = await import("pdfjs-dist/legacy/build/pdf.js");
    return mod.default || mod;
  }
}

async function crawlJobPage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JobVerifyNG/1.0; +https://jobverify.ng)",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return "";

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, nav, footer
    $("script, style, nav, footer, header, noscript, iframe").remove();

    // Try to get main content first, fallback to body
    const mainContent = $("main, article, [role='main'], .job-description, .job-details, #job-description").text();
    const text = mainContent || $("body").text();

    // Clean up whitespace
    return text.replace(/\s+/g, " ").trim().slice(0, 10000);
  } catch (err) {
    console.error("Crawl error:", err.message);
    return "";
  }
}

async function extractTextFromImage(buffer) {
  const Tesseract = require("tesseract.js");
  const { data: { text } } = await Tesseract.recognize(buffer, "eng");
  return text.trim();
}

async function extractTextFromPdfBuffer(buffer) {
  const path = require("path");
  const { pathToFileURL } = require("url");
  const pdfjs = await loadPdfJsLegacy();
  const standardFontDataUrl = pathToFileURL(
    path.join(__dirname, "../node_modules/pdfjs-dist/standard_fonts/")
  ).href;
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    standardFontDataUrl,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;

  let text = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text.trim();
}

router.post("/document", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Supported formats: PDF, PNG, JPG, WEBP" });
    }

    let extractedText = "";

    if (req.file.mimetype === "application/pdf") {
      extractedText = await extractTextFromPdfBuffer(req.file.buffer);

      // If PDF has no selectable text, try OCR on it
      if (!extractedText) {
        extractedText = await extractTextFromImage(req.file.buffer);
      }
    } else {
      // Image file — use OCR
      extractedText = await extractTextFromImage(req.file.buffer);
    }

    if (!extractedText) {
      return res.status(400).json({
        error: "No text could be extracted from this file",
        message: "The file may be blank or the text is not readable. Try pasting the text manually.",
      });
    }

    const { sourcePlatform, recruiterEmail, recruiterPhone, userId } = req.body;

    const ip = getClientIp(req);
    const identifierBase = userId ? `user:${userId}` : `ip:${ip}`;
    const advertKey = makeAdvertKey(extractedText, "");

    const limit = await enforceVerificationLimit({ identifierBase, advertKey });
    if (!limit.allowed) return res.status(limit.status).json(limit.body);

    const textToAnalyze = extractedText;
    const allIndicators = [];
    let totalRiskScore = 0;

    const lowerText = textToAnalyze.toLowerCase();
    const isProcurementContext = PROCUREMENT_CONTEXT_KEYWORDS.some((k) => lowerText.includes(k));
    const hasOfficialDomain = recruiterEmail
      ? OFFICIAL_DOMAIN_PATTERNS.some((p) => p.test(recruiterEmail))
      : false;

    const checks = [
      await checkBlacklist(recruiterEmail, recruiterPhone, null),
      checkPaymentRisk(textToAnalyze, isProcurementContext, hasOfficialDomain),
      checkFreeEmailDomain(recruiterEmail),
      checkCompanyMismatch(textToAnalyze, recruiterEmail),
      checkNoInterview(textToAnalyze),
      checkInstantHiring(textToAnalyze),
      checkInformalContact(textToAnalyze),
      checkUnrealisticSalary(textToAnalyze),
      checkUrgency(textToAnalyze),
      checkNoCompanyName(textToAnalyze),
      checkGenericDescription(textToAnalyze),
      checkPoorGrammar(textToAnalyze),
      checkUrlShortener(textToAnalyze, null),
      checkSuspiciousTLD(textToAnalyze, null),
      checkNonsecureWebsite(null),
      await checkDomainAge(null),
    ];

    for (const check of checks) {
      totalRiskScore += check.score;
      allIndicators.push(...check.indicators);
    }

    const verdict = decideVerdictByFramework(totalRiskScore);

    const verification = await Verification.create({
      advertText: extractedText,
      advertLink: null,
      sourcePlatform: sourcePlatform || "document",
      recruiterEmail: recruiterEmail || null,
      recruiterPhone: recruiterPhone || null,
      riskScore: totalRiskScore,
      verdict,
      indicators: allIndicators,
      userId: userId || null,
      saved: false,
    });

    res.status(201).json({
      id: verification._id,
      riskScore: totalRiskScore,
      verdict,
      indicators: allIndicators,
    });
  } catch (error) {
    console.error("Document verification error:", error);
    res.status(500).json({ error: "Document verification failed" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { advertText, advertLink, sourcePlatform, recruiterEmail, recruiterPhone, userId } = req.body;

    const ip = getClientIp(req);
    const identifierBase = userId ? `user:${userId}` : `ip:${ip}`;
    const advertKey = makeAdvertKey(advertText, advertLink);

    const limit = await enforceVerificationLimit({ identifierBase, advertKey });
    if (!limit.allowed) return res.status(limit.status).json(limit.body);

    // If a link is provided, crawl the page and combine with any pasted text
    let crawledText = "";
    if (advertLink) {
      crawledText = await crawlJobPage(advertLink);
    }

    const textToAnalyze = `${advertText || ""} ${crawledText} ${advertLink || ""}`.trim();
    const allIndicators = [];
    let totalRiskScore = 0;

    const lowerText = textToAnalyze.toLowerCase();
    const isProcurementContext = PROCUREMENT_CONTEXT_KEYWORDS.some((k) => lowerText.includes(k));
    const hasOfficialDomain = recruiterEmail
      ? OFFICIAL_DOMAIN_PATTERNS.some((p) => p.test(recruiterEmail))
      : false;

    const checks = [
      await checkBlacklist(recruiterEmail, recruiterPhone, advertLink),
      checkPaymentRisk(textToAnalyze, isProcurementContext, hasOfficialDomain),
      checkFreeEmailDomain(recruiterEmail),
      checkCompanyMismatch(textToAnalyze, recruiterEmail),
      checkNoInterview(textToAnalyze),
      checkInstantHiring(textToAnalyze),
      checkInformalContact(textToAnalyze),
      checkUnrealisticSalary(textToAnalyze),
      checkUrgency(textToAnalyze),
      checkNoCompanyName(textToAnalyze),
      checkGenericDescription(textToAnalyze),
      checkPoorGrammar(textToAnalyze),
      checkUrlShortener(textToAnalyze, advertLink),
      checkSuspiciousTLD(textToAnalyze, advertLink),
      checkNonsecureWebsite(advertLink),
      await checkDomainAge(advertLink),
    ];

    for (const check of checks) {
      totalRiskScore += check.score;
      allIndicators.push(...check.indicators);
    }

    const verdict = decideVerdictByFramework(totalRiskScore);

    const verification = await Verification.create({
      advertText: advertText || crawledText || null,
      advertLink,
      sourcePlatform,
      recruiterEmail,
      recruiterPhone,
      riskScore: totalRiskScore,
      verdict,
      indicators: allIndicators,
      userId: userId || null,
      saved: false,
    });

    res.status(201).json({
      id: verification._id,
      riskScore: totalRiskScore,
      verdict,
      indicators: allIndicators,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const verification = await Verification.findById(req.params.id);
    if (!verification) return res.status(404).json({ error: "Verification not found" });

    res.json({
      id: verification._id,
      advert_text: verification.advertText,
      advert_link: verification.advertLink,
      source_platform: verification.sourcePlatform,
      recruiter_email: verification.recruiterEmail,
      recruiter_phone: verification.recruiterPhone,
      risk_score: verification.riskScore,
      verdict: verification.verdict,
      indicators: verification.indicators,
      user_id: verification.userId,
      saved: verification.saved,
      created_at: verification.createdAt,
    });
  } catch (error) {
    console.error("Fetch verification error:", error);
    res.status(500).json({ error: "Failed to fetch verification" });
  }
});

router.put("/:id/save", protect, async (req, res) => {
  try {
    const verification = await Verification.findByIdAndUpdate(
      req.params.id,
      { saved: true, userId: req.user._id },
      { new: true }
    );

    if (!verification) return res.status(404).json({ error: "Verification not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("Save verification error:", error);
    res.status(500).json({ error: "Failed to save verification" });
  }
});

module.exports = router;