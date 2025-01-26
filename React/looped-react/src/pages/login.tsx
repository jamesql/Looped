import { useState } from 'react';
import Cookie from 'js-cookie';


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
      e.preventDefault();

      if (!username || !password) {
        setError("Please enter both username and password!");
        return;
      }

      // API Request
      try {
        const res = await fetch("http://localhost/auth/login", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }, body: JSON.stringify({username, password})
        });
        const data = await res.json();
        console.log(data);

        if (res.ok) {
          Cookie.set('accessToken', data.accessToken, {expires: 1});
          Cookie.set('refreshToken', data.refreshToken, {expires: 3});
          window.location.href = "/application";

        } else setError(data.message || "Login failed.");

      } catch (err) {
        setError("An issue occured. Please try again later.");
        console.log(error);
      }
  }

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-80">
          <h2 className="text-2xl font-semibold text-center text-blue-600 mb-4">Login</h2>
          {/* Form can be added here */}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 mb-4 border border-gray-300 rounded-md"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 mb-4 border border-gray-300 rounded-md"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
};