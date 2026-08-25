import type { Metadata } from "next";
import { SignUpForm } from "@/components/account/sign-up-form";

export const metadata: Metadata = {
  title: "Crear cuenta — Art by Vero Miller",
};

export default function RegistroPage() {
  return (
    <div className="flex justify-center px-6 py-14 md:px-10 lg:py-16">
      <SignUpForm />
    </div>
  );
}
