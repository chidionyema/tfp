// File: /src/constants/dbs-constants.ts

import type { DbsOption, DbsRequirement } from "@/types/task";

/**
 * DBS check options with complete information
 */
export const DBS_OPTIONS: DbsOption[] = [
  {
    id: "none",
    name: "No DBS Check Required",
    description: "Task doesn't involve vulnerable groups or sensitive work",
    fee: 0,
    processingTime: "N/A"
  },
  {
    id: "basic",
    name: "Basic DBS Check",
    description: "Standard criminal record check for general employment",
    fee: 18,
    processingTime: "2-4 weeks"
  },
  {
    id: "standard",
    name: "Standard DBS Check", 
    description: "Includes spent and unspent convictions, cautions, reprimands",
    fee: 38,
    processingTime: "2-4 weeks"
  },
  {
    id: "enhanced",
    name: "Enhanced DBS Check",
    description: "Most comprehensive - includes police intelligence and barred lists",
    fee: 44,
    processingTime: "4-6 weeks"
  }
];

/**
 * Category-specific DBS recommendations
 */
export const CATEGORY_DBS_RECOMMENDATIONS: Record<string, DbsRequirement> = {
  "childcare": "enhanced",
  "elderly-care": "enhanced", 
  "healthcare": "standard",
  "tutoring": "enhanced",
  "pet-sitting": "basic",
  "cleaning": "basic",
  "delivery": "none",
  "shopping": "none",
  "tech-support": "none",
  "handyman": "basic",
  "gardening": "none",
  "moving": "basic"
};

/**
 * Tasks that commonly require DBS checks
 */
export const DBS_SENSITIVE_KEYWORDS = [
  "child", "children", "kids", "baby", "toddler",
  "elderly", "senior", "care", "nursing", 
  "vulnerable", "disabled", "special needs",
  "school", "education", "teaching", "tutoring",
  "healthcare", "medical", "therapy"
];

/**
 * Get recommended DBS level for a category
 */
export const getRecommendedDbsLevel = (categoryId: string): DbsRequirement => {
  return CATEGORY_DBS_RECOMMENDATIONS[categoryId] || "none";
};

/**
 * Check if task description suggests DBS requirement
 */
export const suggestDbsFromDescription = (description: string): DbsRequirement => {
  const lowerDesc = description.toLowerCase();
  
  // Check for high-risk keywords
  const hasHighRiskKeywords = DBS_SENSITIVE_KEYWORDS.some(keyword => 
    lowerDesc.includes(keyword)
  );
  
  if (hasHighRiskKeywords) {
    // Look for specific child/vulnerable adult indicators
    if (lowerDesc.includes("child") || lowerDesc.includes("kids") || 
        lowerDesc.includes("school") || lowerDesc.includes("tutoring")) {
      return "enhanced";
    }
    
    if (lowerDesc.includes("elderly") || lowerDesc.includes("care") ||
        lowerDesc.includes("vulnerable") || lowerDesc.includes("disabled")) {
      return "enhanced";
    }
    
    // General sensitive work
    return "standard";
  }
  
  return "none";
};

/**
 * Get DBS option by ID
 */
export const getDbsOption = (id: DbsRequirement): DbsOption | undefined => {
  return DBS_OPTIONS.find(option => option.id === id);
};