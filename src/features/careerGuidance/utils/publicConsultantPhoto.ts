import { environment } from '@/config/environment';
import { CG, segment } from '../api/careerGuidanceApi';

export const publicConsultantPhotoUrl = (consultantId: string): string =>
  `${environment.apiBaseUrl}${CG}/consultants/${segment(consultantId)}/photo`;
