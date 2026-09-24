import { redirect } from "next/navigation";

// Application-Flow.md §2.4: /admin -> /admin/dashboard.
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
