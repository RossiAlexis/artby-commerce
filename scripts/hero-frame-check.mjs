import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "e2e/hero-frame");
const frameHeight = 580;
const background = "#fdf9f4";

const frames = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const covers = [
  {
    name: "landscape",
    url: "http://localhost:3000/seed/cover.png",
  },
  {
    name: "portrait",
    url: "https://swa4mn4bj63n6az4.public.blob.vercel-storage.com/site-settings/cover/a610e083-287c-4efd-9556-b057b06eaa70",
  },
];

function specHtml(imageUrl, width) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:${background}">
    <div id="frame" style="position:relative;width:${width}px;height:${frameHeight}px;overflow:hidden;background:${background}">
      <img id="cover" alt="" src="${imageUrl}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center center" />
    </div>
  </body>
</html>`;
}

async function shot(page, locator) {
  return locator.screenshot({ type: "png" });
}

async function pixelDelta(page, left, right) {
  return page.evaluate(
    async ({ leftB64, rightB64 }) => {
      const load = (b64) =>
        new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error("png decode failed"));
          image.src = `data:image/png;base64,${b64}`;
        });
      const [a, b] = await Promise.all([load(leftB64), load(rightB64)]);
      const width = Math.max(a.width, b.width);
      const height = Math.max(a.height, b.height);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(a, 0, 0);
      const aData = context.getImageData(0, 0, a.width, a.height).data;
      context.clearRect(0, 0, width, height);
      context.drawImage(b, 0, 0);
      const bData = context.getImageData(0, 0, b.width, b.height).data;
      const diff = context.createImageData(width, height);
      let changed = 0;
      const pixels = width * height;
      for (let i = 0; i < pixels; i += 1) {
        const o = i * 4;
        const mismatch =
          a.width !== b.width ||
          a.height !== b.height ||
          aData[o] !== bData[o] ||
          aData[o + 1] !== bData[o + 1] ||
          aData[o + 2] !== bData[o + 2] ||
          aData[o + 3] !== bData[o + 3];
        if (mismatch) {
          changed += 1;
          diff.data[o] = 255;
          diff.data[o + 3] = 255;
        }
      }
      context.putImageData(diff, 0, 0);
      return {
        changed,
        pixels,
        left: { width: a.width, height: a.height },
        right: { width: b.width, height: b.height },
        diffPng: canvas.toDataURL("image/png"),
      };
    },
    {
      leftB64: left.toString("base64"),
      rightB64: right.toString("base64"),
    },
  );
}

async function referenceShot(page, imageUrl, frame) {
  await page.setViewportSize({ width: frame.width, height: frame.height });
  await page.setContent(specHtml(imageUrl, frame.width), {
    waitUntil: "networkidle",
  });
  await page.locator("#cover").evaluate(
    (image) =>
      image.complete && image.naturalWidth > 0
        ? undefined
        : new Promise((resolve, reject) => {
            image.addEventListener("load", () => resolve(undefined), {
              once: true,
            });
            image.addEventListener(
              "error",
              () => reject(new Error("reference image failed")),
              { once: true },
            );
          }),
  );
  return shot(page, page.locator("#frame"));
}

async function liveShot(page, imageUrl, frame) {
  await page.setViewportSize({ width: frame.width, height: frame.height });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const cover = page.locator('img[alt="Vero Miller pintando"]');
  await cover.waitFor();
  await cover.evaluate((image, nextUrl) => {
    image.sizes = "";
    image.srcset = "";
    image.removeAttribute("srcset");
    image.removeAttribute("sizes");
    image.src = nextUrl;
    return image.decode();
  }, imageUrl);
  const hero = cover.locator("xpath=..");
  await hero.evaluate((element) => {
    for (const node of element.querySelectorAll(":scope > div")) {
      node.style.visibility = "hidden";
    }
    element.style.position = "fixed";
    element.style.inset = "0 auto auto 0";
    element.style.width = "100%";
    element.style.zIndex = "50";
  });
  const box = await hero.boundingBox();
  return {
    png: await shot(page, hero),
    box,
    fit: await cover.evaluate((image) => getComputedStyle(image).objectFit),
    position: await cover.evaluate(
      (image) => getComputedStyle(image).objectPosition,
    ),
  };
}

const mode = process.argv[2] ?? "check";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
await page.addInitScript(() => {
  const style = document.createElement("style");
  style.textContent = "html,body{overflow:hidden !important}";
  document.documentElement.appendChild(style);
});
const report = [];

for (const frame of frames) {
  for (const cover of covers) {
    const label = `${frame.name}-${cover.name}`;
    const referencePath = path.join(outDir, `${label}-target.png`);
    let reference;
    if (mode === "before") {
      reference = await referenceShot(page, cover.url, frame);
      await writeFile(referencePath, reference);
    } else {
      reference = await readFile(referencePath);
    }
    const live = await liveShot(page, cover.url, frame);
    const delta = await pixelDelta(page, live.png, reference);
    const livePath = path.join(outDir, `${mode}-${label}-live.png`);
    const diffPath = path.join(outDir, `${mode}-${label}-diff.png`);
    await writeFile(livePath, live.png);
    await writeFile(
      diffPath,
      Buffer.from(delta.diffPng.split(",")[1], "base64"),
    );
    report.push({
      label,
      changed: delta.changed,
      pixels: delta.pixels,
      ratio: Number((delta.changed / delta.pixels).toFixed(4)),
      fit: live.fit,
      position: live.position,
      box: live.box,
      size: delta.left,
      targetSize: delta.right,
    });
  }
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
const failed = report.filter((row) => row.changed !== 0);
if (mode === "check" && failed.length > 0) {
  process.exitCode = 1;
}
