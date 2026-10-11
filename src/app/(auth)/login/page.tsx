import { AuthCard } from "@/components/AuthCard";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <AuthCard title="เข้าสู่ระบบ" subtitle="ยินดีต้อนรับกลับมา">
      <LoginForm next={typeof next === "string" ? next : "/"} linkError={error === "link"} />
    </AuthCard>
  );
}
