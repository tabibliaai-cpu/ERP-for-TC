import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  addDoc,
  deleteDoc,
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Student {
  // 1. Basic Information
  id?: string;
  studentId?: string; // Formal ID Number (Enrollment Number)
  photoUrl?: string; // Profile photo
  name: string;
  gender?: string;
  dob?: string;
  nationality?: string;
  nationalId?: string; // Aadhaar / ID Number
  passportNumber?: string;
  bloodGroup?: string;

  // 2. Contact Details
  phone?: string;
  email: string;
  permanentAddress?: string;
  currentAddress?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship?: string;
  };

  // 3. Family / Guardian Details
  family?: {
    fatherName?: string;
    motherName?: string;
    guardianName?: string;
    occupation?: string;
    contactNumber?: string;
    background?: 'Christian' | 'Non-Christian' | string;
  };

  // 4. Spiritual Information
  spiritual?: {
    conversionDate?: string;
    isBaptized?: boolean;
    baptismDate?: string;
    baptismChurch?: string;
    currentChurch?: string;
    pastorName?: string;
    ministryInvolvement?: string;
    spiritualGifts?: string;
    testimony?: string;
  };

  // 5. Academic Details (Previous)
  previousEducation?: {
    qualification?: string;
    institution?: string;
    boardOrUniversity?: string;
    yearOfPassing?: string;
    marksOrGrade?: string;
    mediumOfInstruction?: string;
  };

  // 6. Course Enrollment
  program: string; // Program Name
  department?: string;
  admissionDate?: string;
  academicYear?: string;
  semester?: number;
  mode?: 'Regular' | 'Online';
  year: number; // Current Year of Study
  
  // 7. Institutional Details
  campus?: string;
  hostelRequired?: boolean;
  roomAllocation?: string;
  transportRequired?: boolean;

  // 8. Financial Information
  financial?: {
    feeStructure?: string;
    hasScholarship?: boolean;
    sponsorshipDetails?: string;
    paymentPlan?: 'Monthly' | 'Quarterly' | 'Full';
    feeStatus?: string;
  };

  // 9. Medical Information
  medicalNotes?: string; // Health Conditions
  allergies?: string;
  disability?: string;
  medicalCertUrl?: string;

  // 10. Documents Upload
  documents?: {
    idProofUrl?: string;
    academicCertsUrl?: string;
    baptismCertUrl?: string;
    recommendationUrl?: string;
  };

  // 11. Ministry & Calling Details
  ministry?: {
    isCalled?: boolean;
    callingType?: string; // Pastor, Missionary, etc
    experience?: string;
    yearsOfService?: number;
    preferredField?: string;
    internshipInterest?: string;
  };

  // 12. Admin Section
  admissionStatus?: 'Pending' | 'Approved' | 'Rejected';
  verifiedBy?: string;
  remarks?: string;
  enrollmentApprovalDate?: string;

  // 13. System Fields
  status: 'active' | 'graduated' | 'withdrawn';
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export const studentService = {
  async addStudent(student: Student) {
    const studentsRef = collection(db, 'students');
    return await addDoc(studentsRef, {
      ...student,
      createdAt: serverTimestamp(),
    });
  },

  async getStudentsByTenant(tenantId: string) {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('tenantId', '==', tenantId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
  },

  async getStudentById(id: string) {
    const docSnap = await getDoc(doc(db, 'students', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Student;
    }
    return null;
  },

  async updateStudent(id: string, data: Partial<Student>) {
    return await setDoc(doc(db, 'students', id), data, { merge: true });
  },

  async deleteStudent(id: string) {
    // In a real system, we might just set status to 'withdrawn' 
    // but for "management features" we'll allow hard delete if requested
    // or just use this to provide the capability.
    // For now, let's just implement the capabilities.
    const studentRef = doc(db, 'students', id);
    return await setDoc(studentRef, { status: 'withdrawn' }, { merge: true });
  }
};

export interface Course {
  id?: string;
  title: string;
  code: string;
  credits: number;
  facultyId: string;
  tenantId: string;
}

export const courseService = {
  async addCourse(course: Course) {
    const coursesRef = collection(db, 'courses');
    return await addDoc(coursesRef, {
      ...course,
      createdAt: serverTimestamp(),
    });
  },

  async getCoursesByTenant(tenantId: string) {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('tenantId', '==', tenantId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  },

  async updateCourse(id: string, data: Partial<Course>) {
    return await setDoc(doc(db, 'courses', id), data, { merge: true });
  },

  async deleteCourse(id: string) {
    // Note: This would typically require deleting/moving subjects too
    // For now we just implement the capability
    const courseRef = doc(db, 'courses', id);
    // Hard delete or status update? Courses don't have status usually.
    // Let's stick to update capability for now since deleting is risky.
  }
};

export interface FeeTransaction {
  id?: string;
  studentId: string;
  amount: number;
  type: 'tuition' | 'hostel' | 'library' | 'exam' | 'other';
  status: 'paid' | 'pending';
  date: any;
  tenantId: string;
  receiptNumber?: string;
  monthsCovered?: string[]; // e.g. ["Jan 2024", "Feb 2024"]
  paymentMethod?: 'cash' | 'bank_transfer' | 'card';
  remarks?: string;
}

export interface PayrollTransaction {
  id?: string;
  facultyId: string;
  amount: number;
  date: any;
  status: 'pending' | 'disbursed';
  month: string; // e.g. "March 2024"
  tenantId: string;
}

export const financeService = {
  async addTransaction(tx: FeeTransaction) {
    const txRef = collection(db, 'finance');
    return await addDoc(txRef, {
      ...tx,
      date: serverTimestamp(),
    });
  },

  async getTransactionsByTenant(tenantId: string) {
    const txRef = collection(db, 'finance');
    const q = query(txRef, where('tenantId', '==', tenantId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeTransaction));
  },

  async getTransactionsByStudent(studentId: string, tenantId?: string) {
    const txRef = collection(db, 'finance');
    const q = tenantId ? query(txRef, where('tenantId', '==', tenantId), where('studentId', '==', studentId)) : query(txRef, where('studentId', '==', studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeTransaction));
  },

  async addPayrollEntry(payroll: Omit<PayrollTransaction, 'id'>) {
    const pRef = collection(db, 'payroll');
    return await addDoc(pRef, {
      ...payroll,
      date: serverTimestamp()
    });
  },

  async getPayrollByTenant(tenantId: string) {
    const pRef = collection(db, 'payroll');
    const q = query(pRef, where('tenantId', '==', tenantId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayrollTransaction));
  }
};

export interface Book {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: 'available' | 'borrowed' | 'reserved';
  tenantId: string;
}

export const bookService = {
  async addBook(book: Book) {
    const booksRef = collection(db, 'books');
    return await addDoc(booksRef, {
      ...book,
      createdAt: serverTimestamp(),
    });
  },

  async getBooksByTenant(tenantId: string) {
    const booksRef = collection(db, 'books');
    const q = query(booksRef, where('tenantId', '==', tenantId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
  },

  async updateBook(id: string, data: Partial<Book>) {
    return await updateDoc(doc(db, 'books', id), data);
  }
};

export interface BookBorrowing {
  id?: string;
  bookId: string;
  studentId: string;
  borrowDate: any;
  returnDate?: any;
  status: 'borrowed' | 'returned';
  tenantId: string;
}

export const borrowingService = {
  async borrowBook(borrowing: Omit<BookBorrowing, 'id' | 'borrowDate'>) {
    const docRef = await addDoc(collection(db, 'book_borrowing'), {
      ...borrowing,
      borrowDate: serverTimestamp(),
      status: 'borrowed'
    });
    // Atomic update of book status
    await updateDoc(doc(db, 'books', borrowing.bookId), { status: 'borrowed' });
    return docRef.id;
  },
  async getBorrowingByTenant(tenantId: string) {
    const q = query(collection(db, 'book_borrowing'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookBorrowing));
  },
  async returnBook(borrowingId: string, bookId: string) {
    await updateDoc(doc(db, 'book_borrowing', borrowingId), {
      returnDate: serverTimestamp(),
      status: 'returned'
    });
    await updateDoc(doc(db, 'books', bookId), { status: 'available' });
  }
};

export interface InstitutionalDocument {
  id?: string;
  title: string;
  type: string;
  size: string;
  subjectId?: string; // Optional: can be a general document or linked to a subject
  facultyId: string;
  url: string; // Mock URL for now
  tenantId: string;
  createdAt: any;
}

export const documentService = {
  async addDocument(document: Omit<InstitutionalDocument, 'id' | 'createdAt'>) {
    return await addDoc(collection(db, 'institutional_documents'), {
      ...document,
      createdAt: serverTimestamp(),
    });
  },
  async getDocumentsByTenant(tenantId: string) {
    const q = query(collection(db, 'institutional_documents'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InstitutionalDocument));
  },
  async getDocumentsBySubject(subjectId: string) {
    const q = query(collection(db, 'institutional_documents'), where('subjectId', '==', subjectId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InstitutionalDocument));
  }
};

export const globalService = {
  async getTenantStats(tenantId: string) {
    const studentsRef = collection(db, 'students');
    const coursesRef = collection(db, 'courses');
    const financeRef = collection(db, 'finance');
    
    const [studentsSnap, coursesSnap, financeSnap] = await Promise.all([
      getDocs(query(studentsRef, where('tenantId', '==', tenantId))),
      getDocs(query(coursesRef, where('tenantId', '==', tenantId))),
      getDocs(query(financeRef, where('tenantId', '==', tenantId)))
    ]);

    const totalRevenue = financeSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

    return {
      studentCount: studentsSnap.size,
      courseCount: coursesSnap.size,
      totalRevenue
    };
  }
};

export interface Subject {
  id?: string;
  courseId: string;
  title: string;
  code: string;
  department: string;
  creditHours: number;
  syllabus?: string;
  teacherIds?: string[];
  moderatorIds?: string[];
  studentIds?: string[];
  tenantId: string;
}

export const subjectService = {
  async addSubject(subject: Subject) {
    return await addDoc(collection(db, 'subjects'), {
      ...subject,
      createdAt: serverTimestamp(),
    });
  },
  async updateSubject(id: string, data: Partial<Subject>) {
    return await setDoc(doc(db, 'subjects', id), data, { merge: true });
  },
  async deleteSubject(id: string) {
    return await deleteDoc(doc(db, 'subjects', id));
  },
  async getSubjectsByCourse(courseId: string) {
    const q = query(collection(db, 'subjects'), where('courseId', '==', courseId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
  },
  async getSubjectsByTeacher(teacherId: string) {
    const q = query(collection(db, 'subjects'), where('teacherIds', 'array-contains', teacherId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
  },
  async getSubjectsByModerator(moderatorId: string) {
    const q = query(collection(db, 'subjects'), where('moderatorIds', 'array-contains', moderatorId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
  },
  async getSubjectsByTenant(tenantId: string) {
    const q = query(collection(db, 'subjects'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
  },
  async getSubjectsByStudent(studentId: string, tenantId?: string) {
    const q = tenantId 
      ? query(collection(db, 'subjects'), where('tenantId', '==', tenantId), where('studentIds', 'array-contains', studentId))
      : query(collection(db, 'subjects'), where('studentIds', 'array-contains', studentId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
  }
};

// ===================================================================
// TEACHER / FACULTY — COMPREHENSIVE 17-SECTION MODEL (Theological ERP)
// ===================================================================

export interface TeacherSpiritualProfile {
  conversionDate?: string;
  isBaptized?: boolean;
  baptismDate?: string;
  baptismChurch?: string;
  currentChurch?: string;
  pastorName?: string;
  ministryInvolvement?: string;
  yearsInMinistry?: number;
  spiritualGifts?: string[];   // Teaching, Leadership, Pastoral Care, Evangelism, Prophecy, etc.
  personalTestimony?: string;
  statementOfFaith?: string;   // URL or text
  devotionalLog?: string[];
}

export interface TeacherQualification {
  highestQualification?: string;
  theologicalDegree?: string;  // B.Th, M.Div, Th.M, PhD, D.Min, etc.
  seminaryName?: string;
  yearOfCompletion?: string;
  certifications?: string[];    // URLs
  specialization?: string;     // OT, NT, Systematic Theology, etc.
}

export interface TeacherEmployment {
  employeeId?: string;          // Auto-generated
  role?: string;                // Teacher / Pastor / Visiting Faculty / Guest Lecturer
  department?: string;
  subjectsAssigned?: string[];  // Subject IDs
  dateOfJoining?: string;
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Visiting';
  experienceYears?: number;
}

export interface TeacherPayroll {
  salaryStructure?: {
    basic?: number;
    hra?: number;
    da?: number;
    allowances?: number;
    deductions?: number;
    tax?: number;
    total?: number;
  };
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolder?: string;
  };
  paymentFrequency?: 'Monthly' | 'Bi-weekly' | 'One-time';
  panNumber?: string;
}

export interface TeacherAccommodation {
  hostelAssigned?: boolean;
  roomDetails?: string;
  transportFacility?: boolean;
}

export interface TeacherMedical {
  healthConditions?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyMedicalInfo?: string;
  bloodGroup?: string;
}

export interface TeacherDocument {
  idProofUrl?: string;
  certificatesUrls?: string[];
  experienceLettersUrls?: string[];
  ordinationCertUrl?: string;
  recommendationLettersUrls?: string[];
  resumeUrl?: string;
  aadhaarOrPassportUrl?: string;
}

export interface TeacherMinistryCalling {
  callingType?: string;         // Teacher / Pastor / Missionary / Evangelist
  ministryExperience?: string;
  currentMinistryRole?: string;
  churchLeadershipRole?: string;
  fieldExperience?: 'Rural' | 'Urban' | 'International' | 'Multi-context';
  ordinationStatus?: 'Ordained' | 'Licensed' | 'In-Process' | 'Not-Applied';
}

export interface TeacherPerformance {
  teachingQualityScore?: number;    // 1-10
  ministryImpactScore?: number;     // 1-10
  studentFeedbackScore?: number;    // 1-10
  adminRating?: number;             // 1-10
  annualReviewNotes?: string;
  reviewDate?: string;
  reviewedBy?: string;
}

export interface Faculty {
  id?: string;

  // ===== System Fields =====
  facultyId?: string;               // Auto-generated: FAC-YYYY-XXXX
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;

  // ===== 1. Basic Information =====
  photoUrl?: string;
  name: string;
  gender?: string;
  dob?: string;
  nationality?: string;
  nationalId?: string;              // Aadhaar / ID / Passport number
  passportNumber?: string;
  maritalStatus?: string;

  // ===== 2. Contact Details =====
  email: string;
  phone: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship?: string;
  };

  // ===== 3. Spiritual Profile (THEOLOGICAL ERP CORE) =====
  spiritual?: TeacherSpiritualProfile;

  // ===== 4. Academic & Theological Qualifications =====
  qualifications?: TeacherQualification;

  // ===== 5. Employment Details =====
  employment?: TeacherEmployment;

  // ===== 6. Permissions & Access =====
  permissions?: string[];
  status: 'active' | 'on_leave' | 'retired' | 'pending' | 'suspended';

  // ===== 7. Ministry & Calling =====
  ministry?: TeacherMinistryCalling;

  // ===== 8. Payroll & Financials =====
  payroll?: TeacherPayroll;

  // ===== 9. Accommodation =====
  accommodation?: TeacherAccommodation;

  // ===== 10. Medical Information =====
  medical?: TeacherMedical;

  // ===== 11. Documents =====
  documents?: TeacherDocument;

  // ===== 12. Performance =====
  performance?: TeacherPerformance;

  // ===== 13. Bio & Professional =====
  bio?: string;
  expertise?: string;
  officeHours?: string;
  department: string;
  role: string;

  // ===== Legacy fields (backward compatible) =====
  salary?: number;
  bankAccount?: string;
  subjects?: string[];

  tenantId: string;
}

// ===================================================================
// TEACHING ASSIGNMENT — Section 6 Module
// ===================================================================

export interface TeachingAssignment {
  id?: string;
  facultyId: string;
  courseId?: string;
  subjectId?: string;
  subjectName?: string;
  subjectCode?: string;
  batch?: string;
  classType?: 'Lecture' | 'Lab' | 'Seminar' | 'Practical';
  mode?: 'Online' | 'Offline' | 'Hybrid';
  weeklyHours?: number;
  lectureHours?: number;
  schedule?: {
    day?: string;
    startTime?: string;
    endTime?: string;
    room?: string;
  }[];
  semester?: string;
  academicYear?: string;
  status?: 'active' | 'completed' | 'cancelled';
  tenantId: string;
  createdAt?: any;
}

export const teachingAssignmentService = {
  async addAssignment(assignment: TeachingAssignment) {
    return await addDoc(collection(db, 'teaching_assignments'), {
      ...assignment,
      createdAt: serverTimestamp(),
    });
  },
  async getByFaculty(facultyId: string) {
    const q = query(collection(db, 'teaching_assignments'), where('facultyId', '==', facultyId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeachingAssignment));
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'teaching_assignments'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeachingAssignment));
  },
  async update(id: string, data: Partial<TeachingAssignment>) {
    return await updateDoc(doc(db, 'teaching_assignments', id), data);
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'teaching_assignments', id));
  },
};

// ===================================================================
// TEACHER PERFORMANCE REVIEW
// ===================================================================

export interface TeacherPerformanceReview {
  id?: string;
  facultyId: string;
  type: 'annual' | 'mid-year' | 'special';
  teachingQualityScore?: number;
  ministryImpactScore?: number;
  studentFeedbackAvg?: number;
  adminRating?: number;
  strengths?: string;
  areasForImprovement?: string;
  reviewNotes?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewDate?: string;
  academicYear?: string;
  tenantId: string;
  createdAt?: any;
}

export const teacherPerformanceService = {
  async addReview(review: TeacherPerformanceReview) {
    return await addDoc(collection(db, 'teacher_performance'), {
      ...review,
      createdAt: serverTimestamp(),
    });
  },
  async getByFaculty(facultyId: string) {
    const q = query(collection(db, 'teacher_performance'), where('facultyId', '==', facultyId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherPerformanceReview));
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'teacher_performance'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherPerformanceReview));
  },
};

// ===================================================================
// TEACHER LEAVE MANAGEMENT
// ===================================================================

export interface TeacherLeave {
  id?: string;
  facultyId: string;
  leaveType: 'Casual' | 'Medical' | 'Maternity' | 'Paternity' | 'Sabbatical' | 'Ministry' | 'Conference' | 'Other';
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvedDate?: string;
  totalDays: number;
  tenantId: string;
  createdAt?: any;
}

export const teacherLeaveService = {
  async addLeave(leave: TeacherLeave) {
    return await addDoc(collection(db, 'teacher_leave'), {
      ...leave,
      createdAt: serverTimestamp(),
    });
  },
  async getByFaculty(facultyId: string) {
    const q = query(collection(db, 'teacher_leave'), where('facultyId', '==', facultyId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherLeave));
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'teacher_leave'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherLeave));
  },
  async updateStatus(id: string, status: 'approved' | 'rejected', approvedBy: string) {
    return await updateDoc(doc(db, 'teacher_leave', id), {
      status,
      approvedBy,
      approvedDate: new Date().toISOString(),
    });
  },
};

// ===================================================================
// SERMON & TEACHING ARCHIVE
// ===================================================================

export interface SermonArchive {
  id?: string;
  facultyId: string;
  title: string;
  scripture?: string;
  topic?: string;
  type: 'Sermon' | 'Teaching' | 'Lecture' | 'Chapel' | 'Devotional';
  date?: string;
  audioUrl?: string;
  videoUrl?: string;
  notesUrl?: string;
  summary?: string;
  tags?: string[];
  tenantId: string;
  createdAt?: any;
}

export const sermonArchiveService = {
  async addSermon(sermon: SermonArchive) {
    return await addDoc(collection(db, 'sermon_archive'), {
      ...sermon,
      createdAt: serverTimestamp(),
    });
  },
  async getByFaculty(facultyId: string) {
    const q = query(collection(db, 'sermon_archive'), where('facultyId', '==', facultyId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SermonArchive));
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'sermon_archive'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SermonArchive));
  },
};

// ===================================================================
// TEACHER ATTENDANCE
// ===================================================================

export interface TeacherAttendance {
  id?: string;
  facultyId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
  tenantId: string;
  createdAt?: any;
}

export const teacherAttendanceService = {
  async markAttendance(record: TeacherAttendance) {
    return await addDoc(collection(db, 'teacher_attendance'), {
      ...record,
      createdAt: serverTimestamp(),
    });
  },
  async getByFaculty(facultyId: string, startDate?: string, endDate?: string) {
    let q = query(collection(db, 'teacher_attendance'), where('facultyId', '==', facultyId));
    const snap = await getDocs(q);
    let records = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherAttendance));
    if (startDate) records = records.filter(r => r.date >= startDate);
    if (endDate) records = records.filter(r => r.date <= endDate);
    return records;
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'teacher_attendance'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherAttendance));
  },
};

