import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {

    issuer: 'http://localhost:89/auth/realms/dev', // OAuh2-OIDC server
    redirectUri: window.location.origin,
    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
    clientId: 'opfab-client',
    scope: 'profile email openid',
    showDebugInformation: true,
    sessionChecksEnabled: false,
};