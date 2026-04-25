import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  GraduationCap, Users, UserPlus, Search, Filter, Eye, Edit3, X, ChevronLeft, ChevronRight,
  Phone, Mail, MapPin, Heart, BookOpen, Church, Calendar, FileText, DollarSign,
  AlertCircle, CheckCircle, Clock, Download, MoreVertical, UserCheck, UserX, Star
} from 'lucide-react';
import { getStudents, createStudent, getStudent, updateStudent, getToken } from '../../utils/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Student {
  id: string; enrollmentNo: string; fullName: string; gender: string; dob: string;
  nationality: string; bloodGroup: string; mobile: string; email: string;
  permanentAddress: string; currentAddress: string; emergencyContact: string; emergencyPhone: string;
  fatherName: string; motherName: string; guardian: string; occupation: string; familyBackground: string;
  conversionDate: string; baptismStatus: string; baptismDate: string; baptismChurch: string;
  currentChurch: string; pastorName: string; ministryInvolvement: string; spiritualGifts: string; testimony: string;
  prevQualification: string; schoolCollege: string; boardUniversity: string; year: string;
  marks: string; medium: string;
  program: string; department: string; admissionDate: string; academicYear: string;
  semester: string; mode: string;
  campus: string; hostelRequired: boolean; roomAllocation: string; transportRequired: boolean;
  feeStructure: string; scholarship: string; sponsorship: string; paymentPlan: string; feeStatus: string;
  healthConditions: string; allergies: string; disability: string; medicalCertificate: boolean;
  idProof: string; academicCerts: string; baptismCert: string; pastorRec: string; passportPhotos: boolean;
  callingType: string; ministryExperience: string; yearsOfService: string; preferredField: string; internshipInterest: string;
  admissionStatus: string; verifiedBy: string; remarks: string; approvalDate: string;
  profilePhoto: string;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────
