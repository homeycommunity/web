import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export async function GET () {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const repo = await octokit.repos.getLatestRelease({
    repo: 'app',
    owner: 'homeycommunity'
  });

  const output = {
    version: repo.data.tag_name,
    url: repo.data.assets.find(asset => asset.name.endsWith('homeycommunityspace.tar.gz'))?.browser_download_url,
  }

  return NextResponse.json(output);
}
