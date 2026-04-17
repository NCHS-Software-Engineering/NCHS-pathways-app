import { AcademicSuccessData, Pathway } from "./types";

export const initialPathways: Pathway[] = [
  {
    id: "cosmetology",
    title: "Cosmetology",
    category: "Healthcare & Human Services",
    tcd: true,
    requirements: {
      pathwayType: "TCD",
      courseCredits: {
        totalCreditsRequired: 6.0,
        requiredCourses: [
          { name: "Cosmetology 1", credits: 3.0, earlyCollegeCredit: true },
          { name: "Cosmetology 2", credits: 3.0, earlyCollegeCredit: true }
        ],
        electiveCreditsRequired: 0,
        electiveCourseOptions: []
      },
      professionalLearning: {
        fulfillmentMethod: "embedded"
      },
      coCurricular: { required: false, examples: ["SkillsUSA"] }
    }
  },
  {
    id: "animal-systems",
    title: "Animal Systems",
    category: "Agriculture",
    tcd: false,
    requirements: {
      pathwayType: "Regular",
      courseCredits: {
        totalCreditsRequired: 4.5,
        requiredCourses: [
          { name: "Companion Animal Science 1", credits: 0.5, earlyCollegeCredit: false },
          { name: "Veterinary Science", credits: 1.0, earlyCollegeCredit: false }
        ],
        electiveCreditsRequired: 2.0,
        electiveCourseOptions: [{ name: "AP Biology", credits: 1.0, earlyCollegeCredit: true }]
      },
      professionalLearning: {
        fulfillmentMethod: "internship"
      },
      coCurricular: { required: false, examples: ["FFA"] }
    }
  }
];

export const initialAcademicData: AcademicSuccessData = {
  title: "Academic Success Requirements",
  description: "Requirements to gain an endorsement for a pathway",
  reading: {
    courseOptions: ["Composition & Reflection", "AP Literature & Composition"],
    examOptions: ["Score of 3+ on AP Literature Exam"],
    testScoreOptions: ["ACT English 18 + Reading 22"]
  },
  math: {
    courseOptions: ["Quantitative Literacy and Statistics", "AP Calculus AB"],
    examOptions: ["Score of 3+ on AP Calculus AB Exam"],
    testScoreOptions: ["ACT Math 22 + Enrollment in Senior Math"]
  }
};

export const emptyPathway: Pathway = {
  id: "",
  title: "",
  category: "STEM",
  tcd: false,
  requirements: {
    pathwayType: "Regular",
    courseCredits: {
      totalCreditsRequired: 0,
      requiredCourses: [],
      electiveCreditsRequired: 0,
      electiveCourseOptions: []
    },
    professionalLearning: { fulfillmentMethod: "embedded" },
    coCurricular: { required: false, examples: [] }
  }
};
