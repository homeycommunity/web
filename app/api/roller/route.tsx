import { PrismaClient } from "@prisma/client";
import axios from "axios";

export async function GET (request: Request) {
  if (process.env.ROLLER_KEY === request.headers.get('x-roller-key')) {
    return new Response(JSON.stringify({}));
  }
  const prisma = new PrismaClient();
  const tokens = await prisma.homeyToken.findMany();
  for (const token of tokens) {
    if (token.expires.getTime() < Date.now() - 60000) {
      // refresh token
      // www token
      const a = new URLSearchParams();
      a.set('client_id', process.env.HOMEY_CLIENT_ID!)
      a.set('client_secret', process.env.HOMEY_CLIENT_SECRET!)
      a.set('grant_type', 'refresh_token')
      a.set('refresh_token', token.refreshToken!)

      const data = await axios.post('https://api.athom.com/oauth2/token', a.toString());
      ;
      await prisma.homeyToken.update({
        where: {
          id: token.id
        },
        data: {
          accessToken: data.data.access_token,
          refreshToken: data.data.refresh_token,
          expires: new Date((Date.now() + data.data.expires_in * 1000) - 1000)
        }
      });
    }
  }
  return new Response(JSON.stringify({}))
}
