import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { Button, Chip } from '@mui/material';

import { ROUTES } from '@/constants/routes';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

import './employers/employers.css';

const hiringProblems = [
  {
    icon: <GroupsOutlinedIcon />,
    title: 'Too many applications',
    description: 'Focus on candidates who actually match your requirements.',
  },
  {
    icon: <ShieldOutlinedIcon />,
    title: 'Hard to verify skills',
    description: 'Go beyond resume keywords with CareerHarbor skill evidence.',
  },
  {
    icon: <MailOutlineIcon />,
    title: 'Candidates don’t respond',
    description: 'Prioritize active candidates and relevant availability signals.',
  },
  {
    icon: <ScheduleOutlinedIcon />,
    title: 'Hiring takes too long',
    description: 'Manage screening, shortlisting and interviews in one workflow.',
  },
];

const candidates = [
  {
    initials: 'RP',
    name: 'Rahul P.',
    score: '92% Match',
    skills: ['.NET Core', 'Microservices', 'SQL', 'Azure'],
    meta: 'Pune • 4.2 years • 15-day notice',
  },
  {
    initials: 'NS',
    name: 'Neha S.',
    score: '89% Match',
    skills: ['.NET Core', 'SQL', 'React'],
    meta: 'Pune • 3.8 years • 30-day notice',
  },
  {
    initials: 'AK',
    name: 'Amit K.',
    score: '86% Match',
    skills: ['.NET Core', 'Microservices', 'SQL'],
    meta: 'Pune • 4.5 years • 20-day notice',
  },
];

const jobRequirements = [
  ['.NET Core', '4 years experience + assessment evidence'],
  ['SQL Server', '3 years + assessment evidence'],
  ['Microservices', 'Project and work experience'],
  ['Azure', 'Resume experience'],
  ['Pune', 'Location match'],
  ['≤ 30-day notice', '15 days'],
];

const workflowSteps = [
  ['1', 'Create Job'],
  ['2', 'Find Candidates'],
  ['3', 'Screen'],
  ['4', 'Shortlist'],
  ['5', 'Interview'],
  ['6', 'Offer'],
  ['7', 'Hire'],
];

const employerFeatures = [
  {
    icon: <PersonSearchOutlinedIcon />,
    title: 'AI Candidate Finder',
    description: 'Search candidates using natural language.',
  },
  {
    icon: <PsychologyOutlinedIcon />,
    title: 'Smart Matching',
    description: 'Rank candidates against actual job requirements.',
  },
  {
    icon: <AssignmentTurnedInOutlinedIcon />,
    title: 'Candidate Evidence',
    description: 'Understand what supports candidate skills.',
  },
  {
    icon: <WorkOutlineIcon />,
    title: 'Applicant Pipeline',
    description: 'Manage candidates from application through hire.',
  },
  {
    icon: <MailOutlineIcon />,
    title: 'Candidate Engagement',
    description: 'Keep communication and follow-ups organized.',
  },
  {
    icon: <AnalyticsOutlinedIcon />,
    title: 'Hiring Analytics',
    description: 'Understand sourcing, conversion and bottlenecks.',
  },
];

