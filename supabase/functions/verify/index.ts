import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ========== RISK SIGNAL CONFIGURATION ==========

// Payment/fee keywords - HIGH RISK (+30)
const PAYMENT_KEYWORDS = [
  "pay", "payment", "fee", "deposit", "transfer", "send money", "registration fee",
  "processing fee", "training fee", "advance payment", "western union", "bitcoin",
  "crypto", "bank transfer before", "pay before", "₦", "naira upfront", "pay to secure",
  "payment required", "fee required", "transfer before"
];

// Procurement/tender context - reduces payment risk
const PROCUREMENT_CONTEXT_KEYWORDS = [
  "tender", "proposal", "procurement", "bid", "rfp", "request for proposal",
  "request for quotation", "rfq", "invitation to bid", "itb", "expression of interest",
  "eoi", "government", "ministry", "federal", "state government", "local government",
  "development bank", "central bank", "public sector", "official", "sealed bid",
  "bidding document", "bid document", "tender document", "procurement office"
];

// Official domain patterns
const OFFICIAL_DOMAIN_PATTERNS = [
  /\.gov\.ng$/i, /\.gov$/i, /\.edu\.ng$/i, /\.org\.ng$/i,
  /bank.*\.com$/i, /\.ac\.ng$/i, /@.*bank/i, /@.*ministry/i,
  /@.*government/i, /development.*bank/i, /central.*bank/i
];

// Free email domains (+15)
const FREE_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
  "mail.com", "ymail.com", "live.com", "icloud.com", "protonmail.com"
];

// No interview keywords (+20)
const NO_INTERVIEW_KEYWORDS = [
  "no interview", "without interview", "skip interview", "interview not required",
  "no interview needed", "direct hiring", "hired immediately"
];

// Instant hiring keywords (+20)
const INSTANT_HIRING_KEYWORDS = [
  "start immediately", "immediate start", "start today", "start tomorrow",
  "instant hiring", "hired on spot", "immediate employment", "urgent hiring",
  "same day hiring", "start asap"
];

// WhatsApp/Telegram only contact (+15)
const INFORMAL_CONTACT_PATTERNS = [
  /whatsapp\s*only/i, /telegram\s*only/i, /contact\s*via\s*(telegram|whatsapp)\s*only/i,
  /reach\s*(me|us)\s*on\s*whatsapp/i, /dm\s*(me|us)\s*on\s*telegram/i,
  /only\s*on\s*(whatsapp|telegram)/i
];

// Unrealistic salary patterns (+20)
const UNREALISTIC_SALARY_PATTERNS = [
  /₦\s*[5-9]\d{5,}/i, // 500k+ naira
  /\$\s*[5-9]\d{3,}/i, // $5k+ USD
  /earn\s+\d+k\s*(monthly|weekly|daily)/i,
  /monthly.*[5-9]\d{5}/i,
  /work\s*from\s*home.*earn\s*\$?\d+k/i,
  /make\s*\$?\d{4,}\s*(per|a)\s*(day|week)/i,
  /guaranteed\s*income\s*of\s*\$?\d{4,}/i
];

// Urgency pressure keywords (+12)
const URGENCY_KEYWORDS = [
  "urgent", "immediately", "asap", "right now", "today only", "limited time",
  "act fast", "don't miss", "hurry", "deadline", "expires", "last chance",
  "only few slots", "closing soon", "apply now before", "limited slots",
  "filling fast", "don't delay"
];

// Company name indicators
const COMPANY_NAME_INDICATORS = [
  "ltd", "limited", "inc", "incorporated", "corp", "corporation", "bank",
  "university", "agency", "company", "plc", "llc", "co.", "enterprise",
  "solutions", "services ltd", "nigeria limited"
];

// URL shorteners (+15)
const URL_SHORTENERS = [
  "bit.ly", "tinyurl", "cutt.ly", "shorturl", "goo.gl", "t.co", "ow.ly",
  "is.gd", "buff.ly", "adf.ly", "short.link", "tiny.cc"
];

// Suspicious TLDs (+15)
const SUSPICIOUS_TLDS = [
  ".xyz", ".top", ".click", ".live", ".work", ".site", ".online", ".buzz",
  ".club", ".loan", ".win", ".stream", ".gq", ".ml", ".cf", ".tk"
];

// No experience keywords for combo rule
const NO_EXPERIENCE_KEYWORDS = [
  "no experience", "zero experience", "experience not required", "no prior experience",
  "freshers welcome", "beginners welcome", "anyone can apply", "no skills required"
];

