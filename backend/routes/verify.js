const express = require("express");
const Verification = require("../models/Verification");
const Blacklist = require("../models/Blacklist");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ========== RISK SIGNAL CONFIGURATION ==========

const PAYMENT_KEYWORDS = [
  "pay", "payment", "fee", "deposit", "transfer", "send money", "registration fee",
  "processing fee", "training fee", "advance payment", "western union", "bitcoin",
  "crypto", "bank transfer before", "pay before", "₦", "naira upfront", "pay to secure",
  "payment required", "fee required", "transfer before",
];

const PROCUREMENT_CONTEXT_KEYWORDS = [
  "tender", "proposal", "procurement", "bid", "rfp", "request for proposal",
  "request for quotation", "rfq", "invitation to bid", "itb", "expression of interest",
  "eoi", "government", "ministry", "federal", "state government", "local government",
  "development bank", "central bank", "public sector", "official", "sealed bid",
];

const OFFICIAL_DOMAIN_PATTERNS = [
  /\.gov\.ng$/i, /\.gov$/i, /\.edu\.ng$/i, /\.org\.ng$/i,
  /bank.*\.com$/i, /\.ac\.ng$/i, /@.*bank/i, /@.*ministry/i,
  /@.*government/i, /development.*bank/i, /central.*bank/i,
];

const FREE_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
  "mail.com", "ymail.com", "live.com", "icloud.com", "protonmail.com",
];

const NO_INTERVIEW_KEYWORDS = [
  "no interview", "without interview", "skip interview", "interview not required",
  "no interview needed", "direct hiring", "hired immediately",
];

const INSTANT_HIRING_KEYWORDS = [
  "start immediately", "immediate start", "start today", "start tomorrow",
  "instant hiring", "hired on spot", "immediate employment", "urgent hiring",
  "same day hiring", "start asap",
];

const INFORMAL_CONTACT_PATTERNS = [
  /whatsapp\s*only/i, /telegram\s*only/i, /contact\s*via\s*(telegram|whatsapp)\s*only/i,
  /reach\s*(me|us)\s*on\s*whatsapp/i, /dm\s*(me|us)\s*on\s*telegram/i,
  /only\s*on\s*(whatsapp|telegram)/i,
];

const UNREALISTIC_SALARY_PATTERNS = [
  /₦\s*[5-9]\d{5,}/i, /\$\s*[5-9]\d{3,}/i,
  /earn\s+\d+k\s*(monthly|weekly|daily)/i, /monthly.*[5-9]\d{5}/i,
  /work\s*from\s*home.*earn\s*\$?\d+k/i, /make\s*\$?\d{4,}\s*(per|a)\s*(day|week)/i,
  /guaranteed\s*income\s*of\s*\$?\d{4,}/i,
];

const URGENCY_KEYWORDS = [
  "urgent", "immediately", "asap", "right now", "today only", "limited time",
  "act fast", "don't miss", "hurry", "deadline", "expires", "last chance",
  "only few slots", "closing soon", "apply now before", "limited slots",
];

const COMPANY_NAME_INDICATORS = [
  "ltd", "limited", "inc", "incorporated", "corp", "corporation", "bank",
  "university", "agency", "company", "plc", "llc", "co.", "enterprise",
  "solutions", "services ltd", "nigeria limited",
];

const URL_SHORTENERS = [
  "bit.ly", "tinyurl", "cutt.ly", "shorturl", "goo.gl", "t.co", "ow.ly",
  "is.gd", "buff.ly", "adf.ly", "short.link", "tiny.cc",
];

const SUSPICIOUS_TLDS = [
  ".xyz", ".top", ".click", ".live", ".work", ".site", ".online", ".buzz",
  ".club", ".loan", ".win", ".stream", ".gq", ".ml", ".cf", ".tk",
];

const NO_EXPERIENCE_KEYWORDS = [
  "no experience", "zero experience", "experience not required", "no prior experience",
  "freshers welcome", "beginners welcome", "anyone can apply", "no skills required",
];

// Risk check functions
function checkPaymentRisk(text, isProcurement, hasOfficialDomain) {
  const lowerText = text.toLowerCase();
  for (const keyword of PAYMENT_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      if (isProcurement || hasOfficialDomain) {
        return { score: 3, indicators: [`Procurement document fee detected ("${keyword}") — normal for tender/RFP processes`] };
      }
      return { score: 30, indicators: [`Requests upfront payment or mentions fees ("${keyword}")`] };
    }
  }
  return { score: 0, indicators: [] };
}

function checkFreeEmailDomain(email) {
  if (!email) return { score: 0, indicators: [] };
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && FREE_EMAIL_DOMAINS.includes(domain)) {
    return { score: 15, indicators: [`Recruiter uses free email service (${domain}) instead of company email`] };
  }
  return { score: 0, indicators: [] };
}

function checkKeywords(text, keywords, score, message) {
  const lowerText = text.toLowerCase();
  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      return { score, indicators: [`${message} ("${keyword}")`] };
    }
  }
  return { score: 0, indicators: [] };
}

function checkPatterns(text, patterns, score, message) {
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      return { score, indicators: [message] };
    }
  }
  return { score: 0, indicators: [] };
}

function checkNoCompanyName(text) {
  const lowerText = text.toLowerCase();
  const hasCompanyIndicator = COMPANY_NAME_INDICATORS.some((i) => lowerText.includes(i));
  if (!hasCompanyIndicator) {
    return { score: 12, indicators: ["No identifiable company name (Ltd, Inc, Corp, Bank, etc.) mentioned"] };
  }
  return { score: 0, indicators: [] };
}

