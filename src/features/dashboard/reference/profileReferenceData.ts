export interface ReferenceOption { value: string; label: string }

const countryCodes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
export const countries: ReferenceOption[] = countryCodes
  .map((code) => ({ value: countryNames.of(code) ?? code, label: countryNames.of(code) ?? code }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const indianCities: ReferenceOption[] = [
  'Ahmedabad', 'Amritsar', 'Aurangabad', 'Bengaluru', 'Bhopal', 'Chandigarh',
  'Chennai', 'Chhatrapati Sambhajinagar', 'Coimbatore', 'Delhi', 'Faridabad',
  'Ghaziabad', 'Gurugram', 'Guwahati', 'Hyderabad', 'Indore', 'Jaipur', 'Kochi',
  'Kolkata', 'Lucknow', 'Ludhiana', 'Mumbai', 'Nagpur', 'Nashik', 'Navi Mumbai',
  'Noida', 'Patna', 'Pune', 'Rajkot', 'Surat', 'Thane', 'Thiruvananthapuram',
  'Vadodara', 'Varanasi', 'Visakhapatnam',
].map((value) => ({ value, label: value }));

export const educationLevels: ReferenceOption[] = [
  '10th', '12th', 'Diploma', 'ITI', 'BE', 'BTech', 'BSc', 'BCA', 'BCom', 'BA', 'BBA',
  'ME', 'MTech', 'MSc', 'MCA', 'MCom', 'MA', 'MBA', 'PG Diploma', 'PhD', 'Other',
].map((value) => ({ value, label: value }));
export const gradingSystems: ReferenceOption[] = [
  { value: 'Percentage', label: 'Percentage' }, { value: 'Cgpa10', label: 'CGPA out of 10' },
  { value: 'Gpa4', label: 'GPA out of 4' }, { value: 'Grade', label: 'Grade' },
  { value: 'PassFail', label: 'Pass / Fail' }, { value: 'Other', label: 'Other' },
];
export const courseSuggestions: ReferenceOption[] = [
  'Computer Science', 'Mechanical Engineering', 'Electrical Engineering',
  'Civil Engineering', 'Electronics and Communication', 'Information Technology',
  'Business Administration', 'Commerce', 'Economics', 'Physics', 'Chemistry',
].map((value) => ({ value, label: value }));
export const instituteSuggestions: ReferenceOption[] = [
  'University of Delhi', 'Savitribai Phule Pune University', 'Anna University',
  'University of Mumbai', 'Indian Institute of Technology Bombay',
  'Indian Institute of Technology Delhi', 'Birla Institute of Technology and Science',
  'K. K. Wagh Institute of Engineering Education and Research',
].map((value) => ({ value, label: value }));
