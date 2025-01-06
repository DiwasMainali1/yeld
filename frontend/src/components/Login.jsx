import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
    const navigate = useNavigate()
    const [data, setData] = useState({
        email: '',
        password: '',
    })
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const loginUser = async (e) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Login failed')
            }

            // Store the token in localStorage
            localStorage.setItem('userToken', result.token)
            
            // Redirect to dashboard
            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-w-screen min-h-screen bg-black flex items-center justify-center flex-col font-sans">
            <a href="/">
                <h1 className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent text-6xl mb-16 font-bold tracking-tight hover:scale-105 transition-transform">Yeld</h1>
            </a>
            <form onSubmit={loginUser} className="flex flex-col w-96 bg-zinc-950 p-8 rounded-2xl shadow-xl border border-zinc-900">
                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-2 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-center space-x-1 pb-3">
                    <label className="text-gray-400 mb-2 text-sm font-medium">New to site?</label>
                    <a href="/register" className="bg-gradient-to-r from-blue-200 to-slate-400 bg-clip-text text-transparent text-sm font-bold">Register</a>
                </div>

                <label className="text-gray-400 mb-2 text-sm font-medium">Email</label>
                <input 
                    type="email" 
                    value={data.email}
                    onChange={(e) => setData({...data, email: e.target.value})}
                    placeholder="Email" 
                    className="rounded-lg p-3 mb-6 bg-black border border-zinc-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition duration-200"
                />
                
                <label className="text-gray-400 mb-2 text-sm font-medium">Password</label>
                <input 
                    type="password" 
                    value={data.password}
                    onChange={(e) => setData({...data, password: e.target.value})}
                    placeholder="Password" 
                    className="rounded-lg p-3 mb-8 bg-black border border-zinc-800 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent transition duration-200"
                />
                
                <div className="flex items-center justify-center">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className={`bg-black text-white py-3 px-8 rounded-xl font-semibold hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Login