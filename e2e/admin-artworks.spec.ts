import path from "node:path";
import { expect, type Page, test } from "@playwright/test";
import { ARTWORK } from "./fixtures/constants";
import { signInAsAdmin } from "./fixtures/auth";

const SEED_PHOTO = path.join(process.cwd(), "public/seed/art-work-1.png");

function artworkCard(page: Page, title: string) {
  return page
    .locator("div.overflow-hidden.rounded-lg.bg-white")
    .filter({ hasText: title });
}

test.beforeEach(async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/admin/artworks");
});

test("admin can create a new Artwork with a photo, then edit it", async ({
  page,
}) => {
  const title = `Obra Creada E2E ${test.info().workerIndex}`;
  const updatedTitle = `${title} (editada)`;

  await page.getByRole("button", { name: "+ Agregar obra" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Agregar nueva obra" }),
  ).toBeVisible();

  await page.setInputFiles('input[type="file"]', SEED_PHOTO);
  await expect(page.getByText("PORTADA", { exact: true })).toBeVisible();

  await page.locator("#form-title").fill(title);
  await page.locator('input[name="medium"]').fill("Óleo sobre lienzo");
  await page.locator("#form-year").fill("2023");
  await page.locator('input[name="width"]').fill("30");
  await page.locator('input[name="height"]').fill("40");
  await page.locator("#form-price").fill("199.00");
  await page
    .locator("#form-description")
    .fill("Creada por un test end-to-end.");
  await page.getByRole("button", { name: "Guardar obra" }).click();

  // Longer timeout: this submit chains a real Vercel Blob upload after the
  // Artwork row is created, not just a DB write.
  await expect(
    page.getByRole("heading", { name: "Agregar nueva obra" }),
  ).toBeHidden({
    timeout: 15_000,
  });
  await expect(artworkCard(page, title)).toBeVisible();

  await artworkCard(page, title)
    .getByRole("button", { name: "Editar" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Editar obra" }),
  ).toBeVisible();
  await page.locator("#form-title").fill(updatedTitle);
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page.getByRole("heading", { name: "Editar obra" })).toBeHidden();
  await expect(artworkCard(page, updatedTitle)).toBeVisible();
});

test("admin can toggle Sold, Visible, and Featured — the public site reflects it", async ({
  page,
}) => {
  const { title } = ARTWORK.toggleMe;

  await artworkCard(page, title)
    .getByRole("button", { name: "Editar" })
    .click();
  // The Switch's `id` lands on its hidden native checkbox, not the visible
  // control — click the associated <label> text instead (native for=
  // association still toggles it, and it's what a real user clicks on).
  await page.getByText("Destacada", { exact: true }).click();
  await page.getByText("Visible en el sitio", { exact: true }).click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("heading", { name: "Editar obra" })).toBeHidden();

  await page.goto("/");
  await expect(page.getByText(title)).toBeHidden();

  await page.goto("/galeria");
  await expect(page.getByText(title)).toBeHidden();

  await page.goto("/admin/artworks");
  await artworkCard(page, title)
    .getByRole("button", { name: "Editar" })
    .click();
  await page.getByText("Visible en el sitio", { exact: true }).click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("heading", { name: "Editar obra" })).toBeHidden();

  await page.goto("/");
  await expect(
    page.getByRole("link", { name: new RegExp(title) }),
  ).toBeVisible();
});

test("admin can delete an Artwork that has no Orders", async ({ page }) => {
  const { title } = ARTWORK.deleteMe;

  await artworkCard(page, title)
    .getByRole("button", { name: "Eliminar" })
    .click();
  await page.getByRole("button", { name: "Sí, eliminar" }).click();

  await expect(artworkCard(page, title)).toBeHidden();
});

test("deleting an Artwork referenced by an Order is blocked, offering to hide it instead", async ({
  page,
}) => {
  const { title } = ARTWORK.blockedDelete;

  await artworkCard(page, title)
    .getByRole("button", { name: "Eliminar" })
    .click();
  // The "referenced by an Order" message only replaces the confirm dialog's
  // content after a real delete attempt fails — it isn't shown up front.
  await page.getByRole("button", { name: "Sí, eliminar" }).click();
  await expect(
    page.getByText(
      "Esta obra está referenciada por un pedido y no puede eliminarse",
    ),
  ).toBeVisible();

  await page.getByRole("button", { name: "Ocultar en su lugar" }).click();
  // Wait for the confirm dialog to actually close — it only does so after
  // `setArtworkFlagsAction` resolves, so this also guarantees the hide has
  // landed before navigating to the public gallery below.
  await expect(
    page.getByRole("button", { name: "Ocultar en su lugar" }),
  ).toBeHidden();
  await expect(artworkCard(page, title)).toBeVisible();

  await page.goto("/galeria?status=sold");
  await expect(page.getByText(title)).toBeHidden();
});