export const EmployersPage = () => {
  useDocumentMetadata(
    'CareerHarbor for Employers | Find and Hire the Right Candidates',
    'Find active candidates, understand job fit, review skill evidence and manage your hiring pipeline with CareerHarbor.',
    { canonicalPath: ROUTES.EMPLOYERS, noIndex: false },
  );

  return (
    <div className="employer-home">
      {/* HERO */}
      <section className="employer-hero">
        <div className="employer-container employer-hero-grid">
          <div className="employer-hero-content">
            <span className="employer-eyebrow">AI-powered hiring platform</span>

            <h1 className="employer-hero-title">
              Find the right candidates.
              <br />
              Know why they match.
              <br />
              <span>Hire faster.</span>
            </h1>

            <p className="employer-hero-description">
              Find active candidates, evaluate real job fit, understand their skills and manage your
              complete hiring pipeline — all in one place.
            </p>

            <div className="employer-hero-actions">
              <Button endIcon={<ArrowForwardIcon />} size="large" variant="contained">
                Start Hiring
              </Button>

              <Button endIcon={<ArrowForwardIcon />} size="large" variant="outlined">
                Find Candidates
              </Button>
            </div>

            <div className="employer-proof-row">
              {[
                'AI-powered matching',
                'Skill evidence',
                'Active candidate signals',
                'Complete hiring pipeline',
              ].map((item) => (
                <span className="employer-proof" key={item}>
                  <span className="employer-proof-check">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="employer-hero-visual">
            <img
              alt="CareerHarbor employer hiring platform"
              src="/images/employers/employer-hero.png"
            />
          </div>
        </div>
      </section>

      {/* PROBLEMS */}
      <section className="employer-section employer-section-soft">
        <div className="employer-container">
          <div className="employer-section-heading">
            <h2>Hiring shouldn’t mean reviewing hundreds of irrelevant resumes.</h2>
          </div>

          <div className="employer-problem-grid">
            {hiringProblems.map((problem) => (
              <article className="employer-card" key={problem.title}>
                <div className="employer-card-icon">{problem.icon}</div>
                <h3>{problem.title}</h3>
                <p>{problem.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AI CANDIDATE FINDER */}
      <section className="employer-section">
        <div className="employer-container employer-finder-grid">
          <div className="employer-finder-content">
            <Chip
              label="✨ AI Candidate Finder"
              sx={{
                bgcolor: '#eef4ff',
                color: '#0b57d0',
                fontWeight: 800,
              }}
            />

            <h2>
              Describe who you need.
              <br />
              CareerHarbor finds the matches.
            </h2>

            <p>
              Search naturally instead of configuring dozens of filters. CareerHarbor can turn your
              hiring requirement into candidate matches.
            </p>

            <div className="employer-search-demo">
              <SearchIcon />
              <span>
                Find .NET developers in Pune with 3–5 years experience, Microservices, SQL...
              </span>
            </div>

            <Button startIcon={<PsychologyOutlinedIcon />} sx={{ mt: 2 }} variant="contained">
              Find Candidates
            </Button>
          </div>

          <div className="employer-candidate-list">
            {candidates.map((candidate) => (
              <article className="employer-candidate-row" key={candidate.name}>
                <div className="employer-avatar">{candidate.initials}</div>

                <div className="employer-candidate-content">
                  <div className="employer-candidate-heading">
                    <strong>{candidate.name}</strong>
                    <span className="employer-match">{candidate.score}</span>
                  </div>

                  <div className="employer-tags">
                    {candidate.skills.map((skill) => (
                      <span className="employer-tag" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="employer-candidate-meta">
                    {candidate.meta}
                    <span className="employer-active">● Actively looking</span>
                  </div>
                </div>

                <Button size="small" variant="outlined">
                  Why this match?
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLAINABLE MATCH */}
      <section className="employer-section employer-section-soft">
        <div className="employer-container employer-two-column">
          <article className="employer-card employer-large-card">
            <h2>Don’t just get a match score. Understand the match.</h2>

            <p className="employer-card-description">
              See how each candidate aligns with the actual job requirement.
            </p>

            <div className="employer-table-wrapper">
              <table className="employer-match-table">
                <thead>
                  <tr>
                    <th>Your Requirement</th>
                    <th>Candidate Evidence</th>
                  </tr>
                </thead>

                <tbody>
                  {jobRequirements.map(([requirement, evidence]) => (
                    <tr key={requirement}>
                      <td>{requirement}</td>
                      <td>
                        <span className="employer-evidence-check">✓</span>
                        {evidence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="employer-overall-fit">
              <strong>Overall Job Fit</strong>
              <span>92% Match</span>
            </div>
          </article>

          <article className="employer-card employer-large-card">
            <h2>From job opening to hired — one workspace.</h2>

            <p className="employer-card-description">
              Keep every stage of the hiring process connected.
            </p>

            <div className="employer-workflow">
              {workflowSteps.map(([number, label]) => (
                <div className="employer-workflow-step" key={label}>
                  <div className="employer-workflow-number">{number}</div>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="employer-workflow-note">
              CareerHarbor keeps candidates, communication, evaluations and hiring progress
              connected throughout the process.
            </div>
          </article>
        </div>
      </section>

      {/* CANDIDATE INTELLIGENCE */}
      <section className="employer-section">
        <div className="employer-container employer-intelligence-grid">
          <article className="employer-intelligence-card">
            <div className="employer-profile-heading">
              <div className="employer-avatar employer-avatar-large">AS</div>

              <div>
                <h3>Amit Sharma</h3>
                <p>Senior Software Engineer</p>
              </div>
            </div>

            <div className="employer-intelligence-title">CareerHarbor Candidate Intelligence</div>

            <div className="employer-score-grid">
              <div className="employer-score-box">
                <span>Resume Match</span>
                <strong>94%</strong>
              </div>

              <div className="employer-score-box">
                <span>Skills Evidence</span>
                <strong>8</strong>
              </div>

              <div className="employer-score-box">
                <span>Assessment</span>
                <strong>Available</strong>
              </div>

              <div className="employer-score-box">
                <span>Project Evidence</span>
                <strong>Available</strong>
              </div>
            </div>

            <div className="employer-availability-grid">
              <div>
                <span>Actively Looking</span>
                <strong className="employer-green">● Yes</strong>
              </div>

              <div>
                <span>Notice Period</span>
                <strong>Immediate</strong>
              </div>

              <div>
                <span>Expected CTC</span>
                <strong>₹18 LPA</strong>
              </div>
            </div>
          </article>

          <div className="employer-intelligence-copy">
            <span className="employer-small-label">CANDIDATE INTELLIGENCE</span>

            <h2>See more than a resume.</h2>

            <p>
              Understand the evidence behind a candidate’s skills, assessments, projects,
              availability and job fit.
            </p>

            <Button endIcon={<ArrowForwardIcon />} variant="outlined">
              Explore Candidate Intelligence
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="employer-section employer-section-soft">
        <div className="employer-container">
          <div className="employer-section-heading">
            <h2>Everything you need to hire</h2>
            <p>One connected workspace for your complete hiring process.</p>
          </div>

          <div className="employer-feature-grid">
            {employerFeatures.map((feature) => (
              <article className="employer-feature-card" key={feature.title}>
                <div className="employer-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TALENT POOL */}
      <section className="employer-section">
        <div className="employer-container">
          <div className="employer-talent-pool">
            <div>
              <span className="employer-small-label">TALENT POOL</span>

              <h2>Your best candidate may already know your company.</h2>

              <p>
                Build a reusable talent pool from applicants, shortlisted candidates and previous
                interviews.
              </p>
            </div>

            <div className="employer-talent-card">
              <div className="employer-talent-count">17</div>

              <div>
                <strong>previous candidates match your new .NET opening.</strong>

                <div>
                  <Button endIcon={<ArrowForwardIcon />} sx={{ mt: 2 }} variant="outlined">
                    Explore Talent Pool
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="employer-final-cta">
        <div className="employer-container employer-final-grid">
          <div>
            <h2>Ready to find your next great hire?</h2>

            <p>
              Create your CareerHarbor employer account and start building your hiring pipeline.
            </p>
          </div>

          <div className="employer-final-actions">
            <Button
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#fff',
                color: '#0b57d0',
                '&:hover': { bgcolor: '#f8fafc' },
              }}
              variant="contained"
            >
              Start Hiring
            </Button>

            <Button
              sx={{
                borderColor: 'rgba(255,255,255,.75)',
                color: '#fff',
                '&:hover': {
                  borderColor: '#fff',
                  bgcolor: 'rgba(255,255,255,.08)',
                },
              }}
              variant="outlined"
            >
              Employer Login
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
