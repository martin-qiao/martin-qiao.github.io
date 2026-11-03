import { extractHtmlMeta, resolvePageUrl } from "./htmlMeta";

const html = `
<html>
  <head>
    <meta content="OG description" property="og:description" />
    <meta property="og:title" content="OG &amp; title" />
    <meta name="description" content="plain description" />
    <meta property="og:image" content="/cover.jpg" />
    <title>Fallback title</title>
  </head>
</html>
`;

test("reads Open Graph fields regardless of attribute order", () => {
  expect(extractHtmlMeta(html)).toEqual({
    title: "OG & title",
    description: "OG description",
    image: "/cover.jpg",
  });
});

test("falls back to the title tag", () => {
  expect(extractHtmlMeta("<title>Just a title</title>").title).toBe("Just a title");
});

test("resolves a relative image against the page", () => {
  expect(resolvePageUrl("https://example.com/notes/a", "/cover.jpg")).toBe(
    "https://example.com/cover.jpg",
  );
});
