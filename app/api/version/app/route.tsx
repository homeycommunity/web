import { NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"

import { type AuthenticatedRequest } from "../../middleware"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

// Protect version info with read:versions scope
export const GET = async (req: AuthenticatedRequest) => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  })

  try {
    const repo = await octokit.repos.getLatestRelease({
      repo: "app",
      owner: "homeycommunity",
    })

    const output = {
      version: repo.data.tag_name,
      url: repo.data.assets.find((asset) =>
        asset.name.endsWith("homeycommunityspace.tar.gz")
      )?.browser_download_url,
    }

    return NextResponse.json(output)
  } catch (error) {
    console.error("Error fetching release:", error)
    return NextResponse.json(
      { error: "Failed to fetch version information" },
      { status: 500 }
    )
  }
}
