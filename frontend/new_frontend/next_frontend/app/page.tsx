"use client"

import { useState, useEffect } from "react";
import { UserRole } from "./types";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Loading from "./components/Loading"

export default function root() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
    if (token && role) {
      if (role === "1") //client
        router.push("/store")
      else if (role === "2") //admin
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

  if (loading) return <Loading/>;
}