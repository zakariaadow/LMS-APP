import React, { useState } from 'react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Button from '../components/common/Button'

const CourseDetailPage = ({ setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div>
      <Navbar setCurrentPage={setCurrentPage} />
      
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-4">Complete Web Development Bootcamp</h1>
              <p className="text-xl text-gray-300 mb-6">
                Become a full-stack web developer with this comprehensive course
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-yellow-400">★★★★★</span>
                  <span className="ml-2">4.8 (1,245 reviews)</span>
                </div>
                <span>•</span>
                <span>45 hours of content</span>
                <span>•</span>
                <span>Certificate of completion</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 text-gray-900">
              <div className="text-3xl font-bold text-blue-600 mb-4">$49.99</div>
              <Button variant="primary" className="w-full mb-3">Enroll Now</Button>
              <Button variant="outline" className="w-full">Start Free Trial</Button>
              <p className="text-sm text-gray-500 mt-4 text-center">30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-b border-gray-200 mb-8">
          <div className="flex space-x-8">
            {['overview', 'curriculum', 'instructor', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 capitalize ${
                  activeTab === tab 
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                This comprehensive web development bootcamp will take you from beginner to 
                professional developer. You'll learn HTML5, CSS3, JavaScript, React, Node.js, 
                and much more. By the end of this course, you'll be able to build full-stack 
                web applications and start your career as a web developer.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">What you'll learn</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Build responsive websites
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Master React and Redux
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Create RESTful APIs
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Deploy applications to production
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}

export default CourseDetailPage