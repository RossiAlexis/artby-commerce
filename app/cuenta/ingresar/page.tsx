import type { Metadata } from "next";
import { SignInForm } from "@/components/account/sign-in-form";

export const metadata: Metadata = {
  title: "Ingresar — Art by Vero Miller",
};

// Only relative, same-origin paths are safe to redirect to after sign-in —
// an absolute or protocol-relative URL here would let `?callbackUrl=` send
// the user off-site right after they authenticate (CWE-601 open redirect).
function sanitizeCallbackUrl(callbackUrl: string | undefined) {
  if (callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }
  return "/cuenta";
}

export default async function IngresarPage(props: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const searchParams = await props.searchParams;
  const callbackUrl = sanitizeCallbackUrl(searchParams?.callbackUrl);

  return (
    <div className="flex justify-center px-6 py-14 md:px-10 lg:py-16">
      <SignInForm callbackUrl={callbackUrl} />
    </div>
  );
}
