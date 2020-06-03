import { OAuth2Client } from 'google-auth-library';

export async function getUID(bearerToken?: string) {
  const token = bearerToken?.substring(7) ?? '';
  if (!token) return null;
  try {
    const oAuthClientID = process.env.OAUTH_CLIENT_ID;
    const oAuthClient = new OAuth2Client(oAuthClientID);
    const ticket = await oAuthClient.verifyIdToken({
      idToken: token,
      audience: oAuthClientID || '',
    });
    return ticket.getPayload()?.sub;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default {
  getUID,
};
