export function getIsAuthEnabled() {
  const clientFlag = process.env.NEXT_PUBLIC_AUTH_DISABLED;
  if (typeof clientFlag === 'string') {
    return clientFlag !== 'true';
  }
  return process.env.AUTH_DISABLED !== 'true';
}

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
}
