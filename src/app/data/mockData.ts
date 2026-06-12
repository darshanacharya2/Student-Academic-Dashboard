export interface College {
  college_id: string;
  name: string;
  location: string;
  subscription_status: "active" | "inactive" | "trial";
  total_students: number;
  total_staff: number;
}

export interface Student {
  student_id: string;
  user_id: string;
  college_id: string;
  department: string;
  batch: string;
  semester: number;
  roll_no: string;
  name: string;
  email: string;
}

export interface Staff {
  staff_id: string;
  user_id: string;
  college_id: string;
  department: string;
  name: string;
  email: string;
  designation: string;
}

export interface Subject {
  subject_id: string;
  college_id: string;
  name: string;
  code: string;
  department: string;
  semester: number;
  staff_id: string;
}

export interface AttendanceRecord {
  record_id: string;
  student_id: string;
  subject_id: string;
  date: string;
  class_number: string;
  status: "present" | "absent" | "late";
}

export interface IAMarks {
  record_id: string;
  student_id: string;
  subject_id: string;
  ia_number: 1 | 2 | 3;
  marks: number;
  max_marks: number;
  submitted_by: string;
  approved_by?: string;
  status: "pending" | "approved" | "rejected";
}

export interface Assignment {
  assignment_id: string;
  student_id: string;
  subject_id: string;
  title: string;
  marks: number;
  max_marks: number;
  submitted_date: string;
}

export interface Achievement {
  achievement_id: string;
  student_id: string;
  title: string;
  description: string;
  category: "sports" | "cultural" | "technical" | "academic" | "other";
  date: string;
  certificate_url?: string;
}

// Mock Data
export const mockColleges: College[] = [
  {
    college_id: "clg1",
    name: "St. Xavier's College of Engineering",
    location: "Mumbai, Maharashtra",
    subscription_status: "active",
    total_students: 1250,
    total_staff: 85,
  },
  {
    college_id: "clg2",
    name: "National Institute of Technology",
    location: "Bangalore, Karnataka",
    subscription_status: "active",
    total_students: 2100,
    total_staff: 140,
  },
  {
    college_id: "clg3",
    name: "Royal College of Arts & Science",
    location: "Delhi, NCR",
    subscription_status: "trial",
    total_students: 850,
    total_staff: 60,
  },
];

export const mockStudents: Student[] = [
  {
    student_id: "std1",
    user_id: "student1",
    college_id: "clg1",
    department: "Computer Science",
    batch: "2021-2025",
    semester: 5,
    roll_no: "CS21001",
    name: "Arjun Patel",
    email: "student@college1.com",
  },
  {
    student_id: "std2",
    user_id: "student2",
    college_id: "clg1",
    department: "Computer Science",
    batch: "2021-2025",
    semester: 5,
    roll_no: "CS21002",
    name: "Priya Mehta",
    email: "priya.mehta@college1.com",
  },
  {
    student_id: "std3",
    user_id: "student3",
    college_id: "clg1",
    department: "Computer Science",
    batch: "2022-2026",
    semester: 5,
    roll_no: "CS21003",
    name: "Rahul Verma",
    email: "rahul.verma@college1.com",
  },
  {
    student_id: "std4",
    user_id: "student4",
    college_id: "clg1",
    department: "Computer Science",
    batch: "2023-2027",
    semester: 5,
    roll_no: "CS21004",
    name: "Sneha Rao",
    email: "sneha.rao@college1.com",
  },
  {
    student_id: "std5",
    user_id: "student5",
    college_id: "clg1",
    department: "Computer Science",
    batch: "2024-2028",
    semester: 5,
    roll_no: "CS21005",
    name: "Vikram Singh",
    email: "vikram.singh@college1.com",
  },
];

export const mockStaff: Staff[] = [
  {
    staff_id: "staff1",
    user_id: "staff1",
    college_id: "clg1",
    department: "Computer Science",
    name: "Dr. Rajesh Kumar",
    email: "hod@college1.com",
    designation: "Head of Department",
  },
  {
    staff_id: "staff2",
    user_id: "staff2",
    college_id: "clg1",
    department: "Computer Science",
    name: "Prof. Priya Sharma",
    email: "priya.sharma@college1.com",
    designation: "Assistant Professor",
  },
  {
    staff_id: "staff3",
    user_id: "staff3",
    college_id: "clg1",
    department: "Computer Science",
    name: "Mr. Amit Patel",
    email: "amit.patel@college1.com",
    designation: "Lecturer",
  },
  {
    staff_id: "staff4",
    user_id: "staff4",
    college_id: "clg1",
    department: "Information Technology",
    name: "Dr. Sunita Verma",
    email: "sunita.verma@college1.com",
    designation: "Associate Professor",
  },
  {
    staff_id: "staff5",
    user_id: "staff5",
    college_id: "clg1",
    department: "Information Technology",
    name: "Mr. Ramesh Gupta",
    email: "ramesh.gupta@college1.com",
    designation: "Lecturer",
  },
];

