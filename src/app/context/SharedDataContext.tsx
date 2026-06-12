import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  mockAssignmentsData,
  mockSubmissionsData,
  mockAchievementsData,
  mockIAMarksData,
  mockAnnouncementsData,
  mockColleges,
  MockAssignment,
  MockSubmission,
  MockAchievement,
  MockIAMark,
  MockAnnouncement,
  College,
  AttendanceRecord,
  generateMockAttendance
} from "../data/mockData";

type Assignment = MockAssignment;
type Submission = MockSubmission;
type Achievement = MockAchievement;
type IAMark = MockIAMark;
type Announcement = MockAnnouncement;

interface SharedDataContextType {
  assignments: Assignment[];
  achievements: Achievement[];
  submissions: Submission[];
  iaMarks: IAMark[];
  announcements: Announcement[];
  colleges: College[];
  addAssignment: (assignment: Omit<Assignment, 'id' | 'created_at'>) => void;
  addAchievement: (achievement: Omit<Achievement, 'id' | 'created_at'>) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'created_at'>) => void;
  addCollege: (college: Omit<College, 'college_id'>) => void;
  updateCollege: (collegeId: string, updates: Partial<College>) => void;
  deleteCollege: (collegeId: string) => void;
  updateAssignment: (assignmentId: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (assignmentId: string) => void;
  updateAchievement: (achievementId: string, updates: Partial<Achievement>) => void;
  deleteAchievement: (achievementId: string) => void;
  updateMarks: (assignmentId: string, studentId: string, marks: number) => void;
  submitAssignment: (assignmentId: string, studentId: string) => void;
  addIAMark: (mark: Omit<IAMark, 'id' | 'created_at'>) => void;
  updateIAMark: (markId: string, updates: Partial<IAMark>) => void;
  deleteIAMarks: (subjectId: string, iaNumber: 1 | 2 | 3) => void;
  approveIAMark: (markId: string, hodId: string) => void;
  rejectIAMark: (markId: string, hodId: string) => void;
  attendance: AttendanceRecord[];
  upsertAttendance: (records: AttendanceRecord[]) => void;
  deleteAttendanceByClass: (subjectId: string, date: string, classNumber: string) => void;
}

const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined);

// Storage keys for localStorage
const STORAGE_KEYS = {
  ASSIGNMENTS: 'dp_assignments',
  ACHIEVEMENTS: 'dp_achievements',
  SUBMISSIONS: 'dp_submissions',
  IA_MARKS: 'dp_ia_marks',
  ANNOUNCEMENTS: 'dp_announcements',
  COLLEGES: 'dp_colleges',
  ATTENDANCE: 'dp_attendance'
};

