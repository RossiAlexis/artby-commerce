import type { Metadata } from "next";
import { SignInForm } from "@/components/account/sign-in-form";

export const metadata: Metadata = {
  title: "Ingresar — Art by Vero Miller",
};

export default async function IngresarPage(props: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl ?? "/cuenta";

  return (
    <div className="flex justify-center px-6 py-14 md:px-10 lg:py-16">
      <SignInForm callbackUrl={callbackUrl} />
    </div>
  );
}
