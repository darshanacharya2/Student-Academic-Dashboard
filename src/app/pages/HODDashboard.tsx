import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatsCard } from "../components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  FileText,
  UserCheck,
  Megaphone,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import {
  mockStudents,
  mockSubjects,
  calculateAttendancePercentage,
  calculateIAAverage,
} from "../data/mockData";
import { useSharedData } from "../context/SharedDataContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

export function HODDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", target_audience: "all" });
  const navigate = useNavigate();
  const { iaMarks, approveIAMark, rejectIAMark, announcements, addAnnouncement } = useSharedData();
  const { user } = useAuth();

  const allDepartmentStudents = mockStudents.filter((s) => s.department === "Computer Science");
  const availableBatches = ["All", ...new Set(allDepartmentStudents.map(s => s.batch))];
  const departmentStudents = selectedBatch === "All" ? allDepartmentStudents : allDepartmentStudents.filter(s => s.batch === selectedBatch);
  const departmentSubjects = mockSubjects.filter((s) => s.department === "Computer Science");

  // Calculate department statistics
  const avgAttendance = Math.round(
    departmentStudents.reduce((sum, s) => sum + calculateAttendancePercentage(s.student_id), 0) /
      departmentStudents.length
  );

  const lowAttendanceStudents = departmentStudents.filter(
    (s) => calculateAttendancePercentage(s.student_id) < 75
  );

  // Attendance distribution data
  const attendanceData = [
    { range: "90-100%", count: departmentStudents.filter(s => calculateAttendancePercentage(s.student_id) >= 90).length },
    { range: "75-89%", count: departmentStudents.filter(s => {
      const att = calculateAttendancePercentage(s.student_id);
      return att >= 75 && att < 90;
    }).length },
    { range: "60-74%", count: departmentStudents.filter(s => {
      const att = calculateAttendancePercentage(s.student_id);
      return att >= 60 && att < 75;
    }).length },
    { range: "<60%", count: departmentStudents.filter(s => calculateAttendancePercentage(s.student_id) < 60).length },
  ];



  // Report generation functions
  const generateAttendanceReport = () => {
    const csvContent = [
      ['Student Name', 'Student ID', 'Attendance Percentage', 'Status'],
      ...departmentStudents.map(student => [
        student.name,
        student.student_id,
        `${calculateAttendancePercentage(student.student_id)}%`,
        calculateAttendancePercentage(student.student_id) >= 75 ? 'Good' : 'Low'
      ])
    ].map(row => row.join(',')).join('\n');

    downloadFile(csvContent, 'attendance_report.csv', 'text/csv');
    toast.success("Attendance report generated and downloaded");
  };

  const generateIAMarksReport = () => {
    const csvContent = [
      ['Student Name', 'Subject', 'IA1', 'IA2', 'IA3', 'Average', 'Status'],
      ...iaMarks.filter(mark => 
        departmentStudents.some(s => s.student_id === mark.student_id)
      ).map(mark => {
        const student = departmentStudents.find(s => s.student_id === mark.student_id);
        const subject = departmentSubjects.find(s => s.subject_id === mark.subject_id);
        return [
          student?.name || 'Unknown',
          subject?.name || 'Unknown',
          mark.ia_number === 1 ? mark.marks : '',
          mark.ia_number === 2 ? mark.marks : '',
          mark.ia_number === 3 ? mark.marks : '',
          '', // Average would need to be calculated
          mark.status
        ];
      })
    ].map(row => row.join(',')).join('\n');

    downloadFile(csvContent, 'ia_marks_report.csv', 'text/csv');
    toast.success("IA marks report generated and downloaded");
  };

  const generatePerformanceReport = () => {
    const csvContent = [
      ['Student Name', 'Student ID', 'Attendance %', 'IA Average', 'Overall Performance'],
      ...departmentStudents.map(student => {
        const attendance = calculateAttendancePercentage(student.student_id);
        const studentIAMarks = iaMarks.filter(m => m.student_id === student.student_id);
        const avgIAMarks = studentIAMarks.length > 0 
          ? studentIAMarks.reduce((sum, m) => sum + m.marks, 0) / studentIAMarks.length 
          : 0;
        
        let performance = 'Poor';
        if (attendance >= 85 && avgIAMarks >= 80) performance = 'Excellent';
        else if (attendance >= 75 && avgIAMarks >= 70) performance = 'Good';
        else if (attendance >= 65 && avgIAMarks >= 60) performance = 'Average';

        return [
          student.name,
          student.student_id,
          `${attendance}%`,
          avgIAMarks.toFixed(2),
          performance
        ];
      })
    ].map(row => row.join(',')).join('\n');

    downloadFile(csvContent, 'performance_report.csv', 'text/csv');
    toast.success("Performance report generated and downloaded");
  };

  const generateAnalyticsReport = () => {
    const analytics = {
      totalStudents: departmentStudents.length,
      avgAttendance: avgAttendance,
      lowAttendanceCount: lowAttendanceStudents.length,
      subjectsCount: departmentSubjects.length
    };

    const csvContent = [
      ['Metric', 'Value'],
      ['Total Students', analytics.totalStudents],
      ['Average Attendance %', `${analytics.avgAttendance}%`],
      ['Students with Low Attendance (<75%)', analytics.lowAttendanceCount],
      ['Total Subjects', analytics.subjectsCount]
    ].map(row => row.join(',')).join('\n');

    downloadFile(csvContent, 'analytics_report.csv', 'text/csv');
    toast.success("Analytics report generated and downloaded");
  };

  // Export functions
  const exportAsPDF = () => {
    // For demo purposes, we'll create a simple text file
    // In a real application, you'd use a PDF library like jsPDF
    const content = `Department Analytics Report
Generated on: ${new Date().toLocaleDateString()}

Summary:
- Total Students: ${departmentStudents.length}
- Average Attendance: ${avgAttendance}%
- Low Attendance Students: ${lowAttendanceStudents.length}
- Total Subjects: ${departmentSubjects.length}

Student Details:
${departmentStudents.map(s => 
  `${s.name} (${s.student_id}): ${calculateAttendancePercentage(s.student_id)}% attendance`
).join('\n')}`;

    downloadFile(content, 'department_report.pdf', 'application/pdf');
    toast.success("PDF report exported");
  };

  const exportAsExcel = () => {
    // For demo purposes, we'll create a CSV file
    // In a real application, you'd use a library like xlsx
    const csvContent = [
      ['Student Name', 'ID', 'Email', 'Attendance %', 'IA Average'],
      ...departmentStudents.map(student => {
        const studentIAMarks = iaMarks.filter(m => m.student_id === student.student_id);
        const avgIAMarks = studentIAMarks.length > 0 
          ? studentIAMarks.reduce((sum, m) => sum + m.marks, 0) / studentIAMarks.length 
          : 0;
        
        return [
          student.name,
          student.student_id,
          student.email,
          calculateAttendancePercentage(student.student_id),
          avgIAMarks.toFixed(2)
        ];
      })
    ].map(row => row.join(',')).join('\n');

    downloadFile(csvContent, 'department_data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    toast.success("Excel file exported");
  };

  const exportAsCSV = () => {
    const csvContent = [
      ['Student Name', 'ID', 'Email', 'Department', 'Attendance %'],
      ...departmentStudents.map(student => [
        student.name,
        student.student_id,
        student.email,
        student.department,
        calculateAttendancePercentage(student.student_id)
      ])
    ].map(row => row.join(',')).join('\n');

    downloadFile(csvContent, 'department_data.csv', 'text/csv');
    toast.success("CSV file exported");
  };

  const handleAnnouncementSubmit = () => {
    if (!announcementForm.title || !announcementForm.message) {
      toast.error("Please fill in both title and message");
      return;
    }
    
    addAnnouncement({
      title: announcementForm.title,
      message: announcementForm.message,
      author_id: user?.user_id || "hod1",
      author_name: user?.name || "HOD",
      author_role: "HOD",
      target_audience: announcementForm.target_audience
    });
    
    setAnnouncementForm({ title: "", message: "", target_audience: "all" });
    toast.success("Announcement broadcasted successfully!");
  };

  // Utility function to download files
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sidebar = (
    <div className="p-4 space-y-4">
      <div className="pb-4 border-b border-gray-200">
        <Label className="mb-2 block text-sm font-medium text-gray-700">Filter by Batch</Label>
        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger>
            <SelectValue placeholder="Select Batch" />
          </SelectTrigger>
          <SelectContent>
            {availableBatches.map(batch => (
              <SelectItem key={batch} value={batch}>{batch}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Button
          variant={selectedTab === "overview" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => setSelectedTab("overview")}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Overview
        </Button>
        <Button
          variant={selectedTab === "students" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => setSelectedTab("students")}
        >
          <Users className="mr-2 h-4 w-4" />
          Students
        </Button>

        <Button
          variant={selectedTab === "reports" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => setSelectedTab("reports")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Reports
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
    </div>
  );

  return (
    <DashboardLayout title="HOD Dashboard - Computer Science" sidebar={sidebar}>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="hidden">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Students"
              value={departmentStudents.length}
              icon={Users}
              trend={{ value: 5, isPositive: true }}
            />
            <StatsCard
              title="Subjects"
              value={departmentSubjects.length}
              icon={BookOpen}
              iconColor="text-purple-600"
            />
            <StatsCard
              title="Avg Attendance"
              value={`${avgAttendance}%`}
              icon={TrendingUp}
              iconColor="text-green-600"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Attendance Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {lowAttendanceStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>All students have good attendance!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lowAttendanceStudents.map((student) => (
                      <div
                        key={student.student_id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.roll_no}</p>
                        </div>
                        <Badge variant="destructive">
                          {calculateAttendancePercentage(student.student_id)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>IA Average</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentStudents.map((student) => {
                    const attendance = calculateAttendancePercentage(student.student_id);
                    const iaAvg = calculateIAAverage(student.student_id, "sub1");
                    const status = attendance >= 75 && iaAvg >= 50 ? "Good" : "At Risk";

                    return (
                      <TableRow 
                        key={student.student_id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/hod/student/${student.student_id}`)}
                      >
                        <TableCell className="font-medium">{student.roll_no}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.semester}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              attendance >= 75
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }
                          >
                            {attendance}%
                          </Badge>
                        </TableCell>
                        <TableCell>{iaAvg}%</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              status === "Good"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }
                          >
                            {status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => generateAttendanceReport()}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Attendance Report
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => generateIAMarksReport()}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  IA Marks Report
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => generatePerformanceReport()}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Student Performance Report
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => generateAnalyticsReport()}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Department Analytics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">
                  Export department data in various formats
                </p>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => exportAsPDF()}
                >
                  Export as PDF
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => exportAsExcel()}
                >
                  Export as Excel
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => exportAsCSV()}
                >
                  Export as CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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
                      <SelectItem value="all">Entire Department</SelectItem>
                      {availableBatches.filter(b => b !== "All").map(batch => (
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
                Broadcast to Department
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Announcements</h3>
            {announcements.filter(a => a.author_role === "HOD" || a.target_audience === "all").length === 0 ? (
              <p className="text-gray-500">No announcements broadcasted yet.</p>
            ) : (
              announcements
                .filter(a => a.author_role === "HOD" || a.target_audience === "all")
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((ann) => (
                  <Card key={ann.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{ann.title}</h4>
                          <p className="text-sm text-gray-500">
                            By {ann.author_name} • {new Date(ann.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {ann.target_audience === "all" ? "Entire Department" : ann.target_audience}
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
