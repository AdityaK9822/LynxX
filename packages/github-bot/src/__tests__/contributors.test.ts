import {
  clearContributorCache,
  getDiscordId,
  getGithubUsername,
  isRegistered,
  registerContributor,
  isFirstContribution,
  markContributorMerged,
  getAllContributors,
} from "../utils/contributors";

const mockReadFileSync = jest.fn();
const mockWriteFileSync = jest.fn();
const mockExistsSync = jest.fn();
const mockMkdirSync = jest.fn();

jest.mock("fs", () => ({
  readFileSync: (...args: any[]) => mockReadFileSync(...args),
  writeFileSync: (...args: any[]) => mockWriteFileSync(...args),
  existsSync: (...args: any[]) => mockExistsSync(...args),
  mkdirSync: (...args: any[]) => mockMkdirSync(...args),
}));

describe("Contributors", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    clearContributorCache();
    process.env = { ...originalEnv };
    delete process.env.CONTRIBUTOR_MAP;

    mockExistsSync.mockReturnValue(false);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getDiscordId", () => {
    it("returns null when no mapping exists", () => {
      expect(getDiscordId("unknown_user")).toBeNull();
    });

    it("returns Discord ID from env var CONTRIBUTOR_MAP", () => {
      process.env.CONTRIBUTOR_MAP = JSON.stringify({ testuser: "123456789" });
      expect(getDiscordId("testuser")).toBe("123456789");
    });

    it("returns Discord ID from file when env var is not set", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        JSON.stringify({ fileuser: "987654321" })
      );
      expect(getDiscordId("fileuser")).toBe("987654321");
    });

    it("returns Discord ID from file when env var is invalid JSON", () => {
      process.env.CONTRIBUTOR_MAP = "not-valid-json";
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        JSON.stringify({ fallbackuser: "555555555" })
      );
      expect(getDiscordId("fallbackuser")).toBe("555555555");
    });

    it("env var overrides file mapping for same user", () => {
      process.env.CONTRIBUTOR_MAP = JSON.stringify({ override: "999999999" });
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        JSON.stringify({ override: "111111111" })
      );
      expect(getDiscordId("override")).toBe("999999999");
    });
  });

  describe("getGithubUsername", () => {
    it("returns null when no mapping exists", () => {
      expect(getGithubUsername("unknown_id")).toBeNull();
    });

    it("returns GitHub username for a known Discord ID", () => {
      process.env.CONTRIBUTOR_MAP = JSON.stringify({ ghuser: "discord456" });
      expect(getGithubUsername("discord456")).toBe("ghuser");
    });
  });

  describe("getAllContributors", () => {
    it("returns a copy of the contributor map", () => {
      process.env.CONTRIBUTOR_MAP = JSON.stringify({ a: "1", b: "2" });
      const map = getAllContributors();
      expect(map).toEqual({ a: "1", b: "2" });
      map.a = "changed";
      expect(getDiscordId("a")).toBe("1");
    });
  });

  describe("isRegistered", () => {
    it("returns true for registered user", () => {
      process.env.CONTRIBUTOR_MAP = JSON.stringify({ registered: "333" });
      expect(isRegistered("registered")).toBe(true);
    });

    it("returns false for unregistered user", () => {
      expect(isRegistered("noone")).toBe(false);
    });
  });

  describe("registerContributor", () => {
    it("registers a new contributor and persists to file", () => {
      expect(registerContributor("newbie", "444444444")).toBe(true);
      expect(isRegistered("newbie")).toBe(true);
      expect(getDiscordId("newbie")).toBe("444444444");
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    it("returns false when already registered with same Discord ID", () => {
      process.env.CONTRIBUTOR_MAP = JSON.stringify({ existing: "555" });
      expect(registerContributor("existing", "555")).toBe(false);
    });

    it("updates Discord ID when changed", () => {
      process.env.CONTRIBUTOR_MAP = JSON.stringify({ existing: "555" });
      expect(registerContributor("existing", "666")).toBe(true);
      expect(getDiscordId("existing")).toBe("666");
    });
  });

  describe("isFirstContribution", () => {
    it("returns true when contributor not in merged list", () => {
      expect(isFirstContribution("fresh_contributor")).toBe(true);
    });

    it("returns false when contributor is already in merged list", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        JSON.stringify(["returning_user"])
      );
      clearContributorCache();
      expect(isFirstContribution("returning_user")).toBe(false);
    });
  });

  describe("markContributorMerged", () => {
    it("adds contributor to merged list and persists", () => {
      markContributorMerged("new_merger");
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        JSON.stringify(["new_merger"])
      );
      clearContributorCache();
      expect(isFirstContribution("new_merger")).toBe(false);
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    it("does not write again if already in list", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        JSON.stringify(["existing_merger"])
      );
      clearContributorCache();
      mockWriteFileSync.mockClear();
      markContributorMerged("existing_merger");
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });
  });
});
