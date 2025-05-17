import React from 'react'
import { Link } from 'react-router-dom'
const Header = () => {
  return (
    <div className="w-full bg-black">
        <div>
            <Link to="/register">
                <button type="button" className="text-black bg-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                    Register
                </button>
            </Link>

            <Link to="/login">
                <button type="button" className="text-black bg-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                    Login
                </button>
            </Link>
        </div>
    </div>
  )
}

export default Header
