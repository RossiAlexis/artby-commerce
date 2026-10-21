import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  SITE_IMAGE_MAX_EDGE,
  fittedSize,
  limitImageEdge,
} from "./limit-image-edge";

describe("fittedSize", () => {
  it("leaves an image that already fits", () => {
    expect(fittedSize(1600, 900)).toEqual({
      width: 1600,
      height: 900,
      resized: false,
    });
  });

  it("scales the long edge down to the cap", () => {
    expect(fittedSize(5760, 2880)).toEqual({
      width: SITE_IMAGE_MAX_EDGE,
      height: 1440,
      resized: true,
    });
  });
});

describe("limitImageEdge", () => {
  it("returns the original bytes when the image is already small enough", async () => {
    const input = await sharp({
      create: { width: 800, height: 400, channels: 3, background: "red" },
    })
      .jpeg()
      .toBuffer();

    const result = await limitImageEdge(input, "image/jpeg");

    expect(result.bytes).toBe(input);
    expect(result.contentType).toBe("image/jpeg");
  });

  it("stores a wide upload at the long-edge cap", async () => {
    const input = await sharp({
      create: { width: 5000, height: 2000, channels: 3, background: "navy" },
    })
      .jpeg()
      .toBuffer();

    const result = await limitImageEdge(input, "image/jpeg");
    const metadata = await sharp(result.bytes).metadata();

    expect(result.contentType).toBe("image/jpeg");
    expect(metadata.width).toBe(SITE_IMAGE_MAX_EDGE);
    expect(metadata.height).toBe(1152);
  });
});