// ===================================================================
// CONTENT & LEARNING MATERIALS
// ===================================================================

export interface LearningMaterial {
  id?: string;
  facultyId: string;
  subjectId?: string;
  title: string;
  type: 'lecture_notes' | 'video' | 'assignment' | 'exam' | 'resource' | 'syllabus';
  fileUrl?: string;
  description?: string;
  semester?: string;
  academicYear?: string;
  downloadCount?: number;
  tenantId: string;
  createdAt?: any;
}

export const learningMaterialService = {
  async addMaterial(material: LearningMaterial) {
    return await addDoc(collection(db, 'learning_materials'), {
      ...material,
      createdAt: serverTimestamp(),
    });
  },
  async getByFaculty(facultyId: string) {
    const q = query(collection(db, 'learning_materials'), where('facultyId', '==', facultyId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LearningMaterial));
  },
  async getBySubject(subjectId: string) {
    const q = query(collection(db, 'learning_materials'), where('subjectId', '==', subjectId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LearningMaterial));
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'learning_materials'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LearningMaterial));
  },
};

// ===================================================================
// ACTIVITY LOG (Audit trail)
// ===================================================================

export interface ActivityLog {
  id?: string;
  userId: string;
  userName?: string;
  action: string;
  module: string;
  details?: string;
  timestamp?: any;
  tenantId: string;
}

