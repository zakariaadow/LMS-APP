import React, { useState } from 'react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Card from '../components/common/Card'

const LoginPage = ({ setCurrentPage, onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      console.log('Attempting login with:', { email, password, role })
      
      // Fetch users from db.json
      const response = await fetch('http://localhost:3001/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const users = await response.json()
      console.log('All users:', users)
      
      // Find user with matching credentials
      const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password && 
        u.role === role
      )
      
      if (user) {
        console.log('Login successful:', user)
        
        // Update last login in db.json
        try {
          await fetch(`http://localhost:3001/users/${user.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              lastLogin: new Date().toISOString(),
              loginCount: (user.loginCount || 0) + 1
            })
          })
        } catch (updateError) {
          console.error('Could not update login time:', updateError)
        }
        
        // Remove password before storing in state
        const { password, ...userWithoutPassword } = user
        onLogin(userWithoutPassword)
      } else {
        setError(`Invalid email, password, or role. Please try again.
        
Demo Accounts:
Student: student@example.com / student123 (Sign up first)
Admin: admin@example.com / admin123
Manager: manager@example.com / manager123

Note: Students need to SIGN UP first before logging in.`)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(`Cannot connect to server. Please make sure:
      
1. JSON Server is running in another terminal
2. Command: json-server --watch db.json --port 3001
3. Then refresh this page`)
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
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm whitespace-pre-line">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">Login as</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="input"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="email@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Signing in...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
              </button>
            </form>
            
            <p className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => setCurrentPage('register')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign up
              </button>
            </p>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                <strong>Demo Accounts:</strong><br/>
                Admin: admin@example.com / admin123<br/>
                Manager: manager@example.com / manager123<br/>
                <strong className="text-green-600">Student: Sign up first, then login!</strong>
              </p>
            </div>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default LoginPage