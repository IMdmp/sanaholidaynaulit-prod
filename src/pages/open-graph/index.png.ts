import { OGImageRoute } from "astro-og-canvas";
import { getSiteData } from "../../lib/site-data";

const buildPages = async () => {
  const site = await getSiteData();
  const next = site.next;
  return {
    index: {
      title: next?.name ?? "SanaHolidayNaUlit",
      description: next
        ? `Next: ${new Date(
            `${next.dateISO}T00:00:00+08:00`
          ).toLocaleDateString("en-PH", {
            month: "long",
            day: "numeric",
          })} • ${site.year}`
        : "Philippine holiday countdown",
    },
  };
};

const fontPaths = [
  "./public/fonts/roboto-700.ttf",
  "./public/fonts/roboto-500.ttf",
  "./public/fonts/roboto-300.ttf",
];

export const { getStaticPaths, GET } = OGImageRoute({
  param: "slug",
  pages: await buildPages(),
  getImageOptions: (_, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [
      [255, 248, 238],
      [255, 237, 213],
    ],
    border: {
      color: [204, 119, 34],
      width: 12,
      side: "block-end",
    },
    padding: 80,
    fonts: fontPaths,
    font: {
      title: {
        families: ["Roboto"],
        weight: "Bold",
        size: 84,
        color: [17, 17, 17],
        lineHeight: 88,
      },
      description: {
        families: ["Roboto"],
        weight: "Medium",
        size: 42,
        color: [170, 102, 0],
        lineHeight: 50,
      },
    },
  }),
});
