const emojiMap: Record<string, string> = {
  // Actors
  user: "👤",
  users: "👥",
  actor: "🎭",
  person: "🧑",
  people: "🧑‍🤝‍🧑",
  client: "📱",
  customer: "🛍️",
  admin: "🛡️",
  administrator: "🛡️",

  // Infrastructure
  database: "🗄️",
  db: "🗄️",
  server: "🖥️",
  cloud: "☁️",
  api: "🔌",
  service: "⚙️",
  network: "🌐",
  internet: "🌐",
  web: "🕸️",
  site: "💻",
  app: "📱",
  application: "📱",
  system: "⚙️",

  // Actions
  save: "💾",
  saving: "💾",
  load: "📂",
  loading: "📂",
  delete: "🗑️",
  remove: "🗑️",
  edit: "✏️",
  update: "🔄",
  search: "🔍",
  find: "🔍",
  login: "🔑",
  logout: "🚪",
  auth: "🔒",
  authentication: "🔒",
  send: "Vk",
  receive: "📥",
  connect: "🔗",
  disconnect: "🔌",

  // Data
  file: "📄",
  document: "📄",
  image: "🖼️",
  photo: "🖼️",
  video: "📹",
  music: "🎵",
  audio: "🔉",
  email: "📧",
  mail: "📧",
  message: "💬",
  chat: "💬",
  report: "📊",
  chart: "📊",
  money: "💰",
  payment: "💳",
  price: "🏷️",

  // States
  error: "❌",
  success: "✅",
  warning: "⚠️",
  info: "ℹ️",
  bug: "🐛",
  idea: "💡",
  love: "❤️",
  like: "👍",
  dislike: "👎",

  // Misc
  time: "⏰",
  date: "📅",
  home: "🏠",
  work: "💼",
  school: "🏫",
  book: "📚",
  phone: "📞",
  computer: "💻",
  lock: "🔒",
  key: "🔑",
  star: "⭐",
  fire: "🔥",
  robot: "🤖",
  ai: "🤖",
  magic: "✨",
};

export function getEmojiForWord(word: string): string | null {
  const lower = word.toLowerCase().trim();
  // Exact match
  if (emojiMap[lower]) {
    return emojiMap[lower];
  }

  // Try singular if plural (basic check)
  if (lower.endsWith("s") && emojiMap[lower.slice(0, -1)]) {
    return emojiMap[lower.slice(0, -1)];
  }

  return null;
}

export function emojifySentence(sentence: string): string {
  const words = sentence.split(/\s+/);
  return words
    .map((word, index) => {
      // Strip punctuation for lookup
      const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      const emoji = getEmojiForWord(cleanWord);

      if (emoji) {
        // Check if word already contains emoji
        if (word.includes(emoji)) return word;

        // Check if previous word IS the emoji
        if (index > 0 && words[index - 1] === emoji) return word;

        return `${emoji} ${word}`;
      }
      return word;
    })
    .join(" ");
}
