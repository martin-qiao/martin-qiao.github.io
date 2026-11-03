/** Dynamic env read so Next does not inline an empty value at build time. */
export function readServerEnv(name: string): string {
  const env = process.env;
  return env[name]?.trim() ?? "";
}
