import { expect, test } from "@playwright/test";
import { ARTWORK } from "./fixtures/constants";
import { signUpCustomer } from "./fixtures/auth";

function uniqueEmail(label: string) {
  return `${label}-${test.info().workerIndex}-${test.info().repeatEachIndex}@example.com`;
}

test("sign-up creates an account and signs the Customer in", async ({
  page,
}) => {
  const email = uniqueEmail("signup-e2e");
  await signUpCustomer(page, {
    name: "Cliente Nuevo",
    email,
    password: "correcthorse1",
  });

  await expect(
    page.getByRole("heading", { name: "Mis pedidos" }),
  ).toBeVisible();
  await expect(
    page.getByText("Todavía no realizaste ningún pedido."),
  ).toBeVisible();
});

test("a customer can sign out and sign back in", async ({ page }) => {
  const email = uniqueEmail("signin-e2e");
  const password = "correcthorse2";
  await signUpCustomer(page, { email, password });

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.waitForURL("/");

  await page.goto("/cuenta/ingresar");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();

  await page.waitForURL("**/cuenta");
  await expect(
    page.getByRole("heading", { name: "Mis pedidos" }),
  ).toBeVisible();
});

test("a signed-in Customer's purchase appears in their Order history", async ({
  page,
}) => {
  const email = uniqueEmail("order-history-e2e");
  await signUpCustomer(page, { email, password: "correcthorse3" });

  await page.goto("/galeria?status=available");
  await page.getByText(ARTWORK.customerCheckout.title).click();
  await page.getByRole("button", { name: "Añadir al carrito" }).click();

  await page.getByRole("button", { name: /Carrito/ }).click();
  await page.getByRole("button", { name: "Finalizar compra" }).click();
  await page.locator("#checkout-name").fill("Cliente Con Cuenta E2E");
  await page.locator("#checkout-email").fill(email);
  await page.locator("#checkout-city").fill("Ciudad de México");
  await page.locator("#checkout-country").fill("México");
  await page.locator("#checkout-address").fill("Calle Falsa 123");
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByText("¡Gracias por tu compra!")).toBeVisible();

  await page.goto("/cuenta");
  await expect(
    page.getByText(
      new RegExp(String(ARTWORK.customerCheckout.priceCents / 100)),
    ),
  ).toBeVisible();
});

test("redirects signed-out visitors from /cuenta to sign in", async ({
  page,
}) => {
  await page.goto("/cuenta");
  await expect(page).toHaveURL(/\/cuenta\/ingresar/);
});
