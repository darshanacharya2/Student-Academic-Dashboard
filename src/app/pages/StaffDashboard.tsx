import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatsCard } from "../components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  Trophy,
  Calendar,
  Upload,
  Download,
  ChevronDown,
  ChevronRight,
  Edit2,
  CheckCircle,
  Megaphone,
} from "lucide-react";
import {
  mockStudents,
  mockSubjects,
  generateMockAttendance,
} from "../data/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { useSharedData } from "../context/SharedDataContext";
import { useAuth } from "../context/AuthContext";
import type { MockAssignment, MockAchievement } from "../data/mockData";

export function StaffDashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("attendance");
  const [selectedSubject, setSelectedSubject] = useState("sub1");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClass, setSelectedClass] = useState("1");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, "present" | "absent" | "late" | undefined>>({});
  const [iaMarks, setIAMarks] = useState<Record<string, string>>({});
  const [selectedIaNumber, setSelectedIaNumber] = useState<1 | 2 | 3>(1);
  const [maxMarks, setMaxMarks] = useState(20);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [expandedAttendanceClasses, setExpandedAttendanceClasses] = useState<Set<string>>(new Set());
  const [expandedIaNumbers, setExpandedIaNumbers] = useState<Set<number>>(new Set());
  const [editingAttendanceClass, setEditingAttendanceClass] = useState<string | null>(null);
  const [editingIaNum, setEditingIaNum] = useState<number | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<MockAssignment | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<MockAchievement | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxMarks: "",
    attachments: [] as any[],
    links: [] as string[]
  });
  const [achievementForm, setAchievementForm] = useState({
    studentId: "",
    title: "",
    description: "",
    date: "",
    category: "academic" as "academic" | "sports" | "cultural" | "technical" | "other"
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    target_audience: "all"
  });

  const { assignments, achievements, announcements, addAssignment, addAchievement, addAnnouncement, updateAssignment, deleteAssignment, updateAchievement, deleteAchievement, addIAMark, updateIAMark, attendance, upsertAttendance, iaMarks: contextIaMarks } = useSharedData();
  const { user } = useAuth();

  // Get staff's subjects and students they teach
  const mySubjects = mockSubjects.filter((s) => s.staff_id === user?.user_id);
  const myDepartments = [...new Set(mySubjects.map(s => s.department))]; // Get unique departments
  const myStudents = mockStudents.filter((s) => myDepartments.includes(s.department));
  const availableBatches = ["All", ...new Set(myStudents.map(s => s.batch))];
  const filteredStudents = selectedBatch === "All" ? myStudents : myStudents.filter(s => s.batch === selectedBatch);

  // Check if attendance already saved for current selection
  const isAttendanceSaved = attendance.some(
    r => r.subject_id === selectedSubject && r.date === selectedDate && r.class_number === selectedClass
  );

  // Check if IA marks already saved for current selection
  const isIaMarksSaved = contextIaMarks.some(
    m => m.subject_id === selectedSubject && m.ia_number === selectedIaNumber
  );

  useEffect(() => {
    // Only auto-load existing attendance if NOT in editing mode
    if (editingAttendanceClass === selectedClass) return;
    const existingAttendance = attendance.filter(r => r.subject_id === selectedSubject && r.date === selectedDate && r.class_number === selectedClass);
    const marks: Record<string, "present" | "absent" | "late"> = {};
    existingAttendance.forEach(r => {
      marks[r.student_id] = r.status;
    });
    setAttendanceMarks(marks);
  }, [selectedSubject, selectedDate, selectedClass, attendance]);

  useEffect(() => {
    // Only auto-load existing marks if NOT in editing mode
    if (editingIaNum === selectedIaNumber) return;
    const existingMarks = contextIaMarks.filter(m => m.subject_id === selectedSubject && m.ia_number === selectedIaNumber);
    const marks: Record<string, string> = {};
    existingMarks.forEach(m => {
      marks[m.student_id] = m.marks.toString();
    });
    setIAMarks(marks);
  }, [selectedSubject, selectedIaNumber, contextIaMarks]);

  // Assignment handlers
  const handleAssignmentSubmit = () => {
    if (!assignmentForm.title || !assignmentForm.dueDate || !assignmentForm.maxMarks) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingAssignment) {
      // Update existing assignment
      updateAssignment(editingAssignment.id, {
        title: assignmentForm.title,
        description: assignmentForm.description,
        subject_id: selectedSubject,
        due_date: assignmentForm.dueDate,
        max_marks: parseInt(assignmentForm.maxMarks),
        attachments: assignmentForm.attachments,
        links: assignmentForm.links
      });
      toast.success("Assignment updated successfully!");
    } else {
      // Create new assignment
      addAssignment({
        title: assignmentForm.title,
        description: assignmentForm.description,
        subject_id: selectedSubject,
        staff_id: user?.user_id || "", // Current staff ID
        due_date: assignmentForm.dueDate,
        max_marks: parseInt(assignmentForm.maxMarks),
        attachments: assignmentForm.attachments,
        links: assignmentForm.links
      });
      toast.success("Assignment created successfully!");
    }

    setShowCreateAssignment(false);
    setEditingAssignment(null);
    setAssignmentForm({
      title: "",
      description: "",
      dueDate: "",
      maxMarks: "",
      attachments: [],
      links: []
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAssignmentForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleAddLink = () => {
    const link = prompt("Enter Google Form or other link:");
    if (link) {
      setAssignmentForm(prev => ({
        ...prev,
        links: [...prev.links, link]
      }));
    }
  };

  // Achievement handlers
  const handleAddAchievement = () => {
    setShowAddAchievement(true);
  };

  const handleAchievementSubmit = () => {
    if (!achievementForm.studentId || !achievementForm.title || !achievementForm.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingAchievement) {
      // Update existing achievement
      updateAchievement(editingAchievement.id, {
        student_id: achievementForm.studentId,
        title: achievementForm.title,
        description: achievementForm.description,
        date: achievementForm.date,
        category: achievementForm.category
      });
      toast.success("Achievement updated successfully!");
    } else {
      // Create new achievement
      addAchievement({
        student_id: achievementForm.studentId,
        title: achievementForm.title,
        description: achievementForm.description,
        date: achievementForm.date,
        category: achievementForm.category,
        certificate_url: null,
        staff_id: user?.user_id || "" // Current staff ID
      });
      toast.success("Achievement added successfully!");
    }

    setShowAddAchievement(false);
    setEditingAchievement(null);
    setAchievementForm({
      studentId: "",
      title: "",
      description: "",
      date: "",
      category: "academic"
    });
  };

  const handleAnnouncementSubmit = () => {
    if (!announcementForm.title || !announcementForm.message) {
      toast.error("Please fill in both title and message");
      return;
    }
    
    addAnnouncement({
      title: announcementForm.title,
      message: announcementForm.message,
      author_id: user?.user_id || "staff1",
      author_name: user?.name || "Staff",
      author_role: "Staff",
      target_audience: announcementForm.target_audience
    });
    
    setAnnouncementForm({ title: "", message: "", target_audience: "all" });
    toast.success("Announcement broadcasted successfully!");
  };

  const handleCreateAssignment = () => {
    setShowCreateAssignment(true);
    setEditingAssignment(null);
  };

  const handleEditAssignment = (assignment: MockAssignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.due_date,
      maxMarks: assignment.max_marks.toString(),
      attachments: assignment.attachments,
      links: assignment.links
    });
    setSelectedSubject(assignment.subject_id);
    setShowCreateAssignment(true);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      deleteAssignment(assignmentId);
      toast.success("Assignment deleted successfully!");
    }
  };

  const handleEditAchievement = (achievement: MockAchievement) => {
    setEditingAchievement(achievement);
    setAchievementForm({
      studentId: achievement.student_id,
      title: achievement.title,
      description: achievement.description,
      date: achievement.date,
      category: achievement.category
    });
    setShowAddAchievement(true);
  };

  const handleDeleteAchievement = (achievementId: string) => {
    if (confirm("Are you sure you want to delete this achievement?")) {
      deleteAchievement(achievementId);
      toast.success("Achievement deleted successfully!");
    }
  };

  const handleAttendanceSubmit = () => {
    const markedRecords = Object.entries(attendanceMarks)
      .filter(([_, status]) => status !== undefined)
      .map(([studentId, status]) => ({
        record_id: `att_${studentId}_${selectedSubject}_${selectedDate}_c${selectedClass}`,
        student_id: studentId,
        subject_id: selectedSubject,
        date: selectedDate,
        class_number: selectedClass,
        status: status as "present" | "absent" | "late"
      }));

    if (markedRecords.length > 0) {
      upsertAttendance(markedRecords);
    }

    const presentCount = Object.values(attendanceMarks).filter(status => status === "present").length;
    toast.success(`Attendance saved for Class ${selectedClass}! ${presentCount}/${filteredStudents.length} students present`);
    
    // Reset the attendance marks and exit edit mode after save
    setAttendanceMarks({});
    setEditingAttendanceClass(null);
  };

  const handleIAMarksSubmit = () => {
    const marksEntries = Object.entries(iaMarks);
    if (marksEntries.length === 0) {
      toast.error("Please enter marks for at least one student");
      return;
    }

    let count = 0;
    marksEntries.forEach(([studentId, marksValue]) => {
      const numericMarks = parseInt(marksValue);
      if (!isNaN(numericMarks) && numericMarks >= 0 && numericMarks <= maxMarks && /^\d*$/.test(marksValue)) {
        const existing = contextIaMarks.find(m => m.student_id === studentId && m.subject_id === selectedSubject && m.ia_number === selectedIaNumber);
        
        if (existing) {
          updateIAMark(existing.id, { marks: numericMarks, max_marks: maxMarks });
        } else {
          addIAMark({
            student_id: studentId,
            subject_id: selectedSubject,
            ia_number: selectedIaNumber,
            marks: numericMarks,
            max_marks: maxMarks,
            staff_id: user?.user_id || "",
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: user?.user_id || ""
          });
        }
        count++;
      }
    });

    toast.success(`IA ${selectedIaNumber} marks saved for ${count} students`);
    
    // Reset the marks form and exit edit mode after save
    setIAMarks({});
    setEditingIaNum(null);
  };

  const handleExportIAMarks = () => {
    const csvData = myStudents.map(student => ({
      roll_no: student.roll_no,
      name: student.name,
      marks: iaMarks[student.student_id] || ""
    }));

    const csvContent = [
      ['Roll No', 'Name', 'Marks'],
      ...csvData.map(row => [row.roll_no, row.name, row.marks])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ia${selectedIaNumber}_marks_${selectedSubject}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImportIAMarks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');

      const rollNoIndex = headers.findIndex(h => h.toLowerCase().includes('roll'));
      const marksIndex = headers.findIndex(h => h.toLowerCase().includes('marks'));

      if (rollNoIndex === -1 || marksIndex === -1) {
        toast.error("Invalid CSV format. Expected columns: Roll No, Name, Marks");
        return;
      }

      const newMarks: Record<string, string> = {};
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length > marksIndex) {
          const rollNo = cols[rollNoIndex].trim();
          const marks = cols[marksIndex].trim();

          const student = myStudents.find(s => s.roll_no === rollNo);
          if (student) {
            newMarks[student.student_id] = marks;
          }
        }
      }

      setIAMarks(newMarks);
      toast.success("IA marks imported successfully!");
    };
    reader.readAsText(file);
  };

  const exportAttendanceAsCSV = () => {
    const records = attendance.filter(r => r.subject_id === selectedSubject && r.date === selectedDate && r.class_number === selectedClass);
    if (records.length === 0) {
      toast.error("No attendance records found for this criteria.");
      return;
    }

    const csvContent = [
      ['Roll No', 'Name', 'Status'],
      ...filteredStudents.map(student => {
        const record = records.find(r => r.student_id === student.student_id);
        return [student.roll_no, student.name, record ? record.status : "Not Marked"];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedSubject}_${selectedDate}_class${selectedClass}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAssignmentGradesAsCSV = (assignment: MockAssignment) => {
    if (!assignment.submissions || assignment.submissions.length === 0) {
      toast.error("No submissions for this assignment yet.");
      return;
    }
    const csvContent = [
      ['Roll No', 'Name', 'Status', 'Marks', 'Max Marks', 'Submitted At'],
      ...myStudents.map(student => {
        const sub = assignment.submissions?.find(s => s.student_id === student.student_id);
        return [
          student.roll_no,
          student.name,
          sub ? sub.status : "Not Submitted",
          sub?.marks !== undefined && sub?.marks !== null ? sub.marks : "",
          assignment.max_marks,
          sub ? new Date(sub.submitted_at).toLocaleString() : ""
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grades_${assignment.title.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sidebar = (
    <div className="p-4 space-y-2">
      <Button
        variant={selectedTab === "attendance" ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => setSelectedTab("attendance")}
      >
        <ClipboardCheck className="mr-2 h-4 w-4" />
        Attendance
      </Button>
      <Button
        variant={selectedTab === "ia-marks" ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => setSelectedTab("ia-marks")}
      >
        <BookOpen className="mr-2 h-4 w-4" />
        IA Marks
      </Button>
      <Button
        variant={selectedTab === "assignments" ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => setSelectedTab("assignments")}
      >
        <Upload className="mr-2 h-4 w-4" />
        Assignments
      </Button>
      <Button
        variant={selectedTab === "achievements" ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => setSelectedTab("achievements")}
      >
        <Trophy className="mr-2 h-4 w-4" />
        Achievements
      </Button>
      <Button
        variant={selectedTab === "announcements" ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => setSelectedTab("announcements")}
      >
        <Megaphone className="mr-2 h-4 w-4" />
        Announcements
      </Button>
    </div>
  );

  return (
    <DashboardLayout title="Staff Dashboard" sidebar={sidebar}>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-8 flex flex-wrap gap-2">
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" /> Attendance
          </TabsTrigger>
          <TabsTrigger value="ia-marks" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> IA Marks
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Upload className="w-4 h-4" /> Assignments
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Achievements
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" /> Announcements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="My Subjects"
              value={mySubjects.length}
              icon={BookOpen}
            />
            <StatsCard
              title="Total Students"
              value={myStudents.length}
              icon={Users}
              iconColor="text-purple-600"
            />
            <StatsCard
              title="Classes Today"
              value={3}
              icon={Calendar}
              iconColor="text-green-600"
            />
          </div>

          {/* Attendance Marking */}
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Select Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mySubjects.map((subject) => (
                        <SelectItem key={subject.subject_id} value={subject.subject_id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Class 1</SelectItem>
                      <SelectItem value="2">Class 2</SelectItem>
                      <SelectItem value="3">Class 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Batch</Label>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBatches.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Show table only if NOT already saved, or if editing */}
              {(!isAttendanceSaved || editingAttendanceClass === selectedClass) ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Attendance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.student_id}>
                          <TableCell className="font-medium">{student.roll_no}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={attendanceMarks[student.student_id] === "present" ? "default" : "outline"}
                                onClick={() =>
                                  setAttendanceMarks((prev) => ({
                                    ...prev,
                                    [student.student_id]: "present",
                                  }))
                                }
                              >
                                P
                              </Button>
                              <Button
                                size="sm"
                                variant={attendanceMarks[student.student_id] === "absent" ? "destructive" : "outline"}
                                onClick={() =>
                                  setAttendanceMarks((prev) => ({
                                    ...prev,
                                    [student.student_id]: "absent",
                                  }))
                                }
                              >
                                AB
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleAttendanceSubmit} className="flex-1">
                      {editingAttendanceClass === selectedClass ? "Update Attendance" : "Save Attendance"}
                    </Button>
                    <Button variant="outline" onClick={exportAttendanceAsCSV}>
                      <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    {editingAttendanceClass === selectedClass && (
                      <Button variant="outline" onClick={() => {
                        setEditingAttendanceClass(null);
                        setAttendanceMarks({});
                      }}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 py-6 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">Attendance already saved for Class {selectedClass}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const savedRecords = attendance.filter(
                  r => r.subject_id === selectedSubject && r.date === selectedDate
                );
                const classPeriods = [...new Set(savedRecords.map(r => r.class_number))].sort();
                
                if (classPeriods.length === 0) {
                  return (
                    <p className="text-center text-gray-500 py-4">
                      No attendance saved for this subject and date yet.
                    </p>
                  );
                }

                return classPeriods.map(classNum => {
                  const classRecords = savedRecords.filter(r => r.class_number === classNum);
                  const presentCount = classRecords.filter(r => r.status === "present").length;
                  const absentCount = classRecords.filter(r => r.status === "absent").length;
                  const lateCount = classRecords.filter(r => r.status === "late").length;
                  const isExpanded = expandedAttendanceClasses.has(classNum);
                  const subjectName = mySubjects.find(s => s.subject_id === selectedSubject)?.name || selectedSubject;

                  return (
                    <div key={classNum} className="mb-3 border rounded-lg overflow-hidden">
                      {/* Collapsed header — always visible */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setExpandedAttendanceClasses(prev => {
                            const next = new Set(prev);
                            if (next.has(classNum)) next.delete(classNum);
                            else next.add(classNum);
                            return next;
                          });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                          <div>
                            <h4 className="font-semibold text-sm">Class {classNum}</h4>
                            <p className="text-xs text-gray-500">{subjectName} · {selectedDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-700">P: {presentCount}</Badge>
                          <Badge className="bg-red-100 text-red-700">Ab: {absentCount}</Badge>
                          {lateCount > 0 && <Badge className="bg-yellow-100 text-yellow-700">Late: {lateCount}</Badge>}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Load this class's attendance into the form for editing
                              setSelectedClass(classNum);
                              setEditingAttendanceClass(classNum);
                              const marks: Record<string, "present" | "absent" | "late"> = {};
                              classRecords.forEach(r => {
                                marks[r.student_id] = r.status;
                              });
                              setAttendanceMarks(marks);
                            }}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      {/* Expanded details — hidden by default */}
                      {isExpanded && (
                        <div className="border-t px-4 pb-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Roll No</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {classRecords.map(record => {
                                const student = myStudents.find(s => s.student_id === record.student_id);
                                return (
                                  <TableRow key={record.record_id}>
                                    <TableCell className="font-medium">{student?.roll_no}</TableCell>
                                    <TableCell>{student?.name}</TableCell>
                                    <TableCell>
                                      <Badge
                                        className={record.status === "present"
                                          ? "bg-green-100 text-green-700"
                                          : record.status === "absent"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-yellow-100 text-yellow-700"}
                                      >
                                        {record.status === "present" ? "P" : record.status === "absent" ? "Ab" : "Late"}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ia-marks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enter IA Marks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mySubjects.map((subject) => (
                        <SelectItem key={subject.subject_id} value={subject.subject_id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>IA Number</Label>
                  <Select value={selectedIaNumber.toString()} onValueChange={(value) => setSelectedIaNumber(parseInt(value) as 1 | 2 | 3)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">IA 1</SelectItem>
                      <SelectItem value="2">IA 2</SelectItem>
                      <SelectItem value="3">IA 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Maximum Marks</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(parseInt(e.target.value) || 20)}
                    placeholder="Enter max marks"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Batch</Label>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBatches.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Marks (out of {maxMarks})</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-medium">{student.roll_no}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter marks"
                          value={iaMarks[student.student_id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setIAMarks((prev) => ({ ...prev, [student.student_id]: val }));
                            } else if (/^\d*$/.test(val)) {
                              const num = parseInt(val, 10);
                              if (!isNaN(num) && num >= 0 && num <= maxMarks) {
                                setIAMarks((prev) => ({ ...prev, [student.student_id]: val }));
                              }
                            }
                          }}
                          className="w-24"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {(!isIaMarksSaved || editingIaNum === selectedIaNumber) ? (
                <div className="flex gap-2">
                  <Button onClick={handleExportIAMarks} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <label className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Import CSV
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImportIAMarks}
                      className="hidden"
                    />
                  </label>
                  <Button onClick={handleIAMarksSubmit} className="flex-1">
                    {editingIaNum === selectedIaNumber ? "Update IA Marks" : "Save IA Marks"}
                  </Button>
                  {editingIaNum === selectedIaNumber && (
                    <Button variant="outline" onClick={() => {
                      setEditingIaNum(null);
                      setIAMarks({});
                    }}>
                      Cancel
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-6 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">IA {selectedIaNumber} marks already saved</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved IA Marks */}
          <Card>
            <CardHeader>
              <CardTitle>Saved IA Marks</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const savedMarks = contextIaMarks.filter(
                  m => m.subject_id === selectedSubject
                );
                const iaNumbers = [...new Set(savedMarks.map(m => m.ia_number))].sort();
                
                if (iaNumbers.length === 0) {
                  return (
                    <p className="text-center text-gray-500 py-4">
                      No IA marks saved for this subject yet.
                    </p>
                  );
                }

                return iaNumbers.map(iaNum => {
                  const iaRecords = savedMarks.filter(m => m.ia_number === iaNum);
                  const avgMarks = iaRecords.length > 0
                    ? (iaRecords.reduce((sum, m) => sum + m.marks, 0) / iaRecords.length).toFixed(1)
                    : '-';
                  const isExpanded = expandedIaNumbers.has(iaNum);
                  const subjectName = mySubjects.find(s => s.subject_id === selectedSubject)?.name || selectedSubject;

                  return (
                    <div key={iaNum} className="mb-3 border rounded-lg overflow-hidden">
                      {/* Collapsed header — always visible */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setExpandedIaNumbers(prev => {
                            const next = new Set(prev);
                            if (next.has(iaNum)) next.delete(iaNum);
                            else next.add(iaNum);
                            return next;
                          });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                          <div>
                            <h4 className="font-semibold text-sm">IA {iaNum}</h4>
                            <p className="text-xs text-gray-500">{subjectName} · {iaRecords.length} students</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700">Avg: {avgMarks}</Badge>
                          <Badge className="bg-green-100 text-green-700">Saved</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Load this IA's marks into the form for editing
                              setSelectedIaNumber(iaNum);
                              setEditingIaNum(iaNum);
                              const marks: Record<string, string> = {};
                              iaRecords.forEach(m => {
                                marks[m.student_id] = m.marks.toString();
                              });
                              setIAMarks(marks);
                              if (iaRecords[0]) setMaxMarks(iaRecords[0].max_marks);
                            }}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      {/* Expanded details — hidden by default */}
                      {isExpanded && (
                        <div className="border-t px-4 pb-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Roll No</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Marks</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {iaRecords.map(mark => {
                                const student = myStudents.find(s => s.student_id === mark.student_id);
                                return (
                                  <TableRow key={mark.id}>
                                    <TableCell className="font-medium">{student?.roll_no}</TableCell>
                                    <TableCell>{student?.name}</TableCell>
                                    <TableCell>{mark.marks}/{mark.max_marks}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assignment Management</CardTitle>
              <Button onClick={handleCreateAssignment}>
                <Upload className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.filter(assignment => assignment.staff_id === user?.user_id).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No assignments created yet. Click "Create Assignment" to add your first assignment.
                  </p>
                ) : (
                  assignments
                    .filter(assignment => assignment.staff_id === user?.user_id)
                    .map((assignment) => (
                      <div key={assignment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{assignment.title}</h3>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                        <p className="text-sm text-gray-500 mb-3">
                          Due: {new Date(assignment.due_date).toLocaleDateString()} | Max Marks: {assignment.max_marks}
                        </p>
                        {assignment.links.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium">Links:</p>
                            {assignment.links.map((link, index) => (
                              <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline block"
                              >
                                {link}
                              </a>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/staff/assignments/${assignment.id}/view`)}>
                            View Submissions ({assignment.submissions?.length || 0}/{myStudents.length})
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/staff/assignments/${assignment.id}/grade`)}>
                            Grade Submissions
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/staff/assignments/${assignment.id}/edit`)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => exportAssignmentGradesAsCSV(assignment)}>
                            <Download className="mr-2 h-4 w-4" /> Export Grades
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteAssignment(assignment.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {showCreateAssignment && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter assignment title"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter assignment description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxMarks">Maximum Marks *</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    value={assignmentForm.maxMarks}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, maxMarks: e.target.value }))}
                    placeholder="Enter max marks"
                  />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mySubjects.map((subject) => (
                        <SelectItem key={subject.subject_id} value={subject.subject_id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Attachments & Links</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Files
                        </span>
                      </Button>
                    </label>
                    <Button variant="outline" size="sm" onClick={handleAddLink}>
                      Add Link
                    </Button>
                  </div>
                  
                  {assignmentForm.attachments.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Files: {assignmentForm.attachments.map(f => f.name).join(', ')}
                    </div>
                  )}
                  
                  {assignmentForm.links.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Links: {assignmentForm.links.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAssignmentSubmit}>Create Assignment</Button>
                <Button variant="outline" onClick={() => setShowCreateAssignment(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Student Achievements</CardTitle>
              <Button onClick={handleAddAchievement}>
                <Upload className="mr-2 h-4 w-4" />
                Add Achievement
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.filter(achievement => achievement.staff_id === user?.user_id).length === 0 ? (
                  <p className="text-sm text-center text-gray-500 py-4">
                    No achievements added yet. Click "Add Achievement" to track student accomplishments.
                  </p>
                ) : (
                  achievements
                    .filter(achievement => achievement.staff_id === user?.user_id)
                    .map((achievement) => {
                      const student = myStudents.find(s => s.student_id === achievement.student_id);
                      return (
                        <div key={achievement.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{achievement.title}</h3>
                              <p className="text-sm text-gray-500">
                                {student?.name} ({student?.roll_no}) | {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)} Achievement
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(achievement.date).toLocaleDateString()}
                              </p>
                              {achievement.description && (
                                <p className="text-sm text-gray-600 mt-2">{achievement.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditAchievement(achievement)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteAchievement(achievement.id)}>
                                Delete
                              </Button>
                              <Trophy className="h-8 w-8 text-yellow-500" />
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}

                <p className="text-sm text-center text-gray-500 py-4">
                  Track and upload student achievements, certificates, and awards
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {showAddAchievement && (
          <Card>
            <CardHeader>
              <CardTitle>Add Student Achievement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Student *</Label>
                  <Select value={achievementForm.studentId} onValueChange={(value) => setAchievementForm(prev => ({ ...prev, studentId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {myStudents.map((student) => (
                        <SelectItem key={student.student_id} value={student.student_id}>
                          {student.name} ({student.roll_no})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="achievementDate">Date *</Label>
                  <Input
                    id="achievementDate"
                    type="date"
                    value={achievementForm.date}
                    onChange={(e) => setAchievementForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="achievementTitle">Achievement Title *</Label>
                <Input
                  id="achievementTitle"
                  value={achievementForm.title}
                  onChange={(e) => setAchievementForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter achievement title"
                />
              </div>

              <div>
                <Label htmlFor="achievementDescription">Description</Label>
                <textarea
                  id="achievementDescription"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={achievementForm.description}
                  onChange={(e) => setAchievementForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter achievement description"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select value={achievementForm.category} onValueChange={(value: any) => setAchievementForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAchievementSubmit}>Add Achievement</Button>
                <Button variant="outline" onClick={() => setShowAddAchievement(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="annTitle">Title</Label>
                  <Input
                    id="annTitle"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <Label>Target Batch</Label>
                  <Select value={announcementForm.target_audience} onValueChange={(value) => setAnnouncementForm(prev => ({ ...prev, target_audience: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBatches.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="annMessage">Message</Label>
                <textarea
                  id="annMessage"
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Write your message here..."
                />
              </div>
              <Button onClick={handleAnnouncementSubmit}>
                <Megaphone className="w-4 h-4 mr-2" />
                Post Announcement
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Announcements</h3>
            {announcements.filter(a => a.author_id === user?.user_id || a.author_role === "HOD").length === 0 ? (
              <p className="text-gray-500">No announcements to display.</p>
            ) : (
              announcements
                .filter(a => a.author_id === user?.user_id || a.author_role === "HOD")
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((ann) => (
                  <Card key={ann.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{ann.title}</h4>
                          <p className="text-sm text-gray-500">
                            By {ann.author_name} ({ann.author_role}) • {new Date(ann.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {ann.target_audience === "all" 
                            ? (ann.author_role === "HOD" ? "Entire Department" : "All My Students") 
                            : ann.target_audience}
                        </Badge>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{ann.message}</p>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
