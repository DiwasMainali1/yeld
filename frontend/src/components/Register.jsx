function Register() {
    return (
        <div className="min-w-screen min-h-screen bg-gradient-to-r from-slate-800 to-slate-700 items-center flex justify-center">
            <form className="flex flex-col w-[400px]">
                <label className="text-white mb-2">Name</label>
                <input type="text" placeholder="Username" className="rounded-md p-3 mb-5"/>
                <label className="text-white mb-2">Email</label>
                <input type="text" placeholder="Email" className="rounded-md p-3 mb-5"/>
                <label className="text-white mb-2">Password</label>
                <input type="password" placeholder="Password" className="rounded-md p-3 mb-5"/>
                <div class="flex items-center justify-center">
                    <button type="text" className="bg-white text-black p-3 rounded-xl font-bold w-[100px]">Submit</button>
                </div>
            </form>
        </div>
    )
}

export default Register