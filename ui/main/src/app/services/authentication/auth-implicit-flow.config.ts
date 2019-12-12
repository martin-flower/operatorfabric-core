import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {

    issuer: 'http://localhost:89/auth/realms/dev',
   redirectUri: window.location.origin + '/index.html',
    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
    clientId: 'opfab-client',
    scope: 'openid profile email voucher',
    showDebugInformation: true,
    sessionChecksEnabled: false,
};