
export default function Signup() {
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-80">
            <h2 className="text-2xl font-semibold text-center text-green-600 mb-4">Sign Up</h2>
            {/* Form can be added here */}
            <form>
            <input
                type="text"
                placeholder="First Name"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md"
              />
                            <input
                type="text"
                placeholder="Last Name"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md"
              />
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-all"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
    );
};