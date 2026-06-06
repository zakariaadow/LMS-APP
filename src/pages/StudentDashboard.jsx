import React, { useState, useEffect } from 'react'

const StudentDashboard = ({ setCurrentPage, onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [studentData, setStudentData] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    loadStudentData()
    loadNotifications()
  }, [])

  const loadStudentData = async () => {
    try {
      // Get student record
      const studentsRes = await fetch('http://localhost:3001/students')
      const students = await studentsRes.json()
      const student = students.find(s => s.email === user.email)
      setStudentData(student)

      // Get all courses
      const coursesRes = await fetch('http://localhost:3001/courses')
      const courses = await coursesRes.json()
      setAllCourses(courses)

      // Get enrolled courses with payment status
      if (student && student.enrolledCourses) {
        const enrolled = courses.filter(c => student.enrolledCourses.includes(c.id))
        
        // Get payments to check status
        const paymentsRes = await fetch('http://localhost:3001/payments')
        const payments = await paymentsRes.json()
        
        const enrolledWithPayment = enrolled.map(course => ({
          ...course,
          paymentStatus: payments.find(p => p.courseId === course.id && p.studentId === student.id)?.status || 'pending'
        }))
        
        setEnrolledCourses(enrolledWithPayment)
      }
    } catch (error) {
      console.error('Error loading student data:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      const res = await fetch('http://localhost:3001/notifications')
      const allNotifications = await res.json()
      const studentNotifications = allNotifications.filter(n => n.studentId === studentData?.id)
      setNotifications(studentNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const processPayment = async () => {
    setLoading(true)
    try {
      // Create payment record
      const paymentsRes = await fetch('http://localhost:3001/payments')
      const existingPayments = await paymentsRes.json()
      
      const newPayment = {
        id: existingPayments.length + 1,
        studentId: studentData.id,
        studentName: user.name,
        courseId: selectedCourse.id,
        courseName: selectedCourse.title,
        amount: selectedCourse.price,
        status: 'completed',
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentMethod,
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
      }
      
      await fetch('http://localhost:3001/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayment)
      })
      
      // Update student's enrolled courses
      const updatedEnrolledCourses = [...(studentData.enrolledCourses || []), selectedCourse.id]
      
      await fetch(`http://localhost:3001/students/${studentData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrolledCourses: updatedEnrolledCourses })
      })
      
      // Update course student count
      const courseRes = await fetch(`http://localhost:3001/courses/${selectedCourse.id}`)
      const course = await courseRes.json()
      await fetch(`http://localhost:3001/courses/${selectedCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: (course.students || 0) + 1 })
      })
      
      alert(`Payment successful! You are now enrolled in ${selectedCourse.title}`)
      setShowPaymentModal(false)
      await loadStudentData()
      await loadNotifications()
      
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = (course) => {
    setSelectedCourse(course)
    setShowPaymentModal(true)
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:3001/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      })
      await loadNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">
                LearnHub
              </h1>
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Student Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className="relative text-gray-700 hover:text-blue-600"
                >
                  <span className="text-2xl">🔔</span>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full" />
                <span className="text-gray-700">{user?.name}</span>
              </div>
              <button 
                onClick={() => setCurrentPage('catalog')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium"
              >
                Browse Courses
              </button>
              <button 
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-green-100">Continue your learning journey. You're doing great!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <div className="text-gray-600">Enrolled Courses</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold">
              {enrolledCourses.filter(c => c.paymentStatus === 'completed').length}
            </div>
            <div className="text-gray-600">Paid Courses</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold">
              ${enrolledCourses.reduce((sum, c) => sum + (c.paymentStatus === 'completed' ? c.price : 0), 0)}
            </div>
            <div className="text-gray-600">Total Spent</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <div className="text-gray-600">Notifications</div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="text-2xl mr-2">🔔</span> 
            Recent Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notifications.filter(n => !n.read).length} new
              </span>
            )}
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications yet. When admin sends you results or confirms payments, they'll appear here.
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    !notification.read 
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">
                          {notification.type === 'result' ? '📊' : '💳'}
                        </span>
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        {!notification.read && (
                          <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      {notification.type === 'result' && notification.data && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Grade:</span>
                              <span className="ml-2 font-semibold text-green-600">{notification.data.grade}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Percentage:</span>
                              <span className="ml-2 font-semibold">{notification.data.percentage}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Final Exam:</span>
                              <span className="ml-2">{notification.data.finalExam}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <span className={`ml-2 font-semibold ${
                                notification.data.status === 'passing' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {notification.data.status}
                              </span>
                            </div>
                          </div>
                          {notification.data.feedback && (
                            <div className="mt-2 pt-2 border-t">
                              <span className="text-gray-500">Feedback:</span>
                              <p className="text-sm mt-1">{notification.data.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {notification.type === 'payment' && notification.data && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Course:</span>
                              <span className="ml-2 font-semibold">{notification.data.courseName}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Amount:</span>
                              <span className="ml-2 font-semibold text-green-600">${notification.data.amount}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 ml-4">
                      {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            {['my-courses', 'available-courses'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 capitalize ${
                  activeTab === tab 
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* My Courses Tab */}
        {activeTab === 'my-courses' && (
          <div className="space-y-4">
            {enrolledCourses.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
                <button 
                  onClick={() => setActiveTab('available-courses')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Browse Available Courses
                </button>
              </div>
            ) : (
              enrolledCourses.map(course => (
                <div key={course.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{course.title}</h3>
                      <p className="text-gray-600 text-sm">Instructor: {course.instructor}</p>
                      <div className="mt-2">
                        {course.paymentStatus === 'completed' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Payment Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⏳ Payment Pending
                          </span>
                        )}
                      </div>
                    </div>
                    {course.paymentStatus === 'completed' ? (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Continue Learning
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(course)}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                      >
                        Complete Payment
                      </button>
                    )}
                  </div>
                  {course.paymentStatus === 'completed' && (
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>0%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 rounded-full h-2 transition-all" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Available Courses Tab */}
        {activeTab === 'available-courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map(course => {
              const isEnrolled = studentData?.enrolledCourses?.includes(course.id)
              return (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{course.description.substring(0, 80)}...</p>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="text-yellow-600">⭐ {course.rating}</span>
                        <span className="text-gray-500 text-sm ml-2">({course.students} students)</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">${course.price}</span>
                    </div>
                    {isEnrolled ? (
                      <button 
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg cursor-default" 
                        disabled
                      >
                        Already Enrolled
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(course)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Enroll Now - ${course.price}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Complete Payment</h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">{selectedCourse.title}</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">${selectedCourse.price}</p>
            </div>
            
            <div className="mb-4">
              <label className="label">Payment Method</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input"
              >
                <option value="credit_card">💳 Credit Card</option>
                <option value="paypal">💰 PayPal</option>
                <option value="bank_transfer">🏦 Bank Transfer</option>
              </select>
            </div>
            
            {paymentMethod === 'credit_card' && (
              <div className="space-y-3 mb-4">
                <input type="text" placeholder="Card Number" className="input" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM/YY" className="input" />
                  <input type="text" placeholder="CVV" className="input" />
                </div>
                <input type="text" placeholder="Cardholder Name" className="input" />
              </div>
            )}
            
            <button 
              onClick={processPayment}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay $${selectedCourse.price}`}
            </button>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              Secure payment powered by LearnHub
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard