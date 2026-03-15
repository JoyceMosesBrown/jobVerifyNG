module.exports = {
  recruiterIdentity: {
    freeEmail: {
      weight: 3,
      description: "Recruiter uses a free email domain (e.g., Gmail, Yahoo)",
    },
    noCompanyName: {
      weight: 1,
      description: "No identifiable company name found in advert",
    },
    companyMismatch: {
      weight: 2,
      description: "Company name in advert does not match email domain",
    },
  },

  contentBased: {
    unrealisticSalary: {
      weight: 2,
      description: "Salary offered is unusually high for the role",
    },
    urgencyLanguage: {
      weight: 2,
      description: "Uses urgency phrases like 'apply now' or 'limited slots'",
    },
    noInterview: {
      weight: 1,
      description: "Claims no interview is required",
    },
    instantHiring: {
      weight: 1,
      description: "Promises immediate or same-day hiring",
    },
    genericDescription: {
      weight: 1,
      description: "Job description is too vague or generic",
    },
    poorGrammar: {
      weight: 1,
      description: "Text contains multiple grammar or spelling errors",
    },
  },

  financialRequests: {
    paymentRequest: {
      weight: 5,
      description: "Requests payment, fees, or money transfer",
    },
  },

  technicalIndicators: {
    urlShortener: {
      weight: 1,
      description: "Uses a URL shortener to hide destination",
    },
    suspiciousTLD: {
      weight: 1,
      description: "Uses a suspicious top-level domain",
    },
    blacklistedEntity: {
      weight: 3,
      description: "Email, phone, or domain is blacklisted",
    },
    nonsecureWebsite: {
      weight: 1,
      description: "Website uses HTTP instead of HTTPS (not secure)",
    },
    newDomain: {
      weight: 4,
      description: "Website domain was recently registered (less than 6 months)",
    },
  },

  //  risk scale: 0-4 = low, 5-8 = moderate, 9+ = high
  riskBands: [
    { min: 0, max: 4, verdict: "likely_legit" },
    { min: 5, max: 8, verdict: "needs_review" },
    { min: 9, max: Infinity, verdict: "high_risk_scam" },
  ],
};
