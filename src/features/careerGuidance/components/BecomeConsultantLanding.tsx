import { useRef } from 'react';
import type { SvgIconComponent } from '@mui/icons-material';
import { Alert, Breadcrumbs, Button, CircularProgress, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { guidanceRoutes } from '../utils/routes';
import styles from './BecomeConsultantLanding.module.css';

interface BecomeConsultantLandingProps {
  onStart: () => void;
  starting?: boolean;
  error?: string | null;
}

const steps = [
  {
    icon: DescriptionOutlinedIcon,
    title: '1. Create profile',
    text: 'Share your professional background and expertise',
  },
  {
    icon: ShieldOutlinedIcon,
    title: '2. Platform review',
    text: 'CareerHarbor reviews your consultant application',
  },
  {
    icon: SettingsOutlinedIcon,
    title: '3. Set your services',
    text: 'Choose session types, pricing and availability',
  },
  {
    icon: EventAvailableOutlinedIcon,
    title: '4. Start consulting',
    text: 'Get bookings and connect with clients',
  },
];

const quality = [
  {
    icon: ShieldOutlinedIcon,
    title: 'Application review',
    text: 'Profiles are reviewed by CareerHarbor before publication',
  },
  {
    icon: PaymentsOutlinedIcon,
    title: 'Secure payments',
    text: 'Safe and transparent transactions',
  },
  {
    icon: StarRoundedIcon,
    title: 'Ratings & reviews',
    text: 'Build trust through authentic feedback',
  },
  {
    icon: SupportAgentIcon,
    title: 'Support',
    text: 'Our platform helps consultants manage their sessions',
  },
];

function IconCircle({
  icon: Icon,
  tone = 'blue',
}: {
  icon: SvgIconComponent;
  tone?: 'blue' | 'green' | 'orange' | 'violet';
}) {
  return (
    <span className={`${styles.iconCircle} ${styles[tone]}`}>
      <Icon aria-hidden="true" />
    </span>
  );
}

function ConsultantHeroArtwork() {
  return (
    <div className={styles.artwork}>
      <img
        className={styles.portrait}
        src="/images/consultant-onboarding-hero.png"
        alt="Career professional"
      />
      <div className={`${styles.overlay} ${styles.mentor}`}>
        <IconCircle icon={GroupsRoundedIcon} />
        <strong>
          Mentor
          <br />
          Professionals
          <br />
          Worldwide
        </strong>
      </div>
      <div className={`${styles.overlay} ${styles.schedule}`}>
        <IconCircle icon={EventAvailableOutlinedIcon} tone="green" />
        <strong>
          Flexible
          <br />
          Schedule
        </strong>
      </div>
      <div className={`${styles.overlay} ${styles.rates}`}>
        <IconCircle icon={TrendingUpIcon} tone="orange" />
        <strong>
          Set your
          <br />
          own rates
        </strong>
      </div>
      <p className={styles.handwriting} aria-hidden="true">
        Your
        <br />
        Experience
        <br />
        Changes
        <br />
        Lives
      </p>
      <div className={`${styles.overlay} ${styles.session}`}>
        <IconCircle icon={ForumOutlinedIcon} />
        <div>
          <strong>Career guidance</strong>
          <span>1-to-1 sessions</span>
        </div>
      </div>
    </div>
  );
}

export function BecomeConsultantLanding({
  onStart,
  starting = false,
  error,
}: BecomeConsultantLandingProps) {
  const howItWorks = useRef<HTMLElement>(null);
  const learnMore = () => {
    howItWorks.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    howItWorks.current?.focus({ preventScroll: true });
  };
  return (
    <div className={styles.page}>
      <Breadcrumbs separator="›" aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link component={RouterLink} to={guidanceRoutes.marketplace} underline="hover">
          Career Guidance
        </Link>
        <Typography color="inherit" fontWeight={700}>
          Become a consultant
        </Typography>
      </Breadcrumbs>
      <section className={styles.hero} aria-labelledby="become-consultant-title">
        <div className={styles.heroCopy}>
          <h1 id="become-consultant-title">
            Share your experience.
            <br />
            Guide the next generation.
          </h1>
          <p className={styles.subtitle}>
            Join Career Harbor as a consultant and help professionals grow in their careers while
            earning on your own terms.
          </p>
          <div className={styles.benefits}>
            <div>
              <IconCircle icon={GroupsRoundedIcon} tone="violet" />
              <p>
                <strong>Make an impact</strong>
                <span>
                  Help job seekers
                  <br />
                  achieve their goals
                </span>
              </p>
            </div>
            <div>
              <IconCircle icon={CurrencyRupeeIcon} tone="green" />
              <p>
                <strong>Earn on your terms</strong>
                <span>
                  Set your own rates
                  <br />
                  and availability
                </span>
              </p>
            </div>
            <div>
              <IconCircle icon={WorkspacePremiumRoundedIcon} tone="orange" />
              <p>
                <strong>Build your brand</strong>
                <span>
                  Showcase your expertise
                  <br />
                  to a large audience
                </span>
              </p>
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="contained"
              disabled={starting}
              onClick={onStart}
              endIcon={
                starting ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />
              }
              className={styles.primaryButton}
            >
              {starting ? 'Starting application…' : 'Start application'}
            </Button>
            <Button
              variant="outlined"
              onClick={learnMore}
              startIcon={<PlayArrowIcon />}
              className={styles.secondaryButton}
            >
              Learn more
            </Button>
          </div>
          <p className={styles.timeNote}>It takes about 10–15 minutes to complete your profile</p>
          {error && (
            <Alert severity="error" className={styles.error}>
              {error}
            </Alert>
          )}
        </div>
        <ConsultantHeroArtwork />
      </section>
      <div className={styles.lowerLayout}>
        <div className={styles.mainContent}>
          <section
            ref={howItWorks}
            tabIndex={-1}
            id="consultant-how-it-works"
            className={styles.howItWorks}
            aria-labelledby="consultant-how-title"
          >
            <h2 id="consultant-how-title">How it works</h2>
            <p className={styles.sectionSubtitle}>Get started in a few simple steps</p>
            <ol className={styles.steps}>
              {steps.map(({ icon, title, text }) => (
                <li key={title}>
                  <IconCircle icon={icon} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <ArrowForwardIcon className={styles.stepArrow} aria-hidden="true" />
                </li>
              ))}
            </ol>
          </section>
          <div className={styles.infoCards}>
            <section className={styles.eligibility} aria-labelledby="consultant-eligibility-title">
              <h2 id="consultant-eligibility-title">Who can become a consultant?</h2>
              <ul>
                {[
                  'HR professionals, recruiters, hiring managers',
                  'Industry experts, senior professionals, and ex-founders',
                  'Career coaches, resume experts, interview coaches',
                  'Anyone with relevant professional experience and a passion to help others',
                ].map((item) => (
                  <li key={item}>
                    <CheckCircleIcon aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className={styles.quality} aria-labelledby="consultant-quality-title">
              <h2 id="consultant-quality-title">Our commitment to trust & quality</h2>
              <ul>
                {quality.map(({ icon, title, text }) => (
                  <li key={title}>
                    <IconCircle icon={icon} tone="orange" />
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
        <aside className={styles.whyPanel} aria-labelledby="consultant-why-title">
          <h2 id="consultant-why-title">Why consult on Career Harbor</h2>
          {[
            {
              icon: EventAvailableOutlinedIcon,
              title: 'Flexible availability',
              text: "Choose when you're available for sessions.",
            },
            {
              icon: CurrencyRupeeIcon,
              title: 'Your expertise, your pricing',
              text: 'Offer 15, 30 or 60 minute sessions and set your rates.',
            },
            {
              icon: WorkspacePremiumRoundedIcon,
              title: 'Build your reputation',
              text: 'Earn authentic reviews from completed sessions.',
            },
          ].map(({ icon, title, text }) => (
            <div className={styles.whyRow} key={title}>
              <IconCircle icon={icon} />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

