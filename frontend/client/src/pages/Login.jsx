import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API_URL from "../config/api";
import { saveAuth } from "../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      saveAuth(data.token, data.user);

      console.log("✅ Login Success");

      navigate("/chat");
    } catch (error) {
      console.error(error);

      alert("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#17212b] flex items-center justify-center">

      <div className="w-full max-w-md bg-[#1f2c38] p-8 rounded-2xl shadow-xl">

        <h1 className="text-white text-3xl font-bold text-center mb-8">
          Telegram Clone
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
              w-full
              p-3
              rounded-xl
              bg-[#17212b]
              text-white
              outline-none
            "
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="
              w-full
              p-3
              rounded-xl
              bg-[#17212b]
              text-white
              outline-none
            "
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-[#2b5278]
              text-white
              p-3
              rounded-xl
              font-semibold
            "
          >
            {loading
              ? "Logging In..."
              : "Login"}
          </button>

        </form>

        <p className="text-gray-400 text-center mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400"
          >
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;