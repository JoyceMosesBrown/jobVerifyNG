/**
 * JobVerify NG - Backend Unit Tests
 * Risk Verification Engine Tests
 *
 * Run: node backend/tests/verify.test.js
 */

// ============================================
// Import the risk check functions by extracting them
// We'll recreate the core logic here for isolated unit testing
// ============================================

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
    toBe(expected) {
      if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) throw new Error(`Expected ${actual} to be greater than ${expected}`);
    },
    toContain(expected) {
      if (!actual.includes(expected)) throw new Error(`Expected array to contain "${expected}"`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy but got ${actual}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy but got ${actual}`);
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
  };
}

function describe(name, fn) {
  console.log(`\n\x1b[1m${name}\x1b[0m`);
  fn();
}

// ============================================
// Payment Keywords (from verify.js)
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

// ============================================
// Helper functions (from verify.js)
// ============================================
function checkPaymentKeywords(text) {
  const lowerText = text.toLowerCase();
  const matchedKeywords = [];
  for (const keyword of PAYMENT_KEYWORDS) {
    if (lowerText.includes(keyword)) matchedKeywords.push(keyword);
  }
  return matchedKeywords;
}

function checkGenericPhrases(text) {
  const lowerText = text.toLowerCase();
  const matched = [];
  for (const phrase of GENERIC_DESCRIPTION_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(lowerText)) matched.push(phrase);
  }
  return matched;
}

function checkFreeEmail(text) {
  const lowerText = text.toLowerCase();
  return FREE_EMAIL_DOMAINS.some((domain) => lowerText.includes(domain));
}

function checkUrgency(text) {
  const lowerText = text.toLowerCase();
  return URGENCY_PHRASES.some((phrase) => {
    const regex = new RegExp(phrase, "i");
    return regex.test(lowerText);
  });
}

function checkCompanyName(text) {
  const companyNamePatterns = [
    /\b\w+\s+(ltd|limited|inc|incorporated|corp|corporation|plc|llc)\b/i,
    /\b\w+\s+(bank|university|agency|enterprise|solutions|technologies|consulting|group|foundation|studios|labs|digital|tech|international)\b/i,
    /\bcompany:\s*\w+/i,
    /\bcompany\s+name:\s*\w+/i,
    /\b(nigeria|services)\s+limited\b/i,
    /\b(at|join)\s+(?!Home|Work|Your|Our|The|This|Any|All|An?|No|Some)[A-Z][a-zA-Z]{2,}\b/,
    /\b\w+@(?!gmail|yahoo|hotmail|outlook|aol|mail|proton|icloud)[a-z]+\.(com|co|org|io|ng|net)\b/i,
  ];
  return companyNamePatterns.some((p) => p.test(text));
}

// ============================================
// UNIT TESTS
// ============================================

console.log("\n========================================");
console.log("  JobVerify NG - Unit Test Suite");
console.log("========================================");

// --- Payment Detection Tests ---
describe("Payment Detection", () => {
  test("should detect 'registration fee' in scam text", () => {
    const matches = checkPaymentKeywords("You must pay a registration fee of $50");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches).toContain("registration fee");
  });

  test("should detect 'western union' in scam text", () => {
    const matches = checkPaymentKeywords("Send payment via western union");
    expect(matches).toContain("western union");
    expect(matches).toContain("send payment");
  });

  test("should detect 'bitcoin' in scam text", () => {
    const matches = checkPaymentKeywords("Pay with bitcoin before starting");
    expect(matches).toContain("bitcoin");
  });

  test("should detect multiple payment keywords", () => {
    const matches = checkPaymentKeywords("You must pay a registration fee via western union or bitcoin");
    expect(matches.length).toBeGreaterThan(2);
  });

  test("should NOT flag legitimate salary text", () => {
    const matches = checkPaymentKeywords("Competitive salary of $3000 monthly with health insurance");
    expect(matches.length).toBe(0);
  });

  test("should NOT flag normal job description", () => {
    const matches = checkPaymentKeywords("We are hiring a Software Developer with 3+ years experience");
    expect(matches.length).toBe(0);
  });
});

// --- Generic Description Tests ---
describe("Generic Description Detection", () => {
  test("should detect 'no experience needed'", () => {
    const matches = checkGenericPhrases("No experience needed! Anyone can apply!");
    expect(matches).toContain("no experience needed");
    expect(matches).toContain("anyone can apply");
  });

  test("should detect 'easy money' and 'unlimited income'", () => {
    const matches = checkGenericPhrases("Earn easy money with unlimited income potential");
    expect(matches).toContain("easy money");
    expect(matches).toContain("unlimited income");
  });

  test("should detect 'work at your convenience'", () => {
    const matches = checkGenericPhrases("Work at your convenience from home");
    expect(matches).toContain("work at your convenience");
  });

  test("should detect 'simple tasks' and 'data entry'", () => {
    const matches = checkGenericPhrases("Do simple tasks like data entry and copy paste work");
    expect(matches).toContain("simple tasks");
    expect(matches).toContain("data entry");
    expect(matches).toContain("copy paste");
  });

  test("should NOT flag professional job requirements", () => {
    const matches = checkGenericPhrases("3+ years experience with React and Node.js. Bachelor's degree required.");
    expect(matches.length).toBe(0);
  });

  test("should NOT flag standard job description", () => {
    const matches = checkGenericPhrases("Join our engineering team to build scalable web applications");
    expect(matches.length).toBe(0);
  });
});

// --- Free Email Detection Tests ---
describe("Free Email Domain Detection", () => {
  test("should flag gmail.com", () => {
    expect(checkFreeEmail("Contact: hiring@gmail.com")).toBeTruthy();
  });

  test("should flag yahoo.com", () => {
    expect(checkFreeEmail("Send CV to recruiter@yahoo.com")).toBeTruthy();
  });

  test("should flag hotmail.com", () => {
    expect(checkFreeEmail("Apply at jobs@hotmail.com")).toBeTruthy();
  });

  test("should NOT flag company email domain", () => {
    expect(checkFreeEmail("Apply at careers@technova.com")).toBeFalsy();
  });

  test("should NOT flag company email with .co domain", () => {
    expect(checkFreeEmail("Contact hr@company.co")).toBeFalsy();
  });

  test("should NOT flag text without email", () => {
    expect(checkFreeEmail("We are hiring a developer")).toBeFalsy();
  });
});

// --- Urgency Detection Tests ---
describe("Urgency Language Detection", () => {
  test("should detect 'urgent hiring'", () => {
    expect(checkUrgency("URGENT HIRING!!! Apply now!")).toBeTruthy();
  });

  test("should detect 'apply immediately'", () => {
    expect(checkUrgency("Apply immediately to secure your spot")).toBeTruthy();
  });

  test("should detect 'limited slots'", () => {
    expect(checkUrgency("Limited slots available, hurry!")).toBeTruthy();
  });

  test("should NOT flag normal job posting", () => {
    expect(checkUrgency("We are looking for a software developer to join our team")).toBeFalsy();
  });

  test("should NOT flag standard application instructions", () => {
    expect(checkUrgency("Submit your resume and cover letter by March 30, 2026")).toBeFalsy();
  });
});

// --- Company Name Detection Tests ---
describe("Company Name Detection", () => {
  test("should detect 'TechNova Solutions'", () => {
    expect(checkCompanyName("TechNova Solutions is hiring a developer")).toBeTruthy();
  });

  test("should detect 'Access Bank'", () => {
    expect(checkCompanyName("Access Bank is recruiting for multiple positions")).toBeTruthy();
  });

  test("should detect 'Nigeria Limited'", () => {
    expect(checkCompanyName("Dangote Nigeria Limited has an opening")).toBeTruthy();
  });

  test("should detect company email domain", () => {
    expect(checkCompanyName("Apply at careers@technova.com")).toBeTruthy();
  });

  test("should NOT detect company name in vague text", () => {
    expect(checkCompanyName("We are hiring for an exciting remote position. No experience needed.")).toBeFalsy();
  });

  test("should NOT detect company name when only generic words used", () => {
    expect(checkCompanyName("Join our team and earn unlimited income from home")).toBeFalsy();
  });
});

// --- Full Scam Detection Test ---
describe("Full Scam Text Analysis", () => {
  const scamText = `URGENT HIRING!!! EARN $3000 WEEKLY FROM HOME!!!
    No experience needed! Anyone can apply!
    Simple tasks like data entry. Be your own boss.
    You must pay a registration fee of $100 via western union.
    Contact: hiring247@gmail.com`;

  test("should detect payment keywords in full scam text", () => {
    const matches = checkPaymentKeywords(scamText);
    expect(matches.length).toBeGreaterThan(0);
  });

  test("should detect generic phrases in full scam text", () => {
    const matches = checkGenericPhrases(scamText);
    expect(matches.length).toBeGreaterThan(3);
  });

  test("should detect free email in full scam text", () => {
    expect(checkFreeEmail(scamText)).toBeTruthy();
  });

  test("should detect urgency in full scam text", () => {
    expect(checkUrgency(scamText)).toBeTruthy();
  });

  test("should NOT detect company name in scam text", () => {
    expect(checkCompanyName(scamText)).toBeFalsy();
  });
});

// --- Legitimate Job Test ---
describe("Legitimate Job Text Analysis", () => {
  const legitText = `TechNova Solutions is hiring a Full Stack Developer to join our engineering team in Lagos.
    Requirements: 3+ years experience with React and Node.js.
    Bachelor's degree in Computer Science.
    Competitive salary, health insurance, and career growth.
    Apply at careers@technova.com`;

  test("should NOT detect payment keywords in legit text", () => {
    const matches = checkPaymentKeywords(legitText);
    expect(matches.length).toBe(0);
  });

  test("should NOT detect generic phrases in legit text", () => {
    const matches = checkGenericPhrases(legitText);
    expect(matches.length).toBe(0);
  });

  test("should NOT detect free email in legit text", () => {
    expect(checkFreeEmail(legitText)).toBeFalsy();
  });

  test("should NOT detect urgency in legit text", () => {
    expect(checkUrgency(legitText)).toBeFalsy();
  });

  test("should detect company name in legit text", () => {
    expect(checkCompanyName(legitText)).toBeTruthy();
  });
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
  console.log("  \x1b[32mAll tests passed! ✓\x1b[0m\n");
}
