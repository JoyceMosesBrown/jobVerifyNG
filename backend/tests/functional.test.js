/**
 * JobVerify NG - Functional & System Tests
 * Tests all functional requirements of the system
 *
 * Run: node backend/tests/functional.test.js
 */

let passed = 0;
let failed = 0;
let total = 0;

function test(description, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${description}`);
  } catch (err) {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${description}`);
    console.log(`    \x1b[31m${err.message}\x1b[0m`);
  }
}

function expect(actual) {
  return {
    toBe(expected) { if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`); },
    toBeGreaterThan(expected) { if (!(actual > expected)) throw new Error(`Expected ${actual} > ${expected}`); },
    toBeTruthy() { if (!actual) throw new Error(`Expected truthy but got ${actual}`); },
    toBeFalsy() { if (actual) throw new Error(`Expected falsy but got ${actual}`); },
    toContain(expected) { if (!actual.includes(expected)) throw new Error(`Expected to contain "${expected}"`); },
  };
}

function describe(name) {
  console.log(`\n\x1b[1m${name}\x1b[0m`);
}

// ============================================
// Core verification logic
// ============================================
const PAYMENT_KEYWORDS = [
  "pay a fee", "pay a deposit", "pay to apply", "pay to start", "pay to secure",
  "pay before", "pay upfront", "pay for training", "pay for materials", "pay for your",
  "you must pay", "you need to pay", "applicants must pay", "candidates must pay",
  "required to pay", "registration fee", "processing fee", "training fee",
  "application fee", "onboarding fee", "equipment fee", "background check fee",
  "fee required", "upfront fee", "deposit required", "deposit before",
  "advance payment", "upfront payment", "payment required",
  "send money", "send payment", "transfer money", "wire money",
  "bank transfer before", "transfer before", "western union", "moneygram",
  "bitcoin", "crypto", "naira upfront",
];

const GENERIC_DESCRIPTION_PHRASES = [
  "easy money", "no experience needed", "no experience required", "anyone can apply",
  "simple tasks", "data entry", "copy paste", "online job", "home based job",
  "be your own boss", "unlimited income", "unlimited earning", "work at your convenience",
  "part time job from home", "earn from your phone", "just follow instructions",
  "typing job", "ad posting job", "click and earn", "survey job",
];

const FREE_EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "mail.com", "protonmail.com", "icloud.com"];

const URL_SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "adf.ly", "shorte.st"];

const SUSPICIOUS_TLDS = [".xyz", ".top", ".buzz", ".click", ".loan", ".work", ".gq", ".ml", ".cf", ".tk"];

function checkPayment(text) {
  const lower = text.toLowerCase();
  const matches = [];
  for (const kw of PAYMENT_KEYWORDS) { if (lower.includes(kw)) matches.push(kw); }
  return { detected: matches.length > 0, matches };
}

function checkGeneric(text) {
  const lower = text.toLowerCase();
  const matches = [];
  for (const phrase of GENERIC_DESCRIPTION_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(lower)) matches.push(phrase);
  }
  return { detected: matches.length > 0, matches };
}

function checkFreeEmail(text) {
  const lower = text.toLowerCase();
  return { detected: FREE_EMAIL_DOMAINS.some(d => lower.includes(d)) };
}

function checkUrgency(text) {
  const lower = text.toLowerCase();
  const phrases = ["urgent hiring", "urgently needed", "apply immediately", "apply now", "limited slots", "act now", "hurry", "immediate start"];
  return { detected: phrases.some(p => lower.includes(p)) };
}

function checkCompanyName(text) {
  const patterns = [
    /\b\w+\s+(ltd|limited|inc|incorporated|corp|corporation|plc|llc)\b/i,
    /\b\w+\s+(bank|university|agency|enterprise|solutions|technologies|consulting|group|foundation)\b/i,
    /\b\w+@(?!gmail|yahoo|hotmail|outlook|aol|mail|proton|icloud)[a-z]+\.(com|co|org|io|ng|net)\b/i,
  ];
  return { detected: patterns.some(p => p.test(text)) };
}

function checkUrlShortener(text) {
  const lower = text.toLowerCase();
  return {
    detected: URL_SHORTENERS.some(s => {
      const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(https?:\\/\\/)?${escaped}(\\/|\\s|$)`, "i").test(lower);
    })
  };
}

