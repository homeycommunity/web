import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export async function GET () {
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

  return NextResponse.json(output);
}
