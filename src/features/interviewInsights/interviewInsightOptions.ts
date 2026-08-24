import { InterviewFormat, InterviewRoundType } from './types/interviewInsightModels';

export const roundLabels: Record<InterviewRoundType, string> = {
  [InterviewRoundType.HR]: 'HR',
  [InterviewRoundType.Technical]: 'Technical',
  [InterviewRoundType.Managerial]: 'Managerial',
  [InterviewRoundType.Coding]: 'Coding',
  [InterviewRoundType.Aptitude]: 'Aptitude',
  [InterviewRoundType.GroupDiscussion]: 'Group discussion',
  [InterviewRoundType.Other]: 'Other',
};

export const formatLabels: Record<InterviewFormat, string> = {
  [InterviewFormat.Online]: 'Online',
  [InterviewFormat.InPerson]: 'In person',
  [InterviewFormat.Phone]: 'Phone',
  [InterviewFormat.Video]: 'Video',
};
