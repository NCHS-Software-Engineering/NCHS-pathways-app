export interface Course {
  name: string;
  credits: number;
  earlyCollegeCredit: boolean;
}

export interface Pathway {
  id: string;
  title: string;
  category: string;
  tcd: boolean;
  imageFile?: string;
  imagePath?: string;
  [key: string]: unknown;
  requirements: {
    pathwayType: string;
    courseCredits: {
      totalCreditsRequired: number;
      requiredCourses: Course[];
      electiveCreditsRequired: number;
      electiveCourseOptions: Course[];
    };
    professionalLearning: {
      fulfillmentMethod: "embedded" | "internship";
      careerExplorationActivities?: number;
      teamChallenges?: number;
      workExperienceHours?: number;
      notes?: string;
      [key: string]: unknown;
    };
    coCurricular: {
      required: boolean;
      examples: string[];
    };
    [key: string]: unknown;
  };
}

export interface AcademicRequirement {
  courseOptions: string[];
  examOptions: string[];
  testScoreOptions: string[];
}

export interface AcademicSuccessData {
  title: string;
  description: string;
  reading: AcademicRequirement;
  math: AcademicRequirement;
}

export type AdminView = "list" | "edit-pathway" | "edit-academic";

export const themeStyles = `
  :root {
    --bg-primary: #f8fafc;
    --bg-card: #ffffff;
    --bg-soft: #f1f5f9;
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --border-primary: #e2e8f0;
    --brand: #2563eb;
    --brand-soft: #eff6ff;
    --brand-text: #1d4ed8;
    --text-on-brand: #ffffff;
    --success: #22c55e;
    --danger: #ef4444;
    --danger-soft: #fef2f2;
  }

  .dark {
    --bg-primary: #0a121a;
    --bg-card: #1d3449;
    --bg-soft: #2b4e6e;
    --text-primary: #f1f5f9;
    --text-secondary: #d0d9e4;
    --border-primary: #334155;
    --brand: #165783;
    --brand-soft: #2f4a66;
    --brand-text: #e8f2fb;
    --text-on-brand: #e2edf7;
    --success: #22c55e;
    --danger: #f87171;
    --danger-soft: #3f1d1d;
  }
`;
