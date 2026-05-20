import { redirect } from "next/navigation";
import './dashboard.css'

export default function AdminPage() {
  redirect("delivery/dashboard");
}