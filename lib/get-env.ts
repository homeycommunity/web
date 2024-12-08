import { Readable } from "stream"
import tarGzGlob from "targz-glob"

export async function getEnv(stream: Readable) {
  const env = await tarGzGlob(stream, ["./env.json", "env.json"])

  return env.get("env.json")! || env.get("./env.json")!
}
