import React from 'react'
import Card from '../common/Card'

const CourseCard = ({ course, setCurrentPage }) => {
  // Course-specific images based on title
  const getCourseImage = (title) => {
    const images = {
      "Web Development Bootcamp": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop",
      "Data Science Masterclass": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
      "UI/UX Design Fundamentals": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop",
      "Mobile App Development": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop"
    }
    return images[title] || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=200&fit=crop"
  }

  return (
    <Card className="cursor-pointer transform transition-transform hover:scale-105 overflow-hidden">
      <div className="relative">
        <img 
          src={getCourseImage(course.title)} 
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <span className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-semibold">
          {course.level}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 text-sm">{course.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-yellow-500 text-lg">★</span>
            <span className="ml-1 text-gray-700 font-semibold">{course.rating}</span>
            <span className="ml-1 text-gray-500 text-sm">({course.reviews})</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">${course.price}</span>
        </div>
        <button 
          onClick={() => setCurrentPage('course-detail')}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Enroll Now
        </button>
      </div>
    </Card>
  )
}

export default CourseCard