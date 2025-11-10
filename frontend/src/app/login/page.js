"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Fill all fields");

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response data:", data);

      if (!res.ok) {
        throw new Error(data.message || "Login error");
      }

      // Store JWT
      localStorage.setItem("token", data.token);

      // Redirect based on role (if backend provides role)
      if (data.user.role === "STAFF") router.push("/staff");
      else if (data.user.role === "SUPERVISOR") router.push("/supervisor");
      else if (data.user.role === "ADMIN") router.push("/admin");
      else router.push("/"); // fallback

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border p-2 mb-2 rounded w-64"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2 mb-2 rounded w-64"
      />
      <button
        onClick={handleLogin}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Login
      </button>
    </div>
  );
}
