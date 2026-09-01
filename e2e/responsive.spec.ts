import { expect, test } from "@playwright/test";
import { ARTWORK } from "./fixtures/constants";
import { signInAsAdmin } from "./fixtures/auth";

test("admin sidebar collapses into a hamburger menu on mobile", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile-only assertion");

  await signInAsAdmin(page);
  await page.goto("/admin/artworks");

  await expect(page.getByRole("link", { name: "Obras" })).toBeHidden();

  await page.getByRole("button", { name: "Abrir menú" }).click();
  // Scoped to the open sheet — the desktop <aside> (display:none here) still
  // renders the same "Ajustes" text node, which a plain page-wide getByText
  // would also match since it isn't restricted to the accessibility tree.
  const menu = page.getByRole("dialog");
  await expect(menu.getByRole("link", { name: "Obras" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Mi sitio" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Pedidos" })).toBeVisible();
  await expect(menu.getByText("Ajustes")).toBeVisible();
  await expect(
    menu.getByRole("button", { name: "Cerrar sesión" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Mi sitio" }).click();
  await page.waitForURL("**/admin/site-settings");
});

test("the artwork edit modal renders full-bleed on mobile", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile-only assertion");

  await signInAsAdmin(page);
  await page.goto("/admin/artworks");
  await page
    .locator("div.overflow-hidden.rounded-lg.bg-white", {
      hasText: ARTWORK.display.title,
    })
    .getByRole("button", { name: "Editar" })
    .click();

  const dialog = page.locator('[data-slot="dialog-content"]');
  const box = await dialog.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  // >= 95%, not exact — a hairline ring/border legitimately shaves a few CSS
  // px off the measured box even when the modal is genuinely full-bleed.
  expect(box!.width).toBeGreaterThan(viewport!.width * 0.95);
  expect(box!.x).toBeLessThanOrEqual(2);
});

test("the public site's mobile nav still opens", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only assertion");

  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.getByRole("link", { name: "Galería" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contacto" })).toBeVisible();
});
