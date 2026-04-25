import { useState, useMemo } from 'react';
import {
  GraduationCap, Users, UserPlus, Search, Eye, X, ChevronLeft, ChevronRight,
  Phone, Mail, MapPin, Heart, BookOpen, Church, Calendar, FileText, DollarSign,
  CheckCircle, Clock, Download, Star, Award, TrendingUp, Coffee
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Teacher {
  id: string; employeeId: string; fullName: string; gender: string; dob: string;
  nationality: string; maritalStatus: string; bloodGroup: string;
  mobile: string; email: string; address: string; emergencyContact: string; emergencyPhone: string;
  conversionDate: string; baptismStatus: string; baptismDate: string; church: string;
  pastor: string; ministryInvolvement: string; yearsInMinistry: string; spiritualGifts: string;
  testimony: string; statementOfFaith: string;
  highestQual: string; theologicalDegree: string; seminary: string; degreeYear: string;
  certifications: string; specialization: string;
  role: string; department: string; subjectsAssigned: string; dateOfJoining: string;
  employmentType: string; experience: string;
  assignedCourses: string; classBatch: string; weeklySchedule: string; lectureHours: string; teachingMode: string;
  callingType: string; ministryExperience: string; currentMinistryRole: string; churchLeadership: string; fieldExperience: string;
  salaryStructure: string; bankDetails: string; paymentFrequency: string; allowances: string; deductions: string;
  idProof: string; certificates: string; experienceLetters: string; ordinationCert: string; recommendations: string; cv: string;
  studentFeedback: string; academicMetrics: string; spiritualLeadership: string; attendance: string; adminRatings: string;
  performanceScore: number;
  status: string;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────
const initialTeachers: Teacher[] = [
  {
    id: '1', employeeId: 'COV-T001', fullName: 'Dr. John Chacko', gender: 'Male', dob: '1965-03-15',
    nationality: 'Indian', maritalStatus: 'Married', bloodGroup: 'A+',
    mobile: '+91 94470 11111', email: 'john.chacko@covenant.edu', address: '12, Seminary Road, Kottayam',
    emergencyContact: 'Mary Chacko', emergencyPhone: '+91 94470 22222',
    conversionDate: '1980-06-10', baptismStatus: 'Baptized', baptismDate: '1981-01-04', church: 'Mar Thoma Church',
    pastor: 'Rev. Dr. Abraham Philip', ministryInvolvement: 'Senior Pastor, Theological Writer', yearsInMinistry: '38', spiritualGifts: 'Teaching, Prophecy, Knowledge',
    testimony: 'Called to ministry during college years at a revival meeting. Has dedicated his life to theological education and training the next generation of pastors.',
    statementOfFaith: 'Evangelical, Reformed theological framework with emphasis on biblical inerrancy.',
    highestQual: 'Ph.D. in Systematic Theology', theologicalDegree: 'Ph.D.', seminary: 'Fuller Theological Seminary', degreeYear: '1995',
    certifications: 'ATS Accreditation Reviewer, ThD Honorary', specialization: 'Systematic Theology, Apologetics',
    role: 'Teacher', department: 'Theology', subjectsAssigned: 'Systematic Theology I, II, III; Apologetics', dateOfJoining: '2005-06-01',
    employmentType: 'Full-time', experience: '28 years',
    assignedCourses: 'M.Div, B.Th', classBatch: '2024-2026', weeklySchedule: 'Mon-Thu', lectureHours: '16 hrs/week', teachingMode: 'In-person',
    callingType: 'Pastor-Teacher', ministryExperience: 'Senior Pastor (1987-2005), Seminary Professor (2005-present)', currentMinistryRole: 'Professor & Academic Dean',
    churchLeadership: 'Board Member, Kerala Theological Forum', fieldExperience: 'Conference Speaker in 15+ countries',
    salaryStructure: 'Professor - Grade A', bankDetails: 'SBI - Kottayam', paymentFrequency: 'Monthly', allowances: 'HRA, DA, Medical', deductions: 'PF, IT',
    idProof: 'Aadhaar', certificates: 'All uploaded', experienceLetters: 'Available', ordinationCert: 'Yes', recommendations: '3 letters', cv: 'Updated 2024',
    studentFeedback: '4.8/5.0', academicMetrics: 'Excellent', spiritualLeadership: 'Outstanding', attendance: '98%', adminRatings: 'A+',
    performanceScore: 96, status: 'Active',
  },
  {
    id: '2', employeeId: 'COV-T002', fullName: 'Dr. Sarah Williams', gender: 'Female', dob: '1972-08-22',
    nationality: 'Indian', maritalStatus: 'Married', bloodGroup: 'B+',
    mobile: '+91 94470 33333', email: 'sarah.williams@covenant.edu', address: '34, Faculty Quarters, Kottayam',
    emergencyContact: 'David Williams', emergencyPhone: '+91 94470 44444',
    conversionDate: '1988-12-25', baptismStatus: 'Baptized', baptismDate: '1989-08-15', church: 'St. George Cathedral',
    pastor: 'Rev. Dr. Samuel Thomas', ministryInvolvement: 'Women Fellowship Leader, Counselor', yearsInMinistry: '30', spiritualGifts: 'Mercy, Counseling, Teaching',
    testimony: 'Came to faith at age 16. Trained in psychology and theology, combining both for Christian counseling ministry.',
    statementOfFaith: 'Evangelical with charismatic emphasis, counseling-oriented theology.',
    highestQual: 'Ph.D. in Christian Counseling', theologicalDegree: 'Ph.D.', seminary: 'Regent College, Vancouver', degreeYear: '2000',
    certifications: 'Licensed Counselor, NCCA Certified', specialization: 'Christian Counseling, Pastoral Care',
    role: 'Teacher', department: 'Counseling', subjectsAssigned: 'Christian Counseling I, II; Psychology & Theology; Family Therapy', dateOfJoining: '2010-06-01',
    employmentType: 'Full-time', experience: '20 years',
    assignedCourses: 'M.Div Counseling', classBatch: '2024-2026', weeklySchedule: 'Mon-Wed, Fri', lectureHours: '14 hrs/week', teachingMode: 'In-person',
    callingType: 'Counselor-Teacher', ministryExperience: 'Campus Counselor (2000-2010), Professor (2010-present)', currentMinistryRole: 'HOD Counseling Dept',
    churchLeadership: 'Counseling Coordinator, City Church', fieldExperience: 'International Conference Speaker',
    salaryStructure: 'Associate Professor - Grade B', bankDetails: 'HDFC - Kottayam', paymentFrequency: 'Monthly', allowances: 'HRA, DA, Medical', deductions: 'PF, IT',
    idProof: 'Aadhaar', certificates: 'All uploaded', experienceLetters: 'Available', ordinationCert: 'N/A', recommendations: '4 letters', cv: 'Updated 2024',
    studentFeedback: '4.9/5.0', academicMetrics: 'Excellent', spiritualLeadership: 'Outstanding', attendance: '99%', adminRatings: 'A+',
    performanceScore: 97, status: 'Active',
  },
  {
    id: '3', employeeId: 'COV-T003', fullName: 'Rev. Dr. Timothy George', gender: 'Male', dob: '1968-11-05',
    nationality: 'Indian', maritalStatus: 'Married', bloodGroup: 'O+',
    mobile: '+91 94470 55555', email: 'timothy.george@covenant.edu', address: '56, Lake View, Kottayam',
    emergencyContact: 'Lilly George', emergencyPhone: '+91 94470 66666',
    conversionDate: '1982-04-10', baptismStatus: 'Baptized', baptismDate: '1983-02-20', church: 'Calvary Baptist Church',
    pastor: 'Rev. Dr. Mathew Philip', ministryInvolvement: 'Evangelism Director, Church Planter', yearsInMinistry: '35', spiritualGifts: 'Evangelism, Leadership, Faith',
    testimony: 'Converted from Hindu background at age 14 through gospel meetings. Has planted 8 churches across South India.',
    statementOfFaith: 'Baptist theological framework, strong emphasis on evangelism and missions.',
    highestQual: 'D.Min. in Missiology', theologicalDegree: 'D.Min.', seminary: 'Southern Baptist Theological Seminary', degreeYear: '1998',
    certifications: 'Church Planting Movement Trainer', specialization: 'Missiology, Church Planting, Evangelism',
    role: 'Pastor', department: 'Missiology', subjectsAssigned: 'Introduction to Missions; Church Planting Strategies; Cross-Cultural Communication', dateOfJoining: '2015-06-01',
    employmentType: 'Full-time', experience: '25 years',
    assignedCourses: 'M.Div Missiology, B.Th', classBatch: '2024-2026', weeklySchedule: 'Tue-Fri', lectureHours: '12 hrs/week', teachingMode: 'In-person',
    callingType: 'Missionary-Pastor', ministryExperience: 'Church Planter (1990-2015), Professor (2015-present)', currentMinistryRole: 'Director of Missions',
    churchLeadership: 'Mission Board Member, IMB Partner', fieldExperience: 'Mission work in 12 countries',
    salaryStructure: 'Associate Professor - Grade B', bankDetails: 'Canara Bank', paymentFrequency: 'Monthly', allowances: 'HRA, DA, Travel', deductions: 'PF, IT',
    idProof: 'Aadhaar', certificates: 'All uploaded', experienceLetters: 'Available', ordinationCert: 'Yes', recommendations: '5 letters', cv: 'Updated 2024',
    studentFeedback: '4.7/5.0', academicMetrics: 'Very Good', spiritualLeadership: 'Outstanding', attendance: '97%', adminRatings: 'A',
    performanceScore: 93, status: 'Active',
  },
  {
    id: '4', employeeId: 'COV-T004', fullName: 'Prof. Rachel Menon', gender: 'Female', dob: '1980-02-28',
    nationality: 'Indian', maritalStatus: 'Single', bloodGroup: 'AB+',
    mobile: '+91 94470 77777', email: 'rachel.menon@covenant.edu', address: '78, College Lane, Kottayam',
    emergencyContact: 'Thomas Menon', emergencyPhone: '+91 94470 88888',
    conversionDate: '1995-07-20', baptismStatus: 'Baptized', baptismDate: '1996-04-05', church: 'CSI Church',
    pastor: 'Rev. Dr. Jacob Thomas', ministryInvolvement: 'Bible Study Leader, Youth Mentor', yearsInMinistry: '22', spiritualGifts: 'Teaching, Knowledge, Writing',
    testimony: 'Grew up in a Christian home, came to personal faith at youth camp. Passionate about making theology accessible to all believers.',
    statementOfFaith: 'Ecumenical evangelical, emphasis on biblical literacy and historical theology.',
    highestQual: 'Th.M. in Church History', theologicalDegree: 'Th.M.', seminary: 'Union Theological Seminary, NYC', degreeYear: '2008',
    certifications: 'ATS Member, Historical Society Fellow', specialization: 'Church History, Historical Theology',
    role: 'Teacher', department: 'Church History', subjectsAssigned: 'Church History I, II; History of Revivals; Christianity in India', dateOfJoining: '2012-06-01',
    employmentType: 'Full-time', experience: '16 years',
    assignedCourses: 'B.Th, M.Div', classBatch: '2024-2026', weeklySchedule: 'Mon-Wed', lectureHours: '14 hrs/week', teachingMode: 'In-person',
    callingType: 'Teacher', ministryExperience: 'Youth Leader (2002-2012), Professor (2012-present)', currentMinistryRole: 'HOD Church History',
    churchLeadership: 'Sunday School Superintendent', fieldExperience: 'Research trips to European archives',
    salaryStructure: 'Assistant Professor - Grade C', bankDetails: 'Federal Bank', paymentFrequency: 'Monthly', allowances: 'HRA, DA', deductions: 'PF, IT',
    idProof: 'Aadhaar', certificates: 'All uploaded', experienceLetters: 'Available', ordinationCert: 'N/A', recommendations: '3 letters', cv: 'Updated 2024',
    studentFeedback: '4.6/5.0', academicMetrics: 'Very Good', spiritualLeadership: 'Very Good', attendance: '96%', adminRatings: 'A',
    performanceScore: 90, status: 'Active',
  },
  {
    id: '5', employeeId: 'COV-T005', fullName: 'Rev. Dr. Abraham Philip', gender: 'Male', dob: '1960-09-12',
    nationality: 'Indian', maritalStatus: 'Married', bloodGroup: 'B-',
    mobile: '+91 94470 99999', email: 'abraham.philip@covenant.edu', address: '23, Bishop Nagar, Kottayam',
    emergencyContact: 'Saramma Philip', emergencyPhone: '+91 94471 00000',
    conversionDate: '1975-01-01', baptismStatus: 'Baptized', baptismDate: '1975-12-25', church: 'Mar Thoma Church',
    pastor: 'Rev. Dr. Eapen Samuel', ministryInvolvement: 'Retired Bishop, Spiritual Father', yearsInMinistry: '45', spiritualGifts: 'Prophecy, Shepherding, Wisdom',
    testimony: 'Third generation pastor. Served as bishop for 15 years before retiring to teach theology. Known for his deep prayer life and wisdom.',
    statementOfFaith: 'Mar Thoma theological tradition with evangelical convictions.',
    highestQual: 'D.D. (Doctor of Divinity)', theologicalDegree: 'D.D.', seminary: 'Serampore College', degreeYear: '1985',
    certifications: 'Honorary Doctorate (3), Senate of Serampore', specialization: 'Pastoral Theology, Homiletics, Christian Ethics',
    role: 'Teacher', department: 'Practical Theology', subjectsAssigned: 'Pastoral Theology; Homiletics; Christian Ethics; Leadership Principles', dateOfJoining: '2018-06-01',
    employmentType: 'Visiting Faculty', experience: '38 years',
    assignedCourses: 'M.Div, D.Min', classBatch: '2024-2026', weeklySchedule: 'Tue, Thu', lectureHours: '8 hrs/week', teachingMode: 'In-person',
    callingType: 'Pastor', ministryExperience: 'Pastor (1980-2003), Bishop (2003-2018), Visiting Professor (2018-present)', currentMinistryRole: 'Mentor & Visiting Faculty',
    churchLeadership: 'Former Bishop, Mar Thoma Church', fieldExperience: 'Ecumenical dialogues worldwide',
    salaryStructure: 'Visiting Professor - Honorarium', bankDetails: 'SBI - Kottayam', paymentFrequency: 'Monthly', allowances: 'Travel, Accommodation', deductions: 'IT',
    idProof: 'Aadhaar', certificates: 'All uploaded', experienceLetters: 'Available', ordinationCert: 'Yes', recommendations: '10+ letters', cv: 'Updated 2024',
    studentFeedback: '5.0/5.0', academicMetrics: 'Outstanding', spiritualLeadership: 'Exceptional', attendance: '100%', adminRatings: 'A+',
    performanceScore: 99, status: 'Active',
  },
  {
    id: '6', employeeId: 'COV-T006', fullName: 'Dr. Michael David', gender: 'Male', dob: '1975-06-18',
    nationality: 'Indian', maritalStatus: 'Married', bloodGroup: 'O-',
    mobile: '+91 94471 11111', email: 'michael.david@covenant.edu', address: '45, River View, Ernakulam',
    emergencyContact: 'Sunitha David', emergencyPhone: '+91 94471 22222',
    conversionDate: '1990-10-10', baptismStatus: 'Baptized', baptismDate: '1991-06-30', church: 'IPC Church',
    pastor: 'Rev. K.V. Daniel', ministryInvolvement: 'Worship Leader, Music Director', yearsInMinistry: '28', spiritualGifts: 'Music, Teaching, Creative Arts',
    testimony: 'Grew up in a Pentecostal home. Trained in classical music and theology. Combines music and worship with theological education.',
    statementOfFaith: 'Pentecostal theological framework, charismatic emphasis.',
    highestQual: 'Ph.D. in Worship Studies', theologicalDegree: 'Ph.D.', seminary: 'Asbury Theological Seminary', degreeYear: '2003',
    certifications: 'Certified Music Director, Worship Leader Certificate', specialization: 'Worship Studies, Church Music, Creative Arts',
    role: 'Teacher', department: 'Worship Studies', subjectsAssigned: 'Biblical Foundations of Worship; Church Music; Creative Arts Ministry', dateOfJoining: '2019-06-01',
    employmentType: 'Full-time', experience: '18 years',
    assignedCourses: 'Diploma, B.Th', classBatch: '2024-2026', weeklySchedule: 'Wed-Sat', lectureHours: '12 hrs/week', teachingMode: 'In-person',
    callingType: 'Worship Leader', ministryExperience: 'Music Director (2003-2019), Professor (2019-present)', currentMinistryRole: 'HOD Worship Studies',
    churchLeadership: 'Worship Director, City Revival Church', fieldExperience: 'International worship conferences',
    salaryStructure: 'Assistant Professor - Grade C', bankDetails: 'ICICI Bank', paymentFrequency: 'Monthly', allowances: 'HRA, DA, Music Equip', deductions: 'PF, IT',
    idProof: 'Aadhaar', certificates: 'All uploaded', experienceLetters: 'Available', ordinationCert: 'Yes', recommendations: '3 letters', cv: 'Updated 2024',
    studentFeedback: '4.8/5.0', academicMetrics: 'Very Good', spiritualLeadership: 'Outstanding', attendance: '95%', adminRatings: 'A',
    performanceScore: 91, status: 'Active',
  },
  {
    id: '7', employeeId: 'COV-T007', fullName: 'Dr. Deepak Sharma', gender: 'Male', dob: '1978-04-03',
    nationality: 'Nepalese', maritalStatus: 'Married', bloodGroup: 'A+',
    mobile: '+977 98412 55555', email: 'deepak.sharma@covenant.edu', address: 'Kathmandu, Nepal (Visiting)',
    emergencyContact: 'Anita Sharma', emergencyPhone: '+977 98512 66666',
    conversionDate: '1996-08-15', baptismStatus: 'Baptized', baptismDate: '1997-03-22', church: 'Kathmandu Baptist Church',
    pastor: 'Rev. Rajendra Khatry', ministryInvolvement: 'Bible Translator, Mission Strategist', yearsInMinistry: '22', spiritualGifts: 'Languages, Teaching, Administration',
    testimony: 'Former Hindu priest who came to faith through reading the Bible in Sanskrit. Now a Bible translator and mission strategist.',
    statementOfFaith: 'Conservative evangelical, strong emphasis on Scripture translation.',
    highestQual: 'Ph.D. in Old Testament Studies', theologicalDegree: 'Ph.D.', seminary: 'Dallas Theological Seminary', degreeYear: '2006',
    certifications: 'Certified Bible Translator (Wycliffe), Sanskrit Scholar', specialization: 'Old Testament, Hebrew, Biblical Languages',
    role: 'Visiting Faculty', department: 'Biblical Studies', subjectsAssigned: 'Hebrew I, II; Old Testament Exegesis; Biblical Hermeneutics', dateOfJoining: '2022-06-01',
    employmentType: 'Part-time', experience: '14 years',
    assignedCourses: 'M.Div, B.Th', classBatch: '2024-2026', weeklySchedule: 'Mon, Wed (Online)', lectureHours: '6 hrs/week', teachingMode: 'Online',
    callingType: 'Missionary-Scholar', ministryExperience: 'Bible Translator (2006-present), Visiting Professor (2022-present)', currentMinistryRole: 'Translation Director, Nepal Bible Society',
    churchLeadership: 'Elder, Kathmandu Baptist Church', fieldExperience: 'Translation projects in 5 languages',
    salaryStructure: 'Visiting Faculty - Honorarium', bankDetails: 'Nabil Bank, Nepal', paymentFrequency: 'Quarterly', allowances: 'Travel', deductions: 'IT',
    idProof: 'Passport', certificates: 'All uploaded', experienceLetters: 'Available', ordinationCert: 'Yes', recommendations: '4 letters', cv: 'Updated 2024',
    studentFeedback: '4.9/5.0', academicMetrics: 'Outstanding', spiritualLeadership: 'Excellent', attendance: '94%', adminRatings: 'A',
    performanceScore: 95, status: 'Active',
  },
  {
    id: '8', employeeId: 'COV-T008', fullName: 'Evangelist Sunil Patel', gender: 'Male', dob: '1985-12-01',
    nationality: 'Indian', maritalStatus: 'Single', bloodGroup: 'B+',
    mobile: '+91 94471 33333', email: 'sunil.patel@covenant.edu', address: 'Mumbai (Guest Lecturer)',
    emergencyContact: 'Rajesh Patel', emergencyPhone: '+91 94471 44444',
    conversionDate: '2003-03-15', baptismStatus: 'Baptized', baptismDate: '2003-11-20', church: 'Full Gospel Church, Mumbai',
    pastor: 'Rev. Dr. Mohan Lal', ministryInvolvement: 'Full-time Evangelist, Itinerant Preacher', yearsInMinistry: '17', spiritualGifts: 'Evangelism, Healing, Prophecy',
    testimony: 'Came to faith at a gospel meeting at age 18. Left engineering to become a full-time evangelist. Travels across India preaching.',
    statementOfFaith: 'Pentecostal/Charismatic with emphasis on power ministry.',
    highestQual: 'B.Th', theologicalDegree: 'B.Th', seminary: 'Bombay Bible College', degreeYear: '2009',
    certifications: 'Licensed Evangelist, AOG', specialization: 'Evangelism, Homiletics, Spiritual Warfare',
    role: 'Guest Lecturer', department: 'Practical Theology', subjectsAssigned: 'Evangelism & Church Growth; Spiritual Warfare; Power Ministry', dateOfJoining: '2024-01-01',
    employmentType: 'Guest', experience: '12 years',
    assignedCourses: 'B.Th', classBatch: '2024-2026', weeklySchedule: 'Bi-weekly', lectureHours: '4 hrs/week', teachingMode: 'In-person + Online',
    callingType: 'Evangelist', ministryExperience: 'Evangelist (2012-present)', currentMinistryRole: 'Itinerant Evangelist',
    churchLeadership: 'Evangelism Director, AOG Maharashtra', fieldExperience: 'Preached in 200+ locations',
    salaryStructure: 'Guest Lecturer - Per Session', bankDetails: 'BOI - Mumbai', paymentFrequency: 'Per Lecture', allowances: 'Travel, Accommodation', deductions: 'IT',
    idProof: 'Aadhaar', certificates: 'All uploaded', experienceLetters: 'Available', ordinationCert: 'Yes', recommendations: '2 letters', cv: 'Updated 2024',
    studentFeedback: '4.5/5.0', academicMetrics: 'Good', spiritualLeadership: 'Outstanding', attendance: '88%', adminRatings: 'B+',
    performanceScore: 85, status: 'On Leave',
  },
];

const formTabs = ['Basic Info','Contact','Spiritual Profile','Qualifications','Employment','Teaching Assignment',
  'Ministry & Calling','Payroll','Documents','Performance'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const Input = ({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    {type === 'textarea' ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none" />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
    )}
  </div>
);

const Select = ({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[];
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white transition-all">
      <option value="">Select...</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const PerformanceBadge = ({ score }: { score: number }) => {
  const color = score >= 95 ? 'bg-emerald-500' : score >= 85 ? 'bg-amber-500' : score >= 70 ? 'bg-orange-500' : 'bg-red-500';
  const label = score >= 95 ? 'Exceptional' : score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Improvement';
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: `hsl(${score * 1.2}, 70%, 45%)` }}>
        {score}
      </div>
      <span className="text-xs font-semibold text-slate-600">{label}</span>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [formTab, setFormTab] = useState(0);
  const [viewTab, setViewTab] = useState(0);

  const [form, setForm] = useState<Partial<Teacher>>({
    fullName: '', gender: 'Male', dob: '', nationality: 'Indian', maritalStatus: 'Single', bloodGroup: '',
    mobile: '', email: '', address: '', emergencyContact: '', emergencyPhone: '',
    conversionDate: '', baptismStatus: 'Unbaptized', baptismDate: '', church: '', pastor: '', ministryInvolvement: '',
    yearsInMinistry: '', spiritualGifts: '', testimony: '', statementOfFaith: '',
    highestQual: '', theologicalDegree: 'B.Th', seminary: '', degreeYear: '', certifications: '', specialization: '',
    role: 'Teacher', department: '', subjectsAssigned: '', dateOfJoining: '2025-06-01', employmentType: 'Full-time', experience: '',
    assignedCourses: '', classBatch: '', weeklySchedule: '', lectureHours: '', teachingMode: 'In-person',
    callingType: 'Pastor', ministryExperience: '', currentMinistryRole: '', churchLeadership: '', fieldExperience: '',
    salaryStructure: '', bankDetails: '', paymentFrequency: 'Monthly', allowances: '', deductions: '',
    idProof: '', certificates: '', experienceLetters: '', ordinationCert: '', recommendations: '', cv: '',
    studentFeedback: '', academicMetrics: '', spiritualLeadership: '', attendance: '', adminRatings: '',
    performanceScore: 0, status: 'Active',
  });

  const uf = (field: string, val: string | number) => setForm(prev => ({ ...prev, [field]: val }));

  const stats = useMemo(() => ({
    total: teachers.length,
    departments: new Set(teachers.map(t => t.department)).size,
    active: teachers.filter(t => t.status === 'Active').length,
    onLeave: teachers.filter(t => t.status === 'On Leave').length,
  }), [teachers]);

  const departments = useMemo(() => ['All', ...new Set(teachers.map(t => t.department))], [teachers]);

  const filtered = useMemo(() => teachers.filter(t => {
    const m1 = search === '' || t.fullName.toLowerCase().includes(search.toLowerCase()) || t.employeeId.toLowerCase().includes(search.toLowerCase());
    const m2 = filterDept === 'All' || t.department === filterDept;
    return m1 && m2;
  }), [teachers, search, filterDept]);

  const handleAdd = () => {
    const newTeacher: Teacher = {
      id: String(teachers.length + 1),
      employeeId: `COV-T${String(teachers.length + 1).padStart(3, '0')}`,
      ...form as unknown as Teacher,
    };
    setTeachers(prev => [...prev, newTeacher]);
    setShowAddModal(false);
  };

  const renderFormTab = () => {
    switch (formTab) {
      case 0: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Full Name" value={form.fullName || ''} onChange={v => uf('fullName', v)} placeholder="Dr. / Rev. / Prof." />
          <Select label="Gender" value={form.gender || ''} onChange={v => uf('gender', v)} options={[{label:'Male',value:'Male'},{label:'Female',value:'Female'}]} />
          <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Date of Birth</label><input type="date" value={form.dob || ''} onChange={e => uf('dob', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" /></div>
          <Select label="Nationality" value={form.nationality || ''} onChange={v => uf('nationality', v)} options={[{label:'Indian',value:'Indian'},{label:'Nepalese',value:'Nepalese'},{label:'Other',value:'Other'}]} />
          <Select label="Marital Status" value={form.maritalStatus || ''} onChange={v => uf('maritalStatus', v)} options={[{label:'Single',value:'Single'},{label:'Married',value:'Married'},{label:'Widowed',value:'Widowed'}]} />
          <Select label="Blood Group" value={form.bloodGroup || ''} onChange={v => uf('bloodGroup', v)} options={['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => ({label:b,value:b}))} />
        </div>
      );
      case 1: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Mobile" value={form.mobile || ''} onChange={v => uf('mobile', v)} />
          <Input label="Email" value={form.email || ''} onChange={v => uf('email', v)} type="email" />
          <div className="col-span-2"><Input label="Address" value={form.address || ''} onChange={v => uf('address', v)} type="textarea" /></div>
          <Input label="Emergency Contact" value={form.emergencyContact || ''} onChange={v => uf('emergencyContact', v)} />
          <Input label="Emergency Phone" value={form.emergencyPhone || ''} onChange={v => uf('emergencyPhone', v)} />
        </div>
      );
      case 2: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Date of Conversion</label><input type="date" value={form.conversionDate || ''} onChange={e => uf('conversionDate', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" /></div>
          <Select label="Baptism Status" value={form.baptismStatus || ''} onChange={v => uf('baptismStatus', v)} options={[{label:'Baptized',value:'Baptized'},{label:'Unbaptized',value:'Unbaptized'}]} />
          <Input label="Church" value={form.church || ''} onChange={v => uf('church', v)} />
          <Input label="Pastor" value={form.pastor || ''} onChange={v => uf('pastor', v)} />
          <Input label="Ministry Involvement" value={form.ministryInvolvement || ''} onChange={v => uf('ministryInvolvement', v)} />
          <Input label="Years in Ministry" value={form.yearsInMinistry || ''} onChange={v => uf('yearsInMinistry', v)} />
          <Input label="Spiritual Gifts" value={form.spiritualGifts || ''} onChange={v => uf('spiritualGifts', v)} />
          <div className="col-span-2"><Input label="Testimony" value={form.testimony || ''} onChange={v => uf('testimony', v)} type="textarea" /></div>
          <div className="col-span-2"><Input label="Statement of Faith" value={form.statementOfFaith || ''} onChange={v => uf('statementOfFaith', v)} type="textarea" /></div>
        </div>
      );
      case 3: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Highest Qualification" value={form.highestQual || ''} onChange={v => uf('highestQual', v)} />
          <Select label="Theological Degree" value={form.theologicalDegree || ''} onChange={v => uf('theologicalDegree', v)} options={[{label:'B.Th',value:'B.Th'},{label:'M.Div',value:'M.Div'},{label:'Th.M',value:'Th.M'},{label:'D.Min',value:'D.Min'},{label:'Ph.D.',value:'Ph.D.'},{label:'D.D.',value:'D.D.'}]} />
          <Input label="Seminary" value={form.seminary || ''} onChange={v => uf('seminary', v)} />
          <Input label="Year" value={form.degreeYear || ''} onChange={v => uf('degreeYear', v)} />
          <Input label="Certifications" value={form.certifications || ''} onChange={v => uf('certifications', v)} />
          <Select label="Specialization" value={form.specialization || ''} onChange={v => uf('specialization', v)} options={[
            {label:'OT',value:'OT'},{label:'NT',value:'NT'},{label:'Systematic Theology',value:'Systematic Theology'},
            {label:'Church History',value:'Church History'},{label:'Missiology',value:'Missiology'},{label:'Christian Counseling',value:'Christian Counseling'},
            {label:'Worship Studies',value:'Worship Studies'},{label:'Practical Theology',value:'Practical Theology'},{label:'Biblical Languages',value:'Biblical Languages'},
          ]} />
        </div>
      );
      case 4: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Employee ID" value={`COV-T${String(teachers.length + 1).padStart(3, '0')}`} onChange={() => {}} />
          <Select label="Role" value={form.role || ''} onChange={v => uf('role', v)} options={[{label:'Teacher',value:'Teacher'},{label:'Pastor',value:'Pastor'},{label:'Visiting Faculty',value:'Visiting Faculty'},{label:'Guest Lecturer',value:'Guest Lecturer'}]} />
          <Select label="Department" value={form.department || ''} onChange={v => uf('department', v)} options={[
            {label:'Theology',value:'Theology'},{label:'Biblical Studies',value:'Biblical Studies'},{label:'Missiology',value:'Missiology'},
            {label:'Counseling',value:'Counseling'},{label:'Worship Studies',value:'Worship Studies'},{label:'Practical Theology',value:'Practical Theology'},
            {label:'Church History',value:'Church History'},{label:'Leadership',value:'Leadership'},
          ]} />
          <Input label="Subjects Assigned" value={form.subjectsAssigned || ''} onChange={v => uf('subjectsAssigned', v)} />
          <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Date of Joining</label><input type="date" value={form.dateOfJoining || ''} onChange={e => uf('dateOfJoining', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" /></div>
          <Select label="Employment Type" value={form.employmentType || ''} onChange={v => uf('employmentType', v)} options={[{label:'Full-time',value:'Full-time'},{label:'Part-time',value:'Part-time'},{label:'Visiting Faculty',value:'Visiting Faculty'},{label:'Guest',value:'Guest'}]} />
          <Input label="Experience" value={form.experience || ''} onChange={v => uf('experience', v)} placeholder="e.g., 15 years" />
        </div>
      );
      case 5: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Assigned Courses" value={form.assignedCourses || ''} onChange={v => uf('assignedCourses', v)} />
          <Input label="Class/Batch" value={form.classBatch || ''} onChange={v => uf('classBatch', v)} />
          <Input label="Weekly Schedule" value={form.weeklySchedule || ''} onChange={v => uf('weeklySchedule', v)} placeholder="e.g., Mon-Thu" />
          <Input label="Lecture Hours/Week" value={form.lectureHours || ''} onChange={v => uf('lectureHours', v)} />
          <Select label="Teaching Mode" value={form.teachingMode || ''} onChange={v => uf('teachingMode', v)} options={[{label:'In-person',value:'In-person'},{label:'Online',value:'Online'},{label:'Hybrid',value:'Hybrid'}]} />
        </div>
      );
      case 6: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Calling Type" value={form.callingType || ''} onChange={v => uf('callingType', v)} options={[{label:'Pastor',value:'Pastor'},{label:'Missionary',value:'Missionary'},{label:'Teacher',value:'Teacher'},{label:'Evangelist',value:'Evangelist'},{label:'Worship Leader',value:'Worship Leader'},{label:'Counselor',value:'Counselor'}]} />
          <Input label="Ministry Experience" value={form.ministryExperience || ''} onChange={v => uf('ministryExperience', v)} type="textarea" />
          <Input label="Current Ministry Role" value={form.currentMinistryRole || ''} onChange={v => uf('currentMinistryRole', v)} />
          <Input label="Church Leadership" value={form.churchLeadership || ''} onChange={v => uf('churchLeadership', v)} />
          <Input label="Field Experience" value={form.fieldExperience || ''} onChange={v => uf('fieldExperience', v)} type="textarea" />
        </div>
      );
      case 7: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Salary Structure" value={form.salaryStructure || ''} onChange={v => uf('salaryStructure', v)} />
          <Input label="Bank Details" value={form.bankDetails || ''} onChange={v => uf('bankDetails', v)} />
          <Select label="Payment Frequency" value={form.paymentFrequency || ''} onChange={v => uf('paymentFrequency', v)} options={[{label:'Monthly',value:'Monthly'},{label:'Quarterly',value:'Quarterly'},{label:'Per Lecture',value:'Per Lecture'}]} />
          <Input label="Allowances" value={form.allowances || ''} onChange={v => uf('allowances', v)} />
          <Input label="Deductions" value={form.deductions || ''} onChange={v => uf('deductions', v)} />
        </div>
      );
      case 8: return (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200"><p className="text-sm text-amber-800 font-medium">Document Upload Section</p><p className="text-xs text-amber-600 mt-1">Upload faculty documents for verification and records.</p></div>
          {['ID Proof','Certificates','Experience Letters','Ordination Certificate','Recommendations','CV/Resume'].map((doc, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
              <span className="text-sm font-medium text-slate-700">{doc}</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500">Pending</span>
            </div>
          ))}
        </div>
      );
      case 9: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Student Feedback" value={form.studentFeedback || ''} onChange={v => uf('studentFeedback', v)} placeholder="e.g., 4.8/5.0" />
          <Input label="Academic Metrics" value={form.academicMetrics || ''} onChange={v => uf('academicMetrics', v)} />
          <Input label="Spiritual Leadership" value={form.spiritualLeadership || ''} onChange={v => uf('spiritualLeadership', v)} />
          <Input label="Attendance Rate" value={form.attendance || ''} onChange={v => uf('attendance', v)} placeholder="e.g., 96%" />
          <Input label="Admin Ratings" value={form.adminRatings || ''} onChange={v => uf('adminRatings', v)} />
        </div>
      );
      default: return null;
    }
  };

  const renderViewSection = () => {
    if (!viewTeacher) return null;
    const t = viewTeacher;
    const Row = ({ label, value }: { label: string; value: string }) => (
      <div className="py-2.5 border-b border-slate-100 last:border-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-slate-800 mt-0.5">{value || '—'}</p>
      </div>
    );

    const sections = [
      { title: 'Overview', content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>{[['Full Name',t.fullName],['Employee ID',t.employeeId],['Gender',t.gender],['Date of Birth',t.dob],['Nationality',t.nationality],['Marital Status',t.maritalStatus]].map(([l,v])=><Row key={l as string} label={l as string} value={v as string} />)}</div>
          <div>{[['Role',t.role],['Department',t.department],['Employment Type',t.employmentType],['Date of Joining',t.dateOfJoining],['Experience',t.experience],['Status',t.status]].map(([l,v])=><Row key={l as string} label={l as string} value={v as string} />)}</div>
        </div>
      )},
      { title: 'Spiritual Profile', content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>{[['Church',t.church],['Baptism',t.baptismStatus],['Ministry Involvement',t.ministryInvolvement],['Years in Ministry',t.yearsInMinistry],['Spiritual Gifts',t.spiritualGifts]].map(([l,v])=><Row key={l as string} label={l as string} value={v as string} />)}</div>
          <div>{[['Testimony',t.testimony],['Statement of Faith',t.statementOfFaith]].map(([l,v])=><Row key={l as string} label={l as string} value={v as string} />)}</div>
        </div>
      )},
      { title: 'Academic', content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>{[['Highest Qualification',t.highestQual],['Theological Degree',t.theologicalDegree],['Seminary',t.seminary],['Year',t.degreeYear],['Specialization',t.specialization],['Certifications',t.certifications]].map(([l,v])=><Row key={l as string} label={l as string} value={v as string} />)}</div>
          <div>{[['Subjects',t.subjectsAssigned],['Assigned Courses',t.assignedCourses],['Weekly Schedule',t.weeklySchedule],['Lecture Hours',t.lectureHours],['Teaching Mode',t.teachingMode]].map(([l,v])=><Row key={l as string} label={l as string} value={v as string} />)}</div>
        </div>
      )},
      { title: 'Performance', content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>{[['Student Feedback',t.studentFeedback],['Academic Metrics',t.academicMetrics],['Spiritual Leadership',t.spiritualLeadership],['Attendance',t.attendance],['Admin Rating',t.adminRatings]].map(([l,v])=><Row key={l as string} label={l as string} value={v as string} />)}</div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">Overall Performance Score</p>
            <PerformanceBadge score={t.performanceScore} />
            <div className="mt-4 w-full max-w-xs space-y-2">
              {[['Teaching', 90],['Research', 85],['Spiritual', 95],['Admin', 88]].map(([l, v]) => (
                <div key={l as string} className="flex items-center gap-2"><span className="text-xs text-slate-500 w-16">{l as string}</span><div className="flex-1 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-500" style={{width:`${v}%`}} /></div><span className="text-xs text-slate-600 font-medium">{v}%</span></div>
              ))}
            </div>
          </div>
        </div>
      )},
    ];

    return sections[viewTab]?.content || sections[0].content;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-amber-600" /> Faculty Management
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Manage teachers, professors, and visiting faculty</p>
        </div>
        <button onClick={() => { setShowAddModal(true); setFormTab(0); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">
          <UserPlus className="h-4 w-4" /> Add Faculty
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Faculty', value: stats.total, icon: Users, color: 'bg-slate-900' },
          { label: 'Departments', value: stats.departments, icon: BookOpen, color: 'bg-blue-600' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'bg-emerald-600' },
          { label: 'On Leave', value: stats.onLeave, icon: Coffee, color: 'bg-amber-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `var(--tw-gradient-from, transparent)` }}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}><card.icon className="h-5 w-5 text-white" /></div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or employee ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
          </div>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white">
            {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
          </select>
        </div>
      </div>

      {/* Teacher Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Faculty</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">ID</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Department</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Role</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Performance</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden xl:table-cell">Status</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {t.fullName.replace(/^(Dr\.|Rev\.|Prof\.)\s*/, '').split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{t.fullName}</p>
                        <p className="text-xs text-slate-400 truncate">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 font-mono text-xs hidden md:table-cell">{t.employeeId}</td>
                  <td className="px-5 py-4 hidden lg:table-cell"><span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">{t.department}</span></td>
                  <td className="px-5 py-4 text-slate-600 text-xs hidden lg:table-cell">{t.role}</td>
                  <td className="px-5 py-4"><PerformanceBadge score={t.performanceScore} /></td>
                  <td className="px-5 py-4 hidden xl:table-cell">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${t.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => { setViewTeacher(t); setViewTab(0); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400"><Users className="h-10 w-10 mx-auto mb-3 opacity-40" /><p className="font-medium">No faculty found</p></div>
        )}
      </div>

      {/* ─── Add Faculty Modal ─────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 pt-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mb-8 animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div><h3 className="text-lg font-bold text-slate-900">Add New Faculty</h3><p className="text-sm text-slate-400">Complete faculty profile across all sections</p></div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="border-b border-slate-100 overflow-x-auto">
              <div className="flex px-4 gap-1 min-w-max">
                {formTabs.map((tab, i) => (
                  <button key={tab} onClick={() => setFormTab(i)} className={`px-3 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${formTab === i ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{tab}</button>
                ))}
              </div>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">{renderFormTab()}</div>
            <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <div>{formTab > 0 && <button onClick={() => setFormTab(formTab - 1)} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all"><ChevronLeft className="h-4 w-4" />Previous</button>}</div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all">Cancel</button>
                {formTab < formTabs.length - 1 ? (
                  <button onClick={() => setFormTab(formTab + 1)} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all">Next<ChevronRight className="h-4 w-4" /></button>
                ) : (
                  <button onClick={handleAdd} className="inline-flex items-center gap-1 px-5 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"><UserPlus className="h-4 w-4" />Add Faculty</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Faculty Modal ────────────────────────────────────────── */}
      {viewTeacher && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 pt-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mb-8 animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg">
                  {viewTeacher.fullName.replace(/^(Dr\.|Rev\.|Prof\.)\s*/, '').split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{viewTeacher.fullName}</h3>
                  <p className="text-sm text-slate-400">{viewTeacher.employeeId} · {viewTeacher.role} · {viewTeacher.department}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${viewTeacher.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{viewTeacher.status}</span>
                    <PerformanceBadge score={viewTeacher.performanceScore} />
                  </div>
                </div>
              </div>
              <button onClick={() => setViewTeacher(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="border-b border-slate-100 overflow-x-auto">
              <div className="flex px-6 gap-1 min-w-max">
                {['Overview','Spiritual Profile','Academic','Performance'].map((tab, i) => (
                  <button key={tab} onClick={() => setViewTab(i)} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${viewTab === i ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{tab}</button>
                ))}
              </div>
            </div>
            <div className="p-6 max-h-[50vh] overflow-y-auto">{renderViewSection()}</div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setViewTeacher(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all">Close</button>
              <button className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all"><Download className="h-4 w-4" />Export Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
