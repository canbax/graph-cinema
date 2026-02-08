import { describe, it, expect } from "vitest";
import { emojifySentence, getEmojiForWord } from "./emojiMapper";

describe("emojiMapper", () => {
  it("should return emoji for known words", () => {
    expect(getEmojiForWord("user")).toBe("👤");
    expect(getEmojiForWord("database")).toBe("🗄️");
    expect(getEmojiForWord("Database")).toBe("🗄️"); // Case insensitive
  });

  it("should return null for unknown words", () => {
    expect(getEmojiForWord("unknownword123")).toBeNull();
  });

  it("should handle plurals", () => {
    expect(getEmojiForWord("users")).toBe("👥");
    // Simple plural fallback logic check if specific map doesn't exist
    // 'databases' is not in map, but 'database' is.
    expect(getEmojiForWord("databases")).toBe("🗄️");
  });

  it("should emojify sentences correctly", () => {
    const input = "User saves to Database";
    const expected = "👤 User 💾 saves to 🗄️ Database";
    expect(emojifySentence(input)).toBe(expected);
  });

  it("should not double emojify", () => {
    const input = "👤 User";
    expect(emojifySentence(input)).toBe("👤 User");
  });

  it("should handle punctuation", () => {
    const input = "User, save!";
    const expected = "👤 User, 💾 save!";
    expect(emojifySentence(input)).toBe(expected);
  });
});
