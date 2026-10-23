import { HiringDrivesSection } from '@/features/hiringDrives/HiringDrivesSection';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import './home/landing.css';
export const HiringDrivesPage = () => {
  useDocumentMetadata(
    'Hiring Drives | Career Harbor',
    'Explore current hiring drives and opportunities.',
  );
  return (
    <div className="career-landing">
      <HiringDrivesSection all />
    </div>
  );
};
