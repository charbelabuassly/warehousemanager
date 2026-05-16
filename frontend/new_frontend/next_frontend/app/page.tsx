"use client"

import { useState, useEffect } from "react";
import { UserRole } from "./types";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

export default function root() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload: any = jwtDecode(token);
      let role: String = payload.Role;
      if (role === "0") //client
        router.push("/store")
      else if (role === "1") //admin
        router.push("/admin")
      else{ // delivery person
        router.push("/delivery")
      }
    }
    else{
      router.push("/login");
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
}