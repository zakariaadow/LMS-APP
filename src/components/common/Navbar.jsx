import React from 'react'

const Navbar = ({ setCurrentPage }) => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 
              onClick={() => setCurrentPage('home')}
              className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700"
            >
              LearnHub
            </h1>
            <div className="hidden md:flex ml-10 space-x-8">
              <button 
                onClick={() => setCurrentPage('catalog')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium transition-colors"
              >
                Courses
              </button>
              <button 
                onClick={() => setCurrentPage('about')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => setCurrentPage('contact')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 font-medium transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => setCurrentPage('login')}
              className="text-gray-700 hover:text-blue-600 px-4 py-2 font-medium transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => setCurrentPage('register')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar