import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
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

      alert("Registration Successful ✅");

      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#17212b] flex items-center justify-center">

      <div className="w-full max-w-md bg-[#1f2c38] p-8 rounded-2xl shadow-xl">

        <h1 className="text-white text-3xl font-bold text-center mb-8">
          Create Account
        </h1>

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
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
              ? "Creating Account..."
              : "Register"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-blue-400"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Register;