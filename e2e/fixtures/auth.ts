import type { Page } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./constants";

/** Signs in through Auth.js's default Credentials sign-in page. */
async function signInWithCredentials(
  page: Page,
  {
    email,
    password,
    callbackUrl,
  }: { email: string; password: string; callbackUrl: string },
) {
  await page.goto(
    `/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
  );
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign in with Credentials" }).click();
}

export async function signInAsAdmin(page: Page) {
  await signInWithCredentials(page, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    callbackUrl: "/admin/artworks",
  });
  await page.waitForURL("**/admin/**");
}

export async function signUpCustomer(
  page: Page,
  { name, email, password }: { name?: string; email: string; password: string },
) {
  await page.goto("/cuenta/registro");
  if (name) await page.locator('input[name="name"]').fill(name);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.waitForURL("**/cuenta");
}
