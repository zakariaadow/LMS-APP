import React from 'react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

const AboutPage = ({ setCurrentPage }) => {
  return (
    <div>
      <Navbar setCurrentPage={setCurrentPage} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About LearnHub</h1>
          <p className="text-xl text-gray-600">Empowering learners worldwide since 2020</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              At LearnHub, our mission is to make quality education accessible to everyone, everywhere. 
              We believe that learning should be engaging, flexible, and tailored to individual needs.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              To create a world where anyone can learn anything, transforming lives through education 
              and building a global community of lifelong learners.
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-semibold mb-2">100+ Expert Instructors</h3>
              <p className="text-gray-600">Industry professionals sharing real-world knowledge</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-semibold mb-2">500+ Courses</h3>
              <p className="text-gray-600">Wide range of topics from beginner to advanced</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="font-semibold mb-2">50,000+ Students</h3>
              <p className="text-gray-600">Trusted by learners from 100+ countries</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default AboutPage