export function expandIfShort(pass) {
  if (!pass) return pass;
  return pass.length >= 32 ? pass : `${pass}.${pass}.${pass}`;
}