const initialStudents: Student[] = [
  {
    id: '1', enrollmentNo: 'COV2024-001', fullName: 'Samuel Joshua Mathew', gender: 'Male', dob: '1998-05-14',
    nationality: 'Indian', bloodGroup: 'B+', mobile: '+91 98765 43210', email: 'samuel.mathew@covenant.edu',
    permanentAddress: '45, Gospel Street, Kottayam, Kerala 686001', currentAddress: 'Room 12, Boys Hostel, Covenant Seminary',
    emergencyContact: 'Mathew Thomas', emergencyPhone: '+91 94470 12345',
    fatherName: 'Mathew Thomas', motherName: 'Leela Mathew', guardian: 'Father', occupation: 'Teacher',
    familyBackground: 'Devout Christian family, actively involved in local church ministry',
    conversionDate: '2012-07-20', baptismStatus: 'Baptized', baptismDate: '2013-01-06', baptismChurch: 'St. Thomas Mar Thoma Church',
    currentChurch: 'Grace Community Church', pastorName: 'Rev. Dr. Philip Abraham', ministryInvolvement: 'Youth Worship Leader, Sunday School Teacher',
    spiritualGifts: 'Teaching, Leadership, Worship', testimony: 'Grew up in a Christian home. Had a personal encounter with Christ at a youth camp at age 14. Felt called to full-time ministry during college.',
    prevQualification: 'B.A. English Literature', schoolCollege: 'CMS College, Kottayam', boardUniversity: 'Mahatma Gandhi University',
    year: '2020', marks: '78%', medium: 'English',
    program: 'M.Div', department: 'Theology', admissionDate: '2024-06-01', academicYear: '2024-2025',
    semester: 'Semester 2', mode: 'Regular',
    campus: 'Main Campus', hostelRequired: true, roomAllocation: 'A-204', transportRequired: false,
    feeStructure: 'M.Div Regular', scholarship: 'Merit Scholarship - 25%', sponsorship: 'None', paymentPlan: 'Quarterly', feeStatus: 'Paid',
    healthConditions: 'None', allergies: 'None', disability: 'None', medicalCertificate: true,
    idProof: 'Aadhaar - Uploaded', academicCerts: 'Uploaded', baptismCert: 'Uploaded', pastorRec: 'Uploaded', passportPhotos: true,
    callingType: 'Pastor', ministryExperience: 'Youth Ministry Leader (2018-2024)', yearsOfService: '6', preferredField: 'Pastoral Ministry', internshipInterest: 'Yes - Summer Internship',
    admissionStatus: 'Approved', verifiedBy: 'Dr. John Chacko', remarks: 'Outstanding candidate with strong ministry background', approvalDate: '2024-05-15',
    profilePhoto: '',
  },
  {
    id: '2', enrollmentNo: 'COV2024-002', fullName: 'Grace Rebecca David', gender: 'Female', dob: '2000-11-03',
    nationality: 'Indian', bloodGroup: 'O+', mobile: '+91 87654 32109', email: 'grace.david@covenant.edu',
    permanentAddress: '12, Mission Road, Chennai, Tamil Nadu 600001', currentAddress: 'Room 5, Girls Hostel, Covenant Seminary',
    emergencyContact: 'David Rajan', emergencyPhone: '+91 94430 98765',
    fatherName: 'David Rajan', motherName: 'Rani David', guardian: 'Father', occupation: 'Business',
    familyBackground: 'Active church family, father is a deacon',
    conversionDate: '2015-03-10', baptismStatus: 'Baptized', baptismDate: '2015-12-25', baptismChurch: 'All Saints Church, Chennai',
    currentChurch: 'New Life Assembly', pastorName: 'Pastor Rajesh Kumar', ministryInvolvement: 'Children Ministry Volunteer',
    spiritualGifts: 'Mercy, Teaching, Administration', testimony: 'Came to faith through VBS at age 15. Passionate about children ministry and theological education.',
    prevQualification: 'B.Sc. Psychology', schoolCollege: 'Loyola College, Chennai', boardUniversity: 'University of Madras',
    year: '2021', marks: '82%', medium: 'English',
    program: 'B.Th', department: 'Theology', admissionDate: '2024-06-01', academicYear: '2024-2025',
    semester: 'Semester 2', mode: 'Regular',
    campus: 'Main Campus', hostelRequired: true, roomAllocation: 'B-108', transportRequired: true,
    feeStructure: 'B.Th Regular', scholarship: 'Need-based - 40%', sponsorship: 'Children Mission Fund', paymentPlan: 'Monthly', feeStatus: 'Partial',
    healthConditions: 'None', allergies: 'Dust', disability: 'None', medicalCertificate: true,
    idProof: 'Aadhaar - Uploaded', academicCerts: 'Uploaded', baptismCert: 'Uploaded', pastorRec: 'Uploaded', passportPhotos: true,
    callingType: 'Teacher', ministryExperience: 'Sunday School Teacher (2019-present)', yearsOfService: '5', preferredField: 'Christian Education', internshipInterest: 'Yes',
    admissionStatus: 'Approved', verifiedBy: 'Dr. John Chacko', remarks: 'Excellent academic record', approvalDate: '2024-05-18',
    profilePhoto: '',
  },
  {
    id: '3', enrollmentNo: 'COV2024-003', fullName: 'Daniel Prasad Rao', gender: 'Male', dob: '1995-08-22',
    nationality: 'Indian', bloodGroup: 'A+', mobile: '+91 76543 21098', email: 'daniel.rao@covenant.edu',
    permanentAddress: '78, Baptist Lane, Hyderabad, Telangana 500001', currentAddress: 'Room 8, Boys Hostel, Covenant Seminary',
    emergencyContact: 'Prasad Rao', emergencyPhone: '+91 94410 56789',
    fatherName: 'Prasad Rao', motherName: 'Sunita Rao', guardian: 'Self', occupation: 'Engineer (former)',
    familyBackground: 'Middle class Hindu background, converted to Christianity',
    conversionDate: '2018-04-15', baptismStatus: 'Baptized', baptismDate: '2018-10-02', baptismChurch: 'Calvary Baptist Church',
    currentChurch: 'Calvary Baptist Church', pastorName: 'Rev. Dr. Timothy George', ministryInvolvement: 'Evangelism Team Lead',
    spiritualGifts: 'Evangelism, Exhortation, Faith', testimony: 'Former software engineer who came to faith through a campus ministry. Felt God calling to leave IT and pursue full-time ministry.',
    prevQualification: 'B.Tech Computer Science', schoolCollege: 'JNTU Hyderabad', boardUniversity: 'Jawaharlal Nehru Technological University',
    year: '2017', marks: '74%', medium: 'English',
    program: 'M.Div', department: 'Missiology', admissionDate: '2024-06-01', academicYear: '2024-2025',
    semester: 'Semester 2', mode: 'Regular',
    campus: 'Main Campus', hostelRequired: true, roomAllocation: 'A-112', transportRequired: false,
    feeStructure: 'M.Div Regular', scholarship: 'None', sponsorship: 'Self-sponsored', paymentPlan: 'Full Year', feeStatus: 'Paid',
    healthConditions: 'None', allergies: 'None', disability: 'None', medicalCertificate: true,
    idProof: 'Aadhaar - Uploaded', academicCerts: 'Uploaded', baptismCert: 'Uploaded', pastorRec: 'Uploaded', passportPhotos: true,
    callingType: 'Missionary', ministryExperience: 'Campus Evangelist (2019-2024)', yearsOfService: '5', preferredField: 'Cross-cultural Missions', internshipInterest: 'Yes - Tribal Mission',
    admissionStatus: 'Approved', verifiedBy: 'Dr. Sarah Williams', remarks: 'Strong calling to missions, tech-savvy', approvalDate: '2024-05-20',
    profilePhoto: '',
  },
  {
    id: '4', enrollmentNo: 'COV2025-004', fullName: 'Ruth Anne Joseph', gender: 'Female', dob: '2001-02-14',
    nationality: 'Indian', bloodGroup: 'AB+', mobile: '+91 65432 10987', email: 'ruth.joseph@covenant.edu',
    permanentAddress: '23, Grace Avenue, Bangalore, Karnataka 560001', currentAddress: 'Room 9, Girls Hostel',
    emergencyContact: 'Joseph Kurien', emergencyPhone: '+91 94450 23456',
    fatherName: 'Joseph Kurien', motherName: 'Susan Joseph', guardian: 'Father', occupation: 'Pastor',
    familyBackground: 'Pastor family, grew up in parsonage',
    conversionDate: '2010-06-01', baptismStatus: 'Baptized', baptismDate: '2011-04-10', baptismChurch: 'Bethel AG Church',
    currentChurch: 'Bethel AG Church', pastorName: 'Rev. Joseph Kurien (Father)', ministryInvolvement: 'Worship Team, Youth Leader',
    spiritualGifts: 'Music, Prophecy, Shepherding', testimony: 'PK (Pastor Kid) who made faith her own at age 9. Gifted in music and worship leading.',
    prevQualification: 'B.A. Music', schoolCollege: 'Christ University, Bangalore', boardUniversity: 'Christ University',
    year: '2022', marks: '85%', medium: 'English',
    program: 'Diploma', department: 'Worship Studies', admissionDate: '2025-06-01', academicYear: '2025-2026',
    semester: 'Semester 1', mode: 'Regular',
    campus: 'Main Campus', hostelRequired: true, roomAllocation: 'B-205', transportRequired: false,
    feeStructure: 'Diploma Regular', scholarship: 'Pastor Family Grant - 30%', sponsorship: 'Home Church', paymentPlan: 'Quarterly', feeStatus: 'Due',
    healthConditions: 'Mild asthma', allergies: 'Pollen', disability: 'None', medicalCertificate: true,
    idProof: 'Aadhaar - Pending', academicCerts: 'Uploaded', baptismCert: 'Uploaded', pastorRec: 'Uploaded', passportPhotos: true,
    callingType: 'Worship Leader', ministryExperience: 'Worship Leader (2018-present)', yearsOfService: '7', preferredField: 'Worship & Creative Arts', internshipInterest: 'Yes',
    admissionStatus: 'Pending', verifiedBy: '', remarks: 'Awaiting final document verification', approvalDate: '',
    profilePhoto: '',
  },
  {
    id: '5', enrollmentNo: 'COV2024-005', fullName: 'Emmanuel Thankachan', gender: 'Male', dob: '1997-12-25',
    nationality: 'Indian', bloodGroup: 'O-', mobile: '+91 54321 09876', email: 'emmanuel.tk@covenant.edu',
    permanentAddress: '56, Cross Road, Thiruvalla, Kerala 689001', currentAddress: 'Room 3, Boys Hostel',
    emergencyContact: 'Thankachan Kuriakose', emergencyPhone: '+91 94420 67890',
    fatherName: 'Thankachan Kuriakose', motherName: 'Mariamma Thankachan', guardian: 'Father', occupation: 'Farmer',
    familyBackground: 'Humble farming family, active in Brethren assembly',
    conversionDate: '2011-08-15', baptismStatus: 'Baptized', baptismDate: '2012-02-12', baptismChurch: 'Bethany Brethren Assembly',
    currentChurch: 'Hebron Brethren Assembly', pastorName: 'Bro. Varghese Mathew', ministryInvolvement: 'Gospel Team, Bible Study Leader',
    spiritualGifts: 'Teaching, Knowledge, Discernment', testimony: 'Came to faith through Gospel meetings in his village. Developed deep love for Scripture study.',
    prevQualification: 'B.Com', schoolCollege: 'Catholicate College, Pathanamthitta', boardUniversity: 'Mahatma Gandhi University',
    year: '2018', marks: '71%', medium: 'English',
    program: 'B.Th', department: 'Biblical Studies', admissionDate: '2024-06-01', academicYear: '2024-2025',
    semester: 'Semester 2', mode: 'Regular',
    campus: 'Main Campus', hostelRequired: true, roomAllocation: 'A-301', transportRequired: true,
    feeStructure: 'B.Th Regular', scholarship: 'Need-based - 50%', sponsorship: 'Friends Missionary Prayer Band', paymentPlan: 'Monthly', feeStatus: 'Partial',
    healthConditions: 'None', allergies: 'None', disability: 'None', medicalCertificate: true,
    idProof: 'Aadhaar - Uploaded', academicCerts: 'Uploaded', baptismCert: 'Uploaded', pastorRec: 'Uploaded', passportPhotos: true,
    callingType: 'Evangelist', ministryExperience: 'Gospel Team Member (2016-present)', yearsOfService: '8', preferredField: 'Rural Ministry', internshipInterest: 'Yes - Village Ministry',
    admissionStatus: 'Approved', verifiedBy: 'Dr. John Chacko', remarks: 'Dedicated student, excellent in biblical languages', approvalDate: '2024-05-22',
    profilePhoto: '',
  },
  {
    id: '6', enrollmentNo: 'COV2024-006', fullName: 'Priya Christina Singh', gender: 'Female', dob: '1999-04-08',
    nationality: 'Indian', bloodGroup: 'B-', mobile: '+91 43210 98765', email: 'priya.singh@covenant.edu',
    permanentAddress: '89, Church Lane, Delhi 110001', currentAddress: 'Room 2, Girls Hostel',
    emergencyContact: 'Rajendra Singh', emergencyPhone: '+91 94480 34567',
    fatherName: 'Rajendra Singh', motherName: 'Christina Singh', guardian: 'Father', occupation: 'Government Officer',
    familyBackground: 'Punjabi Christian family, active in Delhi Pentecostal church',
    conversionDate: '2013-01-01', baptismStatus: 'Baptized', baptismDate: '2014-06-22', baptismChurch: 'Full Gospel Church, Delhi',
    currentChurch: 'Full Gospel Church', pastorName: 'Rev. Dr. Mohan Lal', ministryInvolvement: 'Women Fellowship, Counseling',
    spiritualGifts: 'Counseling, Mercy, Exhortation', testimony: 'Grew up in Christian home, actively involved in women ministry and counseling.',
    prevQualification: 'M.A. Psychology', schoolCollege: 'Delhi University', boardUniversity: 'University of Delhi',
    year: '2021', marks: '80%', medium: 'English',
    program: 'M.Div', department: 'Counseling', admissionDate: '2024-06-01', academicYear: '2024-2025',
    semester: 'Semester 2', mode: 'Regular',
    campus: 'Main Campus', hostelRequired: true, roomAllocation: 'B-301', transportRequired: false,
    feeStructure: 'M.Div Regular', scholarship: 'None', sponsorship: 'Self-sponsored', paymentPlan: 'Quarterly', feeStatus: 'Paid',
    healthConditions: 'None', allergies: 'Medication: Penicillin', disability: 'None', medicalCertificate: true,
    idProof: 'Aadhaar - Uploaded', academicCerts: 'Uploaded', baptismCert: 'Uploaded', pastorRec: 'Uploaded', passportPhotos: true,
    callingType: 'Pastor', ministryExperience: 'Youth Counselor (2020-present)', yearsOfService: '4', preferredField: 'Christian Counseling', internshipInterest: 'Yes - Church Counseling',
    admissionStatus: 'Approved', verifiedBy: 'Dr. Sarah Williams', remarks: 'Combining psychology with theology - unique calling', approvalDate: '2024-05-25',
    profilePhoto: '',
  },
  {
    id: '7', enrollmentNo: 'COV2025-007', fullName: 'Thomas Ignatius D\'Souza', gender: 'Male', dob: '2000-09-17',
    nationality: 'Indian', bloodGroup: 'A-', mobile: '+91 32109 87654', email: 'thomas.dsouza@covenant.edu',
    permanentAddress: '34, St. Anthony Road, Mumbai, Maharashtra 400001', currentAddress: 'Off-campus',
    emergencyContact: 'Ignatius D\'Souza', emergencyPhone: '+91 94490 45678',
    fatherName: 'Ignatius D\'Souza', motherName: 'Teresa D\'Souza', guardian: 'Father', occupation: 'Doctor',
    familyBackground: 'Catholic family, father is a renowned physician',
    conversionDate: '2016-11-01', baptismStatus: 'Baptized', baptismDate: '2000-11-19', baptismChurch: 'St. Peter\'s Church, Mumbai',
    currentChurch: 'New Covenant Fellowship', pastorName: 'Pastor Sunil Patel', ministryInvolvement: 'Street Ministry, Drug Rehabilitation',
    spiritualGifts: 'Healing, Mercy, Evangelism', testimony: 'Catholic background, had a transformative experience at a Protestant retreat. Called to serve the marginalized.',
    prevQualification: 'B.Sc. Nursing', schoolCollege: 'Bombay Hospital College', boardUniversity: 'Maharashtra University of Health Sciences',
    year: '2022', marks: '76%', medium: 'English',
    program: 'B.Th', department: 'Practical Theology', admissionDate: '2025-06-01', academicYear: '2025-2026',
    semester: 'Semester 1', mode: 'Online',
    campus: 'Distance Learning', hostelRequired: false, roomAllocation: 'N/A', transportRequired: false,
    feeStructure: 'B.Th Online', scholarship: 'None', sponsorship: 'Self-sponsored', paymentPlan: 'Full Year', feeStatus: 'Paid',
    healthConditions: 'None', allergies: 'None', disability: 'None', medicalCertificate: true,
    idProof: 'Aadhaar - Uploaded', academicCerts: 'Uploaded', baptismCert: 'Uploaded', pastorRec: 'Uploaded', passportPhotos: true,
    callingType: 'Pastor', ministryExperience: 'Drug Rehab Volunteer (2020-present)', yearsOfService: '4', preferredField: 'Social Justice Ministry', internshipInterest: 'No',
    admissionStatus: 'Pending', verifiedBy: '', remarks: 'Online applicant - document review in progress', approvalDate: '',
    profilePhoto: '',
  },
  {
    id: '8', enrollmentNo: 'COV2024-008', fullName: 'Arun Kumar Verma', gender: 'Male', dob: '1996-03-30',
    nationality: 'Nepalese', bloodGroup: 'O+', mobile: '+977 98412 34567', email: 'arun.verma@covenant.edu',
    permanentAddress: '45, Bhatbhateni, Kathmandu, Nepal', currentAddress: 'Room 15, Boys Hostel',
    emergencyContact: 'Kumar Verma', emergencyPhone: '+977 98512 45678',
    fatherName: 'Kumar Verma', motherName: 'Sita Verma', guardian: 'Self', occupation: 'Government Teacher (former)',
    familyBackground: 'Hindu background, first Christian in family',
    conversionDate: '2017-09-12', baptismStatus: 'Baptized', baptismDate: '2018-03-15', baptismChurch: 'Kathmandu Baptist Church',
    currentChurch: 'Nepal Christian Fellowship', pastorName: 'Rev. Deepak Sharma', ministryInvolvement: 'Church Planting, Literacy Program',
    spiritualGifts: 'Apostleship, Administration, Faith', testimony: 'Former government teacher who found Christ through a missionary. Now called to plant churches in remote Nepal.',
    prevQualification: 'M.A. Education', schoolCollege: 'Tribhuvan University', boardUniversity: 'Tribhuvan University, Nepal',
    year: '2018', marks: '79%', medium: 'English',
    program: 'M.Div', department: 'Missiology', admissionDate: '2024-06-01', academicYear: '2024-2025',
    semester: 'Semester 2', mode: 'Regular',
    campus: 'Main Campus', hostelRequired: true, roomAllocation: 'A-108', transportRequired: false,
    feeStructure: 'M.Div Regular', scholarship: 'International Student Grant - 60%', sponsorship: 'Nepal Mission Society', paymentPlan: 'Quarterly', feeStatus: 'Paid',
    healthConditions: 'None', allergies: 'None', disability: 'None', medicalCertificate: true,
    idProof: 'Passport - Uploaded', academicCerts: 'Uploaded', baptismCert: 'Uploaded', pastorRec: 'Uploaded', passportPhotos: true,
    callingType: 'Missionary', ministryExperience: 'Church Planter (2019-present)', yearsOfService: '5', preferredField: 'Nepal/Tibet Missions', internshipInterest: 'Yes - Nepal Trip',
    admissionStatus: 'Approved', verifiedBy: 'Dr. John Chacko', remarks: 'International student with exceptional vision for Nepal', approvalDate: '2024-05-28',
    profilePhoto: '',
  },
  {
    id: '9', enrollmentNo: 'COV2025-009', fullName: 'Mary Jessinta Cherian', gender: 'Female', dob: '2002-07-19',
    nationality: 'Indian', bloodGroup: 'A+', mobile: '+91 21098 76543', email: 'mary.cherian@covenant.edu',
    permanentAddress: '67, Hill View, Kodaikanal, Tamil Nadu 624101', currentAddress: 'Room 11, Girls Hostel',
    emergencyContact: 'Cherian Philip', emergencyPhone: '+91 94460 78901',
    fatherName: 'Cherian Philip', motherName: 'Rachel Cherian', guardian: 'Father', occupation: 'Retired Professor',
    familyBackground: 'Academic Christian family, grandfather was a missionary',
    conversionDate: '2014-12-25', baptismStatus: 'Baptized', baptismDate: '2015-07-05', baptismChurch: 'CSI Church, Kodaikanal',
    currentChurch: 'CSI Church', pastorName: 'Rev. Samuel Sundaram', ministryInvolvement: 'VBS Coordinator, Choir',
    spiritualGifts: 'Teaching, Writing, Organization', testimony: 'Third generation Christian with missionary heritage. Feels called to theological education and writing.',
    prevQualification: 'B.A. History', schoolCollege: 'Lady Doak College, Madurai', boardUniversity: 'Madurai Kamaraj University',
    year: '2023', marks: '88%', medium: 'English',
    program: 'B.Th', department: 'Church History', admissionDate: '2025-06-01', academicYear: '2025-2026',
    semester: 'Semester 1', mode: 'Regular',
    campus: 'Main Campus', hostelRequired: true, roomAllocation: 'B-110', transportRequired: true,
    feeStructure: 'B.Th Regular', scholarship: 'Academic Excellence - 35%', sponsorship: 'None', paymentPlan: 'Quarterly', feeStatus: 'Due',
    healthConditions: 'None', allergies: 'None', disability: 'None', medicalCertificate: true,
    idProof: 'Aadhaar - Uploaded', academicCerts: 'Uploaded', baptismCert: 'Uploaded', pastorRec: 'Pending', passportPhotos: true,
    callingType: 'Teacher', ministryExperience: 'VBS Teacher (2018-present)', yearsOfService: '6', preferredField: 'Church History & Theology', internshipInterest: 'Yes - Research',
    admissionStatus: 'Pending', verifiedBy: '', remarks: 'Awaiting pastor recommendation letter', approvalDate: '',
    profilePhoto: '',
  },
  {
    id: '10', enrollmentNo: 'COV2024-010', fullName: 'James Chandra Bose', gender: 'Male', dob: '1993-01-11',
    nationality: 'Indian', bloodGroup: 'B+', mobile: '+91 10987 65432', email: 'james.bose@covenant.edu',
    permanentAddress: '12, MG Road, Kolkata, West Bengal 700001', currentAddress: 'Married Housing - Unit 4',
    emergencyContact: 'Lakshmi Bose', emergencyPhone: '+91 94470 89012',
    fatherName: 'Chandra Bose', motherName: 'Annapurna Bose', guardian: 'Self', occupation: 'Business (former)',
    familyBackground: 'Bengali Christian family, married with one child',
    conversionDate: '2008-10-15', baptismStatus: 'Baptized', baptismDate: '2009-04-03', baptismChurch: 'St. Paul\'s Cathedral, Kolkata',
    currentChurch: 'City Church Kolkata', pastorName: 'Rev. Dr. Subir Sarkar', ministryInvolvement: 'Men Fellowship, Business Ministry',
    spiritualGifts: 'Leadership, Administration, Giving', testimony: 'Former businessman who surrendered to full-time ministry after attending a pastor conference. Left lucrative business to serve God.',
    prevQualification: 'MBA', schoolCollege: 'IIM Kolkata', boardUniversity: 'Indian Institute of Management',
    year: '2016', marks: '77%', medium: 'English',
    program: 'M.Div', department: 'Leadership', admissionDate: '2024-06-01', academicYear: '2024-2025',
    semester: 'Semester 2', mode: 'Regular',
    campus: 'Main Campus', hostelRequired: false, roomAllocation: 'Married Unit 4', transportRequired: false,
    feeStructure: 'M.Div Regular', scholarship: 'None', sponsorship: 'Self-sponsored (savings)', paymentPlan: 'Full Year', feeStatus: 'Paid',
    healthConditions: 'None', allergies: 'None', disability: 'None', medicalCertificate: true,
    idProof: 'Aadhaar - Uploaded', academicCerts: 'Uploaded', baptismCert: 'Uploaded', pastorRec: 'Uploaded', passportPhotos: true,
    callingType: 'Pastor', ministryExperience: 'Business Ministry Leader (2018-2024)', yearsOfService: '6', preferredField: 'Church Planting & Leadership', internshipInterest: 'No',
    admissionStatus: 'Approved', verifiedBy: 'Dr. John Chacko', remarks: 'Mature candidate with strong business and leadership background', approvalDate: '2024-05-30',
    profilePhoto: '',
  },
];

