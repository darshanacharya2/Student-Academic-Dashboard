import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
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

export function AssignmentSubmissionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assignments, submissions } = useSharedData();

  const assignment = assignments.find((a) => a.id === id);

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

  // Find all students for this assignment's subject/department.
  // We'll use mockStudents and the assignment's submissions array.
  // A better way is to show all students taught by this staff member, but let's just use those who submitted,
  // or those assigned to the department of this subject. Since Assignment doesn't have a department field, 
  // we'll just show the submissions.
  const assignmentSubmissions = submissions.filter((sub) => sub.assignment_id === id);

  return (
    <DashboardLayout title={`Submissions: ${assignment.title}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/staff")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Badge className="bg-blue-100 text-blue-700">Max Marks: {assignment.max_marks}</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submission List ({assignmentSubmissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {assignmentSubmissions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No submissions received yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Marks</TableHead>
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
                          {sub.status === "graded" ? (
                            <Badge className="bg-green-100 text-green-700 flex items-center w-fit gap-1">
                              <CheckCircle className="h-3 w-3" /> Graded
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700 flex items-center w-fit gap-1">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          {sub.marks !== null ? `${sub.marks}/${assignment.max_marks}` : "-"}
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