function checkSuspiciousTLD(text) {
  const lower = text.toLowerCase();
  return {
    detected: SUSPICIOUS_TLDS.some(tld => {
      const escaped = tld.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`[a-z0-9]${escaped}(\\s|$|\\/)`, "i").test(lower);
    })
  };
}

function generateRiskScore(text) {
  let score = 0;
  if (checkPayment(text).detected) score += 3;
  if (checkGeneric(text).detected) score += 2;
  if (checkFreeEmail(text).detected) score += 1;
  if (checkUrgency(text).detected) score += 1;
  if (!checkCompanyName(text).detected) score += 1;
  if (checkUrlShortener(text).detected) score += 1;
  if (checkSuspiciousTLD(text).detected) score += 1;
  return Math.min(10, score);
}

function getVerdict(score) {
  if (score === 0) return "Legit";
  if (score <= 3) return "Low Risk";
  if (score <= 6) return "Moderate Risk";
  return "High Risk";
}

// ============================================
// FUNCTIONAL & SYSTEM TESTS
// ============================================

console.log("\n========================================");
console.log("  JobVerify NG - Functional & System Tests");
console.log("========================================");

// ---- FR1: Text-Based Verification ----
describe("FR1: Text-Based Verification");

test("should analyse pasted job advert text for risk indicators", () => {
  const score = generateRiskScore("You must pay a registration fee via western union. Contact: scam@gmail.com");
  expect(score).toBeGreaterThan(0);
});

test("should return zero risk for clean professional job text", () => {
  const score = generateRiskScore("TechNova Solutions is hiring a developer. Apply at careers@technova.com");
  expect(score).toBe(0);
});

test("should detect all risk categories in heavily scam text", () => {
  const text = "URGENT HIRING! No experience needed! Pay registration fee via western union. Contact: fake@gmail.com";
  expect(checkPayment(text).detected).toBeTruthy();
  expect(checkGeneric(text).detected).toBeTruthy();
  expect(checkFreeEmail(text).detected).toBeTruthy();
  expect(checkUrgency(text).detected).toBeTruthy();
});

// ---- FR2: Risk Score Generation ----
describe("FR2: Risk Score Generation (0-10 Scale)");

test("should generate score 0 for legitimate job", () => {
  const score = generateRiskScore("Access Bank is recruiting engineers. Apply at careers@accessbank.com");
  expect(score).toBe(0);
});

test("should generate low score for minor concerns", () => {
  const score = generateRiskScore("We are hiring a developer. Send CV to hr@gmail.com");
  const verdict = getVerdict(score);
  expect(verdict).toBe("Low Risk");
});

test("should generate high score for scam job", () => {
  const score = generateRiskScore("URGENT! Pay fee via western union! No experience needed! Easy money! Contact: scam@gmail.com");
  expect(score).toBeGreaterThan(5);
});

test("should cap risk score at maximum of 10", () => {
  const score = generateRiskScore("URGENT! Pay fee! No experience! Easy money! Simple tasks! Online job! Be your own boss! western union! bitcoin! scam@gmail.com Apply at https://bit.ly/scam Visit scamjob.xyz");
  expect(score >= 7).toBeTruthy();
});

// ---- FR3: Risk Indicator Display ----
describe("FR3: Risk Indicator Display with Detected Phrases");

test("should return matched payment phrases", () => {
  const result = checkPayment("You must pay a registration fee and send payment via western union");
  expect(result.matches).toContain("registration fee");
  expect(result.matches).toContain("send payment");
  expect(result.matches).toContain("western union");
});

test("should return matched generic phrases", () => {
  const result = checkGeneric("No experience needed! Anyone can apply for this online job!");
  expect(result.matches).toContain("no experience needed");
  expect(result.matches).toContain("anyone can apply");
  expect(result.matches).toContain("online job");
});

test("should return empty matches for clean text", () => {
  const result = checkPayment("Competitive salary of $5000 monthly");
  expect(result.matches.length).toBe(0);
});

// ---- FR4: Verdict Classification ----
describe("FR4: Verdict Classification System");

test("should classify score 0 as Legit", () => {
  expect(getVerdict(0)).toBe("Legit");
});