// ─── Profile Completion Helper ───────────────────────────────────────────────
function calcCompletion(s: Student): number {
  let filled = 0; let total = 0;
  const fields: (keyof Student)[] = ['fullName','gender','dob','nationality','bloodGroup','mobile','email','permanentAddress',
    'emergencyContact','fatherName','motherName','conversionDate','baptismStatus','currentChurch','pastorName',
    'prevQualification','schoolCollege','program','department','admissionDate','academicYear','semester','mode',
    'callingType','ministryExperience'];
  total = fields.length;
  for (const f of fields) { if (s[f] && String(s[f]).trim() !== '') filled++; }
  return Math.round((filled / total) * 100);
}

// ─── Tab Config ──────────────────────────────────────────────────────────────
const formTabs = ['Basic Info','Contact','Family/Guardian','Spiritual Info','Academic','Course Enrollment',
  'Institutional','Financial','Medical','Documents','Ministry & Calling','Admin Section'];

const statusBadge = (status: string) => {
  if (status === 'Approved') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700"><CheckCircle className="h-3 w-3" />{status}</span>;
  if (status === 'Pending') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700"><Clock className="h-3 w-3" />{status}</span>;
  if (status === 'Rejected') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700"><UserX className="h-3 w-3" />{status}</span>;
  return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600">{status}</span>;
};

