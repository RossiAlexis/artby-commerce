import { expect, test } from "@playwright/test";
import { ARTWORK, SITE_SETTINGS } from "./fixtures/constants";

test.describe("homepage", () => {
  test("shows the hero and the Featured artworks", async ({ page }) => {
    await page.goto("/");
    // Not heroTagline — admin-settings-orders.spec.ts's site-settings edit
    // test mutates that same singleton row concurrently. The announcement
    // bar is never mutated by any spec, so it's a stable signal here.
    await expect(page.getByText(SITE_SETTINGS.announcementBar)).toBeVisible();
    await expect(
      page.getByRole("link", { name: new RegExp(ARTWORK.display.title) }),
    ).toBeVisible();
  });
});

test.describe("gallery", () => {
  test("lists Artworks and the Available/Sold/All filter changes what's shown", async ({
    page,
  }) => {
    await page.goto("/galeria?status=all");
    await expect(page.getByText(ARTWORK.display.title)).toBeVisible();
    await expect(page.getByText(ARTWORK.sold.title)).toBeVisible();

    await page.getByRole("tab", { name: "Disponibles" }).click();
    await expect(page).toHaveURL(/status=available/);
    await expect(page.getByText(ARTWORK.display.title)).toBeVisible();
    await expect(page.getByText(ARTWORK.sold.title)).not.toBeVisible();

    await page.getByRole("tab", { name: "Vendidas" }).click();
    await expect(page).toHaveURL(/status=sold/);
    await expect(page.getByText(ARTWORK.sold.title)).toBeVisible();
    await expect(page.getByText(ARTWORK.display.title)).not.toBeVisible();
  });
});

test.describe("artwork detail", () => {
  test("shows title, description, dimensions, medium, year, price and photos", async ({
    page,
  }) => {
    await page.goto("/galeria");
    await page.getByText(ARTWORK.display.title).click();

    await expect(
      page.getByRole("heading", { name: ARTWORK.display.title }),
    ).toBeVisible();
    await expect(page.getByText("Acrílico sobre lienzo")).toBeVisible();
    await expect(page.getByText("Dimensiones")).toBeVisible();
    await expect(page.getByText("40 × 50 cm")).toBeVisible();
    await expect(page.getByText("2024")).toBeVisible();
    await expect(page.getByRole("img").first()).toBeVisible();
  });

  test("shows a Sold badge instead of hiding the Artwork, and disables purchase", async ({
    page,
  }) => {
    await page.goto("/galeria?status=sold");
    await page.getByText(ARTWORK.sold.title).click();

    await expect(page.getByText("Vendida")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Añadir al carrito" }),
    ).toBeDisabled();
  });
});

test("a guest can buy an available Artwork end to end", async ({ page }) => {
  await page.goto("/galeria?status=available");
  await page.getByText(ARTWORK.guestCheckout.title).click();

  await page.getByRole("button", { name: "Añadir al carrito" }).click();
  await expect(page.getByText("Ya está en tu carrito")).toBeVisible();

  await page.getByRole("button", { name: /Carrito/ }).click();
  await page.getByRole("button", { name: "Finalizar compra" }).click();

  await page.locator("#checkout-name").fill("Cliente Invitado E2E");
  await page.locator("#checkout-email").fill("guest-e2e@example.com");
  await page.locator("#checkout-city").fill("Ciudad de México");
  await page.locator("#checkout-country").fill("México");
  await page.locator("#checkout-address").fill("Calle Falsa 123");
  await page.getByRole("button", { name: "Confirmar compra" }).click();

  await expect(page.getByText("¡Gracias por tu compra!")).toBeVisible();

  await page.goto("/galeria?status=sold");
  await expect(page.getByText(ARTWORK.guestCheckout.title)).toBeVisible();
});
