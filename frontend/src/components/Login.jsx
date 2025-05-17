import { useState } from 'react'
import React from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Logged in!', username, password)
  }
  return (
    <div>
      <h1 className='flex justify-center w-full items-center bg-gray-200 h-12 text-2xl mb-2'>
        <Link to="/">
          <button type="button" className="text-black bg-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
              Home
          </button>
        </Link>  
        Login Page
      </h1>


      <div className='h-full flex justify-center items-center'>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor='username'>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='my-3 pl-3 ml-3 px-3 py-2 border border-gray-300 rounded-md'
            />
          </div>
          <div>
            <label htmlFor='password'>
              Password
            </label>
            <input
              type="text"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='my-3 pl-3 ml-3 px-3 py-2 border border-gray-300 rounded-md'
            />
          </div>
          <div>
            <button
              type='submit'
              className='className="text-black bg-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>
                Login
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}

export default Login
