import axios from "axios"

export async function getSessionTokenFromAccessToken(
  accessToken: string,
  remoteUrl: string
) {
  const response = await axios.post(
    "https://api.athom.com/delegation/token?audience=homey",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const data = response.data

  const login = await axios.post(`${remoteUrl}/api/manager/users/login`, {
    token: data,
  })

  return login.data
}
