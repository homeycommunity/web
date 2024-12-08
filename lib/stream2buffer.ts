import { Stream } from "stream"

export async function stream2buffer(stream: Stream): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const _buf = Array<any>()

    stream.on("data", (chunk) => _buf.push(chunk))
    stream.on("end", () => resolve(Buffer.concat(_buf).buffer))
    stream.on("error", (err) => reject(`error converting stream - ${err}`))
  }) as unknown as ArrayBuffer
}
