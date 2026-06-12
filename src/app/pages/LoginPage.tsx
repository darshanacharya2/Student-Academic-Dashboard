import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { GraduationCap, Shield, Users, TrendingUp, Trophy } from "lucide-react";
import { toast } from "sonner";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = await login(email, password);

    if (success) {
      toast.success("Login successful!");
      
      // Determine redirect based on role
      if (email.includes("admin@system")) {
        navigate("/super-admin");
      } else if (email.includes("hod@")) {
        navigate("/hod");
      } else if (email.includes("staff@")) {
        navigate("/staff");
      } else if (email.includes("student@")) {
        navigate("/student");
      }
    } else {
      setError("Invalid credentials. Please try again.");
      toast.error("Invalid credentials");
    }
  };

  const demoLogins = [
    { role: "Super Admin", email: "admin@system.com", password: "password" },
    { role: "HOD", email: "hod@college1.com", password: "password" },
    { role: "Staff", email: "staff@college1.com", password: "password" },
    { role: "Student", email: "student@college1.com", password: "password" },
  ];

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword("password");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left side - Branding and Info */}
      <div className="w-full md:w-1/2 bg-blue-600 text-white p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-indigo-500 opacity-50 blur-3xl"></div>
        
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-8 backdrop-blur-sm border border-white/30 shadow-xl">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Academic Management <span className="text-blue-200">Portal</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 leading-relaxed">
            A comprehensive, multi-college platform designed to streamline academic operations, track performance, and empower educational institutions with actionable insights.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500 rounded-lg shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Role-Based Access</h3>
                <p className="text-sm text-blue-100 mt-1">Secure, tailored dashboards for Super Admins, HODs, Staff, and Students.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-500 rounded-lg shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Multi-College Support</h3>
                <p className="text-sm text-blue-100 mt-1">Manage multiple institutions from a single centralized platform securely.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-cyan-500 rounded-lg shrink-0">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Real-Time Analytics</h3>
                <p className="text-sm text-blue-100 mt-1">Track attendance, assignments, and IA marks with interactive visualizations.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-500 rounded-lg shrink-0">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Achievement Portfolio</h3>
                <p className="text-sm text-blue-100 mt-1">Students can build and showcase their academic and extracurricular milestones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Please sign in to your account to continue</p>
          </div>

          <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700">Password</Label>
                    <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700 text-white">
                  Sign In
                </Button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Demo Login Credentials</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {demoLogins.map((demo) => (
                    <Button
                      key={demo.role}
                      variant="outline"
                      className="text-sm bg-white hover:bg-slate-50 border-slate-200"
                      onClick={() => quickLogin(demo.email)}
                    >
                      {demo.role}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-center text-slate-400 mt-4">
                  All demo accounts use password: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">password</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}