function checkUrlShortener(text, link) {
  const combinedText = `${text} ${link || ""}`.toLowerCase();
  for (const shortener of URL_SHORTENERS) {
    if (combinedText.includes(shortener)) {
      return { score: 15, indicators: [`Uses URL shortener (${shortener}) — may hide suspicious destination`] };
    }
  }
  return { score: 0, indicators: [] };
}

function checkSuspiciousTLD(text, link) {
  const combinedText = `${text} ${link || ""}`.toLowerCase();
  for (const tld of SUSPICIOUS_TLDS) {
    if (combinedText.includes(tld)) {
      return { score: 15, indicators: [`Uses suspicious domain TLD (${tld})`] };
    }
  }
  return { score: 0, indicators: [] };
}

function checkComboRisk(text) {
  const lowerText = text.toLowerCase();
  const hasHighSalary = UNREALISTIC_SALARY_PATTERNS.some((p) => p.test(text));
  const hasNoExperience = NO_EXPERIENCE_KEYWORDS.some((k) => lowerText.includes(k));
  const hasImmediateStart = INSTANT_HIRING_KEYWORDS.some((k) => lowerText.includes(k));
  if (hasHighSalary && hasNoExperience && hasImmediateStart) {
    return { score: 20, indicators: ["COMBO ALERT: High salary + No experience required + Immediate start — classic scam pattern"] };
  }
  return { score: 0, indicators: [] };
}

async function checkBlacklist(email, phone, link) {
  const blacklist = await Blacklist.find();
  let score = 0;
  const indicators = [];

  for (const item of blacklist) {
    if (item.type === "email" && email?.toLowerCase().includes(item.value.toLowerCase())) {
      indicators.push(`Blacklisted recruiter email detected: ${item.value}`);
      score += 40;
    }
    if (item.type === "phone" && phone?.includes(item.value)) {
      indicators.push(`Blacklisted recruiter phone detected: ${item.value}`);
      score += 40;
    }
    if (item.type === "domain") {
      const emailDomain = email?.split("@")[1]?.toLowerCase();
      const linkLower = link?.toLowerCase();
      if (emailDomain?.includes(item.value) || linkLower?.includes(item.value)) {
        indicators.push(`Blacklisted domain detected: ${item.value}`);
        score += 40;
      }
    }
  }

  return { score, indicators };
}

// POST /api/verify - Verify a job advert
router.post("/", async (req, res) => {
  try {
    const { advertText, advertLink, sourcePlatform, recruiterEmail, recruiterPhone, userId } = req.body;

    const textToAnalyze = `${advertText || ""} ${advertLink || ""}`;
    const allIndicators = [];
    let totalRiskScore = 0;

    const lowerText = textToAnalyze.toLowerCase();
    const isProcurementContext = PROCUREMENT_CONTEXT_KEYWORDS.some((k) => lowerText.includes(k));
    const hasOfficialDomain = recruiterEmail
      ? OFFICIAL_DOMAIN_PATTERNS.some((p) => p.test(recruiterEmail))
      : false;

    // Run all risk checks
    const checks = [
      await checkBlacklist(recruiterEmail, recruiterPhone, advertLink),
      checkPaymentRisk(textToAnalyze, isProcurementContext, hasOfficialDomain),
      checkFreeEmailDomain(recruiterEmail),
      checkKeywords(textToAnalyze, NO_INTERVIEW_KEYWORDS, 20, "No interview required — legitimate jobs typically have interviews"),
      checkKeywords(textToAnalyze, INSTANT_HIRING_KEYWORDS, 20, "Instant/immediate hiring promised"),
      checkPatterns(textToAnalyze, INFORMAL_CONTACT_PATTERNS, 15, "Contact via WhatsApp/Telegram only — lacks professional communication channels"),
      checkPatterns(textToAnalyze, UNREALISTIC_SALARY_PATTERNS, 20, "Contains unrealistic salary promises"),
      checkKeywords(textToAnalyze, URGENCY_KEYWORDS, 12, "Uses urgency pressure language"),
      checkNoCompanyName(textToAnalyze),
      checkUrlShortener(textToAnalyze, advertLink),
      checkSuspiciousTLD(textToAnalyze, advertLink),
      checkComboRisk(textToAnalyze),
    ];

    for (const check of checks) {
      totalRiskScore += check.score;
      allIndicators.push(...check.indicators);
    }

    totalRiskScore = Math.min(totalRiskScore, 100);

    let verdict;
    if (totalRiskScore < 20) verdict = "likely_legit";
    else if (totalRiskScore < 40) verdict = "needs_review";
    else if (totalRiskScore < 70) verdict = "suspicious";
    else verdict = "high_risk_scam";

    // Store the result
    const verification = await Verification.create({
      advertText,
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

// GET /api/verify/:id - Get verification result
router.get("/:id", async (req, res) => {
  try {
    const verification = await Verification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ error: "Verification not found" });
    }

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

// PUT /api/verify/:id/save - Save verification to user history
router.put("/:id/save", protect, async (req, res) => {
  try {
    const verification = await Verification.findByIdAndUpdate(
      req.params.id,
      { saved: true, userId: req.user._id },
      { new: true }
    );

    if (!verification) {
      return res.status(404).json({ error: "Verification not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Save verification error:", error);
    res.status(500).json({ error: "Failed to save verification" });
  }
});

module.exports = router;
