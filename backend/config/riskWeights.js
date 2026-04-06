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

  // Risk classification scale
  // 0 = Legit, 1-3 = Low Risk, 4-6 = Moderate Risk, 7+ = High Risk
  riskBands: [
    { min: 0, max: 0, verdict: "Legit" },
    { min: 1, max: 3, verdict: "Low Risk" },
    { min: 4, max: 6, verdict: "Moderate Risk" },
    { min: 7, max: Infinity, verdict: "High Risk" },
  ],
};
