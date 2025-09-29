// RFID Attendance System Dashboard
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Activity, Settings } from "lucide-react";
import { AttendanceProvider, useAttendance } from "@/components/attendance/AttendanceProvider";
import { ConnectionStatus } from "@/components/dashboard/ConnectionStatus";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { PresentUsers } from "@/components/attendance/PresentUsers";
import { AttendanceFiltersCard } from "@/components/attendance/AttendanceFilters";
import { UserManagement } from "@/components/users/UserManagement";
import { type AttendanceFilters } from "@/lib/api";
import heroImage from "@/assets/hero-attendance.jpg";

const DashboardContent = () => {
  const {
    attendance,
    presentUsers,
    users,
    isLoadingAttendance,
    isLoadingPresent,
    isLoadingUsers,
    isConnected,
    lastEvent,
    refetchAttendance,
  } = useAttendance();

  const [attendanceFilters, setAttendanceFilters] = useState<AttendanceFilters>({});

  const handleFiltersChange = (filters: AttendanceFilters) => {
    setAttendanceFilters(filters);
    refetchAttendance();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">RFID Attendance</h1>
                  <p className="text-sm text-muted-foreground">
                    Real-time access control system
                  </p>
                </div>
              </div>
            </div>
            
            <ConnectionStatus 
              isConnected={isConnected}
              lastEvent={lastEvent}
              onReconnect={() => window.location.reload()}
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-hero text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                Smart Access Control
              </h2>
              <p className="text-xl mb-6 text-white/90">
                Monitor attendance in real-time with RFID technology. 
                Secure, reliable, and easy to use.
              </p>
              <div className="flex space-x-4">
                <Button variant="secondary" size="lg">
                  <Activity className="mr-2 h-5 w-5" />
                  View Activity
                </Button>
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                  <Settings className="mr-2 h-5 w-5" />
                  Manage Users
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage}
                alt="RFID Attendance Control System"
                className="rounded-xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <StatsOverview
          users={users}
          presentUsers={presentUsers}
          attendance={attendance}
          isLoading={isLoadingUsers || isLoadingPresent || isLoadingAttendance}
          className="mb-8"
        />

        <Separator className="my-8" />

        {/* Dashboard Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">
              <Activity className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users">
              <Settings className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Shield className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Present Users - Takes full width on mobile, 1 column on xl */}
              <PresentUsers
                presentUsers={presentUsers}
                isLoading={isLoadingPresent}
                className="xl:col-span-1"
              />

              {/* Attendance Table - Takes full width on mobile, 3 columns on xl */}
              <div className="xl:col-span-3 space-y-6">
                <AttendanceFiltersCard onFiltersChange={handleFiltersChange} />
                <AttendanceTable
                  attendance={attendance}
                  isLoading={isLoadingAttendance}
                />
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagement
              users={users}
              isLoading={isLoadingUsers}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Reports Coming Soon</h3>
              <p className="text-muted-foreground">
                Detailed attendance reports and analytics will be available here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/50 mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                RFID Attendance System
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built with React + Vite + Arduino RC522
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Index = () => {
  return (
    <AttendanceProvider>
      <DashboardContent />
    </AttendanceProvider>
  );
};

export default Index;