export interface Course {
  name: string;
  credits: number;
  earlyCollegeCredit: boolean;
  completed?: boolean;
}

export interface Pathway {
  id: string;
  title: string;
  category: string;
  tcd?: boolean;
  requirements: {
    pathwayType: string;
    courseCredits: {
      totalCreditsRequired: number;
      requiredCourses: Course[];
      electiveCreditsRequired: number;
      electiveCourseOptions: Course[];
    };
    [key: string]: any;
  };
  [key: string]: any;
}

export interface PathwayStats {
  earnedCredits: number;
  totalCredits: number;
  progress: number;
  earnedReq: number;
  earnedElec: number;
}

export interface AcademicStatus {
  reading: boolean;
  math: boolean;
}
