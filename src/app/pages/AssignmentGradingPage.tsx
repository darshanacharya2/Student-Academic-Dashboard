import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";
import { useSharedData } from "../context/SharedDataContext";
import { mockStudents } from "../data/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { toast } from "sonner";

export function AssignmentGradingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assignments, submissions, updateMarks } = useSharedData();

  const [marks, setMarks] = useState<Record<string, string>>({});

  const assignment = assignments.find((a) => a.id === id);

  useEffect(() => {
    // Pre-fill existing marks
    if (assignment) {
      const assignmentSubmissions = submissions.filter((sub) => sub.assignment_id === id);
      const initialMarks: Record<string, string> = {};
      assignmentSubmissions.forEach(sub => {
        if (sub.marks !== null) {
          initialMarks[sub.student_id] = sub.marks.toString();
        }
      });
      setMarks(initialMarks);
    }
  }, [assignment, submissions, id]);

  if (!assignment) {
    return (
      <DashboardLayout title="Assignment Not Found">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-gray-500">The assignment you are looking for does not exist.</p>
          <Button onClick={() => navigate("/staff")}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  const assignmentSubmissions = submissions.filter((sub) => sub.assignment_id === id);

  const handleSaveMarks = () => {
    Object.entries(marks).forEach(([studentId, markValue]) => {
      if (markValue !== "") {
        updateMarks(assignment.id, studentId, parseInt(markValue, 10));
      }
    });
    toast.success("Grades saved successfully!");
    navigate("/staff");
  };

  return (
    <DashboardLayout title={`Grade Assignment: ${assignment.title}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/staff")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Badge className="bg-blue-100 text-blue-700">Max Marks: {assignment.max_marks}</Badge>
            <Button onClick={handleSaveMarks}>
              <Save className="mr-2 h-4 w-4" />
              Save All Grades
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grade Submissions ({assignmentSubmissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {assignmentSubmissions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No submissions received yet to grade.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Marks (out of {assignment.max_marks})</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignmentSubmissions.map((sub) => {
                    const student = mockStudents.find((s) => s.student_id === sub.student_id);
                    return (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{student?.roll_no || "Unknown"}</TableCell>
                        <TableCell>{student?.name || "Unknown"}</TableCell>
                        <TableCell>
                          {new Date(sub.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={assignment.max_marks}
                            value={marks[sub.student_id] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= assignment.max_marks)) {
                                setMarks(prev => ({ ...prev, [sub.student_id]: val }));
                              }
                            }}
                            className="w-24"
                            placeholder="Marks"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
