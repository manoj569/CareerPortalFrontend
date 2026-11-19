import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

export type HiringStage = {
  id: number;
  name: string;
};

export type JobDraft = {
  // Step 1 — Job Details
  jobTitle: string;
  jobType: string;
  workMode: string;
  experienceLevel: string;
  location: string;
  openings: string;
  description: string;
  responsibilities: string[];
  company: string;
  isPublic: boolean;
  salaryMin: string;
  salaryMax: string;
  skills: string[];
  deadline: string;

  // Step 2 — Requirements
  minimumExperience: string;
  maximumExperience: string;
  education: string;
  preferredQualifications: string;
  mustHave: string[];
  niceToHave: string[];
  openIndianCandidates: boolean;
  openInternationalCandidates: boolean;
  willingToRelocate: boolean;
  immediateJoiners: boolean;
  noticePeriod30Days: boolean;

  // Step 3 — Screening & Process
  resumeScreening: boolean;
  skillsAssessment: boolean;
  aptitudeTest: boolean;
  customQuestion: boolean;
  minimumScore: string;
  autoShortlist: boolean;
  manualReview: boolean;
  stages: HiringStage[];
  interviewMode: string;
  interviewDuration: string;
  interviewers: string;
  automaticInvite: boolean;
};

type JobDraftContextValue = {
  draft: JobDraft;
  updateDraft: (updates: Partial<JobDraft>) => void;
  resetDraft: () => void;
};

const initialJobDraft: JobDraft = {
  // Step 1
  jobTitle: '',
  jobType: '',
  workMode: '',
  experienceLevel: '',
  location: '',
  openings: '',
  description: '',
  responsibilities: [
    'Build and maintain product features',
    'Collaborate with cross-functional teams',
    'Write clean and scalable code',
  ],
  company: 'TechNova Solutions',
  isPublic: true,
  salaryMin: '',
  salaryMax: '',
  skills: ['React', 'TypeScript', 'HTML', 'CSS'],
  deadline: '',

  // Step 2
  minimumExperience: '',
  maximumExperience: '',
  education: '',
  preferredQualifications: '',
  mustHave: [],
  niceToHave: [],
  openIndianCandidates: true,
  openInternationalCandidates: false,
  willingToRelocate: false,
  immediateJoiners: false,
  noticePeriod30Days: false,

  // Step 3
  resumeScreening: true,
  skillsAssessment: true,
  aptitudeTest: false,
  customQuestion: false,
  minimumScore: '60',
  autoShortlist: true,
  manualReview: false,
  stages: [
    {
      id: 1,
      name: 'Resume Screening',
    },
    {
      id: 2,
      name: 'Technical Assessment',
    },
    {
      id: 3,
      name: 'Interview',
    },
    {
      id: 4,
      name: 'Final Selection',
    },
  ],
  interviewMode: 'Online (Video)',
  interviewDuration: '45 minutes',
  interviewers: '',
  automaticInvite: true,
};

const JobDraftContext =
  createContext<JobDraftContextValue | null>(null);

export const JobDraftProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [draft, setDraft] =
    useState<JobDraft>(initialJobDraft);

  const updateDraft = (
    updates: Partial<JobDraft>,
  ) => {
    setDraft((current) => ({
      ...current,
      ...updates,
    }));
  };

  const resetDraft = () => {
    setDraft(initialJobDraft);
  };

  const value = useMemo(
    () => ({
      draft,
      updateDraft,
      resetDraft,
    }),
    [draft],
  );

  return (
    <JobDraftContext.Provider value={value}>
      {children}
    </JobDraftContext.Provider>
  );
};

export const useJobDraft = () => {
  const context = useContext(JobDraftContext);

  if (!context) {
    throw new Error(
      'useJobDraft must be used inside JobDraftProvider',
    );
  }

  return context;
};