interface VerifyRequest {
  advertText: string | null;
  advertLink: string | null;
  sourcePlatform: string | null;
  recruiterEmail: string | null;
  recruiterPhone: string | null;
  userId: string | null;
}

interface RiskResult {
  score: number;
  indicators: string[];
}

function checkPaymentRisk(text: string, isProcurement: boolean, hasOfficialDomain: boolean): RiskResult {
  const lowerText = text.toLowerCase();
  for (const keyword of PAYMENT_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      if (isProcurement || hasOfficialDomain) {
        return {
          score: 3,
          indicators: [`Procurement document fee detected ("${keyword}") — normal for tender/RFP processes`]
        };
      }
      return {
        score: 30,
        indicators: [`Requests upfront payment or mentions fees ("${keyword}")`]
      };
    }
  }
  return { score: 0, indicators: [] };
}

function checkFreeEmailDomain(email: string | null): RiskResult {
  if (!email) return { score: 0, indicators: [] };
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && FREE_EMAIL_DOMAINS.includes(domain)) {
    return {
      score: 15,
      indicators: [`Recruiter uses free email service (${domain}) instead of company email`]
    };
  }
  return { score: 0, indicators: [] };
}

function checkNoInterview(text: string): RiskResult {
  const lowerText = text.toLowerCase();
  for (const keyword of NO_INTERVIEW_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return {
        score: 20,
        indicators: [`No interview required ("${keyword}") — legitimate jobs typically have interviews`]
      };
    }
  }
  return { score: 0, indicators: [] };
}

function checkInstantHiring(text: string): RiskResult {
  const lowerText = text.toLowerCase();
  for (const keyword of INSTANT_HIRING_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return {
        score: 20,
        indicators: [`Instant/immediate hiring promised ("${keyword}")`]
      };
    }
  }
  return { score: 0, indicators: [] };
}

function checkInformalContact(text: string, email: string | null): RiskResult {
  for (const pattern of INFORMAL_CONTACT_PATTERNS) {
    if (pattern.test(text)) {
      return {
        score: 15,
        indicators: ["Contact via WhatsApp/Telegram only — lacks professional communication channels"]
      };
    }
  }
  // Also check if they mention messaging apps without providing email
  if (!email && /whatsapp|telegram/i.test(text)) {
    return {
      score: 10,
      indicators: ["Prefers informal messaging apps over professional email communication"]
    };
  }
  return { score: 0, indicators: [] };
}

function checkUnrealisticSalary(text: string): RiskResult {
  for (const pattern of UNREALISTIC_SALARY_PATTERNS) {
    if (pattern.test(text)) {
      return {
        score: 20,
        indicators: ["Contains unrealistic salary promises"]
      };
    }
  }
  return { score: 0, indicators: [] };
}

function checkUrgencyPressure(text: string): RiskResult {
  const lowerText = text.toLowerCase();
  for (const keyword of URGENCY_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return {
        score: 12,
        indicators: [`Uses urgency pressure language ("${keyword}")`]
      };
    }
  }
  return { score: 0, indicators: [] };
}

function checkNoCompanyName(text: string): RiskResult {
  const lowerText = text.toLowerCase();
  const hasCompanyIndicator = COMPANY_NAME_INDICATORS.some(indicator => 
    lowerText.includes(indicator)
  );
  if (!hasCompanyIndicator) {
    return {
      score: 12,
      indicators: ["No identifiable company name (Ltd, Inc, Corp, Bank, etc.) mentioned"]
    };
  }
  return { score: 0, indicators: [] };
}

function checkUrlShortener(text: string, link: string | null): RiskResult {
  const combinedText = `${text} ${link || ""}`.toLowerCase();
  for (const shortener of URL_SHORTENERS) {
    if (combinedText.includes(shortener)) {
      return {
        score: 15,
        indicators: [`Uses URL shortener (${shortener}) — may hide suspicious destination`]
      };
    }
  }
  return { score: 0, indicators: [] };
}

function checkSuspiciousTLD(text: string, link: string | null): RiskResult {
  const combinedText = `${text} ${link || ""}`.toLowerCase();
  for (const tld of SUSPICIOUS_TLDS) {
    if (combinedText.includes(tld)) {
      return {
        score: 15,
        indicators: [`Uses suspicious domain TLD (${tld})`]
      };
    }
  }
  return { score: 0, indicators: [] };
}

