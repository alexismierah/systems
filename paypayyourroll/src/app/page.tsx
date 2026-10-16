
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [message, setMessage] = useState("Not tested");

  async function testConnection() {
    setMessage("Testing...");

    const { error } = await supabase
      .from("employees")
      .select("id")
      .limit(1);

    if (error) {
      setMessage(`Supabase response: ${error.message}`);
      return;
    }

    setMessage("Connected successfully!");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">PayPayYourRoll</h1>

      <button
        onClick={testConnection}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
      >
        Test Supabase
      </button>

      <p>{message}</p>
    </main>
  );
}
