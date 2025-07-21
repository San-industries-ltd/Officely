'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Calendar, MapPin, Users, Sun, Building2, User, LogOut, MessageSquare, UserPlus, Activity, BarChart3, Settings, Trash2, Plus, Minus, Upload, Camera } from 'lucide-react'
import { toast } from 'sonner'

const LOCATIONS = ['Chennai', 'Mumbai', 'Bangalore']

export default function App() {
  const [user, setUser] = useState(null)
  const [employees, setEmployees] = useState([])
  const [attendanceData, setAttendanceData] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', role: 'employee' })
  const [activeTab, setActiveTab] = useState('app') // 'app' or 'dashboard'
  const [selectedUser, setSelectedUser] = useState(null)
  const [profileForm, setProfileForm] = useState({ name: '', bio: '', avatar: '', banner: '' })
  const [currentWeek, setCurrentWeek] = useState(1) // Week navigation (1-5)

  // Mock data initialization
  useEffect(() => {
    fetchEmployees()
    fetchAttendanceData()
  }, [])

  const fetchEmployees = async () => {
    // Mock employees data
    const mockEmployees = [
      { id: '1', name: 'John Doe', email: 'john@company.com', role: 'employee', location: 'Chennai', avatar: '', banner: '', status: 'active' },
      { id: '2', name: 'Sarah Smith', email: 'sarah@company.com', role: 'employee', location: 'Mumbai', avatar: '', banner: '', status: 'active' },
      { id: '3', name: 'Mike Johnson', email: 'mike@company.com', role: 'employee', location: 'Bangalore', avatar: '', banner: '', status: 'active' },
      { id: '4', name: 'Lisa Chen', email: 'lisa@company.com', role: 'employee', location: 'Chennai', avatar: '', banner: '', status: 'active' },
      { id: '5', name: 'Alex Rodriguez', email: 'alex@company.com', role: 'employee', location: 'Mumbai', avatar: '', banner: '', status: 'suspended' }
    ]
    setEmployees(mockEmployees)
  }

  const fetchAttendanceData = async () => {
    // Mock attendance data
    const today = new Date()
    const mockAttendance = [
      { id: '1', userId: '1', date: today.toISOString().split('T')[0], location: 'Chennai', type: 'planned', status: 'confirmed' },
      { id: '2', userId: '2', date: today.toISOString().split('T')[0], location: 'Mumbai', type: 'planned', status: 'pending' },
      { id: '3', userId: '3', date: today.toISOString().split('T')[0], location: 'Bangalore', type: 'planned', status: 'confirmed' }
    ]
    setAttendanceData(mockAttendance)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    // For testing - accept any login credentials
    const mockUser = {
      id: loginForm.email === 'hr' ? 'hr-admin-id' : `user-${Date.now()}`,
      name: loginForm.email === 'hr' ? 'Super Admin' : loginForm.email,
      email: loginForm.email,
      role: (loginForm.email === 'hr' && loginForm.password === 'test123') ? 'super_admin' : 'employee',
      location: loginForm.email === 'hr' ? 'Admin' : 'Chennai',
      avatar: '',
      banner: ''
    }
    
    setUser(mockUser)
    setIsLoginOpen(false)
    toast.success(`Welcome ${mockUser.name}!`)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const mockUser = {
      id: `user-${Date.now()}`,
      name: signupForm.name,
      email: signupForm.email,
      role: signupForm.role,
      location: 'Chennai',
      avatar: '',
      banner: ''
    }
    
    setUser(mockUser)
    setIsSignupOpen(false)
    toast.success('Account created successfully!')
  }

  const handleJoinOffice = async (date, location) => {
    if (!user) {
      toast.error('Please login first')
      return
    }
    
    const dateStr = date.toISOString().split('T')[0]
    const newAttendance = {
      id: `att-${Date.now()}`,
      userId: user.id,
      date: dateStr,
      location: location,
      type: 'planned',
      status: 'pending'
    }
    
    setAttendanceData([...attendanceData, newAttendance])
    toast.success(`Marked for ${location} on ${date.toLocaleDateString()}`)
  }

  const deleteEmployee = (employeeId) => {
    setEmployees(employees.filter(emp => emp.id !== employeeId))
    setAttendanceData(attendanceData.filter(att => att.userId !== employeeId))
    toast.success('Employee removed')
  }

  const toggleEmployeeStatus = (employeeId) => {
    setEmployees(employees.map(emp => 
      emp.id === employeeId 
        ? { ...emp, status: emp.status === 'active' ? 'suspended' : 'active' }
        : emp
    ))
    toast.success('Employee status updated')
  }

  const addToInvite = (employeeId, date, location) => {
    const dateStr = date.toISOString().split('T')[0]
    const existingInvite = attendanceData.find(att => 
      att.userId === employeeId && att.date === dateStr && att.location === location
    )
    
    if (!existingInvite) {
      const newInvite = {
        id: `inv-${Date.now()}`,
        userId: employeeId,
        date: dateStr,
        location: location,
        type: 'invited',
        status: 'pending'
      }
      setAttendanceData([...attendanceData, newInvite])
      toast.success('Invite sent')
    }
  }

  const removeFromInvite = (employeeId, date, location) => {
    const dateStr = date.toISOString().split('T')[0]
    setAttendanceData(attendanceData.filter(att => 
      !(att.userId === employeeId && att.date === dateStr && att.location === location)
    ))
    toast.success('Invite removed')
  }

  const logout = () => {
    setUser(null)
    setActiveTab('app')
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
                    placeholder="Email or Username (try: hr)"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Password (try: test123 for hr)"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    required
                  />
                  <Button type="submit" className="w-full">Login</Button>
                  <p className="text-sm text-center text-gray-600">
                    For testing: Any credentials work, or use 'hr' / 'test123' for admin
                  </p>
                </form>
              </DialogContent>
            </Dialog>

            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsSignupOpen(true)}>
              Get Started
            </Button>
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
      {user.role === 'super_admin' ? (
        // Super Admin Layout
        <div className="flex h-screen">
          {/* Left Sidebar */}
          <div className="w-64 bg-white border-r shadow-sm">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-8">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-lg font-semibold">Super Admin</h1>
                  <p className="text-sm text-gray-600">{user.name}</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <Button
                  variant={activeTab === 'app' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('app')}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  App
                </Button>
                <Button
                  variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('dashboard')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </nav>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6">
              <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'app' ? (
              // Regular App View for Super Admin
              <div>
                {/* Banner Placeholder */}
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-60" />
                      <p className="text-sm opacity-80">Banner Image Placeholder</p>
                      <p className="text-xs opacity-60">Upload your company banner here</p>
                    </div>
                  </div>
                </div>

                {/* Profile Section */}
                <div className="px-8 py-6 bg-white border-b">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <p className="text-gray-600">{user.role.replace('_', ' ').toUpperCase()}</p>
                      <Badge variant="secondary">{user.location}</Badge>
                    </div>
                  </div>
                </div>

                {/* Calendar Content */}
                <div className="p-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Weekly Office Schedule</h3>
                    {weekDates.map((date, dateIndex) => (
                      <Card key={dateIndex}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="bg-blue-50 rounded-xl p-4">
                                <div className="text-2xl font-bold text-blue-600">
                                  {date.getDate()}
                                </div>
                                <div className="text-sm text-blue-600 uppercase">
                                  {date.toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold">
                                  {date.toLocaleDateString('en-US', { weekday: 'long' })}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {date.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {LOCATIONS.map((location) => {
                              const locationAttendance = getAttendanceForDate(date, location)
                              const employeesAtLocation = locationAttendance.map(att => 
                                employees.find(emp => emp.id === att.userId)?.name || 'Unknown'
                              ).filter(Boolean)

                              return (
                                <div key={location} className="bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className="flex items-center space-x-2">
                                        <Building2 className="w-4 h-4 text-gray-600" />
                                        <span className="font-medium">{location}</span>
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
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Dashboard View
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">User Management Dashboard</h2>
                
                <div className="grid gap-6">
                  {employees.map((employee) => (
                    <Card key={employee.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={employee.avatar} />
                              <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{employee.name}</h3>
                              <p className="text-sm text-gray-600">{employee.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">{employee.location}</Badge>
                                <Badge 
                                  variant={employee.status === 'active' ? 'default' : 'destructive'} 
                                  className="text-xs"
                                >
                                  {employee.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Invite Management */}
                            <div className="flex items-center space-x-1">
                              {LOCATIONS.map((location) => (
                                <div key={location} className="flex items-center space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addToInvite(employee.id, new Date(), location)}
                                    className="p-1 h-8 w-8"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeFromInvite(employee.id, new Date(), location)}
                                    className="p-1 h-8 w-8"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            
                            <Separator orientation="vertical" className="h-6" />
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleEmployeeStatus(employee.id)}
                            >
                              {employee.status === 'active' ? 'Suspend' : 'Activate'}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteEmployee(employee.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Regular Employee Layout
        <div>
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
                    {user.location}
                  </Badge>
                  
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

          {/* Banner Placeholder */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-8 h-8 mx-auto mb-1 opacity-60" />
                <p className="text-xs opacity-80">Banner Image Placeholder</p>
              </div>
            </div>
          </div>

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
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  )
}