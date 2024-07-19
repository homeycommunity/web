export function userInfoUrl() {
  return process.env.AUTH_ISSUER + "/oidc/me"
}
