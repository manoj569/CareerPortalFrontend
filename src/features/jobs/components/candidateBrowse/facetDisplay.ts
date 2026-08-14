const normalizeLabel = (value: string): string => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

const locationLabels = [
  'Pune',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Delhi / NCR',
  'Mumbai (All Areas)',
  'Mumbai',
  'Kolkata',
  'New Delhi',
  'Noida',
  'Nagpur',
  'Nashik',
  'Chhatrapati Sambhajinagar',
  'Thane',
  'Ahmedabad',
  'Indore',
  'Gurugram',
  'Coimbatore',
  'Kochi',
  'Thiruvananthapuram',
  'Greater Noida',
  'Bangalore Rural',
  'Navi Mumbai',
  'Bhubaneswar',
  'Salem',
] as const;

const locationLabelByKey = new Map(
  locationLabels.map((label) => [normalizeLabel(label), label] as const),
);

const educationLabelByKey = new Map<string, string>([
  ['mba/pgdm', 'MBA/PGDM'],
  ['any postgraduate', 'Any Postgraduate'],
  ['m.tech', 'M.Tech'],
  ['mca', 'MCA'],
  ['ms/m.sc (science)', 'MS/M.Sc (Science)'],
  ['m.sc', 'MS/M.Sc (Science)'],
  ['post graduation not required', 'Post Graduation Not Required'],
  ['llm', 'LLM'],
  ['mcm', 'MCM'],
  ['cs', 'CS'],
  ['pg diploma', 'PG Diploma'],
  ['master in it management', 'Master in IT Management'],
  ['ca', 'CA'],
  ['b.tech / b.e.', 'B.Tech / B.E.'],
  ['b.tech', 'B.Tech / B.E.'],
  ['b.e.', 'B.Tech / B.E.'],
  ['any graduate', 'Any Graduate'],
  ['b.sc', 'B.Sc'],
  ['b.c.a.', 'B.C.A.'],
  ['bca', 'B.C.A.'],
  ['graduation not required', 'Graduation Not Required'],
  ['diploma', 'Diploma'],
  ['b.com', 'B.Com'],
  ['b.a - bachelor of arts', 'B.A - Bachelor of Arts'],
  ['b.b.a. / b.m.s.', 'B.B.A. / B.M.S.'],
  ['b.ed', 'B.Ed'],
]);

export const normalizeFacetIdentity = normalizeLabel;

export const getLocationDisplayLabel = (value: string): string =>
  locationLabelByKey.get(normalizeLabel(value)) ?? value.trim().replace(/\s+/g, ' ');

export const getEducationDisplayLabel = (value: string): string =>
  educationLabelByKey.get(normalizeLabel(value)) ?? value.trim().replace(/\s+/g, ' ');
