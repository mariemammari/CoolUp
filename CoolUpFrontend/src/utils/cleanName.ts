export function cleanName(raw: string): string {
  let name = raw.replace(/^[A-Z_0-9]+ - /, '');
  name = name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  name = name.replace(/\bDe L\b/g, "de l'").replace(/\bD\b/g, "d'");
  return name;
}
