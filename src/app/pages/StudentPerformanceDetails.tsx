import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, LayoutDashboard, Users, FileText } from "lucide-react";
import { mockStudents, mockSubjects } from "../data/mockData";
import { useSharedData } from "../context/SharedDataContext";

export function StudentPerformanceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { iaMarks } = useSharedData();

  // Find the student based on ID
  // In a real app, you might fetch this if they aren't all loaded, but here we can just find them
  const student = mockStudents.find(s => s.student_id === id);

  // We should only show subjects for their department
  const departmentSubjects = mockSubjects.filter((s) => s.department === student?.department);

  const sidebar = (
    <div className="p-4 space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/hod")}
      >
        <LayoutDashboard className="mr-2 h-4 w-4" />
        Overview
      </Button>
      <Button
        variant="secondary"
        className="w-full justify-start"
        onClick={() => navigate("/hod")}
      >
        <Users className="mr-2 h-4 w-4" />
        Students
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => navigate("/hod")}
      >
        <FileText className="mr-2 h-4 w-4" />
        Reports
      </Button>
    </div>
  );

  if (!student) {
    return (
      <DashboardLayout title="Student Not Found" sidebar={sidebar}>
        <div className="p-6 text-center">
          <p>The student details could not be found.</p>
          <Button onClick={() => navigate("/hod")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Student Details - ${student.department}`} sidebar={sidebar}>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/hod")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>
            Detailed Performance - {student.name} ({student.roll_no})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentSubjects.map((subject) => {
              const studentIAMarks = iaMarks.filter(
                (mark) => mark.student_id === id && mark.subject_id === subject.subject_id
              );

              return (
                <div key={subject.subject_id} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">{subject.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {studentIAMarks.length > 0 ? (
                      studentIAMarks.map((mark, index) => (
                        <div key={index} className="text-center">
                          <p className="text-sm text-gray-500">IA {mark.ia_number}</p>
                          <p className="text-lg font-semibold">
                            {mark.marks}/{mark.max_marks}
                          </p>
                          <Badge
                            className={
                              mark.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : mark.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {mark.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 col-span-4">
                        No marks recorded yet
                      </p>
                    )}
                  </div>
                  {studentIAMarks.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Average:</span>
                        <span className="text-lg font-semibold">
                          {(
                            studentIAMarks.reduce(
                              (sum, mark) => sum + (mark.marks / mark.max_marks) * 100,
                              0
                            ) / studentIAMarks.length
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
