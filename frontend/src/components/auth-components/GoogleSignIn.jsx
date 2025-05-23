import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from 'lucide-react';

function GoogleSignIn() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // Use your actual client ID - this is critical
    const CLIENT_ID = "203545799410-7v1vguihr91o3lmtr9tn3bih11o0vvhp.apps.googleusercontent.com";

    useEffect(() => {
        // Add the Google script directly in HTML to avoid CORS issues
        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.head.appendChild(script);

        // Clean up
        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const initializeGoogleSignIn = () => {
        if (!window.google) {
            console.error("Google Identity Services library not loaded");
            setError("Failed to load Google Sign-In. Please try again later.");
            return;
        }

        try {
            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleGoogleSignIn,
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            window.google.accounts.id.renderButton(
                document.getElementById('google-signin-button'),
                { 
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    text: "continue_with",
                    shape: "rectangular",
                    logo_alignment: "center",
                    width: 320
                }
            );

            // Also display the One Tap UI
            window.google.accounts.id.prompt();
        } catch (err) {
            console.error("Error initializing Google Sign-In:", err);
            setError("Failed to initialize Google Sign-In. Please try again later.");
        }
    };

    const handleGoogleSignIn = async (response) => {
        try {
            setIsLoading(true);
            setError("");
            
            console.log("Google sign-in response received:", response);

            if (!response.credential) {
                throw new Error("No credential received from Google");
            }

            // Send the ID token to your backend
            const result = await fetch('http://localhost:5000/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: response.credential
                })
            });

            const data = await result.json();

            if (!result.ok) {
                throw new Error(data.message || 'Google sign in failed');
            }

            // Store auth data
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('username', data.username);
            
            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error('Google sign in error:', err);
            setError(err.message || "Authentication failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-w-screen min-h-screen bg-black flex items-center justify-center flex-col font-sans">
            <a href="/">
                <h1 className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent text-6xl mb-16 font-bold tracking-tight hover:scale-105 transition-transform">Yeld</h1>
            </a>
            
            <div className="flex flex-col w-96 bg-zinc-950 p-8 rounded-2xl shadow-xl border border-zinc-900">
                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-2 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <div className="text-center mb-6">
                    <h2 className="text-gray-200 text-xl font-semibold mb-2">Welcome to Yeld</h2>
                    <p className="text-gray-400 text-sm">Sign in to track your productivity journey</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center my-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300"></div>
                    </div>
                ) : (
                    <div className="flex justify-center my-4">
                        <div id="google-signin-button"></div>
                    </div>
                )}

                <div className="text-center mt-4">
                    <p className="text-zinc-500 text-sm">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}

export default GoogleSignIn;