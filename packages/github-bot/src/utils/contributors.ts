import * as fs from "fs";
import * as path from "path";

export interface ContributorMap {
  [githubUsername: string]: string;
}

let contributorMap: ContributorMap | null = null;

function loadContributorMap(): ContributorMap {
  if (contributorMap) return contributorMap;

  const map: ContributorMap = {};

  try {
    const filePath = path.join(__dirname, "..", "data", "contributor-map.json");
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const fileMap = JSON.parse(fileContent) as ContributorMap;
      Object.assign(map, fileMap);
    }
  } catch (err: any) {
    console.warn(`[Contributors] Could not load contributor-map.json: ${err.message}`);
  }

  if (process.env.CONTRIBUTOR_MAP) {
    try {
      const envMap = JSON.parse(process.env.CONTRIBUTOR_MAP) as ContributorMap;
      Object.assign(map, envMap);
    } catch {
      console.warn("[Contributors] Failed to parse CONTRIBUTOR_MAP env var, falling back to file.");
    }
  }

  contributorMap = map;
  return map;
}

export function getDiscordId(githubUsername: string): string | null {
  const map = loadContributorMap();
  return map[githubUsername] || null;
}

export function getGithubUsername(discordId: string): string | null {
  const map = loadContributorMap();
  for (const [github, discord] of Object.entries(map)) {
    if (discord === discordId) return github;
  }
  return null;
}

export function getAllContributors(): ContributorMap {
  return { ...loadContributorMap() };
}

export function isRegistered(githubUsername: string): boolean {
  return getDiscordId(githubUsername) !== null;
}

export function registerContributor(githubUsername: string, discordId: string): boolean {
  const map = loadContributorMap();

  if (map[githubUsername] === discordId) return false;

  map[githubUsername] = discordId;

  try {
    const filePath = path.join(__dirname, "..", "data", "contributor-map.json");
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(map, null, 2), "utf-8");
    return true;
  } catch (err: any) {
    console.warn(`[Contributors] Could not persist contributor-map.json: ${err.message}`);
    return true;
  }
}

export function clearContributorCache(): void {
  contributorMap = null;
  mergedContributorsCache = null;
}

let mergedContributorsCache: Set<string> | null = null;

function loadMergedContributors(): Set<string> {
  if (mergedContributorsCache) return mergedContributorsCache;

  const set = new Set<string>();

  try {
    const filePath = path.join(__dirname, "..", "data", "merged-contributors.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const arr = JSON.parse(content) as string[];
      for (const name of arr) {
        set.add(name);
      }
    }
  } catch (err: any) {
    console.warn(`[Contributors] Could not load merged-contributors.json: ${err.message}`);
  }

  mergedContributorsCache = set;
  return set;
}

function saveMergedContributors(set: Set<string>): void {
  try {
    const filePath = path.join(__dirname, "..", "data", "merged-contributors.json");
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify([...set], null, 2), "utf-8");
  } catch (err: any) {
    console.warn(`[Contributors] Could not persist merged-contributors.json: ${err.message}`);
  }
}

export function isFirstContribution(githubUsername: string): boolean {
  const set = loadMergedContributors();
  return !set.has(githubUsername);
}

export function markContributorMerged(githubUsername: string): void {
  const set = loadMergedContributors();
  if (set.has(githubUsername)) return;
  set.add(githubUsername);
  saveMergedContributors(set);
}
