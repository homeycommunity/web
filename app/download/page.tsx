import { Badge } from "@/components/ui/badge";
import { Octokit } from "@octokit/rest";


export default async function DownloadPage () {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const repo = await octokit.repos.getLatestRelease({
    repo: 'desktop',
    owner: 'homeycommunity'
  });

  const output = {
    version: repo.data.tag_name,
    windows: repo.data.assets.find(asset => asset.name.endsWith('exe'))?.browser_download_url,
    mac: repo.data.assets.find(asset => asset.name.endsWith('dmg'))?.browser_download_url,
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Download the installer <Badge>{output.version}</Badge> 🚀
        </h1>

        <div className="flex flex-col gap-2">
          <p className="text-lg">
            <a href={output.windows} className="text-blue-500 hover:underline">
              Windows
            </a>
          </p>
          <p className="text-lg">
            <a href={output.mac} className="text-blue-500 hover:underline">
              macOS
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
