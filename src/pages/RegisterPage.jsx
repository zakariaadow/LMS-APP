import React, { useState } from 'react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Card from '../components/common/Card'

const RegisterPage = ({ setCurrentPage, onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    
    try {
      // Check if user already exists
      const usersResponse = await fetch('http://localhost:3001/users')
      const existingUsers = await usersResponse.json()
      const userExists = existingUsers.find(u => u.email === formData.email)
      
      if (userExists) {
        setError('Email already registered. Please login.')
        setLoading(false)
        return
      }
      
      // Get the highest ID
      const maxUserId = existingUsers.length > 0 ? Math.max(...existingUsers.map(u => u.id)) : 0
      
      // Create new user
      const newUser = {
        id: maxUserId + 1,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        createdAt: new Date().toISOString(),
        status: 'active',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=3b82f6&color=fff`,
        lastLogin: null,
        loginCount: 0
      }
      
      const userResponse = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      
      const createdUser = await userResponse.json()
      
      // If student, add to students array
      if (formData.role === 'student') {
        const studentsResponse = await fetch('http://localhost:3001/students')
        const existingStudents = await studentsResponse.json()
        const maxStudentId = existingStudents.length > 0 ? Math.max(...existingStudents.map(s => s.id)) : 0
        
        const newStudent = {
          id: maxStudentId + 1,
          name: formData.name,
          email: formData.email,
          studentId: `STU${String(maxStudentId + 1).padStart(3, '0')}`,
          enrolledCourses: [],
          paymentHistory: [],
          status: 'active',
          joinDate: new Date().toISOString(),
          userId: createdUser.id
        }
        
        await fetch('http://localhost:3001/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStudent)
        })
      }
      
      const { password, ...userWithoutPassword } = createdUser
      
      alert(`Registration successful! Welcome ${formData.name}!`)
      onRegister(userWithoutPassword)
      
    } catch (err) {
      console.error('Registration error:', err)
      setError('Registration failed. Please make sure JSON Server is running on port 3001')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar setCurrentPage={setCurrentPage} />
      
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-600 mt-2">Start your learning journey today</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  required
                  minLength="2"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  required
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  required
                  minLength="6"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input"
                  required
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="label">Register as</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
            
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => setCurrentPage('login')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default RegisterPage