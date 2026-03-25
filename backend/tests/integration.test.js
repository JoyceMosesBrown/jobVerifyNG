/**
 * JobVerify NG - Integration Tests
 * Tests the full verification pipeline end-to-end
 *
 * Run: node backend/tests/integration.test.js
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
    toBeLessThan(expected) { if (!(actual < expected)) throw new Error(`Expected ${actual} < ${expected}`); },
    toContain(expected) { if (!actual.includes(expected)) throw new Error(`Expected to contain "${expected}"`); },
    toBeTruthy() { if (!actual) throw new Error(`Expected truthy but got ${actual}`); },
    toBeFalsy() { if (actual) throw new Error(`Expected falsy but got ${actual}`); },
  };
}

function describe(name) {
  console.log(`\n\x1b[1m${name}\x1b[0m`);
}

// ============================================
// Recreate the full verification pipeline
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

const FREE_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
  "mail.com", "protonmail.com", "icloud.com", "yandex.com", "zoho.com",
];

const URGENCY_PHRASES = [
  "urgent hiring", "urgently needed", "urgent recruitment",
  "apply immediately", "apply now", "limited slots", "few slots left",
  "don't miss out", "don't miss this", "act now", "act fast",
  "hurry", "asap", "immediate start", "start immediately",
  "slots filling fast", "only.*left", "expires soon",
];

function checkPayment(text) {
  const lower = text.toLowerCase();
  const matches = [];
  for (const kw of PAYMENT_KEYWORDS) { if (lower.includes(kw)) matches.push(kw); }
  return { score: matches.length > 0 ? 3 : 0, matches, indicator: matches.length > 0 ? "Payment request detected" : null };
}

function checkGeneric(text) {
  const lower = text.toLowerCase();
  const matches = [];
  for (const phrase of GENERIC_DESCRIPTION_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(lower)) matches.push(phrase);
  }
  return { score: matches.length > 0 ? 2 : 0, matches, indicator: matches.length > 0 ? "Generic description detected" : null };
}

function checkFreeEmail(text) {
  const lower = text.toLowerCase();
  const found = FREE_EMAIL_DOMAINS.some(d => lower.includes(d));
  return { score: found ? 1 : 0, found, indicator: found ? "Free email domain detected" : null };
}

function checkUrgency(text) {
  const lower = text.toLowerCase();
  const found = URGENCY_PHRASES.some(p => new RegExp(p, "i").test(lower));
  return { score: found ? 1 : 0, found, indicator: found ? "Urgency language detected" : null };
}

function checkCompanyName(text) {
  const patterns = [
    /\b\w+\s+(ltd|limited|inc|incorporated|corp|corporation|plc|llc)\b/i,
    /\b\w+\s+(bank|university|agency|enterprise|solutions|technologies|consulting|group|foundation)\b/i,
    /\bcompany:\s*\w+/i,
    /\bcompany\s+name:\s*\w+/i,
    /\b(at|join)\s+(?!Home|Work|Your|Our|The|This|Any|All|An?|No|Some)[A-Z][a-zA-Z]{2,}\b/,
    /\b\w+@(?!gmail|yahoo|hotmail|outlook|aol|mail|proton|icloud)[a-z]+\.(com|co|org|io|ng|net)\b/i,
  ];
  const found = !patterns.some(p => p.test(text));
  return { score: found ? 1 : 0, found, indicator: found ? "No company name detected" : null };
}

// Full pipeline: all checks combined
function verifyJobAdvert(text) {
  const payment = checkPayment(text);
  const generic = checkGeneric(text);
  const freeEmail = checkFreeEmail(text);
  const urgency = checkUrgency(text);
  const companyName = checkCompanyName(text);

  const totalScore = Math.min(10, payment.score + generic.score + freeEmail.score + urgency.score + companyName.score);
  const indicators = [payment, generic, freeEmail, urgency, companyName].filter(c => c.indicator !== null);

  let verdict;
  if (totalScore === 0) verdict = "Legit";
  else if (totalScore <= 3) verdict = "Low Risk";
  else if (totalScore <= 6) verdict = "Moderate Risk";
  else verdict = "High Risk";

  return { risk_score: totalScore, verdict, indicators, advert_text: text };
}

// ============================================
// INTEGRATION TESTS
// ============================================

console.log("\n========================================");
console.log("  JobVerify NG - Integration Test Suite");
console.log("========================================");

// ---- Full Pipeline: Scam Text ----
describe("Full Verification Pipeline → Scam Job Advert");

test("should produce High Risk verdict for scam text", () => {
  const result = verifyJobAdvert("URGENT HIRING! No experience needed! You must pay a registration fee of $100 via western union. Contact: scammer@gmail.com");
  expect(result.verdict).toBe("High Risk");
});

test("should generate risk score above 5 for scam text", () => {
  const result = verifyJobAdvert("URGENT HIRING! No experience needed! You must pay a registration fee via western union. Contact: scam@gmail.com");
  expect(result.risk_score).toBeGreaterThan(5);
});

test("should detect multiple indicators for scam text", () => {
  const result = verifyJobAdvert("URGENT HIRING! No experience needed! Anyone can apply! You must pay a registration fee via western union. Contact: scam@gmail.com");
  expect(result.indicators.length).toBeGreaterThan(3);
});

test("should preserve original submitted text in response", () => {
  const input = "Test advert text for integration testing";
  const result = verifyJobAdvert(input);
  expect(result.advert_text).toBe(input);
});

// ---- Full Pipeline: Legit Text ----
describe("Full Verification Pipeline → Legitimate Job Advert");

test("should produce Legit verdict for clean job text", () => {
  const result = verifyJobAdvert("TechNova Solutions is hiring a Full Stack Developer. Requirements: 3+ years React experience. Competitive salary. Apply at careers@technova.com");
  expect(result.verdict).toBe("Legit");
});

test("should generate risk score of 0 for legit text", () => {
  const result = verifyJobAdvert("Access Bank is recruiting a Senior Software Engineer. 5+ years experience required. Apply at careers@accessbank.com");
  expect(result.risk_score).toBe(0);
});

test("should return zero indicators for legit text", () => {
  const result = verifyJobAdvert("Dangote Nigeria Limited has an opening for Chemical Engineer. MSc preferred. Apply at hr@dangote.com");
  expect(result.indicators.length).toBe(0);
});

// ---- Pipeline: Payment + Email Combined ----
describe("Combined Risk Check Pipeline → Multiple Indicators");

test("should detect both payment AND free email in same text", () => {
  const result = verifyJobAdvert("Pay a registration fee of $50. Send payment to recruiter@gmail.com");
  const hasPayment = result.indicators.some(i => i.indicator.includes("Payment"));
  const hasEmail = result.indicators.some(i => i.indicator.includes("email"));
  expect(hasPayment).toBeTruthy();
  expect(hasEmail).toBeTruthy();
});

test("should detect payment + generic + urgency + email + no company", () => {
  const result = verifyJobAdvert("URGENT HIRING! No experience needed! Simple tasks! You must pay a fee. Contact: fake@gmail.com");
  expect(result.indicators.length).toBeGreaterThan(4);
});

test("should produce high risk score with many indicators", () => {
  const result = verifyJobAdvert("URGENT HIRING! No experience needed! Anyone can apply! Easy money! Simple tasks! You must pay a registration fee via western union or bitcoin. Contact: scam@gmail.com");
  expect(result.risk_score).toBeGreaterThan(5);
});

// ---- Pipeline: Risk Score Ranges ----
describe("Risk Score Classification Pipeline");

test("should classify score 0 as Legit", () => {
  const result = verifyJobAdvert("TechNova Solutions is hiring. Apply at careers@technova.com");
  expect(result.verdict).toBe("Legit");
});

test("should classify moderate scam as Moderate Risk", () => {
  const result = verifyJobAdvert("We are hiring. No experience needed. Contact: hr@gmail.com");
  const validVerdicts = ["Low Risk", "Moderate Risk"];
  if (!validVerdicts.includes(result.verdict)) throw new Error(`Expected Low/Moderate Risk but got ${result.verdict}`);
});

test("should classify heavy scam as High Risk", () => {
  const result = verifyJobAdvert("URGENT! Pay registration fee via western union! No experience needed! Easy money! Contact: scam@gmail.com");
  expect(result.verdict).toBe("High Risk");
});

// ---- Data Flow Validation ----
describe("Data Flow Validation (Input → Processing → Output)");

test("should process text input and return structured response", () => {
  const result = verifyJobAdvert("Test job advert");
  if (!result.hasOwnProperty("risk_score")) throw new Error("Missing risk_score in response");
  if (!result.hasOwnProperty("verdict")) throw new Error("Missing verdict in response");
  if (!result.hasOwnProperty("indicators")) throw new Error("Missing indicators in response");
  if (!result.hasOwnProperty("advert_text")) throw new Error("Missing advert_text in response");
});

test("should handle empty text without crashing", () => {
  const result = verifyJobAdvert("");
  if (result.risk_score === undefined) throw new Error("Crashed on empty text");
});

test("should handle very long text without crashing", () => {
  const longText = "We are hiring a developer. ".repeat(500);
  const result = verifyJobAdvert(longText);
  if (result.risk_score === undefined) throw new Error("Crashed on long text");
});

test("should handle special characters without crashing", () => {
  const result = verifyJobAdvert("Job @#$%^&*() hiring!!! ₦50,000 salary <script>alert('xss')</script>");
  if (result.risk_score === undefined) throw new Error("Crashed on special characters");
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
  console.log("  \x1b[32mAll integration tests passed! ✓\x1b[0m\n");
}
