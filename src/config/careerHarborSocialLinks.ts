export type CareerHarborSocialPlatform =
  'linkedin' | 'instagram' | 'youtube' | 'whatsapp' | 'facebook' | 'x' | 'reddit' | 'telegram';

export interface CareerHarborSocialLink {
  id: CareerHarborSocialPlatform;
  label: string;
  url: string;
  primary: boolean;
}

// These configured official links already existed in the public footer.
export const careerHarborSocialLinks: CareerHarborSocialLink[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/company/career-harbor-jobs',
    primary: true,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    url: 'https://www.instagram.com/career.harbor',
    primary: true,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    url: 'https://www.youtube.com/@CareerHarborOfficial',
    primary: true,
  },
  { id: 'whatsapp', label: 'WhatsApp', url: '', primary: true },
  {
    id: 'facebook',
    label: 'Facebook',
    url: 'https://www.facebook.com/CareerHarbor',
    primary: false,
  },
  { id: 'x', label: 'X', url: '', primary: false },
  { id: 'reddit', label: 'Reddit', url: '', primary: false },
  { id: 'telegram', label: 'Telegram', url: '', primary: false },
];
