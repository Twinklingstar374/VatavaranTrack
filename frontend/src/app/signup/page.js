"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // added email field
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STAFF");
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) return alert("Fill all fields");

    try {
      const res = await fetch("http://localhost:5001/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error signing up");
      }

      alert("User created! Now login.");
      router.push("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <h1 className="text-3xl font-bold mb-4">Signup</h1>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="border p-2 mb-2 rounded w-64"
      />
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
      <select
        value={role}
        onChange={e => setRole(e.target.value)}
        className="border p-2 mb-2 rounded w-64"
      >
        <option value="STAFF">Staff</option>
        <option value="SUPERVISOR">Supervisor</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        onClick={handleSignup}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Signup
      </button>
    </div>
  );
}