const feeBadge = (status: string) => {
  if (status === 'Paid') return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">{status}</span>;
  if (status === 'Partial') return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700">{status}</span>;
  if (status === 'Due') return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700">{status}</span>;
  return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600">{status}</span>;
};

// ─── Form Input Helper ───────────────────────────────────────────────────────
function Input({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none" rows={3} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all bg-white">
        <option value="">Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Toast helper ──────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in ${
      type === 'success' ? 'bg-[#2D6A4F] text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="h-3.5 w-3.5" /></button>
    </div>
  );
}

// ─── snake_case to camelCase mapper ──────────────────────────────────────────
function mapStudentFromApi(raw: any): Student {
  return {
    id: raw.id || String(raw.id),
    enrollmentNo: raw.enrollment_no || raw.enrollmentNo || '',
    fullName: raw.full_name || raw.fullName || '',
    gender: raw.gender || '',
    dob: raw.dob || raw.date_of_birth || '',
    nationality: raw.nationality || '',
    bloodGroup: raw.blood_group || raw.bloodGroup || '',
    mobile: raw.mobile || raw.phone || '',
    email: raw.email || '',
    permanentAddress: raw.permanent_address || raw.permanentAddress || '',
    currentAddress: raw.current_address || raw.currentAddress || '',
    emergencyContact: raw.emergency_contact || raw.emergencyContact || '',
    emergencyPhone: raw.emergency_phone || raw.emergencyPhone || '',
    fatherName: raw.father_name || raw.fatherName || '',
    motherName: raw.mother_name || raw.motherName || '',
    guardian: raw.guardian || '',
    occupation: raw.occupation || '',
    familyBackground: raw.family_background || raw.familyBackground || '',
    conversionDate: raw.conversion_date || raw.conversionDate || '',
    baptismStatus: raw.baptism_status || raw.baptismStatus || '',
    baptismDate: raw.baptism_date || raw.baptismDate || '',
    baptismChurch: raw.baptism_church || raw.baptismChurch || '',
    currentChurch: raw.current_church || raw.currentChurch || '',
    pastorName: raw.pastor_name || raw.pastorName || '',
    ministryInvolvement: raw.ministry_involvement || raw.ministryInvolvement || '',
    spiritualGifts: raw.spiritual_gifts || raw.spiritualGifts || '',
    testimony: raw.testimony || '',
    prevQualification: raw.prev_qualification || raw.prevQualification || '',
    schoolCollege: raw.school_college || raw.schoolCollege || '',
    boardUniversity: raw.board_university || raw.boardUniversity || '',
    year: raw.year || '',
    marks: raw.marks || '',
    medium: raw.medium || '',
    program: raw.program || '',
    department: raw.department || '',
    admissionDate: raw.admission_date || raw.admissionDate || '',
    academicYear: raw.academic_year || raw.academicYear || '',
    semester: raw.semester || '',
    mode: raw.mode || '',
    campus: raw.campus || '',
    hostelRequired: raw.hostel_required ?? raw.hostelRequired ?? false,
    roomAllocation: raw.room_allocation || raw.roomAllocation || '',
    transportRequired: raw.transport_required ?? raw.transportRequired ?? false,
    feeStructure: raw.fee_structure || raw.feeStructure || '',
    scholarship: raw.scholarship || '',
    sponsorship: raw.sponsorship || '',
    paymentPlan: raw.payment_plan || raw.paymentPlan || '',
    feeStatus: raw.fee_status || raw.feeStatus || '',
    healthConditions: raw.health_conditions || raw.healthConditions || '',
    allergies: raw.allergies || '',
    disability: raw.disability || '',
    medicalCertificate: raw.medical_certificate ?? raw.medicalCertificate ?? false,
    idProof: raw.id_proof || raw.idProof || '',
    academicCerts: raw.academic_certs || raw.academicCerts || '',
    baptismCert: raw.baptism_cert || raw.baptismCert || '',
    pastorRec: raw.pastor_rec || raw.pastorRec || '',
    passportPhotos: raw.passport_photos ?? raw.passportPhotos ?? false,
    callingType: raw.calling_type || raw.callingType || '',
    ministryExperience: raw.ministry_experience || raw.ministryExperience || '',
    yearsOfService: raw.years_of_service || raw.yearsOfService || '',
    preferredField: raw.preferred_field || raw.preferredField || '',
    internshipInterest: raw.internship_interest || raw.internshipInterest || '',
    admissionStatus: raw.admission_status || raw.admissionStatus || '',
    verifiedBy: raw.verified_by || raw.verifiedBy || '',
    remarks: raw.remarks || '',
    approvalDate: raw.approval_date || raw.approvalDate || '',
    profilePhoto: raw.profile_photo || raw.profilePhoto || '',
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [filterProgram, setFilterProgram] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [formTab, setFormTab] = useState(0);
  const [viewTab, setViewTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New student form state
  const [form, setForm] = useState<Partial<Student>>({
    fullName: '', gender: 'Male', dob: '', nationality: 'Indian', bloodGroup: '', mobile: '', email: '',
    permanentAddress: '', currentAddress: '', emergencyContact: '', emergencyPhone: '',
    fatherName: '', motherName: '', guardian: 'Father', occupation: '', familyBackground: '',
    conversionDate: '', baptismStatus: 'Unbaptized', baptismDate: '', baptismChurch: '',
    currentChurch: '', pastorName: '', ministryInvolvement: '', spiritualGifts: '', testimony: '',
    prevQualification: '', schoolCollege: '', boardUniversity: '', year: '', marks: '', medium: 'English',
    program: 'B.Th', department: '', admissionDate: '2025-06-01', academicYear: '2025-2026',
    semester: 'Semester 1', mode: 'Regular',
    campus: 'Main Campus', hostelRequired: false, roomAllocation: '', transportRequired: false,
    feeStructure: '', scholarship: 'None', sponsorship: '', paymentPlan: 'Quarterly', feeStatus: 'Due',
    healthConditions: '', allergies: '', disability: '', medicalCertificate: false,
    idProof: '', academicCerts: '', baptismCert: '', pastorRec: '', passportPhotos: false,
    callingType: 'Pastor', ministryExperience: '', yearsOfService: '', preferredField: '', internshipInterest: '',
    admissionStatus: 'Pending', verifiedBy: '', remarks: '', approvalDate: '',
    profilePhoto: '',
  });

  const uf = (field: string, val: string | boolean) => setForm(prev => ({ ...prev, [field]: val }));

  // ─── API fetch students ────────────────────────────────────────────────
  const fetchStudents = useCallback(async (searchTerm?: string, statusFilter?: string) => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      const data = await getStudents(params);
      if (data && Array.isArray(data.students)) {
        setStudents(data.students.map(mapStudentFromApi));
      } else if (Array.isArray(data)) {
        setStudents(data.map(mapStudentFromApi));
      }
    } catch (err) {
      console.warn('Failed to fetch students, using fallback data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { fetchStudents(search, filterStatus); }, [search, filterStatus, fetchStudents]);

  // Summary stats
  const stats = useMemo(() => ({
    total: students.length,
    newMonth: students.filter(s => s.admissionDate.startsWith('2025')).length,
    active: students.filter(s => s.admissionStatus === 'Approved').length,
    pending: students.filter(s => s.admissionStatus === 'Pending').length,
  }), [students]);

  // Filtered students
  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchSearch = search === '' || s.fullName.toLowerCase().includes(search.toLowerCase()) || s.enrollmentNo.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
      const matchProgram = filterProgram === 'All' || s.program === filterProgram;
      const matchStatus = filterStatus === 'All' || s.admissionStatus === filterStatus;
      return matchSearch && matchProgram && matchStatus;
    });
  }, [students, search, filterProgram, filterStatus]);

  const handleAdd = async () => {
    const token = getToken();
    setSaving(true);
    try {
      if (!token) {
        setToast({ message: 'Unable to create student: not authenticated', type: 'error' });
        setSaving(false);
        return;
      }
      // Send camelCase directly — backend expects camelCase
      const apiData: any = {};
      for (const [key, val] of Object.entries(form)) {
        if (val === '' || val === undefined || val === null) continue;
        apiData[key] = val;
      }
      await createStudent(apiData);
      setToast({ message: 'Student created successfully', type: 'success' });
      setShowAddModal(false);
      setForm({ fullName: '', gender: 'Male', dob: '', nationality: 'Indian', bloodGroup: '', mobile: '', email: '',
        permanentAddress: '', currentAddress: '', emergencyContact: '', emergencyPhone: '',
        fatherName: '', motherName: '', guardian: 'Father', occupation: '', familyBackground: '',
        conversionDate: '', baptismStatus: 'Unbaptized', baptismDate: '', baptismChurch: '',
        currentChurch: '', pastorName: '', ministryInvolvement: '', spiritualGifts: '', testimony: '',
        prevQualification: '', schoolCollege: '', boardUniversity: '', year: '', marks: '', medium: 'English',
        program: 'B.Th', department: '', admissionDate: '2025-06-01', academicYear: '2025-2026',
        semester: 'Semester 1', mode: 'Regular',
        campus: 'Main Campus', hostelRequired: false, roomAllocation: '', transportRequired: false,
        feeStructure: '', scholarship: 'None', sponsorship: '', paymentPlan: 'Quarterly', feeStatus: 'Due',
        healthConditions: '', allergies: '', disability: '', medicalCertificate: false,
        idProof: '', academicCerts: '', baptismCert: '', pastorRec: '', passportPhotos: false,
        callingType: 'Pastor', ministryExperience: '', yearsOfService: '', preferredField: '', internshipInterest: '',
        admissionStatus: 'Pending', verifiedBy: '', remarks: '', approvalDate: '', profilePhoto: '',
      });
      fetchStudents();
    } catch (err: any) {
      setToast({ message: err?.message || 'Failed to create student', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ─── Form Tab Renderer ─────────────────────────────────────────────────
  const renderFormTab = () => {
    switch (formTab) {
      case 0: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Full Name" value={form.fullName || ''} onChange={v => uf('fullName', v)} placeholder="Enter full name" />
          <Select label="Gender" value={form.gender || ''} onChange={v => uf('gender', v)} options={[{label:'Male',value:'Male'},{label:'Female',value:'Female'}]} />
          <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Date of Birth</label><input type="date" value={form.dob || ''} onChange={e => uf('dob', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" /></div>
          <Select label="Nationality" value={form.nationality || ''} onChange={v => uf('nationality', v)} options={[{label:'Indian',value:'Indian'},{label:'Nepalese',value:'Nepalese'},{label:'Bangladeshi',value:'Bangladeshi'},{label:'Sri Lankan',value:'Sri Lankan'},{label:'Other',value:'Other'}]} />
          <Select label="Blood Group" value={form.bloodGroup || ''} onChange={v => uf('bloodGroup', v)} options={['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => ({label:b,value:b}))} />
          <Input label="Aadhaar / ID Number" value={form.idProof || ''} onChange={v => uf('idProof', v)} placeholder="ID number" />
        </div>
      );
      case 1: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Mobile" value={form.mobile || ''} onChange={v => uf('mobile', v)} placeholder="+91 XXXXX XXXXX" />
          <Input label="Email" value={form.email || ''} onChange={v => uf('email', v)} placeholder="email@example.com" type="email" />
          <div className="col-span-1 md:col-span-2"><Input label="Permanent Address" value={form.permanentAddress || ''} onChange={v => uf('permanentAddress', v)} placeholder="Full address" type="textarea" /></div>
          <div className="col-span-1 md:col-span-2"><Input label="Current Address" value={form.currentAddress || ''} onChange={v => uf('currentAddress', v)} placeholder="Current address" type="textarea" /></div>
          <Input label="Emergency Contact Name" value={form.emergencyContact || ''} onChange={v => uf('emergencyContact', v)} />
          <Input label="Emergency Contact Phone" value={form.emergencyPhone || ''} onChange={v => uf('emergencyPhone', v)} />
        </div>
      );
      case 2: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Father's Name" value={form.fatherName || ''} onChange={v => uf('fatherName', v)} />
          <Input label="Mother's Name" value={form.motherName || ''} onChange={v => uf('motherName', v)} />
          <Select label="Guardian" value={form.guardian || ''} onChange={v => uf('guardian', v)} options={[{label:'Father',value:'Father'},{label:'Mother',value:'Mother'},{label:'Self',value:'Self'},{label:'Other',value:'Other'}]} />
          <Input label="Occupation (Guardian)" value={form.occupation || ''} onChange={v => uf('occupation', v)} />
          <div className="col-span-1 md:col-span-2"><Input label="Family Background" value={form.familyBackground || ''} onChange={v => uf('familyBackground', v)} type="textarea" placeholder="Brief family and spiritual background" /></div>
        </div>
      );
      case 3: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Date of Conversion</label><input type="date" value={form.conversionDate || ''} onChange={e => uf('conversionDate', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" /></div>
          <Select label="Baptism Status" value={form.baptismStatus || ''} onChange={v => uf('baptismStatus', v)} options={[{label:'Baptized',value:'Baptized'},{label:'Unbaptized',value:'Unbaptized'},{label:'Awaiting',value:'Awaiting'}]} />
          <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Baptism Date</label><input type="date" value={form.baptismDate || ''} onChange={e => uf('baptismDate', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" /></div>
          <Input label="Baptism Church" value={form.baptismChurch || ''} onChange={v => uf('baptismChurch', v)} />
          <Input label="Current Church" value={form.currentChurch || ''} onChange={v => uf('currentChurch', v)} />
          <Input label="Pastor Name" value={form.pastorName || ''} onChange={v => uf('pastorName', v)} />
          <Input label="Ministry Involvement" value={form.ministryInvolvement || ''} onChange={v => uf('ministryInvolvement', v)} />
          <Input label="Spiritual Gifts" value={form.spiritualGifts || ''} onChange={v => uf('spiritualGifts', v)} placeholder="Teaching, Leadership, etc." />
          <div className="col-span-1 md:col-span-2"><Input label="Personal Testimony" value={form.testimony || ''} onChange={v => uf('testimony', v)} type="textarea" placeholder="Brief testimony of faith journey" /></div>
        </div>
      );
      case 4: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Previous Qualification" value={form.prevQualification || ''} onChange={v => uf('prevQualification', v)} placeholder="e.g., B.A., B.Sc., B.Com" />
          <Input label="School / College" value={form.schoolCollege || ''} onChange={v => uf('schoolCollege', v)} />
          <Input label="Board / University" value={form.boardUniversity || ''} onChange={v => uf('boardUniversity', v)} />
          <Input label="Year of Passing" value={form.year || ''} onChange={v => uf('year', v)} placeholder="e.g., 2023" />
          <Input label="Marks / CGPA" value={form.marks || ''} onChange={v => uf('marks', v)} placeholder="e.g., 78% or 8.0" />
          <Select label="Medium" value={form.medium || ''} onChange={v => uf('medium', v)} options={[{label:'English',value:'English'},{label:'Hindi',value:'Hindi'},{label:'Regional',value:'Regional'}]} />
        </div>
      );
      case 5: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select label="Program" value={form.program || ''} onChange={v => uf('program', v)} options={[{label:'B.Th - Bachelor of Theology',value:'B.Th'},{label:'M.Div - Master of Divinity',value:'M.Div'},{label:'Diploma in Theology',value:'Diploma'},{label:'Certificate in Ministry',value:'Certificate'}]} />
          <Select label="Department" value={form.department || ''} onChange={v => uf('department', v)} options={[{label:'Theology',value:'Theology'},{label:'Biblical Studies',value:'Biblical Studies'},{label:'Missiology',value:'Missiology'},{label:'Counseling',value:'Counseling'},{label:'Worship Studies',value:'Worship Studies'},{label:'Practical Theology',value:'Practical Theology'},{label:'Church History',value:'Church History'},{label:'Leadership',value:'Leadership'}]} />
          <Input label="Enrollment Number" value={`COV${new Date().getFullYear()}-${String(students.length + 1).padStart(3, '0')}`} onChange={() => {}} placeholder="Auto-generated" />
          <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Admission Date</label><input type="date" value={form.admissionDate || ''} onChange={e => uf('admissionDate', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" /></div>
          <Select label="Academic Year" value={form.academicYear || ''} onChange={v => uf('academicYear', v)} options={[{label:'2024-2025',value:'2024-2025'},{label:'2025-2026',value:'2025-2026'}]} />
          <Select label="Semester" value={form.semester || ''} onChange={v => uf('semester', v)} options={[{label:'Semester 1',value:'Semester 1'},{label:'Semester 2',value:'Semester 2'},{label:'Semester 3',value:'Semester 3'},{label:'Semester 4',value:'Semester 4'},{label:'Semester 5',value:'Semester 5'},{label:'Semester 6',value:'Semester 6'}]} />
          <Select label="Mode" value={form.mode || ''} onChange={v => uf('mode', v)} options={[{label:'Regular',value:'Regular'},{label:'Online',value:'Online'}]} />
        </div>
      );
      case 6: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Campus / Branch" value={form.campus || ''} onChange={v => uf('campus', v)} options={[{label:'Main Campus',value:'Main Campus'},{label:'Distance Learning',value:'Distance Learning'}]} />
          <div className="space-y-1.5 flex items-end gap-2"><div className="flex items-center gap-2"><input type="checkbox" checked={form.hostelRequired as boolean || false} onChange={e => uf('hostelRequired', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" /><label className="text-sm font-medium text-slate-700">Hostel Required</label></div></div>
          <Input label="Room Allocation" value={form.roomAllocation || ''} onChange={v => uf('roomAllocation', v)} placeholder="To be assigned" />
          <div className="space-y-1.5 flex items-end gap-2"><div className="flex items-center gap-2"><input type="checkbox" checked={form.transportRequired as boolean || false} onChange={e => uf('transportRequired', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" /><label className="text-sm font-medium text-slate-700">Transport Required</label></div></div>
        </div>
      );
      case 7: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Fee Structure" value={form.feeStructure || ''} onChange={v => uf('feeStructure', v)} placeholder="e.g., M.Div Regular" />
          <Input label="Scholarship" value={form.scholarship || ''} onChange={v => uf('scholarship', v)} placeholder="e.g., Merit - 25%" />
          <Input label="Sponsorship" value={form.sponsorship || ''} onChange={v => uf('sponsorship', v)} placeholder="Sponsor details" />
          <Select label="Payment Plan" value={form.paymentPlan || ''} onChange={v => uf('paymentPlan', v)} options={[{label:'Full Year',value:'Full Year'},{label:'Quarterly',value:'Quarterly'},{label:'Monthly',value:'Monthly'}]} />
        </div>
      );
      case 8: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Health Conditions" value={form.healthConditions || ''} onChange={v => uf('healthConditions', v)} placeholder="Any existing conditions" />
          <Input label="Allergies" value={form.allergies || ''} onChange={v => uf('allergies', v)} />
          <Input label="Disability (if any)" value={form.disability || ''} onChange={v => uf('disability', v)} />
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.medicalCertificate as boolean || false} onChange={e => uf('medicalCertificate', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" /><label className="text-sm font-medium text-slate-700">Medical Certificate Submitted</label></div>
        </div>
      );
      case 9: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800 font-medium mb-2">Document Upload Section</p>
            <p className="text-xs text-amber-600">Upload documents using the file upload feature. Below are the submission statuses.</p>
          </div>
          {['ID Proof','Academic Certificates','Baptism Certificate','Pastor Recommendation','Passport Photos'].map((doc, i) => {
            const keys = ['idProof','academicCerts','baptismCert','pastorRec','passportPhotos'];
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <span className="text-sm font-medium text-slate-700">{doc}</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500">Pending</span>
              </div>
            );
          })}
        </div>
      );
      case 10: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Calling to Ministry" value={form.callingType || ''} onChange={v => uf('callingType', v)} options={[{label:'Pastor',value:'Pastor'},{label:'Missionary',value:'Missionary'},{label:'Teacher',value:'Teacher'},{label:'Evangelist',value:'Evangelist'},{label:'Worship Leader',value:'Worship Leader'},{label:'Counselor',value:'Counselor'}]} />
          <Input label="Ministry Experience" value={form.ministryExperience || ''} onChange={v => uf('ministryExperience', v)} type="textarea" />
          <Input label="Years of Service" value={form.yearsOfService || ''} onChange={v => uf('yearsOfService', v)} placeholder="e.g., 5" />
          <Input label="Preferred Ministry Field" value={form.preferredField || ''} onChange={v => uf('preferredField', v)} />
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.internshipInterest === 'Yes'} onChange={e => uf('internshipInterest', e.target.checked ? 'Yes' : 'No')} className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" /><label className="text-sm font-medium text-slate-700">Interested in Internship</label></div>
        </div>
      );
      case 11: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Admission Status" value={form.admissionStatus || ''} onChange={v => uf('admissionStatus', v)} options={[{label:'Pending',value:'Pending'},{label:'Approved',value:'Approved'},{label:'Rejected',value:'Rejected'}]} />
          <Input label="Verified By" value={form.verifiedBy || ''} onChange={v => uf('verifiedBy', v)} />
          <Input label="Remarks" value={form.remarks || ''} onChange={v => uf('remarks', v)} type="textarea" />
          <div className="space-y-1.5"><label className="block text-sm font-medium text-slate-700">Approval Date</label><input type="date" value={form.approvalDate || ''} onChange={e => uf('approvalDate', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" /></div>
        </div>
      );
      default: return null;
    }
  };

  // ─── View Tab Renderer ─────────────────────────────────────────────────
  const renderViewTab = () => {
    if (!viewStudent) return null;
    const s = viewStudent;
    const InfoRow = ({ label, value }: { label: string; value: string }) => (
      <div className="py-2.5 border-b border-slate-100 last:border-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-slate-800 mt-0.5">{value || '—'}</p>
      </div>
    );

    switch (viewTab) {
      case 0: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-0.5">{[['Full Name',s.fullName],['Gender',s.gender],['Date of Birth',s.dob],['Nationality',s.nationality],['Blood Group',s.bloodGroup]].map(([l,v])=><InfoRow key={l as string} label={l as string} value={v as string} />)}</div>
          <div className="space-y-0.5">{[['Enrollment No',s.enrollmentNo],['Program',s.program],['Department',s.department],['Semester',s.semester],['Mode',s.mode]].map(([l,v])=><InfoRow key={l as string} label={l as string} value={v as string} />)}</div>
        </div>
      );
      case 1: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-0.5">{[['Mobile',s.mobile],['Email',s.email]].map(([l,v])=><InfoRow key={l as string} label={l as string} value={v as string} />)}</div>
          <div className="space-y-0.5">{[['Emergency Contact',`${s.emergencyContact} (${s.emergencyPhone})`],['Current Address',s.currentAddress]].map(([l,v])=><InfoRow key={l as string} label={l as string} value={v as string} />)}</div>
        </div>
      );
      case 2: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-0.5">{[["Father's Name",s.fatherName],["Mother's Name",s.motherName],['Guardian',s.guardian],['Occupation',s.occupation]].map(([l,v])=><InfoRow key={l as string} label={l as string} value={v as string} />)}</div>
          <div className="space-y-0.5">{[['Family Background',s.familyBackground]].map(([l,v])=><InfoRow key={l as string} label={l as string} value={v as string} />)}</div>
        </div>
      );
      case 3: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-0.5">{[['Conversion Date',s.conversionDate],['Baptism Status',s.baptismStatus],['Baptism Date',s.baptismDate],['Baptism Church',s.baptismChurch],['Current Church',s.currentChurch],['Pastor',s.pastorName]].map(([l,v])=><InfoRow key={l as string} label={l as string} value={v as string} />)}</div>
          <div className="space-y-0.5">{[['Ministry Involvement',s.ministryInvolvement],['Spiritual Gifts',s.spiritualGifts],['Personal Testimony',s.testimony]].map(([l,v])=><InfoRow key={l as string} label={l as string} value={v as string} />)}</div>
        </div>
      );
      case 4: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-0.5">{[['Previous Qualification',s.prevQualification],['School/College',s.schoolCollege],['Board/University',s.boardUniversity],['Year',s.year],['Marks',s.marks],['Medium',s.medium]].map(([l,v])=><InfoRow key={l as string} label={l as string} value={v as string} />)}</div>
        </div>
      );
      case 5: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-0.5">{[['Program',s.program],['Department',s.department],['Enrollment No',s.enrollmentNo],['Admission Date',s.admissionDate],['Academic Year',s.academicYear],['Semester',s.semester],['Mode',s.mode]].map(([l,v])=><InfoRow key={l as string} label={l as string} value={v as string} />)}</div>
        </div>
      );
      default: return (
        <div className="text-center text-slate-400 py-8">View details for all sections available</div>
      );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-[#6B6B6B] animate-pulse">
          <div className="w-4 h-4 border-2 border-[#6B2D3E] border-t-transparent rounded-full animate-spin" />
          Loading from server…
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-amber-600" /> Student Enrollment
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Manage student admissions, profiles, and enrollment</p>
        </div>
        <button onClick={() => { setShowAddModal(true); setFormTab(0); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">
          <UserPlus className="h-4 w-4" /> Add Student
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.total, icon: Users, color: 'bg-slate-900', change: '' },
          { label: 'New This Year', value: stats.newMonth, icon: UserPlus, color: 'bg-blue-600', change: `${stats.newMonth} enrolled` },
          { label: 'Active Students', value: stats.active, icon: UserCheck, color: 'bg-emerald-600', change: 'Approved' },
          { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'bg-amber-600', change: 'Action needed' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, enrollment number, or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
          </div>
          <div className="flex gap-2">
            <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white">
              <option value="All">All Programs</option>
              <option value="B.Th">B.Th</option>
              <option value="M.Div">M.Div</option>
              <option value="Diploma">Diploma</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white">
              <option value="All">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Enrollment</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Program</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Semester</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Fees</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden xl:table-cell">Profile</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((s) => {
                const pct = calcCompletion(s);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {s.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{s.fullName}</p>
                          <p className="text-xs text-slate-400 truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-mono text-xs hidden md:table-cell">{s.enrollmentNo}</td>
                    <td className="px-5 py-4 hidden lg:table-cell"><span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white">{s.program}</span></td>
                    <td className="px-5 py-4 text-slate-600 text-xs hidden lg:table-cell">{s.semester}</td>
                    <td className="px-5 py-4">{statusBadge(s.admissionStatus)}</td>
                    <td className="px-5 py-4 hidden lg:table-cell">{feeBadge(s.feeStatus)}</td>
                    <td className="px-5 py-4 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${pct}%` }} /></div>
                        <span className="text-xs text-slate-500 font-medium">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => {
                          const token = getToken();
                          if (token) {
                            getStudent(s.id).then((data) => { setViewStudent(mapStudentFromApi(data)); setViewTab(0); }).catch(() => { setViewStudent(s); setViewTab(0); });
                          } else { setViewStudent(s); setViewTab(0); }
                        }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors" title="Edit"><Edit3 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No students found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* ─── Add Student Modal ─────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 pt-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mb-8 animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">New Student Enrollment</h3>
                <p className="text-sm text-slate-400">Fill in the student details across all sections</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            {/* Form Tabs */}
            <div className="border-b border-slate-100 overflow-x-auto">
              <div className="flex px-4 gap-1 min-w-max">
                {formTabs.map((tab, i) => (
                  <button key={tab} onClick={() => setFormTab(i)}
                    className={`px-3 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                      formTab === i ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}>{tab}</button>
                ))}
              </div>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">{renderFormTab()}</div>
            <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <div className="flex gap-2">
                {formTab > 0 && <button onClick={() => setFormTab(formTab - 1)} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all"><ChevronLeft className="h-4 w-4" />Previous</button>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all">Cancel</button>
                {formTab < formTabs.length - 1 ? (
                  <button onClick={() => setFormTab(formTab + 1)} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all">Next<ChevronRight className="h-4 w-4" /></button>
                ) : (
                  <button onClick={handleAdd} disabled={saving} className="inline-flex items-center gap-1 px-5 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-60 disabled:cursor-not-allowed">{saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus className="h-4 w-4" />}{saving ? 'Enrolling…' : 'Enroll Student'}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Student Modal ────────────────────────────────────────── */}
      {viewStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4 pt-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mb-8 animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                  {viewStudent.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{viewStudent.fullName}</h3>
                  <p className="text-sm text-slate-400">{viewStudent.enrollmentNo} · {viewStudent.program} · {viewStudent.department}</p>
                  <div className="flex gap-2 mt-1">{statusBadge(viewStudent.admissionStatus)} {feeBadge(viewStudent.feeStatus)}</div>
                </div>
              </div>
              <button onClick={() => setViewStudent(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="border-b border-slate-100 overflow-x-auto">
              <div className="flex px-6 gap-1 min-w-max">
                {['Overview','Contact','Family','Spiritual','Academic','Enrollment'].map((tab, i) => (
                  <button key={tab} onClick={() => setViewTab(i)}
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                      viewTab === i ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}>{tab}</button>
                ))}
              </div>
            </div>
            <div className="p-6 max-h-[50vh] overflow-y-auto">{renderViewTab()}</div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setViewStudent(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white transition-all">Close</button>
              <button className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all"><Download className="h-4 w-4" />Export</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
