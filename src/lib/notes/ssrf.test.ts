import {
  UnsafeUrlError,
  assertAddressesArePublic,
  isBlockedAddress,
  isBlockedHostname,
  parsePublicHttpUrl,
} from "./ssrf";

test("blocks private, loopback, link-local, and mapped addresses", () => {
  expect(isBlockedAddress("127.0.0.1")).toBe(true);
  expect(isBlockedAddress("10.1.2.3")).toBe(true);
  expect(isBlockedAddress("172.16.0.4")).toBe(true);
  expect(isBlockedAddress("192.168.1.9")).toBe(true);
  expect(isBlockedAddress("169.254.169.254")).toBe(true);
  expect(isBlockedAddress("::ffff:127.0.0.1")).toBe(true);
  expect(isBlockedAddress("::1")).toBe(true);
  expect(isBlockedAddress("8.8.8.8")).toBe(false);
  expect(isBlockedAddress("172.15.0.4")).toBe(false);
});

test("blocks local hostnames and obfuscated IPs", () => {
  expect(isBlockedHostname("localhost")).toBe(true);
  expect(isBlockedHostname("printer.local")).toBe(true);
  expect(isBlockedHostname("metadata.google.internal")).toBe(true);
  expect(isBlockedHostname("2130706433")).toBe(true);
  expect(isBlockedHostname("example.com")).toBe(false);
});

test("only accepts public http(s) URLs", () => {
  expect(parsePublicHttpUrl("https://example.com/post").hostname).toBe("example.com");
  expect(() => parsePublicHttpUrl("http://127.0.0.1/secret")).toThrow(UnsafeUrlError);
  expect(() => parsePublicHttpUrl("http://user:pass@example.com/")).toThrow(UnsafeUrlError);
  expect(() => parsePublicHttpUrl("file:///etc/passwd")).toThrow(UnsafeUrlError);
  expect(() => parsePublicHttpUrl("not a url")).toThrow(UnsafeUrlError);
});

test("rejects a public name that resolves to a private address", () => {
  expect(() => assertAddressesArePublic(["127.0.0.1"])).toThrow(UnsafeUrlError);
  expect(() => assertAddressesArePublic(["8.8.8.8", "10.0.0.2"])).toThrow(UnsafeUrlError);
  expect(() => assertAddressesArePublic(["1.1.1.1"])).not.toThrow();
});
