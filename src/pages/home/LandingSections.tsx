import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Button, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { guidanceRoutes } from '@/features/careerGuidance/utils/routes';
import { useGetPublicReferralJobsQuery } from '@/features/referrals/api/referralsApi';

const referralPath = `${ROUTES.DASHBOARD_JOBS}?mode=referral`;
const features = [
  {
    title: 'Jobs',
    copy: 'Discover relevant opportunities from the live job catalogue.',
    action: 'Explore jobs',
    path: ROUTES.JOBS,
    icon: <WorkOutlineIcon />,
    tone: 'blue',
  },
  {
    title: 'Employee Referrals',
    copy: 'Connect with employees and discover referral opportunities.',
    action: 'Explore referrals',
    path: referralPath,
    icon: <GroupsOutlinedIcon />,
    tone: 'green',
  },
  {
    title: 'Interview Insights',
    copy: 'Learn from candidate-shared interview experiences.',
    action: 'Explore insights',
    path: ROUTES.INTERVIEW_INSIGHTS,
    icon: <QuestionAnswerOutlinedIcon />,
    tone: 'violet',
  },
  {
    title: 'Career Guidance',
    copy: 'Connect with professionals for focused career conversations.',
    action: 'Find a consultant',
    path: guidanceRoutes.marketplace,
    icon: <PersonSearchOutlinedIcon />,
    tone: 'orange',
  },
  {
    title: 'Career Portfolio',
    copy: 'Showcase your skills, projects and professional experience.',
    action: 'Build your portfolio',
    path: ROUTES.PORTFOLIO,
    icon: <DescriptionOutlinedIcon />,
    tone: 'pink',
  },
];

