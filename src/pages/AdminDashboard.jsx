import React, { useState, useEffect } from 'react'

const AdminDashboard = ({ setCurrentPage, onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [payments, setPayments] = useState([])
  const [results, setResults] = useState([])
  const [showResultModal, setShowResultModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showEditStudentModal, setShowEditStudentModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [studentsRes, coursesRes, paymentsRes, resultsRes] = await Promise.all([
        fetch('http://localhost:3001/students'),
        fetch('http://localhost:3001/courses'),
        fetch('http://localhost:3001/payments'),
        fetch('http://localhost:3001/results')
      ])
      setStudents(await studentsRes.json())
      setCourses(await coursesRes.json())
      setPayments(await paymentsRes.json())
      setResults(await resultsRes.json())
    } catch (error) { console.error('Error:', error) }
  }

  const addStudent = async (studentData) => {
    setLoading(true)
    try {
      const existingStudent = students.find(s => s.email === studentData.email)
      if (existingStudent) {
        alert('Student with this email already exists!')
        setLoading(false)
        return
      }

      const newStudent = {
        id: students.length + 1,
        name: studentData.name,
        email: studentData.email,
        studentId: `STU${String(students.length + 1).padStart(3, '0')}`,
        enrolledCourses: studentData.enrolledCourses || [],
        status: 'active',
        joinDate: new Date().toISOString(),
        phone: studentData.phone || '',
        address: studentData.address || ''
      }

      await fetch('http://localhost:3001/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      })

      const usersRes = await fetch('http://localhost:3001/users')
      const existingUsers = await usersRes.json()
      const maxUserId = existingUsers.length > 0 ? Math.max(...existingUsers.map(u => u.id)) : 0

      const newUser = {
        id: maxUserId + 1,
        name: studentData.name,
        email: studentData.email,
        password: studentData.password || 'student123',
        role: 'student',
        createdAt: new Date().toISOString(),
        status: 'active',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.name)}&background=3b82f6&color=fff`,
        lastLogin: null,
        loginCount: 0
      }

      await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      alert(`Student ${studentData.name} added successfully!`)
      setShowAddStudentModal(false)
      loadData()
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  const editStudent = async (studentData) => {
    setLoading(true)
    try {
      // Check if email already exists for another student
      const existingStudent = students.find(s => s.email === studentData.email && s.id !== studentData.id)
      if (existingStudent) {
        alert('Another student with this email already exists!')
        setLoading(false)
        return
      }

      // Update student in students array
      await fetch(`http://localhost:3001/students/${studentData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...studentData,
          updatedAt: new Date().toISOString()
        })
      })

      // Update user account
      const usersRes = await fetch('http://localhost:3001/users')
      const users = await usersRes.json()
      const userAccount = users.find(u => u.email === studentData.oldEmail || u.email === studentData.email)
      
      if (userAccount) {
        await fetch(`http://localhost:3001/users/${userAccount.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: studentData.name,
            email: studentData.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.name)}&background=3b82f6&color=fff`
          })
        })
      }

      alert(`Student ${studentData.name} updated successfully!`)
      setShowEditStudentModal(false)
      setSelectedStudent(null)
      loadData()
    } catch (error) {
      console.error('Error editing student:', error)
      alert('Failed to edit student')
    } finally {
      setLoading(false)
    }
  }

  const deleteStudent = async (student) => {
    try {
      await fetch(`http://localhost:3001/students/${student.id}`, { method: 'DELETE' })

      const usersRes = await fetch('http://localhost:3001/users')
      const users = await usersRes.json()
      const userAccount = users.find(u => u.email === student.email)
      if (userAccount) {
        await fetch(`http://localhost:3001/users/${userAccount.id}`, { method: 'DELETE' })
      }

      const paymentsToDelete = payments.filter(p => p.studentId === student.id)
      for (const payment of paymentsToDelete) {
        await fetch(`http://localhost:3001/payments/${payment.id}`, { method: 'DELETE' })
      }

      const resultsToDelete = results.filter(r => r.studentId === student.id)
      for (const result of resultsToDelete) {
        await fetch(`http://localhost:3001/results/${result.id}`, { method: 'DELETE' })
      }

      alert(`Student ${student.name} deleted successfully!`)
      setShowDeleteConfirm(null)
      loadData()
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Failed to delete student')
    }
  }

  const sendResultToStudent = async (resultData) => {
    try {
      const existingResult = results.find(r => r.studentId === resultData.studentId && r.courseId === resultData.courseId)
      if (existingResult) {
        await fetch(`http://localhost:3001/results/${existingResult.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...existingResult, ...resultData })
        })
      } else {
        const newResult = { id: results.length + 1, ...resultData, createdAt: new Date().toISOString() }
        await fetch('http://localhost:3001/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newResult) })
      }
      
      const notification = { 
        id: Date.now(), 
        studentId: resultData.studentId, 
        studentName: resultData.studentName, 
        type: 'result', 
        title: 'Result Published', 
        message: `Your result for ${resultData.courseName} has been published. Grade: ${resultData.grade} (${resultData.percentage}%)`, 
        data: resultData, 
        read: false, 
        createdAt: new Date().toISOString() 
      }
      
      await fetch('http://localhost:3001/notifications', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(notification) 
      })
      
      alert(`Result sent to ${resultData.studentName} successfully!`)
      setShowResultModal(false)
      loadData()
    } catch (error) { 
      alert('Failed to send result') 
    }
  }

  const sendFeePaymentNotification = async (paymentData) => {
    try {
      const newPayment = { 
        id: payments.length + 1, 
        ...paymentData, 
        paymentDate: new Date().toISOString(), 
        transactionId: `TXN${Date.now()}`, 
        status: 'completed' 
      }
      
      await fetch('http://localhost:3001/payments', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(newPayment) 
      })
      
      const student = students.find(s => s.id === paymentData.studentId)
      if (student && !student.enrolledCourses?.includes(paymentData.courseId)) {
        await fetch(`http://localhost:3001/students/${student.id}`, { 
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ enrolledCourses: [...(student.enrolledCourses || []), paymentData.courseId] }) 
        })
      }
      
      const course = courses.find(c => c.id === paymentData.courseId)
      await fetch(`http://localhost:3001/courses/${course.id}`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ students: (course.students || 0) + 1 }) 
      })
      
      const notification = { 
        id: Date.now(), 
        studentId: paymentData.studentId, 
        studentName: paymentData.studentName, 
        type: 'payment', 
        title: 'Payment Confirmed', 
        message: `Your payment of $${paymentData.amount} for ${paymentData.courseName} has been confirmed.`, 
        data: paymentData, 
        read: false, 
        createdAt: new Date().toISOString() 
      }
      
      await fetch('http://localhost:3001/notifications', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(notification) 
      })
      
      alert(`Payment notification sent to ${paymentData.studentName}!`)
      setShowPaymentModal(false)
      loadData()
    } catch (error) { 
      alert('Failed to send payment notification') 
    }
  }

  const stats = { 
    totalStudents: students.length, 
    totalCourses: courses.length, 
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0), 
    totalPayments: payments.length, 
    totalResults: results.length 
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">LearnHub Admin</h1>
              <span className="ml-3 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Admin Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full" />
              <span className="text-gray-700">{user?.name}</span>
              <button onClick={onLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">👨‍🎓</div>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <div className="text-gray-600">Students</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <div className="text-gray-600">Courses</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-gray-600">Revenue</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">💳</div>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
            <div className="text-gray-600">Payments</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold">{stats.totalResults}</div>
            <div className="text-gray-600">Results</div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Send Results</h3>
            <p className="mb-4">Publish and send grades to students</p>
            <button onClick={() => setShowResultModal(true)} className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-100">Send Results →</button>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Confirm Payments</h3>
            <p className="mb-4">Confirm student payments and enrollment</p>
            <button onClick={() => setShowPaymentModal(true)} className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100">Confirm Payment →</button>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Add Student</h3>
            <p className="mb-4">Add new students to the system</p>
            <button onClick={() => setShowAddStudentModal(true)} className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100">+ Add Student</button>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Manage Students</h3>
            <p className="mb-4">Edit or remove existing students</p>
            <button onClick={() => setActiveTab('students')} className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-gray-100">Manage →</button>
          </div>
        </div>

        {/* Students Management Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Student Management</h2>
            <button onClick={() => setShowAddStudentModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              + Add Student
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map(student => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{student.studentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.enrolledCourses?.length || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(student.joinDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">{student.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowEditStudentModal(true)
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(student)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No students found. Click "Add Student" to add your first student.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Results Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b"><h2 className="text-xl font-semibold">Recent Results Sent</h2></div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 5).map(result => (
                  <tr key={result.id}>
                    <td className="px-6 py-4">{result.studentName}</td>
                    <td className="px-6 py-4">{result.courseName}</td>
                    <td className="px-6 py-4 font-bold">{result.grade}</td>
                    <td className="px-6 py-4">{result.percentage}%</td>
                    <td className="px-6 py-4">{new Date(result.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No results sent yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add New Student</h2>
              <button onClick={() => setShowAddStudentModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              addStudent({
                name: fd.get('name'),
                email: fd.get('email'),
                password: fd.get('password'),
                enrolledCourses: []
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" name="name" className="input" required placeholder="John Doe" />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" name="email" className="input" required placeholder="student@example.com" />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="text" name="password" className="input" required placeholder="Enter password" defaultValue="student123" />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800"><strong>Note:</strong> A user account will also be created for this student.</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddStudentModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                  {loading ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Student</h2>
              <button onClick={() => {
                setShowEditStudentModal(false)
                setSelectedStudent(null)
              }} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              editStudent({
                id: selectedStudent.id,
                oldEmail: selectedStudent.email,
                name: fd.get('name'),
                email: fd.get('email'),
                phone: fd.get('phone'),
                address: fd.get('address'),
                status: fd.get('status'),
                studentId: selectedStudent.studentId,
                enrolledCourses: selectedStudent.enrolledCourses,
                joinDate: selectedStudent.joinDate
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="label">Student ID</label>
                  <input type="text" value={selectedStudent.studentId} className="input bg-gray-100" disabled />
                </div>
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" name="name" className="input" required defaultValue={selectedStudent.name} />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" name="email" className="input" required defaultValue={selectedStudent.email} />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input type="text" name="phone" className="input" defaultValue={selectedStudent.phone || ''} placeholder="Optional" />
                </div>
                <div>
                  <label className="label">Address</label>
                  <textarea name="address" className="input" rows="2" defaultValue={selectedStudent.address || ''} placeholder="Optional"></textarea>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select name="status" className="input" defaultValue={selectedStudent.status}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800"><strong>Note:</strong> Email change will also update the user account.</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => {
                  setShowEditStudentModal(false)
                  setSelectedStudent(null)
                }} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900">Delete Student</h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>?
              </p>
              <p className="text-red-600 text-sm mt-2">
                This will also delete their user account, payments, and results!
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={() => deleteStudent(showDeleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Send Student Result</h2>
              <button onClick={() => setShowResultModal(false)} className="text-gray-500">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              sendResultToStudent({
                studentId: parseInt(fd.get('studentId')),
                studentName: fd.get('studentName'),
                courseId: parseInt(fd.get('courseId')),
                courseName: fd.get('courseName'),
                totalScore: parseFloat(fd.get('totalScore')),
                percentage: parseFloat(fd.get('percentage')),
                grade: fd.get('grade'),
                completedAssignments: parseInt(fd.get('completedAssignments')),
                totalAssignments: parseInt(fd.get('totalAssignments')),
                quizScores: fd.get('quizScores').split(',').map(Number),
                finalExam: parseFloat(fd.get('finalExam')),
                status: fd.get('status'),
                feedback: fd.get('feedback')
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="label">Select Student</label>
                  <select name="studentId" className="input" required onChange={(e) => {
                    const s = students.find(st => st.id === parseInt(e.target.value))
                    if (s) e.target.form.studentName.value = s.name
                  }}>
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                  </select>
                </div>
                <input type="hidden" name="studentName" />
                <div>
                  <label className="label">Select Course</label>
                  <select name="courseId" className="input" required onChange={(e) => {
                    const c = courses.find(cr => cr.id === parseInt(e.target.value))
                    if (c) e.target.form.courseName.value = c.title
                  }}>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <input type="hidden" name="courseName" />
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Total Score</label><input type="number" name="totalScore" className="input" required step="0.1" /></div>
                  <div><label className="label">Percentage (%)</label><input type="number" name="percentage" className="input" required step="0.1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Grade</label><select name="grade" className="input" required>
                    <option value="A+">A+</option><option value="A">A</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B">B</option><option value="B-">B-</option>
                    <option value="C+">C+</option><option value="C">C</option><option value="C-">C-</option>
                    <option value="D">D</option><option value="F">F</option>
                  </select></div>
                  <div><label className="label">Final Exam</label><input type="number" name="finalExam" className="input" required step="0.1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Completed Assignments</label><input type="number" name="completedAssignments" className="input" required /></div>
                  <div><label className="label">Total Assignments</label><input type="number" name="totalAssignments" className="input" required /></div>
                </div>
                <div><label className="label">Quiz Scores (comma separated)</label><input type="text" name="quizScores" className="input" required placeholder="85,90,88" /></div>
                <div><label className="label">Status</label><select name="status" className="input" required><option value="passing">Passing</option><option value="failing">Failing</option></select></div>
                <div><label className="label">Feedback</label><textarea name="feedback" rows="3" className="input" placeholder="Provide feedback..."></textarea></div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowResultModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Send Result</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Confirm Fee Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-500">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              sendFeePaymentNotification({
                studentId: parseInt(fd.get('studentId')),
                studentName: fd.get('studentName'),
                courseId: parseInt(fd.get('courseId')),
                courseName: fd.get('courseName'),
                amount: parseFloat(fd.get('amount')),
                paymentMethod: fd.get('paymentMethod')
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="label">Select Student</label>
                  <select name="studentId" className="input" required onChange={(e) => {
                    const s = students.find(st => st.id === parseInt(e.target.value))
                    if (s) e.target.form.studentName.value = s.name
                  }}>
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                  </select>
                </div>
                <input type="hidden" name="studentName" />
                <div>
                  <label className="label">Select Course</label>
                  <select name="courseId" className="input" required onChange={(e) => {
                    const c = courses.find(cr => cr.id === parseInt(e.target.value))
                    if (c) {
                      e.target.form.courseName.value = c.title
                      e.target.form.amount.value = c.price
                    }
                  }}>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title} - ${c.price}</option>)}
                  </select>
                </div>
                <input type="hidden" name="courseName" />
                <div><label className="label">Amount ($)</label><input type="number" name="amount" className="input" required readOnly /></div>
                <div><label className="label">Payment Method</label><select name="paymentMethod" className="input" required>
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select></div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard