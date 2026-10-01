import { AuthForm } from "@/components/AuthForm";
export const metadata = { title: "Entrar — AnúncioIA" };
export default function Page() {
  return <div className="px-4"><AuthForm mode="login" /></div>;
}