export const mockSubjects: Subject[] = [
  {
    subject_id: "sub1",
    college_id: "clg1",
    name: "Data Structures & Algorithms",
    code: "CS301",
    department: "Computer Science",
    semester: 5,
    staff_id: "staff1",
  },
  {
    subject_id: "sub2",
    college_id: "clg1",
    name: "Database Management Systems",
    code: "CS302",
    department: "Computer Science",
    semester: 5,
    staff_id: "staff1",
  },
  {
    subject_id: "sub3",
    college_id: "clg1",
    name: "Operating Systems",
    code: "CS303",
    department: "Computer Science",
    semester: 5,
    staff_id: "staff2",
  },
  {
    subject_id: "sub4",
    college_id: "clg1",
    name: "Computer Networks",
    code: "CS304",
    department: "Computer Science",
    semester: 5,
    staff_id: "staff2",
  },
];

// Generate mock attendance data
export const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const dates = getLast30Days();
  const classNumbers = ["1", "2", "3"];
  
  mockStudents.forEach((student) => {
    mockSubjects.forEach((subject) => {
      dates.forEach((date, index) => {
        // Generate attendance for each class period
        classNumbers.forEach((classNum) => {
          const random = Math.random();
          let status: "present" | "absent" | "late";
          
          if (student.student_id === "std1") {
            status = random > 0.1 ? "present" : "absent";
          } else if (student.student_id === "std2") {
            status = random > 0.25 ? "present" : random > 0.2 ? "late" : "absent";
          } else if (student.student_id === "std3") {
            status = random > 0.4 ? "present" : "absent";
          } else {
            status = random > 0.15 ? "present" : "absent";
          }
          
          records.push({
            record_id: `att_${student.student_id}_${subject.subject_id}_${date}_c${classNum}`,
            student_id: student.student_id,
            subject_id: subject.subject_id,
            date,
            class_number: classNum,
            status,
          });
        });
      });
    });
  });
  
  return records;
};

export const mockIAMarks: IAMarks[] = [
  // IA 1
  { record_id: "ia1", student_id: "std1", subject_id: "sub1", ia_number: 1, marks: 18, max_marks: 20, submitted_by: "staff1", approved_by: "hod1", status: "approved" },
  { record_id: "ia2", student_id: "std2", subject_id: "sub1", ia_number: 1, marks: 16, max_marks: 20, submitted_by: "staff1", approved_by: "hod1", status: "approved" },
  { record_id: "ia3", student_id: "std3", subject_id: "sub1", ia_number: 1, marks: 12, max_marks: 20, submitted_by: "staff1", approved_by: "hod1", status: "approved" },
  { record_id: "ia4", student_id: "std4", subject_id: "sub1", ia_number: 1, marks: 17, max_marks: 20, submitted_by: "staff1", approved_by: "hod1", status: "approved" },
  { record_id: "ia5", student_id: "std5", subject_id: "sub1", ia_number: 1, marks: 14, max_marks: 20, submitted_by: "staff1", approved_by: "hod1", status: "approved" },
  
  // IA 2
  { record_id: "ia6", student_id: "std1", subject_id: "sub1", ia_number: 2, marks: 19, max_marks: 20, submitted_by: "staff1", status: "pending" },
  { record_id: "ia7", student_id: "std2", subject_id: "sub1", ia_number: 2, marks: 15, max_marks: 20, submitted_by: "staff1", status: "pending" },
  { record_id: "ia8", student_id: "std3", subject_id: "sub1", ia_number: 2, marks: 10, max_marks: 20, submitted_by: "staff1", status: "pending" },
  { record_id: "ia9", student_id: "std4", subject_id: "sub1", ia_number: 2, marks: 18, max_marks: 20, submitted_by: "staff1", status: "pending" },
  { record_id: "ia10", student_id: "std5", subject_id: "sub1", ia_number: 2, marks: 13, max_marks: 20, submitted_by: "staff1", status: "pending" },
  
  // Subject 2 - IA 1
  { record_id: "ia11", student_id: "std1", subject_id: "sub2", ia_number: 1, marks: 17, max_marks: 20, submitted_by: "staff1", approved_by: "hod1", status: "approved" },
  { record_id: "ia12", student_id: "std2", subject_id: "sub2", ia_number: 1, marks: 18, max_marks: 20, submitted_by: "staff1", approved_by: "hod1", status: "approved" },
  { record_id: "ia13", student_id: "std3", subject_id: "sub2", ia_number: 1, marks: 11, max_marks: 20, submitted_by: "staff1", approved_by: "hod1", status: "approved" },
];

