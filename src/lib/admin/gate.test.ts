import { adminWriteRejection } from "./gate";

test("unauthenticated writes are rejected", () => {
  expect(adminWriteRejection({ authenticated: false, crossSite: false })).toEqual({
    status: 401,
    error: "Unauthorized",
  });
  expect(adminWriteRejection({ authenticated: false, crossSite: true })?.status).toBe(401);
});

test("cross-site authenticated writes are forbidden", () => {
  expect(adminWriteRejection({ authenticated: true, crossSite: true })).toEqual({
    status: 403,
    error: "Forbidden",
  });
});

test("same-origin authenticated writes proceed", () => {
  expect(adminWriteRejection({ authenticated: true, crossSite: false })).toBeNull();
});
