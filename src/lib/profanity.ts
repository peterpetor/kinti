const BAD_WORDS = [
  // Hungarian
  "bazdmeg", "bzdmg", "kurva", "fasz", "geci", "szar", "picsa", "köcsög", "kocsog", "buzi", "baszni", "baszás",
  "faszfej", "gecc", "kurafi", "szarházi", "gec",
  // English
  "fuck", "shit", "bitch", "cunt", "asshole", "dick", "pussy", "slut", "whore", "motherfucker", "fucker",
  // German
  "scheisse", "scheiße", "arsch", "arschloch", "ficken", "hure", "fotze", "schlampe", "wixer", "wichser",
];

// Creates a regex that matches any of the bad words, with word boundaries where appropriate.
// We use a simple replacement, turning matched words into asterisks based on their length.
export function filterProfanity(text: string): string {
  if (!text) return text;

  let filteredText = text;
  
  for (const word of BAD_WORDS) {
    // Escaping special characters just in case, though our list is simple letters.
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Case insensitive regex for the word.
    // Using \b boundaries might fail on Hungarian suffixes (e.g. kurvával), so we do a more general match 
    // or word boundaries. For simplicity and aggressive filtering, we match the root.
    const regex = new RegExp(escapedWord, "gi");
    
    filteredText = filteredText.replace(regex, (match) => {
      // Keep the first character, star out the rest, or just replace fully with asterisks
      return '*'.repeat(match.length);
    });
  }

  return filteredText;
}