test("should classify score 1-3 as Low Risk", () => {
  expect(getVerdict(1)).toBe("Low Risk");
  expect(getVerdict(2)).toBe("Low Risk");
  expect(getVerdict(3)).toBe("Low Risk");
});

test("should classify score 4-6 as Moderate Risk", () => {
  expect(getVerdict(4)).toBe("Moderate Risk");
  expect(getVerdict(5)).toBe("Moderate Risk");
  expect(getVerdict(6)).toBe("Moderate Risk");
});

test("should classify score 7-10 as High Risk", () => {
  expect(getVerdict(7)).toBe("High Risk");
  expect(getVerdict(8)).toBe("High Risk");
  expect(getVerdict(9)).toBe("High Risk");
  expect(getVerdict(10)).toBe("High Risk");
});

// ---- FR5: URL Shortener Detection ----
describe("FR5: URL Shortener Detection");

test("should detect bit.ly links", () => {
  expect(checkUrlShortener("Apply at https://bit.ly/job123").detected).toBeTruthy();
});

test("should detect tinyurl.com links", () => {
  expect(checkUrlShortener("Visit tinyurl.com/apply").detected).toBeTruthy();
});

test("should NOT flag normal URLs", () => {
  expect(checkUrlShortener("Visit www.technova.com/careers").detected).toBeFalsy();
});

test("should NOT flag t.co inside domain names like technova.com", () => {
  expect(checkUrlShortener("Apply at careers@technova.com").detected).toBeFalsy();
});

// ---- FR6: Suspicious TLD Detection ----
describe("FR6: Suspicious TLD Detection");

test("should detect .xyz domain", () => {
  expect(checkSuspiciousTLD("Visit jobs.xyz for details").detected).toBeTruthy();
});

test("should detect .tk domain", () => {
  expect(checkSuspiciousTLD("Apply at hiring.tk").detected).toBeTruthy();
});

test("should NOT flag .com domains", () => {
  expect(checkSuspiciousTLD("Visit google.com").detected).toBeFalsy();
});

test("should NOT flag .work in normal text like 'we work hard'", () => {
  expect(checkSuspiciousTLD("we work hard every day").detected).toBeFalsy();
});

// ---- FR7: Company Name Detection ----
describe("FR7: Company Name Identification");

test("should identify 'TechNova Solutions' as company name", () => {
  expect(checkCompanyName("TechNova Solutions is hiring").detected).toBeTruthy();
});

test("should identify company email as company identifier", () => {
  expect(checkCompanyName("Apply at careers@dangote.com").detected).toBeTruthy();
});

test("should NOT identify company in vague scam text", () => {
  expect(checkCompanyName("We are hiring for exciting remote work from home").detected).toBeFalsy();
});

// ---- FR8: Free Email Detection ----
describe("FR8: Free Email Domain Detection");

test("should flag gmail.com as free email", () => {
  expect(checkFreeEmail("Contact: recruiter@gmail.com").detected).toBeTruthy();
});

test("should flag yahoo.com as free email", () => {
  expect(checkFreeEmail("Send CV to jobs@yahoo.com").detected).toBeTruthy();
});

test("should NOT flag professional company email", () => {
  expect(checkFreeEmail("Apply at hr@technova.com").detected).toBeFalsy();
});

// ---- FR9: Input Validation ----
describe("FR9: Input Validation & Error Handling");

test("should handle empty string without crashing", () => {
  const score = generateRiskScore("");
  expect(score).toBe(1); // Only no company name detected
});

test("should handle very long text without crashing", () => {
  const longText = "We are hiring. ".repeat(1000);
  const score = generateRiskScore(longText);
  expect(score >= 0).toBeTruthy();
});

test("should handle special characters without crashing", () => {
  const score = generateRiskScore("Job @#$%^&*() <script>alert('test')</script> ₦50,000");
  expect(score >= 0).toBeTruthy();
});

test("should handle unicode and emoji without crashing", () => {
  const score = generateRiskScore("🚀 Exciting job opportunity! Apply today 💼");
  expect(score >= 0).toBeTruthy();
});

// ============================================
// RESULTS SUMMARY
// ============================================
console.log("\n========================================");
console.log(`  Results: ${passed} passed, ${failed} failed, ${total} total`);
console.log("========================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("  \x1b[32mAll functional & system tests passed! ✓\x1b[0m\n");
}
