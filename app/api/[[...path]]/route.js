import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

let client = null
let db = null

// Initialize MongoDB connection
async function connectToDatabase() {
  if (db) return db
  
  try {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME || 'office_attendance')
    console.log('Connected to MongoDB')
    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// Initialize collections with sample data
async function initializeCollections() {
  const database = await connectToDatabase()
  
  // Initialize employees collection
  const employeesCollection = database.collection('employees')
  const employeesCount = await employeesCollection.countDocuments()
  
  if (employeesCount === 0) {
    const sampleEmployees = [
      {
        id: uuidv4(),
        name: 'John Doe',
        email: 'john@company.com',
        password: 'password123',
        role: 'employee',
        location: 'Chennai',
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Sarah Smith',
        email: 'sarah@company.com',
        password: 'password123',
        role: 'employee',
        location: 'Mumbai',
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'HR Manager',
        email: 'hr@company.com',
        password: 'admin123',
        role: 'hr',
        location: 'Bangalore',
        createdAt: new Date()
      }
    ]
    
    await employeesCollection.insertMany(sampleEmployees)
    console.log('Sample employees created')
  }
  
  // Initialize attendance collection
  const attendanceCollection = database.collection('attendance')
  const attendanceCount = await attendanceCollection.countDocuments()
  
  if (attendanceCount === 0) {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const employees = await employeesCollection.find().toArray()
    const sampleAttendance = [
      {
        id: uuidv4(),
        userId: employees[0]?.id,
        date: today.toISOString().split('T')[0],
        location: 'Chennai',
        type: 'planned',
        status: 'confirmed',
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        userId: employees[1]?.id,
        date: today.toISOString().split('T')[0],
        location: 'Mumbai',
        type: 'planned',
        status: 'pending',
        createdAt: new Date()
      }
    ]
    
    await attendanceCollection.insertMany(sampleAttendance)
    console.log('Sample attendance created')
  }
}

export async function GET(request, { params }) {
  const path = params?.path?.join('/') || ''
  
  try {
    await initializeCollections()
    const database = await connectToDatabase()
    
    if (path === '' || path === 'health') {
      return NextResponse.json({ 
        message: 'Office Attendance API is running!',
        timestamp: new Date().toISOString(),
        endpoints: [
          '/api/employees',
          '/api/attendance',
          '/api/auth/login',
          '/api/auth/signup'
        ]
      })
    }
    
    if (path === 'employees') {
      const employees = await database.collection('employees').find({}, {
        projection: { password: 0 } // Don't return passwords
      }).toArray()
      return NextResponse.json(employees)
    }
    
    if (path === 'attendance') {
      const attendance = await database.collection('attendance').find().toArray()
      return NextResponse.json(attendance)
    }
    
    if (path.startsWith('attendance/user/')) {
      const userId = path.split('/')[2]
      const attendance = await database.collection('attendance').find({ userId }).toArray()
      return NextResponse.json(attendance)
    }
    
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  const path = params?.path?.join('/') || ''
  
  try {
    const body = await request.json()
    const database = await connectToDatabase()
    
    if (path === 'auth/login') {
      const { email, password } = body
      const user = await database.collection('employees').findOne({ 
        email, 
        password // In production, use proper password hashing
      }, {
        projection: { password: 0 }
      })
      
      if (user) {
        return NextResponse.json(user)
      } else {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }
    }
    
    if (path === 'auth/signup') {
      const { name, email, password, role } = body
      
      // Check if user already exists
      const existingUser = await database.collection('employees').findOne({ email })
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 })
      }
      
      const newUser = {
        id: uuidv4(),
        name,
        email,
        password, // In production, hash this password
        role: role || 'employee',
        location: null,
        createdAt: new Date()
      }
      
      await database.collection('employees').insertOne(newUser)
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser
      return NextResponse.json(userWithoutPassword)
    }
    
    if (path === 'attendance/join') {
      const { userId, date, location, type } = body
      
      // Check if user already has attendance for this date and location
      const existingAttendance = await database.collection('attendance').findOne({
        userId,
        date,
        location
      })
      
      if (existingAttendance) {
        return NextResponse.json({ error: 'Already marked for this date and location' }, { status: 400 })
      }
      
      const attendance = {
        id: uuidv4(),
        userId,
        date,
        location,
        type: type || 'planned',
        status: 'pending',
        createdAt: new Date()
      }
      
      await database.collection('attendance').insertOne(attendance)
      return NextResponse.json(attendance)
    }
    
    if (path === 'attendance/confirm') {
      const { attendanceId, status } = body
      
      const result = await database.collection('attendance').updateOne(
        { id: attendanceId },
        { 
          $set: { 
            status,
            confirmedAt: new Date()
          }
        }
      )
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
      }
      
      return NextResponse.json({ message: 'Attendance updated successfully' })
    }
    
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const path = params?.path?.join('/') || ''
  
  try {
    const body = await request.json()
    const database = await connectToDatabase()
    
    if (path.startsWith('employees/')) {
      const userId = path.split('/')[1]
      const { name, email, role, location } = body
      
      const result = await database.collection('employees').updateOne(
        { id: userId },
        { 
          $set: { 
            name,
            email,
            role,
            location,
            updatedAt: new Date()
          }
        }
      )
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      return NextResponse.json({ message: 'User updated successfully' })
    }
    
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const path = params?.path?.join('/') || ''
  
  try {
    const database = await connectToDatabase()
    
    if (path.startsWith('employees/')) {
      const userId = path.split('/')[1]
      
      const result = await database.collection('employees').deleteOne({ id: userId })
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      // Also delete associated attendance records
      await database.collection('attendance').deleteMany({ userId })
      
      return NextResponse.json({ message: 'User deleted successfully' })
    }
    
    if (path.startsWith('attendance/')) {
      const attendanceId = path.split('/')[1]
      
      const result = await database.collection('attendance').deleteOne({ id: attendanceId })
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
      }
      
      return NextResponse.json({ message: 'Attendance record deleted successfully' })
    }
    
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}