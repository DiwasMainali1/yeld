import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Register() {
    const navigate = useNavigate()
    const [data, setData] = useState({
        username: '',
        email: '',
        password: '',
    })
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const registerUser = async (e) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        // Basic validation
        if (!data.username || !data.email || !data.password) {
            setError("All fields are required")
            setIsLoading(false)
            return
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.email)) {
            setError("Please enter a valid email address")
            setIsLoading(false)
            return
        }

        // Password validation
        if (data.password.length < 6) {
            setError("Password must be at least 6 characters long")
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('http://localhost:5000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: data.username.trim(),
                    email: data.email.trim().toLowerCase(),
                    password: data.password
                })
            })

            const result = await response.json()

            if (!response.ok) {
                // Handle specific error messages from the backend
                if (result.message.includes('already exists')) {
                    throw new Error('Username or email already taken')
                } else if (result.message.includes('validation')) {
                    throw new Error('Please check your input and try again')
                } else {
                    throw new Error(result.message || 'Registration failed')
                }
            }

            // Store the token in localStorage
            localStorage.setItem('userToken', result.token)
            
            // Initialize user stats in localStorage
            localStorage.setItem('completedSessions', '0')
            localStorage.setItem('totalTimeStudied', '0')
            
            // Redirect to dashboard
            navigate('/dashboard')
        } catch (err) {
            console.error('Registration error:', err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (error) setError("")
    }

    return (
        <div className="min-w-screen min-h-screen bg-black flex items-center justify-center flex-col font-sans">
            <a href="/">
                <h1 className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent text-6xl mb-16 font-bold tracking-tight hover:scale-105 transition-transform">Yeld</h1>
            </a>            
            <form onSubmit={registerUser} className="flex flex-col w-96 bg-zinc-950 p-8 rounded-2xl shadow-xl border border-zinc-900">
                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-2 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}
                
                <div className="flex justify-center space-x-1 pb-3">
                    <label className="text-gray-400 mb-2 text-sm font-medium">Already have an account?</label>
                    <a href="/login" className="bg-gradient-to-r from-blue-200 to-slate-400 bg-clip-text text-transparent text-sm font-bold">Login</a>
                </div>
                
                <label className="text-gray-400 mb-2 text-sm font-medium">Username</label>
                <input 
                    type="text" 
                    name="username"
                    value={data.username}
                    onChange={handleInputChange}
                    placeholder="Username" 
                    className="rounded-lg p-3 mb-6 bg-black border border-zinc-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition duration-200"
                />
                
                <label className="text-gray-400 mb-2 text-sm font-medium">Email</label>
                <input 
                    type="email" 
                    name="email"
                    value={data.email}
                    onChange={handleInputChange}
                    placeholder="Email" 
                    className="rounded-lg p-3 mb-6 bg-black border border-zinc-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition duration-200"
                />
                
                <label className="text-gray-400 mb-2 text-sm font-medium">Password</label>
                <input 
                    type="password" 
                    name="password"
                    value={data.password}
                    onChange={handleInputChange}
                    placeholder="Password" 
                    className="rounded-lg p-3 mb-8 bg-black border border-zinc-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition duration-200"
                />
                
                <div className="flex items-center justify-center">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className={`bg-black text-white py-3 px-8 rounded-xl font-semibold hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Register