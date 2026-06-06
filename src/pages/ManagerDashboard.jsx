import React, { useState, useEffect } from 'react'

const ManagerDashboard = ({ setCurrentPage, onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [payments, setPayments] = useState([])
  const [assignments, setAssignments] = useState([])
  const [results, setResults] = useState([])
  const [instructors, setInstructors] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [studentsRes, coursesRes, paymentsRes, assignmentsRes, resultsRes, instructorsRes] = await Promise.all([
        fetch('http://localhost:3001/students'),
        fetch('http://localhost:3001/courses'),
        fetch('http://localhost:3001/payments'),
        fetch('http://localhost:3001/assignments'),
        fetch('http://localhost:3001/results'),
        fetch('http://localhost:3001/instructors')
      ])
      
      setStudents(await studentsRes.json())
      setCourses(await coursesRes.json())
      setPayments(await paymentsRes.json())
      setAssignments(await assignmentsRes.json())
      setResults(await resultsRes.json())
      setInstructors(await instructorsRes.json())
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const stats = {
    totalStudents: students.length,
    totalCourses: courses.length,
    totalInstructors: instructors.length,
    totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    averagePassRate: (results.filter(r => r.status === 'passing').length / results.length * 100).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600 cursor-pointer">
                LearnHub Manager
              </h1>
              <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                Manager Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full" />
                <span className="text-gray-700">{user?.name}</span>
              </div>
              <button onClick={onLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-purple-100">Here's the complete overview of all activities.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">👨‍🎓</div>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <div className="text-gray-600">Total Students</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <div className="text-gray-600">Total Courses</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">👨‍🏫</div>
            <div className="text-2xl font-bold">{stats.totalInstructors}</div>
            <div className="text-gray-600">Instructors</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-gray-600">Revenue</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold">{stats.averagePassRate}%</div>
            <div className="text-gray-600">Pass Rate</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8 overflow-x-auto">
            {['overview', 'students', 'courses', 'payments', 'assignments', 'results', 'instructors'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 capitalize whitespace-nowrap ${
                  activeTab === tab 
                    ? 'border-b-2 border-purple-600 text-purple-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Students View */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">All Students</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Courses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map(student => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{student.studentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{student.enrolledCourses.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments View */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">All Payments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{payment.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{payment.courseName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${payment.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assignments View */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {assignments.map(assignment => (
              <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">{assignment.title}</h3>
                <p className="text-gray-600 mb-4">{assignment.courseName}</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <p>{new Date(assignment.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Submissions:</span>
                    <p>{assignment.submissions.filter(s => s.status !== 'pending').length}/{assignment.submissions.length}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Average Grade:</span>
                    <p>{
                      (assignment.submissions.filter(s => s.grade).reduce((sum, s) => sum + s.grade, 0) / 
                      assignment.submissions.filter(s => s.grade).length || 0).toFixed(1)
                    }/{assignment.totalPoints}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p>
                      {assignment.submissions.filter(s => s.status === 'graded').length} Graded, 
                      {assignment.submissions.filter(s => s.status === 'submitted').length} Pending Review
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results View */}
        {activeTab === 'results' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Student Results Overview</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map(result => (
                    <tr key={result.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{result.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{result.courseName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{result.percentage}%</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold">{result.grade}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          result.status === 'passing' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {result.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerDashboard