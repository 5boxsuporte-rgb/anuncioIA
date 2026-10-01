import { AuthForm } from "@/components/AuthForm";
export const metadata = { title: "Criar conta — AnúncioIA" };
export default function Page() {
  return <div className="px-4"><AuthForm mode="register" /></div>;
}