export const LandingFeatures = ({
  portfolioPath,
  portfolioState,
}: {
  portfolioPath: string;
  portfolioState?: { from: { pathname: string } };
}) => (
  <section className="feature-section">
    <div className="landing-container landing-section">
      <span className="eyebrow">Why Career Harbor</span>
      <h2>More than just a job portal</h2>
      <p>Everything you need to discover opportunities, prepare better and build your career.</p>
      <div className="platform-features">
        {features.map((feature) => (
          <Link
            className={`platform-card ${feature.tone}`}
            to={feature.tone === 'pink' ? portfolioPath : feature.path}
            state={feature.tone === 'pink' ? portfolioState : undefined}
            key={feature.title}
          >
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.copy}</p>
            <strong>
              {feature.action} <ArrowForwardIcon />
            </strong>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export const LandingHeroVisual = ({ company }: { company?: string }) => (
  <div className="landing-visual" role="group" aria-label="Career Harbor hero features">
    <div className="hero-orbit" aria-hidden="true" />
    <img
      className="hero-person"
      src="/images/career-professional.webp"
      alt="Fictional professional representing a Career Harbor job seeker"
    />
    {features.slice(0, 4).map((feature, index) => (
      <Link
        to={feature.path}
        key={feature.title}
        className={`hero-product hero-product-${index} ${feature.tone}`}
      >
        <span className="feature-icon">{feature.icon}</span>
        <h3>{feature.title}</h3>
        <p>
          {index === 0
            ? company
              ? `Explore opportunities at ${company}`
              : 'Discover your next opportunity'
            : index === 1
              ? 'Connect with employees'
              : index === 2
                ? 'Experiences · Questions · Preparation'
                : '1-to-1 career conversations'}
        </p>
        <strong>
          {feature.action} <ArrowForwardIcon />
        </strong>
      </Link>
    ))}
  </div>
);

export const ReferralFeature = () => {
  const referrals = useGetPublicReferralJobsQuery({ pageNumber: 1, pageSize: 1 });
  const job = referrals.data?.items.at(0);
  return (
    <section className="landing-container">
      <div className="referral-feature">
        <div>
          <span className="eyebrow">Get referred</span>
          <h2>Employee Referrals</h2>
          <p>
            Connect with employees and discover referral opportunities that can help you reach the
            right teams.
          </p>
          <Button
            component={Link}
            to={referralPath}
            endIcon={<ArrowForwardIcon />}
            variant="contained"
            className="white-cta"
          >
            Explore referral jobs
          </Button>
        </div>
        <div className="referral-preview">
          <div className="preview-card referral-opportunity">
            <span className="preview-label">
              {job ? 'From the referral catalogue' : 'Referral experience preview'}
            </span>
            <WorkOutlineIcon />
            <h3>{job?.jobTitle ?? 'Discover referral opportunities'}</h3>
            {job?.companyName && <p>{job.companyName}</p>}
            {job?.location && <p>{job.location}</p>}
            <p>
              {job
                ? 'Explore the job and available contact options.'
                : 'Browse roles, explore details and review contact access.'}
            </p>
            <Button component={Link} to={referralPath} endIcon={<ArrowForwardIcon />} size="small">
              Explore opportunities
            </Button>
          </div>
          <div className="preview-card referral-connect">
            <span className="feature-icon green">
              <GroupsOutlinedIcon />
            </span>
            <h3>Connect with employees</h3>
            <p>View referrer details on eligible jobs with Referral Contact Access.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const InsightsPreview = () => (
  <div className="insights-preview preview-card">
    <span className="preview-label">Product preview · Interview Insights</span>
    <h3>A little preparation. A clearer perspective.</h3>
    <div className="preview-tabs">
      <Chip label="Company & role" size="small" />
      <Chip label="Interview rounds" size="small" />
    </div>
    {['Candidate experiences', 'Questions discussed', 'Preparation tips'].map((text, index) => (
      <div className="insight-row" key={text}>
        <span>0{index + 1}</span>
        <div>
          <strong>{text}</strong>
          <div className="preview-line" />
          <div className="preview-line short" />
        </div>
        <CheckCircleOutlineIcon />
      </div>
    ))}
    <p>Explore what candidates choose to share. Experiences vary by role and company.</p>
  </div>
);

export const GuidanceFeature = () => (
  <section className="landing-container landing-section">
    <div className="guidance-feature split-feature">
      <div>
        <span className="eyebrow">Career guidance</span>
        <h2>Don’t navigate your career alone.</h2>
        <p>
          Connect with professionals for focused career conversations. Explore services, check
          availability and choose a session that works for you.
        </p>
        <div className="cta-row">
          <Button
            component={Link}
            to={guidanceRoutes.marketplace}
            variant="contained"
            endIcon={<ArrowForwardIcon />}
          >
            Find a consultant
          </Button>
          <Button component={Link} to={guidanceRoutes.becomeConsultant} variant="outlined">
            Become a consultant
          </Button>
        </div>
      </div>
      <div className="guidance-capabilities">
        {[
          '1-to-1 guidance',
          'Interview preparation',
          'Career direction',
          'Consultant availability',
        ].map((text) => (
          <div key={text}>
            <span className="feature-icon orange">
              <PersonSearchOutlinedIcon />
            </span>
            <strong>{text}</strong>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const LandingCommunity = () => (
  <section className="landing-container landing-section community-section">
    <div>
      <span className="eyebrow">Build your career with us</span>
      <h2>One connected career community.</h2>
      <p>Real opportunities, useful perspectives and professional connections.</p>
    </div>
    <div className="community-benefits">
      {features.slice(0, 4).map((feature) => (
        <div key={feature.title} className={feature.tone}>
          <span className="feature-icon">{feature.icon}</span>
          <strong>{feature.title}</strong>
        </div>
      ))}
    </div>
  </section>
);

export const FinalCareerCTA = () => (
  <section className="landing-container final-section">
    <div className="final-career-cta">
      <div>
        <h2>Ready to take the next step in your career?</h2>
        <p>
          Create your account to discover jobs, explore referrals, prepare with interview insights,
          connect with professionals and build your Career Harbor portfolio.
        </p>
        <div className="cta-row">
          <Button
            component={Link}
            to={ROUTES.REGISTER}
            variant="contained"
            className="white-cta"
            endIcon={<ArrowForwardIcon />}
          >
            Get started free
          </Button>
          <Button
            component={Link}
            to={ROUTES.JOBS}
            variant="outlined"
            sx={{ color: 'white', borderColor: '#ffffff80' }}
          >
            Explore jobs
          </Button>
        </div>
      </div>
      <div className="career-dashboard-preview" aria-label="Illustrative Career Harbor workspace">
        <span className="preview-label">Your Career Harbor workspace</span>
        {features.map((feature) => (
          <div key={feature.title} className={feature.tone}>
            {feature.icon}
            <strong>{feature.title}</strong>
            <CheckCircleOutlineIcon />
          </div>
        ))}
        <TrendingUpIcon className="career-growth" />
      </div>
    </div>
  </section>
);