function checkDomainMismatch(email: string | null, link: string | null): RiskResult {
  if (!email || !link) return { score: 0, indicators: [] };
  
  try {
    const emailDomain = email.split("@")[1]?.toLowerCase();
    // Skip if using free email
    if (emailDomain && FREE_EMAIL_DOMAINS.includes(emailDomain)) {
      return { score: 0, indicators: [] };
    }
    
    // Extract domain from link
    const linkMatch = link.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
    const linkDomain = linkMatch?.[1]?.toLowerCase();
    
    if (emailDomain && linkDomain && !linkDomain.includes(emailDomain.replace("mail.", "").replace("hr.", ""))) {
      // Check if they share a common base domain
      const emailBase = emailDomain.split(".").slice(-2).join(".");
      const linkBase = linkDomain.split(".").slice(-2).join(".");
      
      if (emailBase !== linkBase) {
        return {
          score: 15,
          indicators: [`Recruiter email domain (${emailDomain}) doesn't match advert link domain (${linkDomain})`]
        };
      }
    }
  } catch {
    // Ignore parsing errors
  }
  return { score: 0, indicators: [] };
}

function checkComboRisk(text: string): RiskResult {
  const lowerText = text.toLowerCase();
  
  // Check for high salary indicators
  const hasHighSalary = UNREALISTIC_SALARY_PATTERNS.some(p => p.test(text));
  
  // Check for no experience
  const hasNoExperience = NO_EXPERIENCE_KEYWORDS.some(k => lowerText.includes(k));
  
  // Check for immediate start
  const hasImmediateStart = INSTANT_HIRING_KEYWORDS.some(k => lowerText.includes(k));
  
  if (hasHighSalary && hasNoExperience && hasImmediateStart) {
    return {
      score: 20,
      indicators: ["COMBO ALERT: High salary + No experience required + Immediate start — classic scam pattern"]
    };
  }
  return { score: 0, indicators: [] };
}

async function checkBlacklist(
  supabase: any,
  email: string | null,
  phone: string | null,
  link: string | null
): Promise<RiskResult> {
  const { data: blacklist } = await supabase.from("blacklist").select("type, value");
  
  let score = 0;
  const indicators: string[] = [];
  
  if (blacklist) {
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
  }
  
  return { score, indicators };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: VerifyRequest = await req.json();
    const { advertText, advertLink, sourcePlatform, recruiterEmail, recruiterPhone, userId } = body;

    const textToAnalyze = `${advertText || ""} ${advertLink || ""}`;
    const allIndicators: string[] = [];
    let totalRiskScore = 0;

    // Check procurement context
    const lowerText = textToAnalyze.toLowerCase();
    const isProcurementContext = PROCUREMENT_CONTEXT_KEYWORDS.some(keyword => 
      lowerText.includes(keyword)
    );
    const hasOfficialDomain = recruiterEmail ? 
      OFFICIAL_DOMAIN_PATTERNS.some(pattern => pattern.test(recruiterEmail)) : false;

    // Run all risk checks
    const checks = [
      await checkBlacklist(supabase, recruiterEmail, recruiterPhone, advertLink),
      checkPaymentRisk(textToAnalyze, isProcurementContext, hasOfficialDomain),
      checkFreeEmailDomain(recruiterEmail),
      checkNoInterview(textToAnalyze),
      checkInstantHiring(textToAnalyze),
      checkInformalContact(textToAnalyze, recruiterEmail),
      checkUnrealisticSalary(textToAnalyze),
      checkUrgencyPressure(textToAnalyze),
      checkNoCompanyName(textToAnalyze),
      checkUrlShortener(textToAnalyze, advertLink),
      checkSuspiciousTLD(textToAnalyze, advertLink),
      checkDomainMismatch(recruiterEmail, advertLink),
      checkComboRisk(textToAnalyze),
    ];

    for (const check of checks) {
      totalRiskScore += check.score;
      allIndicators.push(...check.indicators);
    }

    // Cap the risk score at 100
    totalRiskScore = Math.min(totalRiskScore, 100);

    // Determine verdict based on new thresholds
    let verdict: "likely_legit" | "needs_review" | "suspicious" | "high_risk_scam";
    if (totalRiskScore < 20) {
      verdict = "likely_legit";
    } else if (totalRiskScore < 40) {
      verdict = "needs_review";
    } else if (totalRiskScore < 70) {
      verdict = "suspicious";
    } else {
      verdict = "high_risk_scam";
    }

    // Store the result
    const { data, error } = await supabase
      .from("verification_results")
      .insert({
        advert_text: advertText,
        advert_link: advertLink,
        source_platform: sourcePlatform,
        recruiter_email: recruiterEmail,
        recruiter_phone: recruiterPhone,
        risk_score: totalRiskScore,
        verdict,
        indicators: allIndicators,
        user_id: userId,
        saved: false,
      })
      .select("id")
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ id: data.id, riskScore: totalRiskScore, verdict, indicators: allIndicators }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
