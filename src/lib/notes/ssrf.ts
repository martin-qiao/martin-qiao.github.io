import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

const blocked = new BlockList();
blocked.addSubnet("0.0.0.0", 8, "ipv4");
blocked.addSubnet("10.0.0.0", 8, "ipv4");
blocked.addSubnet("100.64.0.0", 10, "ipv4");
blocked.addSubnet("127.0.0.0", 8, "ipv4");
blocked.addSubnet("169.254.0.0", 16, "ipv4");
blocked.addSubnet("172.16.0.0", 12, "ipv4");
blocked.addSubnet("192.0.0.0", 24, "ipv4");
blocked.addSubnet("192.0.2.0", 24, "ipv4");
blocked.addSubnet("192.168.0.0", 16, "ipv4");
blocked.addSubnet("198.51.100.0", 24, "ipv4");
blocked.addSubnet("203.0.113.0", 24, "ipv4");
blocked.addSubnet("224.0.0.0", 4, "ipv4");
blocked.addSubnet("240.0.0.0", 4, "ipv4");
blocked.addAddress("::", "ipv6");
blocked.addAddress("::1", "ipv6");
blocked.addSubnet("fc00::", 7, "ipv6");
blocked.addSubnet("fe80::", 10, "ipv6");
blocked.addSubnet("ff00::", 8, "ipv6");

export function isBlockedAddress(address: string): boolean {
  const normalized = address.toLowerCase();
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return blocked.check(mapped[1], "ipv4");
  const family = isIP(normalized);
  if (family === 4) return blocked.check(normalized, "ipv4");
  if (family === 6) return blocked.check(normalized, "ipv6");
  return true;
}

export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".localdomain")) {
    return true;
  }
  if (host === "metadata.google.internal") return true;
  if (isObfuscatedIp(host)) return true;
  if (isIP(host)) return isBlockedAddress(host);
  return false;
}

function isObfuscatedIp(hostname: string): boolean {
  if (/^\d+$/.test(hostname)) return true;
  if (/^0x[0-9a-f]+$/i.test(hostname)) return true;
  if (/^[\d.]+$/.test(hostname) && hostname.includes(".")) {
    const parts = hostname.split(".");
    if (parts.length !== 4) return true;
    if (parts.some((part) => part.length > 1 && part.startsWith("0"))) return true;
  }
  return false;
}

export function assertAddressesArePublic(addresses: readonly string[]): void {
  if (addresses.length === 0) {
    throw new UnsafeUrlError("Could not resolve that host");
  }
  if (addresses.some((address) => isBlockedAddress(address))) {
    throw new UnsafeUrlError("That host resolves to a private address");
  }
}

export function parsePublicHttpUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new UnsafeUrlError("Enter a valid http(s) URL");
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError("URLs with credentials are not allowed");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("Only http and https links are allowed");
  }
  if (isBlockedHostname(url.hostname)) {
    throw new UnsafeUrlError("That host is not allowed");
  }
  return url;
}

export async function resolvePublicAddress(url: URL): Promise<string> {
  if (isIP(url.hostname)) {
    assertAddressesArePublic([url.hostname]);
    return url.hostname;
  }
  let records: { address: string }[];
  try {
    records = await lookup(url.hostname, { all: true, verbatim: true });
  } catch {
    throw new UnsafeUrlError("Could not resolve that host");
  }
  assertAddressesArePublic(records.map((record) => record.address));
  return records[0]?.address ?? "";
}