export const mockAssignments: Assignment[] = [
  { assignment_id: "asn1", student_id: "std1", subject_id: "sub1", title: "Binary Search Tree Implementation", marks: 9, max_marks: 10, submitted_date: "2026-03-10" },
  { assignment_id: "asn2", student_id: "std2", subject_id: "sub1", title: "Binary Search Tree Implementation", marks: 8, max_marks: 10, submitted_date: "2026-03-10" },
  { assignment_id: "asn3", student_id: "std3", subject_id: "sub1", title: "Binary Search Tree Implementation", marks: 6, max_marks: 10, submitted_date: "2026-03-11" },
  { assignment_id: "asn4", student_id: "std1", subject_id: "sub2", title: "SQL Query Optimization", marks: 10, max_marks: 10, submitted_date: "2026-03-12" },
];

export const mockAchievements: Achievement[] = [
  {
    achievement_id: "ach1",
    student_id: "std1",
    title: "Winner - National Level Hackathon",
    description: "First place in Smart India Hackathon 2026",
    category: "technical",
    date: "2026-02-15",
  },
  {
    achievement_id: "ach2",
    student_id: "std1",
    title: "Best Paper Award",
    description: "IEEE Conference on Artificial Intelligence",
    category: "academic",
    date: "2026-01-20",
  },
  {
    achievement_id: "ach3",
    student_id: "std2",
    title: "State Level Basketball Championship",
    description: "Gold medal in Women's Basketball",
    category: "sports",
    date: "2026-03-01",
  },
  {
    achievement_id: "ach4",
    student_id: "std4",
    title: "Cultural Fest Winner",
    description: "First prize in Classical Dance competition",
    category: "cultural",
    date: "2026-02-28",
  },
];

// New mock data structures for SharedDataContext
export interface MockAssignment {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  staff_id: string;
  due_date: string;
  max_marks: number;
  attachments: string[];
  links: string[];
  created_at: string;
  submissions?: MockSubmission[];
}

export interface MockSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at: string;
  marks: number | null;
  status: 'pending' | 'graded';
}

export interface MockAchievement {
  id: string;
  student_id: string;
  title: string;
  description: string;
  category: 'sports' | 'cultural' | 'technical' | 'academic' | 'other';
  date: string;
  certificate_url: string | null;
  created_at: string;
  staff_id: string;
}

