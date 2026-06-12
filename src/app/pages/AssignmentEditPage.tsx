import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, Upload, Save } from "lucide-react";
import { useSharedData } from "../context/SharedDataContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { mockSubjects } from "../data/mockData";
import { useAuth } from "../context/AuthContext";

export function AssignmentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assignments, updateAssignment } = useSharedData();
  const { user } = useAuth();
  
  const mySubjects = mockSubjects.filter((s) => s.staff_id === user?.user_id);

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxMarks: "",
    attachments: [] as File[],
    links: [] as string[]
  });
  const [selectedSubject, setSelectedSubject] = useState("");

  const assignment = assignments.find((a) => a.id === id);

  useEffect(() => {
    if (assignment) {
      setAssignmentForm({
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date.split("T")[0],
        maxMarks: assignment.max_marks.toString(),
        attachments: [], // We don't load actual files back, but we could list their names if we stored them
        links: assignment.links || []
      });
      setSelectedSubject(assignment.subject_id);
    }
  }, [assignment]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAssignmentForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files || [])]
      }));
    }
  };

  const handleAddLink = () => {
    const link = prompt("Enter link URL:");
    if (link) {
      setAssignmentForm(prev => ({
        ...prev,
        links: [...prev.links, link]
      }));
    }
  };

  const handleSave = () => {
    if (!assignmentForm.title || !assignmentForm.dueDate || !assignmentForm.maxMarks || !selectedSubject) {
      toast.error("Please fill in all required fields");
      return;
    }

    updateAssignment(assignment.id, {
      title: assignmentForm.title,
      description: assignmentForm.description,
      due_date: assignmentForm.dueDate,
      max_marks: parseInt(assignmentForm.maxMarks, 10),
      subject_id: selectedSubject,
      links: assignmentForm.links
      // We'd typically upload files here to a server
    });

    toast.success("Assignment updated successfully!");
    navigate("/staff");
  };

  return (
    <DashboardLayout title={`Edit Assignment: ${assignment.title}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/staff")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Details</CardTitle>
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
                rows={4}
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
                <Label>Subject *</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
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
                        Upload Additional Files
                      </span>
                    </Button>
                  </label>
                  <Button variant="outline" size="sm" onClick={handleAddLink}>
                    Add Link
                  </Button>
                </div>
                
                {assignmentForm.attachments.length > 0 && (
                  <div className="text-sm text-gray-600">
                    New Files: {assignmentForm.attachments.map(f => f.name).join(', ')}
                  </div>
                )}
                
                {assignmentForm.links.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Links: {assignmentForm.links.join(', ')}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => navigate("/staff")}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
