import { expect, test } from "@playwright/test";

test.describe("VIP subscriber signup", () => {
  test("accepts a valid email", async ({ page }) => {
    await page.goto("/");
    const email = `vip-e2e-${test.info().workerIndex}-${test.info().repeatEachIndex}@example.com`;
    await page.getByPlaceholder("Tu email").fill(email);
    await page.getByRole("button", { name: "Sumarme" }).click();
    await expect(
      page.getByText("¡Listo! Te avisaremos cuando haya obras nuevas."),
    ).toBeVisible();
  });

  test("rejects an invalid email", async ({ page }) => {
    await page.goto("/");
    const input = page.getByPlaceholder("Tu email");
    await input.fill("not-an-email");
    await input.evaluate((el: HTMLInputElement) => el.reportValidity());
    await expect(input).toHaveJSProperty("validity.valid", false);
  });
});

// Skipped for the same reason as contactAction's own vitest suite
// (app/actions/contact.test.ts): contactAction's entire job is sending an
// email, and this environment's RESEND_API_KEY currently 401s (tracked in
// issue #40) — there's no app-level fallback to assert against instead.
test.skip("contact form submits successfully", async ({ page }) => {
  await page.goto("/contacto");
  await page.locator("#name").fill("Visitante E2E");
  await page.locator("#email").fill("visitante-e2e@example.com");
  await page.locator("#message").fill("Hola, me interesa una obra. (E2E)");
  await page.getByRole("button", { name: "Enviar mensaje" }).click();

  await expect(
    page.getByText(
      "¡Gracias por tu mensaje! Te responderé personalmente a la brevedad.",
    ),
  ).toBeVisible();
});