export interface MockIAMark {
  id: string;
  student_id: string;
  subject_id: string;
  ia_number: 1 | 2 | 3;
  marks: number;
  max_marks: number;
  staff_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export const mockAssignmentsData: MockAssignment[] = [
  {
    id: "assignment1",
    title: "Data Structures Assignment 1",
    description: "Implement Binary Search Tree with all operations",
    subject_id: "sub1",
    staff_id: "staff1",
    due_date: "2026-03-25",
    max_marks: 20,
    attachments: [],
    links: ["https://example.com/ds-notes"],
    created_at: "2026-03-10T10:00:00Z",
    submissions: []
  },
  {
    id: "assignment2",
    title: "Database Design Project",
    description: "Design and implement a database for college management system",
    subject_id: "sub2",
    staff_id: "staff1",
    due_date: "2026-03-30",
    max_marks: 25,
    attachments: [],
    links: [],
    created_at: "2026-03-12T14:00:00Z",
    submissions: []
  },
  {
    id: "assignment3",
    title: "Operating Systems Lab",
    description: "Implement process scheduling algorithms",
    subject_id: "sub3",
    staff_id: "staff2",
    due_date: "2026-04-05",
    max_marks: 15,
    attachments: [],
    links: [],
    created_at: "2026-03-15T09:00:00Z",
    submissions: []
  }
];

export const mockSubmissionsData: MockSubmission[] = [
  {
    id: "sub1",
    assignment_id: "assignment1",
    student_id: "std1",
    submitted_at: "2026-03-20T12:00:00Z",
    marks: 18,
    status: 'graded'
  },
  {
    id: "sub2",
    assignment_id: "assignment1",
    student_id: "std2",
    submitted_at: "2026-03-22T10:00:00Z",
    marks: 16,
    status: 'graded'
  },
  {
    id: "sub3",
    assignment_id: "assignment2",
    student_id: "std1",
    submitted_at: "2026-03-28T15:00:00Z",
    marks: null,
    status: 'pending'
  }
];

export const mockAchievementsData: MockAchievement[] = [
  {
    id: "ach1",
    student_id: "std1",
    title: "Winner - National Level Hackathon",
    description: "First place in Smart India Hackathon 2026",
    category: "technical",
    date: "2026-02-15",
    certificate_url: null,
    created_at: "2026-02-16T10:00:00Z",
    staff_id: "staff1"
  },
  {
    id: "ach2",
    student_id: "std1",
    title: "Best Paper Award",
    description: "IEEE Conference on Artificial Intelligence",
    category: "academic",
    date: "2026-01-20",
    certificate_url: null,
    created_at: "2026-01-21T10:00:00Z",
    staff_id: "staff1"
  },
  {
    id: "ach3",
    student_id: "std2",
    title: "State Level Basketball Championship",
    description: "Gold medal in Women's Basketball",
    category: "sports",
    date: "2026-03-01",
    certificate_url: null,
    created_at: "2026-03-02T10:00:00Z",
    staff_id: "staff2"
  }
];

export const mockIAMarksData: MockIAMark[] = [
  {
    id: "ia1",
    student_id: "std1",
    subject_id: "sub1",
    ia_number: 1,
    marks: 18,
    max_marks: 20,
    staff_id: "staff1",
    status: 'approved',
    created_at: "2026-02-15T10:00:00Z",
    approved_at: "2026-02-16T10:00:00Z",
    approved_by: "hod1"
  },
  {
    id: "ia2",
    student_id: "std2",
    subject_id: "sub1",
    ia_number: 1,
    marks: 16,
    max_marks: 20,
    staff_id: "staff1",
    status: 'approved',
    created_at: "2026-02-15T10:00:00Z",
    approved_at: "2026-02-16T10:00:00Z",
    approved_by: "hod1"
  },
  {
    id: "ia3",
    student_id: "std1",
    subject_id: "sub1",
    ia_number: 2,
    marks: 19,
    max_marks: 20,
    staff_id: "staff1",
    status: 'pending',
    created_at: "2026-03-01T10:00:00Z",
    approved_at: null,
    approved_by: null
  },
  {
    id: "ia4",
    student_id: "std2",
    subject_id: "sub1",
    ia_number: 2,
    marks: 15,
    max_marks: 20,
    staff_id: "staff1",
    status: 'pending',
    created_at: "2026-03-01T10:00:00Z",
    approved_at: null,
    approved_by: null
  }
];

// Helper function to get last 30 days
function getLast30Days(): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

// Calculate attendance percentage
export function calculateAttendancePercentage(
  studentId: string,
  subjectId?: string
): number {
  const attendance = generateMockAttendance();
  let records = attendance.filter((r) => r.student_id === studentId);
  
  if (subjectId) {
    records = records.filter((r) => r.subject_id === subjectId);
  }
  
  const totalClasses = records.length;
  const presentClasses = records.filter((r) => r.status === "present" || r.status === "late").length;
  
  return totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
}

// Calculate IA average
export function calculateIAAverage(studentId: string, subjectId: string): number {
  const iaRecords = mockIAMarks.filter(
    (r) => r.student_id === studentId && r.subject_id === subjectId
  );
  
  if (iaRecords.length === 0) return 0;
  
  const total = iaRecords.reduce((sum, record) => {
    const percentage = (record.marks / record.max_marks) * 100;
    return sum + percentage;
  }, 0);
  
  return Math.round(total / iaRecords.length);
}

export interface MockAnnouncement {
  id: string;
  title: string;
  message: string;
  author_id: string;
  author_name: string;
  author_role: string;
  target_audience: "all" | string;
  created_at: string;
}

export const mockAnnouncementsData: MockAnnouncement[] = [
  {
    id: "ann_1",
    title: "Welcome to the new semester",
    message: "Welcome everyone to the new academic year. Please check your timetables in the department portal.",
    author_id: "hod1",
    author_name: "Dr. Robert Smith",
    author_role: "HOD",
    target_audience: "all",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "ann_2",
    title: "Project Submission Guidelines",
    message: "The final year project submission guidelines have been updated. Please adhere to the new format.",
    author_id: "staff1",
    author_name: "Prof. Sarah Johnson",
    author_role: "Staff",
    target_audience: "2021-2025",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  }
];
