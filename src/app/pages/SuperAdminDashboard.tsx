import { useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatsCard } from "../components/StatsCard";
import { InfoCard } from "../components/InfoCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign,
  Plus,
  Settings,
  Shield,
  Database,
  Pencil,
  Trash2,
} from "lucide-react";
import { useSharedData } from "../context/SharedDataContext";
import { toast } from "sonner";
import { College, mockStudents, mockStaff } from "../data/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export function SuperAdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dataBackup, setDataBackup] = useState(false);
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [collegeForm, setCollegeForm] = useState({
    name: "",
    location: "",
    subscription_status: "trial" as "active" | "inactive" | "trial"
  });

  const { colleges, addCollege, updateCollege, deleteCollege } = useSharedData();

  const totalColleges = colleges.length;
  const activeColleges = colleges.filter((c) => c.subscription_status === "active").length;
  const totalStudents = colleges.reduce((sum, c) => sum + c.total_students, 0);
  const totalStaff = colleges.reduce((sum, c) => sum + c.total_staff, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "trial":
        return "bg-yellow-100 text-yellow-700";
      case "inactive":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Settings handlers
  const handleToggleMaintenance = () => {
    setMaintenanceMode(!maintenanceMode);
    toast.success(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`);
  };

  const handleConfigureEmail = () => {
    toast.success("Email configuration opened");
    // In a real app, this would open a modal or navigate to settings page
  };

  const handleScheduleBackup = () => {
    setDataBackup(!dataBackup);
    toast.success(`Data backup ${!dataBackup ? 'scheduled' : 'cancelled'}`);
  };

  const handleAddCollege = () => {
    if (!collegeForm.name || !collegeForm.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingCollege) {
      updateCollege(editingCollege.college_id, {
        name: collegeForm.name,
        location: collegeForm.location,
        subscription_status: collegeForm.subscription_status,
      });
      toast.success(`College "${collegeForm.name}" updated successfully!`);
      setEditingCollege(null);
    } else {
      addCollege({
        name: collegeForm.name,
        location: collegeForm.location,
        subscription_status: collegeForm.subscription_status,
        total_students: 0,
        total_staff: 0
      });
      toast.success(`College "${collegeForm.name}" added successfully!`);
    }

    setCollegeForm({ name: "", location: "", subscription_status: "trial" });
    setShowAddCollege(false);
  };

  const handleEditCollegeClick = (college: College) => {
    setEditingCollege(college);
    setCollegeForm({
      name: college.name,
      location: college.location,
      subscription_status: college.subscription_status,
    });
    setShowAddCollege(true);
  };

  const handleDeleteCollege = (college: College) => {
    if (confirm(`Are you sure you want to delete "${college.name}"? This action cannot be undone.`)) {
      deleteCollege(college.college_id);
      toast.success(`College "${college.name}" deleted successfully!`);
    }
  };

  const handleCancelForm = () => {
    setShowAddCollege(false);
    setEditingCollege(null);
    setCollegeForm({ name: "", location: "", subscription_status: "trial" });
  };

  const sidebar = (
    <div className="p-4 space-y-2">
      <Button
        variant={selectedTab === "overview" ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => setSelectedTab("overview")}
      >
        <Building2 className="mr-2 h-4 w-4" />
        Overview
      </Button>
      <Button
        variant={selectedTab === "colleges" ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => setSelectedTab("colleges")}
      >
        <Building2 className="mr-2 h-4 w-4" />
        Colleges
      </Button>
      <Button
        variant={selectedTab === "users" ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => setSelectedTab("users")}
      >
        <Users className="mr-2 h-4 w-4" />
        All Users
      </Button>
      <Button
        variant={selectedTab === "analytics" ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => setSelectedTab("analytics")}
      >
        <TrendingUp className="mr-2 h-4 w-4" />
        Analytics
      </Button>
      <Button
        variant={selectedTab === "billing" ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => setSelectedTab("billing")}
      >
        <DollarSign className="mr-2 h-4 w-4" />
        Billing
      </Button>
      <Button
        variant={selectedTab === "settings" ? "secondary" : "ghost"}
        className="w-full justify-start"
        onClick={() => setSelectedTab("settings")}
      >
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Colleges"
                value={totalColleges}
                icon={Building2}
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="Active Subscriptions"
                value={activeColleges}
                icon={TrendingUp}
                iconColor="text-green-600"
              />
              <StatsCard
                title="Total Students"
                value={totalStudents.toLocaleString()}
                icon={Users}
                iconColor="text-purple-600"
              />
              <StatsCard
                title="Total Staff"
                value={totalStaff}
                icon={Users}
                iconColor="text-orange-600"
              />
            </div>

            {/* System Maintenance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Status</span>
                    <Badge className="bg-green-100 text-green-700">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Response Time</span>
                    <span className="text-sm font-medium">42ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Server Uptime</span>
                    <span className="text-sm font-medium">99.9%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="text-gray-500">New college registration</p>
                    <p className="font-medium">Royal College of Arts & Science</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Subscription renewed</p>
                    <p className="font-medium">NIT Bangalore</p>
                    <p className="text-xs text-gray-400">1 day ago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "colleges":
        return (
          <div className="space-y-6">
            {/* Add College Form */}
            {showAddCollege && (
              <Card>
                <CardHeader>
                  <CardTitle>{editingCollege ? "Edit College" : "Add New College"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="collegeName">College Name</Label>
                      <Input
                        id="collegeName"
                        value={collegeForm.name}
                        onChange={(e) => setCollegeForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter college name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="collegeLocation">Location</Label>
                      <Input
                        id="collegeLocation"
                        value={collegeForm.location}
                        onChange={(e) => setCollegeForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subscriptionStatus">Subscription Status</Label>
                    <Select
                      value={collegeForm.subscription_status}
                      onValueChange={(value: "active" | "inactive" | "trial") =>
                        setCollegeForm(prev => ({ ...prev, subscription_status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCollege}>
                      {editingCollege ? "Update College" : "Add College"}
                    </Button>
                    <Button variant="outline" onClick={handleCancelForm}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Colleges Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Registered Colleges</CardTitle>
                <Button size="sm" onClick={() => setShowAddCollege(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add College
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>College Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colleges.map((college) => (
                      <TableRow key={college.college_id}>
                        <TableCell className="font-medium">{college.name}</TableCell>
                        <TableCell>{college.location}</TableCell>
                        <TableCell>{college.total_students}</TableCell>
                        <TableCell>{college.total_staff}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(college.subscription_status)}>
                            {college.subscription_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditCollegeClick(college)}>
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteCollege(college)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatsCard
                title="Total Students"
                value={mockStudents.length}
                icon={Users}
                iconColor="text-blue-600"
              />
              <StatsCard
                title="Total Staff"
                value={mockStaff.length}
                icon={Users}
                iconColor="text-green-600"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...mockStudents.slice(0, 10), ...mockStaff.slice(0, 10)].map((user, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {'department' in user ? 'Student' : 'Staff'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const collegeId = (user as any).college_id;
                            const college = colleges.find(c => c.college_id === collegeId);
                            return college?.name || 'N/A';
                          })()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                title="System Usage"
                value="94%"
                icon={TrendingUp}
                iconColor="text-blue-600"
              />
              <StatsCard
                title="Active Sessions"
                value="1,247"
                icon={Users}
                iconColor="text-green-600"
              />
              <StatsCard
                title="Data Processed"
                value="2.4GB"
                icon={Database}
                iconColor="text-purple-600"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Detailed analytics and insights coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );

      case "billing":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                title="Monthly Revenue"
                value="$12,450"
                icon={DollarSign}
                iconColor="text-green-600"
                trend={{ value: 8, isPositive: true }}
              />
              <StatsCard
                title="Active Subscriptions"
                value={activeColleges}
                icon={TrendingUp}
                iconColor="text-blue-600"
              />
              <StatsCard
                title="Pending Payments"
                value="3"
                icon={DollarSign}
                iconColor="text-orange-600"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Billing Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Billing and subscription management coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Temporarily disable the system for maintenance</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={maintenanceMode ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                      {maintenanceMode ? "Enabled" : "Disabled"}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleToggleMaintenance}>
                      {maintenanceMode ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Send system notifications via email</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={emailNotifications ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {emailNotifications ? "Enabled" : "Disabled"}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleConfigureEmail}>
                      Configure
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Backup</p>
                    <p className="text-sm text-gray-500">Schedule automatic data backups</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={dataBackup ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}>
                      {dataBackup ? "Scheduled" : "Not Scheduled"}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleScheduleBackup}>
                      {dataBackup ? "Cancel" : "Schedule"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Super Admin Dashboard" sidebar={sidebar}>
      {renderContent()}
    </DashboardLayout>
  );
}