export function SharedDataProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [iaMarks, setIaMarks] = useState<IAMark[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);

      // Load assignments
      const savedAssignments = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      const assignmentsData = savedAssignments ? JSON.parse(savedAssignments) : mockAssignmentsData;

      // Load submissions
      const savedSubmissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      const submissionsData = savedSubmissions ? JSON.parse(savedSubmissions) : mockSubmissionsData;

      // Attach submissions to assignments
      const assignmentsWithSubmissions = assignmentsData.map((assignment: any) => ({
        ...assignment,
        submissions: submissionsData.filter((sub: any) => sub.assignment_id === assignment.id)
      }));

      setAssignments(assignmentsWithSubmissions);
      setSubmissions(submissionsData);

      // Load achievements
      const savedAchievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      const achievementsData = savedAchievements ? JSON.parse(savedAchievements) : mockAchievementsData;
      setAchievements(achievementsData);

      // Load IA marks
      const savedIAMarks = localStorage.getItem(STORAGE_KEYS.IA_MARKS);
      const iaMarksData = savedIAMarks ? JSON.parse(savedIAMarks) : mockIAMarksData;
      setIaMarks(iaMarksData);

      // Load announcements
      const savedAnnouncements = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      const announcementsData = savedAnnouncements ? JSON.parse(savedAnnouncements) : mockAnnouncementsData;
      setAnnouncements(announcementsData);

      // Load colleges
      const savedColleges = localStorage.getItem(STORAGE_KEYS.COLLEGES);
      const collegesData = savedColleges ? JSON.parse(savedColleges) : mockColleges;
      setColleges(collegesData);

      // Load attendance
      const savedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      const attendanceData = savedAttendance ? JSON.parse(savedAttendance) : generateMockAttendance();
      setAttendance(attendanceData);

    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to mock data if localStorage fails
      const assignmentsWithSubmissions = mockAssignmentsData.map(assignment => ({
        ...assignment,
        submissions: mockSubmissionsData.filter(sub => sub.assignment_id === assignment.id)
      }));
      setAssignments(assignmentsWithSubmissions);
      setAchievements(mockAchievementsData);
      setSubmissions(mockSubmissionsData);
      setIaMarks(mockIAMarksData);
      setAnnouncements(mockAnnouncementsData);
      setColleges(mockColleges);
      setAttendance(generateMockAttendance());
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const addAssignment = (assignmentData: Omit<Assignment, 'id' | 'created_at' | 'submissions'>) => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `assignment_${Date.now()}`,
      created_at: new Date().toISOString(),
      submissions: []
    };

    const updatedAssignments = [...assignments, newAssignment];
    setAssignments(updatedAssignments);
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, updatedAssignments.map(a => ({ ...a, submissions: undefined }))); // Don't save submissions in assignments
  };

  const addAchievement = (achievementData: Omit<Achievement, 'id' | 'created_at'>) => {
    const newAchievement: Achievement = {
      ...achievementData,
      id: `achievement_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    const updatedAchievements = [...achievements, newAchievement];
    setAchievements(updatedAchievements);
    saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, updatedAchievements);
  };

  const addAnnouncement = (announcementData: Omit<Announcement, 'id' | 'created_at'>) => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: `announcement_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    const updatedAnnouncements = [...announcements, newAnnouncement];
    setAnnouncements(updatedAnnouncements);
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, updatedAnnouncements);
  };

  const addCollege = (collegeData: Omit<College, 'college_id'>) => {
    const newCollege: College = {
      ...collegeData,
      college_id: `clg${Date.now()}`
    };

    const updatedColleges = [...colleges, newCollege];
    setColleges(updatedColleges);
    saveToStorage(STORAGE_KEYS.COLLEGES, updatedColleges);
  };

  const updateCollege = (collegeId: string, updates: Partial<College>) => {
    const updatedColleges = colleges.map(college =>
      college.college_id === collegeId ? { ...college, ...updates } : college
    );
    setColleges(updatedColleges);
    saveToStorage(STORAGE_KEYS.COLLEGES, updatedColleges);
  };

  const deleteCollege = (collegeId: string) => {
    const updatedColleges = colleges.filter(college => college.college_id !== collegeId);
    setColleges(updatedColleges);
    saveToStorage(STORAGE_KEYS.COLLEGES, updatedColleges);
  };

  const updateAssignment = (assignmentId: string, updates: Partial<Assignment>) => {
    const updatedAssignments = assignments.map(assignment =>
      assignment.id === assignmentId ? { ...assignment, ...updates } : assignment
    );
    setAssignments(updatedAssignments);
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, updatedAssignments.map(a => ({ ...a, submissions: undefined })));
  };

  const deleteAssignment = (assignmentId: string) => {
    const updatedAssignments = assignments.filter(assignment => assignment.id !== assignmentId);
    setAssignments(updatedAssignments);
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, updatedAssignments.map(a => ({ ...a, submissions: undefined })));
  };

  const updateAchievement = (achievementId: string, updates: Partial<Achievement>) => {
    const updatedAchievements = achievements.map(achievement =>
      achievement.id === achievementId ? { ...achievement, ...updates } : achievement
    );
    setAchievements(updatedAchievements);
    saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, updatedAchievements);
  };

  const deleteAchievement = (achievementId: string) => {
    const updatedAchievements = achievements.filter(achievement => achievement.id !== achievementId);
    setAchievements(updatedAchievements);
    saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, updatedAchievements);
  };

  const updateMarks = (assignmentId: string, studentId: string, marks: number) => {
    const updatedSubmissions = submissions.map(sub =>
      sub.assignment_id === assignmentId && sub.student_id === studentId
        ? { ...sub, marks, status: 'graded' as const }
        : sub
    );

    setSubmissions(updatedSubmissions);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, updatedSubmissions);

    // Update assignments with updated submissions
    const updatedAssignments = assignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, submissions: updatedSubmissions.filter(sub => sub.assignment_id === assignmentId) }
        : assignment
    );
    setAssignments(updatedAssignments);
  };

  const submitAssignment = (assignmentId: string, studentId: string) => {
    const existingSubmission = submissions.find(
      sub => sub.assignment_id === assignmentId && sub.student_id === studentId
    );

    if (!existingSubmission) {
      const newSubmission: Submission = {
        id: `submission_${Date.now()}`,
        assignment_id: assignmentId,
        student_id: studentId,
        submitted_at: new Date().toISOString(),
        marks: null,
        status: 'pending'
      };

      const updatedSubmissions = [...submissions, newSubmission];
      setSubmissions(updatedSubmissions);
      saveToStorage(STORAGE_KEYS.SUBMISSIONS, updatedSubmissions);

      // Update assignments with new submissions
      const updatedAssignments = assignments.map(assignment =>
        assignment.id === assignmentId
          ? { ...assignment, submissions: updatedSubmissions.filter(sub => sub.assignment_id === assignmentId) }
          : assignment
      );
      setAssignments(updatedAssignments);
    }
  };

  const addIAMark = (markData: Omit<IAMark, 'id' | 'created_at'>) => {
    const newIAMark: IAMark = {
      ...markData,
      id: `ia_mark_${markData.student_id}_${markData.subject_id}_ia${markData.ia_number}_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    const updatedIAMarks = [...iaMarks, newIAMark];
    setIaMarks(updatedIAMarks);
    saveToStorage(STORAGE_KEYS.IA_MARKS, updatedIAMarks);
  };

  const updateIAMark = (markId: string, updates: Partial<IAMark>) => {
    const updatedIAMarks = iaMarks.map(mark =>
      mark.id === markId ? { ...mark, ...updates } : mark
    );
    setIaMarks(updatedIAMarks);
    saveToStorage(STORAGE_KEYS.IA_MARKS, updatedIAMarks);
  };

  const upsertAttendance = (records: AttendanceRecord[]) => {
    const updatedAttendance = [...attendance];
    records.forEach(newRecord => {
      const existingIndex = updatedAttendance.findIndex(r => 
        r.student_id === newRecord.student_id && 
        r.subject_id === newRecord.subject_id && 
        r.date === newRecord.date &&
        r.class_number === newRecord.class_number
      );
      if (existingIndex >= 0) {
        updatedAttendance[existingIndex] = newRecord;
      } else {
        updatedAttendance.push(newRecord);
      }
    });
    setAttendance(updatedAttendance);
    saveToStorage(STORAGE_KEYS.ATTENDANCE, updatedAttendance);
  };

  const deleteAttendanceByClass = (subjectId: string, date: string, classNumber: string) => {
    const updatedAttendance = attendance.filter(r => 
      !(r.subject_id === subjectId && r.date === date && r.class_number === classNumber)
    );
    setAttendance(updatedAttendance);
    saveToStorage(STORAGE_KEYS.ATTENDANCE, updatedAttendance);
  };

  const deleteIAMarks = (subjectId: string, iaNumber: 1 | 2 | 3) => {
    const updatedIAMarks = iaMarks.filter(m => 
      !(m.subject_id === subjectId && m.ia_number === iaNumber)
    );
    setIaMarks(updatedIAMarks);
    saveToStorage(STORAGE_KEYS.IA_MARKS, updatedIAMarks);
  };

  const approveIAMark = (markId: string, hodId: string) => {
    const updatedIAMarks = iaMarks.map(mark =>
      mark.id === markId
        ? {
            ...mark,
            status: 'approved' as const,
            approved_at: new Date().toISOString(),
            approved_by: hodId
          }
        : mark
    );

    setIaMarks(updatedIAMarks);
    saveToStorage(STORAGE_KEYS.IA_MARKS, updatedIAMarks);
  };

  const rejectIAMark = (markId: string, hodId: string) => {
    const updatedIAMarks = iaMarks.map(mark =>
      mark.id === markId
        ? {
            ...mark,
            status: 'rejected' as const,
            approved_at: new Date().toISOString(),
            approved_by: hodId
          }
        : mark
    );

    setIaMarks(updatedIAMarks);
    saveToStorage(STORAGE_KEYS.IA_MARKS, updatedIAMarks);
  };

  return (
    <SharedDataContext.Provider value={{
      assignments,
      achievements,
      submissions,
      iaMarks,
      announcements,
      colleges,
      addAssignment,
      addAchievement,
      addAnnouncement,
      addCollege,
      updateCollege,
      deleteCollege,
      updateAssignment,
      deleteAssignment,
      updateAchievement,
      deleteAchievement,
      updateMarks,
      submitAssignment,
      addIAMark,
      updateIAMark,
      deleteIAMarks,
      approveIAMark,
      rejectIAMark,
      attendance,
      upsertAttendance,
      deleteAttendanceByClass
    }}>
      {children}
    </SharedDataContext.Provider>
  );
}

export function useSharedData() {
  const context = useContext(SharedDataContext);
  if (context === undefined) {
    throw new Error('useSharedData must be used within a SharedDataProvider');
  }
  return context;
}