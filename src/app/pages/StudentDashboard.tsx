import { DashboardLayout } from "../components/DashboardLayout";
import { StatsCard } from "../components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Trophy,
  AlertTriangle,
  Award,
  FileText,
  Megaphone,
  UploadCloud,
  X,
  File as FileIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  mockSubjects,
  calculateIAAverage,
} from "../data/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useAuth } from "../context/AuthContext";
import { useSharedData } from "../context/SharedDataContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export function StudentDashboard() {
  const { user } = useAuth();
  const { assignments, achievements, submissions, submitAssignment, iaMarks, attendance, announcements } = useSharedData();
  const studentId = user?.student_id || "std1";
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [simulatedFiles, setSimulatedFiles] = useState<{name: string, size: string}[]>([]);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSimulatedFiles(prev => [...prev, { name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + " MB" }]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleConfirmSubmit = (assignmentId: string) => {
    submitAssignment(assignmentId, studentId);
    setSelectedAssignmentId(null);
    setSimulatedFiles([]);
    toast.success("Assignment submitted successfully!");
  };

  const getAttendancePercent = (sid: string, subId?: string) => {
    let records = attendance.filter((r) => r.student_id === sid);
    if (subId) {
      records = records.filter((r) => r.subject_id === subId);
    }
    const totalClasses = records.length;
    const presentClasses = records.filter((r) => r.status === "present" || r.status === "late").length;
    return totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
  };

  // Calculate overall statistics
  const overallAttendance = getAttendancePercent(studentId);
  const mySubjects = mockSubjects.filter((s) => s.department === user?.department);
  
  // Get student's IA marks
  const myIAMarks = iaMarks.filter((m) => m.student_id === studentId);
  const approvedMarks = myIAMarks;
  
  // Calculate average IA percentage
  const avgIAPercentage = approvedMarks.length > 0
    ? Math.round(
        approvedMarks.reduce((sum, m) => sum + (m.marks / m.max_marks) * 100, 0) /
          approvedMarks.length
      )
    : 0;

  // Get student's assignments and achievements
  const myAssignments = assignments.filter(assignment => 
    mySubjects.some(subject => subject.subject_id === assignment.subject_id)
  );
  const myAchievements = achievements.filter(achievement => achievement.student_id === studentId);

  // Attendance shortage warning
  const attendanceShortage = overallAttendance < 75;
  const lowPerformance = avgIAPercentage < 50;

  // Filter announcements for the student
  const myAnnouncements = announcements
    .filter(a => a.target_audience === "all" || a.target_audience === user?.batch)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Subject-wise data for pie chart
  const subjectAttendanceData = mySubjects.map((subject) => ({
    name: subject.code,
    value: getAttendancePercent(studentId, subject.subject_id),
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  const sidebar = (
    <div className="p-4 space-y-2">
      <div className="px-3 py-2">
        <p className="text-xs font-medium text-gray-500 mb-1">Semester 5</p>
        <p className="text-sm font-medium">{user?.department}</p>
      </div>
      <div className="border-t pt-2 mt-2">
        <div className="px-3 py-2">
          <p className="text-xs text-gray-500">Overall Attendance</p>
          <p className="text-2xl font-bold">{overallAttendance}%</p>
          <Progress value={overallAttendance} className="mt-2" />
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title={`Welcome, ${user?.name}!`} sidebar={sidebar}>
      <div className="space-y-6">
        {/* Alerts */}
        {(attendanceShortage || lowPerformance) && (
          <div className="space-y-3">
            {attendanceShortage && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Shortage of Attendance!</strong> Your attendance is {overallAttendance}%. 
                  You need at least 75% to be eligible for exams.
                </AlertDescription>
              </Alert>
            )}
            {lowPerformance && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Low Performance Alert!</strong> Your average IA marks are {avgIAPercentage}%. 
                  Please consult with your faculty for improvement.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Announcements Widget */}
        {myAnnouncements.length > 0 && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Megaphone className="w-5 h-5 mr-2 text-blue-500" />
                Recent Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myAnnouncements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="border-b last:border-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-md">{ann.title}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-1">{ann.message}</p>
                    <p className="text-xs text-gray-500 font-medium">
                      By {ann.author_name} ({ann.author_role})
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Overall Attendance"
            value={`${overallAttendance}%`}
            icon={Calendar}
            iconColor={overallAttendance >= 75 ? "text-green-600" : "text-red-600"}
          />
          <StatsCard
            title="Average IA Marks"
            value={`${avgIAPercentage}%`}
            icon={BookOpen}
            iconColor="text-purple-600"
          />
          <StatsCard
            title="Assignments Submitted"
            value={myAssignments.length}
            icon={FileText}
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Achievements"
            value={myAchievements.length}
            icon={Trophy}
            iconColor="text-yellow-600"
          />
        </div>

        {/* Attendance & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mySubjects.map((subject) => {
                    const attendance = getAttendancePercent(studentId, subject.subject_id);
                    return (
                      <TableRow key={subject.subject_id}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>{subject.code}</TableCell>
                        <TableCell>{attendance}%</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              attendance >= 75
                                ? "bg-green-100 text-green-700"
                                : attendance >= 60
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }
                          >
                            {attendance >= 75 ? "Good" : attendance >= 60 ? "Warning" : "Critical"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={subjectAttendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subjectAttendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* IA Marks */}
        <Card>
          <CardHeader>
            <CardTitle>Internal Assessment (IA) Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>IA Number</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myIAMarks.map((mark) => {
                  const subject = mySubjects.find((s) => s.subject_id === mark.subject_id);
                  const percentage = Math.round((mark.marks / mark.max_marks) * 100);
                  
                  return (
                    <TableRow key={mark.id}>
                      <TableCell className="font-medium">{subject?.name}</TableCell>
                      <TableCell>IA {mark.ia_number}</TableCell>
                      <TableCell>
                        {mark.marks}/{mark.max_marks}
                      </TableCell>
                      <TableCell>{percentage}%</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            mark.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : mark.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }
                        >
                          {mark.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {myAssignments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No assignments available</p>
            ) : (
              <div className="space-y-4">
                {myAssignments.map((assignment) => {
                  const mySubmission = submissions.find(
                    sub => sub.assignment_id === assignment.id && sub.student_id === studentId
                  );
                  
                  return (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{assignment.title}</h3>
                        <Badge className={
                          mySubmission 
                            ? mySubmission.status === "graded" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }>
                          {mySubmission 
                            ? mySubmission.status === "graded" 
                              ? "Graded" 
                              : "Submitted"
                            : "Pending"
                          }
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                      <p className="text-sm text-gray-500 mb-3">
                        Due: {new Date(assignment.due_date).toLocaleDateString()} | Max Marks: {assignment.max_marks}
                      </p>
                      
                      {assignment.links.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium">Assignment Links:</p>
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
                      
                      {mySubmission ? (
                        <div className="flex items-center gap-4">
                          <span className="text-sm">
                            Submitted: {new Date(mySubmission.submitted_at).toLocaleDateString()}
                          </span>
                          {mySubmission.marks !== undefined && (
                            <Badge className="bg-green-100 text-green-700">
                              Marks: {mySubmission.marks}/{assignment.max_marks}
                            </Badge>
                          )}
                        </div>
                      ) : selectedAssignmentId === assignment.id ? (
                        <div className="mt-4 border rounded-md p-4 bg-gray-50">
                          <h4 className="font-medium text-sm mb-3">Submit your work</h4>
                          
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                            onDrop={handleFileDrop}
                            onDragOver={handleDragOver}
                            onClick={() => {
                              // Simulate clicking a file input
                              const fakeFiles = [
                                { name: "assignment_solution.pdf", size: "2.4 MB" },
                                { name: "code_files.zip", size: "5.1 MB" },
                                { name: "presentation.pptx", size: "12.0 MB" }
                              ];
                              const randomFile = fakeFiles[Math.floor(Math.random() * fakeFiles.length)];
                              setSimulatedFiles(prev => [...prev, randomFile]);
                            }}
                          >
                            <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">Click to browse or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, ZIP, DOCX up to 50MB</p>
                          </div>

                          {simulatedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {simulatedFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-white border rounded text-sm">
                                  <div className="flex items-center">
                                    <FileIcon className="h-4 w-4 text-blue-500 mr-2" />
                                    <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-gray-500 ml-2 text-xs">({file.size})</span>
                                  </div>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSimulatedFiles(prev => prev.filter((_, i) => i !== idx))}>
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 mt-4 justify-end">
                            <Button variant="outline" size="sm" onClick={() => { setSelectedAssignmentId(null); setSimulatedFiles([]); }}>
                              Cancel
                            </Button>
                            <Button size="sm" disabled={simulatedFiles.length === 0} onClick={() => handleConfirmSubmit(assignment.id)}>
                              Confirm Submission
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedAssignmentId(assignment.id)}
                        >
                          Submit Assignment
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle>My Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {myAchievements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No achievements recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="border rounded-lg p-4 flex items-start gap-4"
                  >
                    <div className="p-3 bg-yellow-50 rounded-full">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="bg-blue-100 text-blue-700">
                          {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
