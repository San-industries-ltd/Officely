'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, MapPin, Users, Sun, Building2, User, LogOut, MessageSquare, UserPlus, Activity, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

const LOCATIONS = ['Chennai', 'Mumbai', 'Bangalore']

export default function App() {
  const [user, setUser] = useState(null)
  const [employees, setEmployees] = useState([])
  const [attendanceData, setAttendanceData] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [isHRDashboardOpen, setIsHRDashboardOpen] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', role: 'employee' })

  // Mock data initialization
  useEffect(() => {
    fetchEmployees()
    fetchAttendanceData()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch('/api/attendance')
      if (response.ok) {
        const data = await response.json()
        setAttendanceData(data)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    // For testing - accept any login credentials
    const mockUser = {
      id: loginForm.email === 'hr' ? 'hr-admin-id' : `user-${Date.now()}`,
      name: loginForm.email === 'hr' ? 'Super Admin' : loginForm.email,
      email: loginForm.email,
      role: (loginForm.email === 'hr' && loginForm.password === 'test123') ? 'super_admin' : 'employee',
      location: loginForm.email === 'hr' ? 'Admin' : 'Chennai'
    }
    
    setUser(mockUser)
    setIsLoginOpen(false)
    toast.success(`Welcome ${mockUser.name}!`)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm)
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setIsSignupOpen(false)
        toast.success('Account created successfully!')
        fetchEmployees() // Refresh employee list
      } else {
        toast.error('Signup failed')
      }
    } catch (error) {
      toast.error('Signup failed')
    }
  }

  const handleJoinOffice = async (date, location) => {
    if (!user) {
      toast.error('Please login first')
      return
    }
    
    try {
      const response = await fetch('/api/attendance/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          date: date.toISOString().split('T')[0],
          location: location,
          type: 'planned'
        })
      })
      
      if (response.ok) {
        toast.success(`Marked for ${location} on ${date.toLocaleDateString()}`)
        fetchAttendanceData()
      }
    } catch (error) {
      toast.error('Failed to mark attendance')
    }
  }

  const logout = () => {
    setUser(null)
    toast.success('Logged out successfully')
  }

  // Generate calendar days for current week
  const getWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - currentDay + 1) // Monday

    const dates = []
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const getAttendanceForDate = (date, location) => {
    const dateStr = date.toISOString().split('T')[0]
    return attendanceData.filter(att => 
      att.date === dateStr && att.location === location
    )
  }

  const weekDates = getWeekDates()

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1615406020658-6c4b805f1f30?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBidWlsZGluZ3xlbnwwfHx8fDE3NTMwOTA4MTl8MA&ixlib=rb-4.1.0&q=85)',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Sun Element */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-yellow-400 rounded-full shadow-2xl animate-pulse">
          <Sun className="w-8 h-8 text-yellow-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Header */}
        <header className="relative z-20 flex justify-between items-center p-6">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-semibold text-white">Office Attendance</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Login to Your Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    placeholder="Email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    required
                  />
                  <Button type="submit" className="w-full">Login</Button>
                  <p className="text-sm text-center text-gray-600">
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      className="text-blue-600 hover:underline"
                      onClick={() => {
                        setIsLoginOpen(false)
                        setIsSignupOpen(true)
                      }}
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Your Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSignup} className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                    required
                  />
                  <Select value={signupForm.role} onValueChange={(value) => setSignupForm({...signupForm, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="hr">HR Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="w-full">Create Account</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 mt-32">
          <h2 className="text-5xl font-bold text-white mb-6">
            Your Office, Your Way
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl">
            Beautiful and intuitive office attendance tracking. Plan your days, connect with colleagues, and stay organized.
          </p>
          <div className="flex space-x-4">
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100"
              onClick={() => setIsSignupOpen(true)}
            >
              Get Started Today
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              onClick={() => setIsLoginOpen(true)}
            >
              Login
            </Button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white text-center">
          <p className="text-sm opacity-80">Trusted by teams across Chennai • Mumbai • Bangalore</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Office Attendance</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {user.location || 'Not Set'}
              </Badge>
              
              {user.role === 'hr' && (
                <Dialog open={isHRDashboardOpen} onOpenChange={setIsHRDashboardOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      HR Dashboard
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>HR Dashboard</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Total Employees</p>
                                <p className="text-2xl font-bold">{employees.length}</p>
                              </div>
                              <Users className="w-8 h-8 text-blue-600" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Today's Attendance</p>
                                <p className="text-2xl font-bold">
                                  {attendanceData.filter(att => 
                                    att.date === new Date().toISOString().split('T')[0] && 
                                    att.type === 'confirmed'
                                  ).length}
                                </p>
                              </div>
                              <Activity className="w-8 h-8 text-green-600" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Active Locations</p>
                                <p className="text-2xl font-bold">{LOCATIONS.length}</p>
                              </div>
                              <Building2 className="w-8 h-8 text-purple-600" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Employee Directory</h3>
                        <div className="grid gap-3">
                          {employees.map((employee) => (
                            <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{employee.name}</p>
                                <p className="text-sm text-gray-600">{employee.email}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium capitalize">{employee.role}</p>
                                <p className="text-sm text-gray-600">{employee.location || 'Not set'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Hello, {user.name}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Calendar View */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Weekly Office Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {weekDates.map((date, dateIndex) => (
                  <div key={dateIndex} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm">
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="text-2xl font-bold text-gray-900">
                            {date.getDate()}
                          </div>
                          <div className="text-sm text-gray-600 uppercase tracking-wider">
                            {date.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {date.toLocaleDateString('en-US', { weekday: 'long' })}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Location Rows */}
                    <div className="space-y-3">
                      {LOCATIONS.map((location, locIndex) => {
                        const locationAttendance = getAttendanceForDate(date, location)
                        const employeesAtLocation = locationAttendance.map(att => 
                          employees.find(emp => emp.id === att.userId)?.name || 'Unknown'
                        ).filter(Boolean)

                        return (
                          <div key={locIndex} className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <Building2 className="w-4 h-4 text-gray-600" />
                                  <span className="font-medium text-gray-900">{location}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {employeesAtLocation.slice(0, 3).map((name, nameIndex) => (
                                    <Badge key={nameIndex} variant="secondary" className="text-xs">
                                      {name}
                                    </Badge>
                                  ))}
                                  {employeesAtLocation.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{employeesAtLocation.length - 3} more
                                    </Badge>
                                  )}
                                  {employeesAtLocation.length === 0 && (
                                    <span className="text-sm text-gray-500">No one scheduled</span>
                                  )}
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                onClick={() => handleJoinOffice(date, location)}
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={locationAttendance.some(att => att.userId === user.id)}
                              >
                                {locationAttendance.some(att => att.userId === user.id) ? 'Joined' : 'Join'}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streak Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Your Streak</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">7</div>
                  <p className="text-sm text-gray-600">Days in office this week</p>
                </div>
              </CardContent>
            </Card>

            {/* Invite/Chat Panel */}
            <Card>
              <CardHeader>
                <div className="flex space-x-2 mb-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Invites
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Team Standup</p>
                    <p className="text-xs text-gray-600">Tomorrow at 10:00 AM</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Sarah invited you</p>
                    <p className="text-xs text-gray-600">Join Mumbai office tomorrow</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Chennai</span>
                    <span className="text-sm font-medium">3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mumbai</span>
                    <span className="text-sm font-medium">2 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bangalore</span>
                    <span className="text-sm font-medium">0 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}