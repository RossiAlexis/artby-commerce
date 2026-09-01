import { expect, test } from "@playwright/test";
import { ARTWORK } from "./fixtures/constants";
import { signInAsAdmin } from "./fixtures/auth";

test.beforeEach(async ({ page }) => {
  await signInAsAdmin(page);
});

test("admin edits Mi sitio and the change reflects on the public site", async ({
  page,
}) => {
  const newTagline = `Tagline editado por E2E ${test.info().workerIndex}`;

  await page.goto("/admin/site-settings");
  await page.locator("#heroTagline").fill(newTagline);
  await page.locator("#aboutTitle").fill("Vero Miller (E2E)");
  await page.locator("#instagramUrl").fill("https://instagram.com/e2e-test");
  await page.locator("#contactEmail").fill("e2e-contact@artbyveromiller.com");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(
    page.getByRole("button", { name: "Guardar cambios" }),
  ).toBeEnabled();

  await page.goto("/");
  await expect(page.getByText(newTagline)).toBeVisible();
});

test("admin can view the Orders list and open a single Order's detail", async ({
  page,
}) => {
  const { customerName, title, priceCents } = ARTWORK.sold;
  const amount = `USD ${priceCents / 100}`;

  await page.goto("/admin/orders");
  const row = page.locator("tr", { hasText: ARTWORK.sold.customerName });
  await expect(row).toBeVisible();
  await expect(row.getByText(title)).toBeVisible();
  await expect(row.getByText(amount)).toBeVisible();

  await row.getByRole("link", { name: "Ver detalle" }).click();
  await page.waitForURL(/\/admin\/orders\/\d+$/);

  await expect(page.getByText(customerName)).toBeVisible();
  await expect(page.getByText(ARTWORK.sold.customerEmail)).toBeVisible();
  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText(amount).first()).toBeVisible();
});
