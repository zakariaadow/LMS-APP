import React, { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CourseCatalogPage from './pages/CourseCatalogPage'
import CourseDetailPage from './pages/CourseDetailPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ManagerDashboard from './pages/ManagerDashboard'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)

  // Check for saved user on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('lms_user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      // Redirect to appropriate dashboard based on role
      if (userData.role === 'student') setCurrentPage('student-dashboard')
      else if (userData.role === 'admin') setCurrentPage('admin-dashboard')
      else if (userData.role === 'manager') setCurrentPage('manager-dashboard')
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('lms_user', JSON.stringify(userData))
    
    // Redirect based on role
    if (userData.role === 'admin') setCurrentPage('admin-dashboard')
    else if (userData.role === 'manager') setCurrentPage('manager-dashboard')
    else if (userData.role === 'student') setCurrentPage('student-dashboard')
  }

  const handleLogout = async () => {
    // Optionally update last login in db.json
    if (user) {
      try {
        await fetch(`http://localhost:3001/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lastLogout: new Date().toISOString() })
        })
      } catch (error) {
        console.error('Logout update error:', error)
      }
    }
    
    setUser(null)
    localStorage.removeItem('lms_user')
    setCurrentPage('home')
  }

  const handleRegister = (userData) => {
    handleLogin(userData)
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} user={user} />
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} onLogin={handleLogin} />
      case 'register':
        return <RegisterPage setCurrentPage={setCurrentPage} onRegister={handleRegister} />
      case 'catalog':
        return <CourseCatalogPage setCurrentPage={setCurrentPage} user={user} />
      case 'course-detail':
        return <CourseDetailPage setCurrentPage={setCurrentPage} user={user} />
      case 'about':
        return <AboutPage setCurrentPage={setCurrentPage} />
      case 'contact':
        return <ContactPage setCurrentPage={setCurrentPage} />
      case 'student-dashboard':
        return user ? <StudentDashboard setCurrentPage={setCurrentPage} onLogout={handleLogout} user={user} /> : <LoginPage setCurrentPage={setCurrentPage} onLogin={handleLogin} />
      case 'admin-dashboard':
        return user ? <AdminDashboard setCurrentPage={setCurrentPage} onLogout={handleLogout} user={user} /> : <LoginPage setCurrentPage={setCurrentPage} onLogin={handleLogin} />
      case 'manager-dashboard':
        return user ? <ManagerDashboard setCurrentPage={setCurrentPage} onLogout={handleLogout} user={user} /> : <LoginPage setCurrentPage={setCurrentPage} onLogin={handleLogin} />
      default:
        return <HomePage setCurrentPage={setCurrentPage} user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
    </div>
  )
}

export default App