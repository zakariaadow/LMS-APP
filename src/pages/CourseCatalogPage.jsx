import React from 'react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import CourseCard from '../components/courses/CourseCard'

const courses = [
  {
    id: 1,
    title: "Web Development Bootcamp",
    description: "Learn HTML, CSS, JavaScript, React and Node.js",
    image: "https://via.placeholder.com/400x200",
    level: "Beginner",
    rating: 4.8,
    reviews: 1245,
    price: 49.99
  },
  {
    id: 2,
    title: "Data Science Masterclass",
    description: "Python, Pandas, Machine Learning and AI",
    image: "https://via.placeholder.com/400x200",
    level: "Intermediate",
    rating: 4.9,
    reviews: 892,
    price: 59.99
  },
  {
    id: 3,
    title: "UI/UX Design Fundamentals",
    description: "Figma, Prototyping, User Research",
    image: "https://via.placeholder.com/400x200",
    level: "Beginner",
    rating: 4.7,
    reviews: 567,
    price: 39.99
  },
  {
    id: 4,
    title: "Mobile App Development",
    description: "React Native, iOS, Android",
    image: "https://via.placeholder.com/400x200",
    level: "Advanced",
    rating: 4.6,
    reviews: 432,
    price: 69.99
  }
]

const CourseCatalogPage = ({ setCurrentPage }) => {
  return (
    <div>
      <Navbar setCurrentPage={setCurrentPage} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Courses</h1>
          <p className="text-xl text-gray-600">Choose from 100+ expert-led courses</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              setCurrentPage={setCurrentPage}
            />
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default CourseCatalogPage