export const activityLogService = {
  async log(entry: Omit<ActivityLog, 'id' | 'timestamp'>) {
    return await addDoc(collection(db, 'activity_logs'), {
      ...entry,
      timestamp: serverTimestamp(),
    });
  },
  async getByTenant(tenantId: string, limit = 50) {
    const q = query(collection(db, 'activity_logs'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog)).slice(0, limit);
  },
  async getByUser(userId: string) {
    const q = query(collection(db, 'activity_logs'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
  },
};

// ===================================================================
// FACULTY SERVICE — Enhanced CRUD
// ===================================================================

export const facultyService = {
  async addFaculty(faculty: Faculty) {
    return await addDoc(collection(db, 'faculty'), {
      ...faculty,
      createdAt: serverTimestamp(),
    });
  },
  async getFacultyByTenant(tenantId: string) {
    const q = query(collection(db, 'faculty'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Faculty));
  },
  async getFacultyById(id: string) {
    const docSnap = await getDoc(doc(db, 'faculty', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Faculty;
    }
    return null;
  },
  async updateFaculty(id: string, data: Partial<Faculty>) {
    return await updateDoc(doc(db, 'faculty', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },
  async deleteFaculty(id: string) {
    return await deleteDoc(doc(db, 'faculty', id));
  },
  // Profile completion percentage calculator
  calculateProfileCompletion(teacher: Faculty): number {
    let total = 0;
    let filled = 0;

    // Basic info (6 fields)
    const basic = ['name', 'email', 'phone', 'gender', 'dob', 'nationality'];
    total += basic.length;
    basic.forEach(f => { if (teacher[f as keyof Faculty]) filled++; });

    // Spiritual profile (5 key fields)
    if (teacher.spiritual) {
      const spiritual = ['conversionDate', 'isBaptized', 'currentChurch', 'pastorName', 'spiritualGifts'];
      total += spiritual.length;
      spiritual.forEach(f => {
        const val = teacher.spiritual![f as keyof TeacherSpiritualProfile];
        if (val !== undefined && val !== null && val !== '') filled++;
      });
    } else {
      total += 5;
    }

    // Qualifications (4 fields)
    if (teacher.qualifications) {
      const qual = ['highestQualification', 'theologicalDegree', 'seminaryName', 'specialization'];
      total += qual.length;
      qual.forEach(f => {
        const val = teacher.qualifications![f as keyof TeacherQualification];
        if (val !== undefined && val !== null && val !== '') filled++;
      });
    } else {
      total += 4;
    }

    // Employment (4 fields)
    if (teacher.employment) {
      const emp = ['role', 'dateOfJoining', 'employmentType', 'experienceYears'];
      total += emp.length;
      emp.forEach(f => {
        const val = teacher.employment![f as keyof TeacherEmployment];
        if (val !== undefined && val !== null && val !== '') filled++;
      });
    } else {
      total += 4;
    }

    // Ministry (3 fields)
    if (teacher.ministry) {
      const min = ['callingType', 'currentMinistryRole', 'fieldExperience'];
      total += min.length;
      min.forEach(f => {
        const val = teacher.ministry![f as keyof TeacherMinistryCalling];
        if (val !== undefined && val !== null && val !== '') filled++;
      });
    } else {
      total += 3;
    }

    // Photo, bio, department, expertise
    const extra = ['photoUrl', 'bio', 'expertise', 'address'];
    total += extra.length;
    extra.forEach(f => { if (teacher[f as keyof Faculty]) filled++; });

    return total > 0 ? Math.round((filled / total) * 100) : 0;
  }
};

export const tenantService = {
  async updateTenantSettings(tenantId: string, data: any) {
    return await updateDoc(doc(db, 'tenants', tenantId), data);
  }
};

export interface Grade {
  id?: string;
  studentId: string;
  subjectId: string;
  score: number;
  maxScore: number;
  type: 'exam' | 'assignment' | 'quiz';
  date: any;
  tenantId: string;
}

export const gradeService = {
  async addGrade(grade: Grade) {
    return await addDoc(collection(db, 'grades'), {
      ...grade,
      createdAt: serverTimestamp(),
    });
  },
  async updateGrade(id: string, data: Partial<Grade>) {
    return await updateDoc(doc(db, 'grades', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },
  async getGradesBySubject(subjectId: string) {
    const q = query(collection(db, 'grades'), where('subjectId', '==', subjectId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
  },
  async getGradesByStudent(studentId: string, tenantId?: string) {
    const q = tenantId
       ? query(collection(db, 'grades'), where('tenantId', '==', tenantId), where('studentId', '==', studentId))
       : query(collection(db, 'grades'), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
  }
};

export interface Attendance {
  id?: string;
  studentId: string;
  subjectId: string;
  date: any;
  status: 'present' | 'absent' | 'late';
  tenantId: string;
}

export const attendanceService = {
  async markAttendance(record: Attendance) {
    return await addDoc(collection(db, 'attendance'), {
      ...record,
      createdAt: serverTimestamp(),
    });
  },
  async getAttendanceBySubject(subjectId: string, date?: string) {
    let q = query(collection(db, 'attendance'), where('subjectId', '==', subjectId));
    if (date) {
      q = query(q, where('date', '==', date));
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
  },
  async getAttendanceByStudent(studentId: string, tenantId?: string) {
    const q = tenantId
       ? query(collection(db, 'attendance'), where('tenantId', '==', tenantId), where('studentId', '==', studentId))
       : query(collection(db, 'attendance'), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
  }
};

export interface InstitutionalEvent {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'academic' | 'liturgy' | 'community' | 'seminar';
  location: string;
  tenantId: string;
}

export interface PrayerRequest {
  id?: string;
  userName: string;
  content: string;
  status: 'pending' | 'answered';
  date: any;
  tenantId: string;
}

export const prayerService = {
  async addRequest(request: Omit<PrayerRequest, 'id'>) {
    return await addDoc(collection(db, 'prayer_requests'), {
      ...request,
      date: serverTimestamp()
    });
  },
  async updateStatus(id: string, status: 'pending' | 'answered') {
    const ref = doc(db, 'prayer_requests', id);
    return await updateDoc(ref, { status });
  },
  async getRequestsByTenant(tenantId: string) {
    const q = query(collection(db, 'prayer_requests'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrayerRequest));
  }
};

export interface MessageDoc {
  id?: string;
  tenantId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  iv?: string; // Add IV
  createdAt: any;
  isEncrypted: boolean;
}

export const messageService = {
  async sendMessage(msg: MessageDoc) {
    return await addDoc(collection(db, 'messages'), {
      ...msg,
      createdAt: serverTimestamp()
    });
  },
  async getMessages(tenantId: string, userId1: string, userId2: string) {
    const q1 = query(collection(db, 'messages'), where('tenantId', '==', tenantId), where('senderId', '==', userId1), where('receiverId', '==', userId2));
    const q2 = query(collection(db, 'messages'), where('tenantId', '==', tenantId), where('senderId', '==', userId2), where('receiverId', '==', userId1));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const all = [...snap1.docs, ...snap2.docs].map(doc => ({ id: doc.id, ...doc.data() } as MessageDoc));
    return all.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeA - timeB;
    });
  }
};

export interface CongregationMember {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  category: 'frequent' | 'occasional' | 'leader';
  joinDate: any;
  tenantId: string;
}

export const congregationService = {
  async addMember(member: Omit<CongregationMember, 'id'>) {
    return await addDoc(collection(db, 'congregation'), {
      ...member,
      joinDate: serverTimestamp()
    });
  },
  async getMembersByTenant(tenantId: string) {
    const q = query(collection(db, 'congregation'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CongregationMember));
  }
};

export const churchService = {
  getEventsByTenant: async (tenantId: string) => {
    const q = query(collection(db, 'institutional_events'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InstitutionalEvent));
  },
  addEvent: async (event: Omit<InstitutionalEvent, 'id'>) => {
    return await addDoc(collection(db, 'institutional_events'), {
      ...event,
      createdAt: serverTimestamp()
    });
  }
};

// ===================================================================
// BILLING SYSTEM — Fee Structures, Invoices, Sponsors, Scholarships
// ===================================================================

export interface FeeComponent {
  name: string;        // e.g. "Tuition Fee", "Hostel Fee"
  amount: number;
  type: 'one_time' | 'recurring';
  frequency?: 'monthly' | 'quarterly' | 'annually'; // for recurring
  isMandatory: boolean;
}

export interface FeeStructure {
  id?: string;
  name: string;              // e.g. "B.Th 1st Year"
  program: string;           // e.g. "B.Th"
  academicYear: string;      // e.g. "2024-2025"
  semester: number;
  components: FeeComponent[];
  totalAmount: number;       // sum of all components
  tenantId: string;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface StudentFeeAssignment {
  id?: string;
  studentId: string;
  feeStructureId: string;
  feeStructureName: string;
  totalFee: number;
  discount: number;
  adjustedFee: number;        // totalFee - discount
  paidAmount: number;
  balanceAmount: number;      // adjustedFee - paidAmount
  paymentPlan: 'full' | 'monthly' | 'quarterly' | 'custom';
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  startDate: string;
  dueDate?: string;
  installmentCount?: number;
  installmentAmount?: number;
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Payment {
  id?: string;
  paymentId: string;          // Auto-generated: PAY-YYYY-XXXXX
  studentFeeId: string;
  studentId: string;
  studentName?: string;
  amount: number;
  paymentMode: 'cash' | 'upi' | 'bank_transfer' | 'online' | 'cheque';
  transactionRef?: string;
  receivedBy: string;         // Admin UID
  receiptNumber: string;      // Auto-generated: RCPT-YYYY-XXXXX
  installmentNumber?: number;
  balanceAfterPayment: number;
  status: 'completed' | 'failed' | 'refunded';
  remarks?: string;
  tenantId: string;
  createdAt?: any;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;      // Auto-generated: INV-YYYY-XXXXX
  studentFeeId: string;
  studentId: string;
  studentName?: string;
  program?: string;
  feeBreakdown: {
    component: string;
    amount: number;
  }[];
  totalAmount: number;
  discount: number;
  netAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate?: string;
  qrCodeUrl?: string;         // UPI QR code
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Sponsor {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  organization?: string;
  totalContributed: number;
  linkedStudents: string[];    // student IDs
  status: 'active' | 'inactive';
  notes?: string;
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Scholarship {
  id?: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;              // percentage or fixed amount
  criteria: 'merit' | 'need' | 'ministry' | 'general';
  description?: string;
  maxStudents?: number;
  currentRecipients: number;
  totalDisbursed: number;
  status: 'active' | 'inactive';
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface RefundEntry {
  id?: string;
  paymentId: string;
  studentId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'processed';
  processedBy?: string;
  tenantId: string;
  createdAt?: any;
  processedAt?: any;
}

export interface TransactionLog {
  id?: string;
  entityType: 'payment' | 'invoice' | 'refund' | 'fee_assignment';
  entityId: string;
  action: 'create' | 'update' | 'reverse';
  previousData?: any;
  newData?: any;
  performedBy: string;
  performedByName?: string;
  tenantId: string;
  timestamp?: any;
  ipAddress?: string;
}

export const feeStructureService = {
  async addFeeStructure(fee: FeeStructure) {
    const ref = collection(db, 'fee_structures');
    return await addDoc(ref, { ...fee, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const ref = collection(db, 'fee_structures');
    const q = query(ref, where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FeeStructure));
  },
  async getById(id: string) {
    const docSnap = await getDoc(doc(db, 'fee_structures', id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as FeeStructure : null;
  },
  async update(id: string, data: Partial<FeeStructure>) {
    return await updateDoc(doc(db, 'fee_structures', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'fee_structures', id));
  }
};

export const studentFeeService = {
  async assignFee(assignment: StudentFeeAssignment) {
    const ref = collection(db, 'student_fees');
    return await addDoc(ref, { ...assignment, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const ref = collection(db, 'student_fees');
    const q = query(ref, where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentFeeAssignment));
  },
  async getByStudent(studentId: string, tenantId: string) {
    const ref = collection(db, 'student_fees');
    const q = query(ref, where('tenantId', '==', tenantId), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentFeeAssignment));
  },
  async update(id: string, data: Partial<StudentFeeAssignment>) {
    return await updateDoc(doc(db, 'student_fees', id), { ...data, updatedAt: serverTimestamp() });
  }
};

export const paymentService = {
  async recordPayment(payment: Payment) {
    const ref = collection(db, 'payments');
    return await addDoc(ref, { ...payment, createdAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const ref = collection(db, 'payments');
    const q = query(ref, where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment));
  },
  async getByStudent(studentId: string, tenantId: string) {
    const ref = collection(db, 'payments');
    const q = query(ref, where('tenantId', '==', tenantId), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment));
  },
  async updateStatus(id: string, status: Payment['status']) {
    return await updateDoc(doc(db, 'payments', id), { status });
  }
};

export const invoiceService = {
  async createInvoice(invoice: Invoice) {
    const ref = collection(db, 'invoices');
    return await addDoc(ref, { ...invoice, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const ref = collection(db, 'invoices');
    const q = query(ref, where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));
  },
  async getByStudent(studentId: string, tenantId: string) {
    const ref = collection(db, 'invoices');
    const q = query(ref, where('tenantId', '==', tenantId), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));
  },
  async update(id: string, data: Partial<Invoice>) {
    return await updateDoc(doc(db, 'invoices', id), { ...data, updatedAt: serverTimestamp() });
  }
};

export const sponsorService = {
  async addSponsor(sponsor: Sponsor) {
    const ref = collection(db, 'sponsors');
    return await addDoc(ref, { ...sponsor, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const ref = collection(db, 'sponsors');
    const q = query(ref, where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Sponsor));
  },
  async update(id: string, data: Partial<Sponsor>) {
    return await updateDoc(doc(db, 'sponsors', id), { ...data, updatedAt: serverTimestamp() });
  }
};

export const scholarshipService = {
  async addScholarship(scholarship: Scholarship) {
    const ref = collection(db, 'scholarships');
    return await addDoc(ref, { ...scholarship, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const ref = collection(db, 'scholarships');
    const q = query(ref, where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Scholarship));
  },
  async update(id: string, data: Partial<Scholarship>) {
    return await updateDoc(doc(db, 'scholarships', id), { ...data, updatedAt: serverTimestamp() });
  }
};

export const refundService = {
  async createRefund(refund: RefundEntry) {
    const ref = collection(db, 'refunds');
    return await addDoc(ref, { ...refund, createdAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const ref = collection(db, 'refunds');
    const q = query(ref, where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as RefundEntry));
  },
  async update(id: string, data: Partial<RefundEntry>) {
    return await updateDoc(doc(db, 'refunds', id), data);
  }
};

export const transactionLogService = {
  async log(log: TransactionLog) {
    const ref = collection(db, 'transaction_log');
    return await addDoc(ref, { ...log, timestamp: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const ref = collection(db, 'transaction_log');
    const q = query(ref, where('tenantId', '==', tenantId), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as TransactionLog));
  }
};

// ===================================================================
// DYNAMIC ACADEMIC CONFIGURATION SYSTEM
// ===================================================================

export interface CurriculumSemester {
  semesterNumber: number;
  semesterName: string;
  courseIds: string[];
  totalCredits: number;
}

export interface AcademicProgram {
  id?: string;
  name: string;
  code: string;
  level: 'Undergraduate' | 'Postgraduate' | 'Certificate' | 'Diploma' | 'Doctorate';
  department?: string;
  durationYears: number;
  durationSemesters: number;
  totalCredits: number;
  creditSystem: 'mandatory' | 'optional';
  gradingSystem: 'marks' | 'gpa' | 'cgpa';
  description?: string;
  pattern: 'semester' | 'yearly' | 'trimester' | 'modular';
  enableMinistryPracticum: boolean;
  enableInternship: boolean;
  enableThesis: boolean;
  status: 'active' | 'archived' | 'draft';
  version: number;
  effectiveFrom?: string;
  effectiveBatch?: string;
  isMasterProgram?: boolean;
  sharedWithTenants?: string[];
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export interface ProgramVersion {
  id?: string;
  programId: string;
  programName: string;
  version: number;
  effectiveFrom: string;
  effectiveBatch: string;
  curriculumSnapshot: CurriculumSemester[];
  changes: string;
  status: 'active' | 'superseded' | 'draft';
  tenantId: string;
  createdAt?: any;
  createdBy?: string;
}

export interface CurriculumMap {
  id?: string;
  programId: string;
  programName?: string;
  academicYear: string;
  batch?: string;
  semesters: CurriculumSemester[];
  totalCredits: number;
  version: number;
  status: 'active' | 'draft' | 'archived';
  clonedFrom?: string;
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export interface AcademicCourse {
  id?: string;
  name: string;
  code: string;
  department?: string;
  credits: number;
  courseType: 'core' | 'elective' | 'optional';
  level?: number;
  prerequisites?: string[];
  description?: string;
  syllabus?: string;
  syllabusUrl?: string;
  videoResources?: string[];
  readingMaterials?: string[];
  status: 'active' | 'archived' | 'draft';
  version: number;
  isMasterCourse?: boolean;
  sharedWithTenants?: string[];
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export interface ElectiveGroup {
  id?: string;
  name: string;
  code?: string;
  programId?: string;
  semester?: number;
  minElectives: number;
  maxElectives: number;
  eligibilityCriteria?: string;
  courseIds: string[];
  status: 'active' | 'archived' | 'draft';
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface GradeMapping {
  grade: string;
  minMarks: number;
  maxMarks: number;
  gradePoints: number;
  description?: string;
}

export interface GradingConfig {
  id?: string;
  name: string;
  programId?: string;
  type: 'marks' | 'gpa' | 'cgpa';
  maxMarks: number;
  passingMarks: number;
  gradeMappings: GradeMapping[];
  creditSystem: 'mandatory' | 'optional';
  creditsPerSubject?: number;
  isDefault: boolean;
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
}

export const academicProgramService = {
  async addProgram(program: AcademicProgram) {
    return await addDoc(collection(db, 'programs'), { ...program, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'programs'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AcademicProgram));
  },
  async getById(id: string) {
    const docSnap = await getDoc(doc(db, 'programs', id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as AcademicProgram : null;
  },
  async update(id: string, data: Partial<AcademicProgram>) {
    return await updateDoc(doc(db, 'programs', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'programs', id));
  }
};

export const academicCourseService = {
  async addCourse(course: AcademicCourse) {
    return await addDoc(collection(db, 'academic_courses'), { ...course, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'academic_courses'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AcademicCourse));
  },
  async update(id: string, data: Partial<AcademicCourse>) {
    return await updateDoc(doc(db, 'academic_courses', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'academic_courses', id));
  }
};

export const curriculumMapService = {
  async addCurriculum(curriculum: CurriculumMap) {
    return await addDoc(collection(db, 'curriculum_maps'), { ...curriculum, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'curriculum_maps'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CurriculumMap));
  },
  async getByProgram(programId: string) {
    const q = query(collection(db, 'curriculum_maps'), where('programId', '==', programId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CurriculumMap));
  },
  async update(id: string, data: Partial<CurriculumMap>) {
    return await updateDoc(doc(db, 'curriculum_maps', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'curriculum_maps', id));
  }
};

export const programVersionService = {
  async addVersion(version: ProgramVersion) {
    return await addDoc(collection(db, 'program_versions'), { ...version, createdAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'program_versions'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProgramVersion));
  },
  async getByProgram(programId: string) {
    const q = query(collection(db, 'program_versions'), where('programId', '==', programId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProgramVersion));
  }
};

export const electiveGroupService = {
  async addGroup(group: ElectiveGroup) {
    return await addDoc(collection(db, 'electives'), { ...group, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'electives'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ElectiveGroup));
  },
  async update(id: string, data: Partial<ElectiveGroup>) {
    return await updateDoc(doc(db, 'electives', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'electives', id));
  }
};

export const gradingConfigService = {
  async addConfig(config: GradingConfig) {
    return await addDoc(collection(db, 'grading_configs'), { ...config, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'grading_configs'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as GradingConfig));
  },
  async update(id: string, data: Partial<GradingConfig>) {
    return await updateDoc(doc(db, 'grading_configs', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'grading_configs', id));
  }
};

// ===================================================================
// PEDAGOGICAL PORTAL — Teaching Methods, Lesson Plans, Resources,
// Engagement, Reflections, Mentorships, Reports
// ===================================================================

export interface TeachingMethod {
  id?: string;
  name: string;
  description: string;
  style: 'lecture' | 'discussion' | 'case_study' | 'sermon_based' | 'field_based' | 'interactive';
  courseIds?: string[];
  expectedOutcomes: string[];
  isTemplate?: boolean;
  templateCategory?: 'bible_study' | 'theology_lecture' | 'ministry_training' | 'custom';
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export const teachingMethodService = {
  async addMethod(method: TeachingMethod) {
    return await addDoc(collection(db, 'teaching_methods'), { ...method, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'teaching_methods'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as TeachingMethod));
  },
  async update(id: string, data: Partial<TeachingMethod>) {
    return await updateDoc(doc(db, 'teaching_methods', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'teaching_methods', id));
  }
};

export interface LessonPlan {
  id?: string;
  facultyId: string;
  courseId?: string;
  subjectId?: string;
  topic: string;
  date: string;
  duration: number;
  objectives: string[];
  teachingMethodId?: string;
  teachingMethodName?: string;
  materialsRequired: string[];
  activitiesPlanned: string[];
  scriptureReferences: string[];
  ministryApplications: string[];
  sermonOutline?: { topic: string; scripture: string; outline: string; application: string; };
  status: 'draft' | 'published' | 'completed';
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
}

export const lessonPlanService = {
  async addPlan(plan: LessonPlan) {
    return await addDoc(collection(db, 'lesson_plans'), { ...plan, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'lesson_plans'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LessonPlan));
  },
  async getByFaculty(facultyId: string) {
    const q = query(collection(db, 'lesson_plans'), where('facultyId', '==', facultyId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LessonPlan));
  },
  async update(id: string, data: Partial<LessonPlan>) {
    return await updateDoc(doc(db, 'lesson_plans', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'lesson_plans', id));
  }
};

export interface TeachingResource {
  id?: string;
  title: string;
  type: 'note' | 'sermon' | 'video' | 'pdf' | 'link' | 'presentation';
  url?: string;
  courseId?: string;
  subjectId?: string;
  topic?: string;
  scriptureTags?: string[];
  facultyId: string;
  description?: string;
  downloadCount?: number;
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
}

export const teachingResourceService = {
  async addResource(resource: TeachingResource) {
    return await addDoc(collection(db, 'teaching_resources'), { ...resource, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), downloadCount: 0 });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'teaching_resources'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as TeachingResource));
  },
  async update(id: string, data: Partial<TeachingResource>) {
    return await updateDoc(doc(db, 'teaching_resources', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'teaching_resources', id));
  }
};

export interface EngagementLog {
  id?: string;
  studentId: string;
  facultyId: string;
  courseId?: string;
  subjectId?: string;
  type: 'participation' | 'assignment' | 'discussion' | 'devotion' | 'prayer' | 'bible_study' | 'reflection';
  score: number;
  details?: string;
  date: string;
  engagementLevel: 'active' | 'moderate' | 'low';
  gamificationPoints?: number;
  tenantId: string;
  createdAt?: any;
}

export const engagementLogService = {
  async addLog(log: EngagementLog) {
    return await addDoc(collection(db, 'engagement_logs'), { ...log, createdAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'engagement_logs'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as EngagementLog));
  },
  async getByStudent(studentId: string) {
    const q = query(collection(db, 'engagement_logs'), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as EngagementLog));
  },
  async getByFaculty(facultyId: string) {
    const q = query(collection(db, 'engagement_logs'), where('facultyId', '==', facultyId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as EngagementLog));
  }
};

export interface Reflection {
  id?: string;
  studentId: string;
  facultyId: string;
  courseId?: string;
  type: 'journal' | 'ministry_experience' | 'spiritual_growth';
  title: string;
  content: string;
  scriptureReferenced?: string;
  teacherFeedback?: string;
  feedbackDate?: string;
  status: 'submitted' | 'reviewed' | 'returned';
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
}

export const reflectionService = {
  async addReflection(reflection: Reflection) {
    return await addDoc(collection(db, 'reflections'), { ...reflection, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'reflections'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Reflection));
  },
  async update(id: string, data: Partial<Reflection>) {
    return await updateDoc(doc(db, 'reflections', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'reflections', id));
  }
};

export interface Mentorship {
  id?: string;
  facultyId: string;
  studentId: string;
  type: 'academic' | 'spiritual' | 'ministry';
  status: 'active' | 'paused' | 'completed';
  meetingCount: number;
  lastMeetingDate?: string;
  nextMeetingDate?: string;
  guidanceNotes?: string;
  spiritualGrowthNotes?: string;
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
}

export const mentorshipService = {
  async addMentorship(mentorship: Mentorship) {
    return await addDoc(collection(db, 'mentorships'), { ...mentorship, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'mentorships'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Mentorship));
  },
  async update(id: string, data: Partial<Mentorship>) {
    return await updateDoc(doc(db, 'mentorships', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'mentorships', id));
  }
};

export interface PedagogyReport {
  id?: string;
  type: 'teaching_quality' | 'student_engagement' | 'spiritual_growth' | 'course_effectiveness';
  facultyId?: string;
  courseId?: string;
  period: string;
  metrics: {
    teachingScore?: number;
    clarityIndex?: number;
    studentSatisfaction?: number;
    avgEngagement?: number;
    attendanceRate?: number;
    spiritualGrowthIndex?: number;
    assignmentCompletionRate?: number;
  };
  recommendations?: string[];
  aiSuggestions?: string[];
  tenantId: string;
  createdAt?: any;
}

export const pedagogyReportService = {
  async addReport(report: PedagogyReport) {
    return await addDoc(collection(db, 'pedagogy_reports'), { ...report, createdAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'pedagogy_reports'), where('tenantId', '==', tenantId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PedagogyReport));
  }
};

// ===================================================================
// THEOLOGICAL LIBRARY SYSTEM — Full manuscript & knowledge engine
// ===================================================================

export interface Manuscript {
  id?: string;
  title: string;
  author: string;
  authorId?: string;
  category: string;
  categoryId?: string;
  type: 'book' | 'research_paper' | 'sermon' | 'commentary' | 'thesis' | 'journal' | 'manuscript';
  language: string;
  publicationYear?: number;
  isbn?: string;
  status: 'available' | 'borrowed' | 'reserved' | 'draft' | 'under_review' | 'published';
  accessLevel: 'public' | 'students' | 'faculty' | 'admin';
  scriptureReferences?: string[];
  keywords?: string[];
  abstract?: string;
  fileUrl?: string;
  fileType?: string;
  tenantId: string;
  contributedBy?: string;
  approvedBy?: string;
  approvedAt?: any;
  viewCount?: number;
  referenceCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export const manuscriptService = {
  async addManuscript(manuscript: Manuscript) {
    return await addDoc(collection(db, 'manuscripts'), {
      ...manuscript,
      viewCount: 0,
      referenceCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'manuscripts'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Manuscript));
  },
  async getByCategory(tenantId: string, category: string) {
    const q = query(collection(db, 'manuscripts'), where('tenantId', '==', tenantId), where('category', '==', category));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Manuscript));
  },
  async getByType(tenantId: string, type: string) {
    const q = query(collection(db, 'manuscripts'), where('tenantId', '==', tenantId), where('type', '==', type));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Manuscript));
  },
  async getPendingReview(tenantId: string) {
    const q = query(collection(db, 'manuscripts'), where('tenantId', '==', tenantId), where('status', '==', 'under_review'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Manuscript));
  },
  async getById(id: string) {
    const snap = await getDoc(doc(db, 'manuscripts', id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Manuscript) : null;
  },
  async update(id: string, data: Partial<Manuscript>) {
    return await updateDoc(doc(db, 'manuscripts', id), { ...data, updatedAt: serverTimestamp() });
  },
  async incrementViews(id: string) {
    const snap = await getDoc(doc(db, 'manuscripts', id));
    if (snap.exists()) {
      const current = (snap.data().viewCount as number) || 0;
      await updateDoc(doc(db, 'manuscripts', id), { viewCount: current + 1 });
    }
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'manuscripts', id));
  },
};

export interface LibraryCategory {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  color?: string;
  tenantId: string;
  createdAt?: any;
}

export const libraryCategoryService = {
  async addCategory(category: LibraryCategory) {
    return await addDoc(collection(db, 'library_categories'), { ...category, createdAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'library_categories'), where('tenantId', '==', tenantId), orderBy('sortOrder', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryCategory));
  },
  async update(id: string, data: Partial<LibraryCategory>) {
    return await updateDoc(doc(db, 'library_categories', id), data);
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'library_categories', id));
  },
};

export interface LibraryAuthor {
  id?: string;
  name: string;
  bio?: string;
  expertise?: string[];
  affiliation?: string;
  tenantId: string;
  createdAt?: any;
}

export const libraryAuthorService = {
  async addAuthor(author: LibraryAuthor) {
    return await addDoc(collection(db, 'library_authors'), { ...author, createdAt: serverTimestamp() });
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'library_authors'), where('tenantId', '==', tenantId), orderBy('name', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryAuthor));
  },
  async update(id: string, data: Partial<LibraryAuthor>) {
    return await updateDoc(doc(db, 'library_authors', id), data);
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'library_authors', id));
  },
};

export interface LibraryBorrowLog {
  id?: string;
  manuscriptId: string;
  manuscriptTitle?: string;
  userId: string;
  userName?: string;
  borrowDate: any;
  dueDate: any;
  returnDate?: any;
  status: 'borrowed' | 'returned' | 'overdue';
  fineAmount?: number;
  notes?: string;
  tenantId: string;
  createdAt?: any;
}

export const libraryBorrowService = {
  async borrowManuscript(log: Omit<LibraryBorrowLog, 'id' | 'borrowDate' | 'createdAt' | 'status'>) {
    const docRef = await addDoc(collection(db, 'library_borrow_logs'), {
      ...log,
      status: 'borrowed',
      borrowDate: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'manuscripts', log.manuscriptId), { status: 'borrowed' });
    return docRef.id;
  },
  async getByTenant(tenantId: string) {
    const q = query(collection(db, 'library_borrow_logs'), where('tenantId', '==', tenantId), orderBy('borrowDate', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryBorrowLog));
  },
  async getByUser(tenantId: string, userId: string) {
    const q = query(collection(db, 'library_borrow_logs'), where('tenantId', '==', tenantId), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryBorrowLog));
  },
  async returnManuscript(borrowId: string, manuscriptId: string) {
    await updateDoc(doc(db, 'library_borrow_logs', borrowId), {
      returnDate: serverTimestamp(),
      status: 'returned',
    });
    await updateDoc(doc(db, 'manuscripts', manuscriptId), { status: 'available' });
  },
  async markOverdue(borrowId: string) {
    await updateDoc(doc(db, 'library_borrow_logs', borrowId), { status: 'overdue' });
  },
};

export interface LibraryBookmark {
  id?: string;
  userId: string;
  manuscriptId: string;
  manuscriptTitle?: string;
  collectionName?: string;
  notes?: string;
  tenantId: string;
  createdAt?: any;
}

export const libraryBookmarkService = {
  async addBookmark(bookmark: LibraryBookmark) {
    return await addDoc(collection(db, 'library_bookmarks'), { ...bookmark, createdAt: serverTimestamp() });
  },
  async getByUser(tenantId: string, userId: string) {
    const q = query(collection(db, 'library_bookmarks'), where('tenantId', '==', tenantId), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryBookmark));
  },
  async getCollections(tenantId: string, userId: string) {
    const q = query(collection(db, 'library_bookmarks'), where('tenantId', '==', tenantId), where('userId', '==', userId));
    const snap = await getDocs(q);
    const bookmarks = snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryBookmark));
    const collections = new Map<string, LibraryBookmark[]>();
    bookmarks.forEach(b => {
      const name = b.collectionName || 'Uncategorized';
      if (!collections.has(name)) collections.set(name, []);
      collections.get(name)!.push(b);
    });
    return collections;
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'library_bookmarks', id));
  },
};

export interface LibraryNote {
  id?: string;
  userId: string;
  manuscriptId: string;
  manuscriptTitle?: string;
  content: string;
  highlightText?: string;
  pageNumber?: number;
  chapter?: string;
  tenantId: string;
  createdAt?: any;
  updatedAt?: any;
}

export const libraryNoteService = {
  async addNote(note: LibraryNote) {
    return await addDoc(collection(db, 'library_notes'), { ...note, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  },
  async getByUser(tenantId: string, userId: string) {
    const q = query(collection(db, 'library_notes'), where('tenantId', '==', tenantId), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryNote));
  },
  async getByManuscript(tenantId: string, manuscriptId: string) {
    const q = query(collection(db, 'library_notes'), where('tenantId', '==', tenantId), where('manuscriptId', '==', manuscriptId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryNote));
  },
  async update(id: string, data: Partial<LibraryNote>) {
    return await updateDoc(doc(db, 'library_notes', id), { ...data, updatedAt: serverTimestamp() });
  },
  async delete(id: string) {
    return await deleteDoc(doc(db, 'library_notes', id));
  },
};

export interface ManuscriptVersion {
  id?: string;
  manuscriptId: string;
  versionNumber: number;
  fileUrl?: string;
  changeDescription?: string;
  createdBy: string;
  tenantId: string;
  createdAt?: any;
}

export const manuscriptVersionService = {
  async addVersion(version: ManuscriptVersion) {
    return await addDoc(collection(db, 'manuscript_versions'), { ...version, createdAt: serverTimestamp() });
  },
  async getByManuscript(tenantId: string, manuscriptId: string) {
    const q = query(collection(db, 'manuscript_versions'), where('tenantId', '==', tenantId), where('manuscriptId', '==', manuscriptId), orderBy('versionNumber', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ManuscriptVersion));
  },
};

export interface LibraryAccessControl {
  id?: string;
  manuscriptId: string;
  accessLevel: 'public' | 'students' | 'faculty' | 'admin';
  grantedBy: string;
  tenantId: string;
  createdAt?: any;
}

export const libraryAccessControlService = {
  async setAccess(control: LibraryAccessControl) {
    return await addDoc(collection(db, 'library_access_controls'), { ...control, createdAt: serverTimestamp() });
  },
  async getByManuscript(tenantId: string, manuscriptId: string) {
    const q = query(collection(db, 'library_access_controls'), where('tenantId', '==', tenantId), where('manuscriptId', '==', manuscriptId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryAccessControl));
  },
  async update(id: string, data: Partial<LibraryAccessControl>) {
    return await updateDoc(doc(db, 'library_access_controls', id), data);
  },
};

