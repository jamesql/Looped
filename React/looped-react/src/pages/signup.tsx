import { useState } from "react";
import Cookie from 'js-cookie';


export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState("");

  const handleChange = (e: any) => {
    const {name, value} = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    Cookie.remove("accessToken");
    Cookie.remove("refreshToken");
    Cookie.remove("userId");
          // API Request
          try {
            const res = await fetch("http://localhost/auth/signup", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }, body: JSON.stringify(formData)
            });
            const data = await res.json();
            console.log(data);
    
            if (res.ok) {
              Cookie.set('accessToken', data.accessToken, {expires: 1});
              Cookie.set('refreshToken', data.refreshToken, {expires: 3});
              Cookie.set("userId", data.userId, {expires: 7});
              window.location.href = "/application";
    
            } else setError(data.message || "Signup failed.");
    
          } catch (err) {
            setError("An issue occured. Please try again later.");
            console.log(error);
          }
  }


    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-80">
            <h2 className="text-2xl font-semibold text-center text-green-600 mb-4">Sign Up</h2>
            {/* Form can be added here */}
            <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="First Name"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
                            <input
                type="text"
                placeholder="Last Name"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 mb-4 border border-gray-300 rounded-md"
                name="password"
                value={formData.password}
                onChange={handleChange}
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