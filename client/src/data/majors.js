/**
 * Majors list with aliases for fuzzy search.
 * Each major has a canonical "value" (stored in DB) and "aliases" (for search matching).
 */
export const MAJORS = [
  { value: "Computer Science", aliases: ["cs", "compsci", "comp sci"] },
  { value: "Electrical and Computer Engineering", aliases: ["ece", "electrical engineering", "ee", "electrical"] },
  { value: "Mechanical Engineering", aliases: ["me", "mech", "mech eng", "mechanical"] },
  { value: "Civil Engineering", aliases: ["ce", "civil"] },
  { value: "Chemical Engineering", aliases: ["cheme", "chem eng", "chemical"] },
  { value: "Biomedical Engineering", aliases: ["bme", "biomed", "biomedical"] },
  { value: "Aerospace Engineering", aliases: ["aero", "aerospace"] },
  { value: "Mathematics", aliases: ["math", "maths", "applied math", "pure math"] },
  { value: "Physics", aliases: ["phys"] },
  { value: "Chemistry", aliases: ["chem"] },
  { value: "Biology", aliases: ["bio"] },
  { value: "Biochemistry", aliases: ["biochem"] },
  { value: "Economics", aliases: ["econ"] },
  { value: "Business Administration", aliases: ["business", "bba", "management"] },
  { value: "Finance", aliases: ["fin"] },
  { value: "Accounting", aliases: ["acct"] },
  { value: "Marketing", aliases: ["mktg"] },
  { value: "Psychology", aliases: ["psych"] },
  { value: "Sociology", aliases: ["soc"] },
  { value: "Political Science", aliases: ["poli sci", "polisci", "politics"] },
  { value: "History", aliases: ["hist"] },
  { value: "English", aliases: ["eng lit", "english literature"] },
  { value: "Philosophy", aliases: ["phil"] },
  { value: "Communications", aliases: ["comm", "media"] },
  { value: "Journalism", aliases: ["journ"] },
  { value: "Art", aliases: ["fine art", "studio art", "visual art"] },
  { value: "Music", aliases: ["mus"] },
  { value: "Theater", aliases: ["theatre", "drama"] },
  { value: "Nursing", aliases: ["bsn", "rn"] },
  { value: "Pre-Med", aliases: ["premed", "pre-medical"] },
  { value: "Pre-Law", aliases: ["prelaw", "pre-legal"] },
  { value: "Data Science", aliases: ["ds", "data analytics"] },
  { value: "Information Systems", aliases: ["is", "mis", "info systems"] },
  { value: "Cybersecurity", aliases: ["cyber", "infosec", "information security"] },
  { value: "Undeclared", aliases: ["undecided", "exploratory"] },
  { value: "Other", aliases: [] },
]

/**
 * Fuzzy search matching against both the canonical value and aliases.
 * Returns majors sorted by match quality.
 */
export function searchMajors(query) {
  if (!query || query.trim() === "") {
    return MAJORS
  }
  
  const q = query.toLowerCase().trim()
  
  return MAJORS
    .map(major => {
      const valueLower = major.value.toLowerCase()
      const aliasesLower = major.aliases.map(a => a.toLowerCase())
      
      // Exact match on value
      if (valueLower === q) return { ...major, score: 100 }
      
      // Exact match on alias
      if (aliasesLower.includes(q)) return { ...major, score: 90 }
      
      // Starts with match on value
      if (valueLower.startsWith(q)) return { ...major, score: 80 }
      
      // Starts with match on any alias
      if (aliasesLower.some(a => a.startsWith(q))) return { ...major, score: 70 }
      
      // Contains match on value
      if (valueLower.includes(q)) return { ...major, score: 60 }
      
      // Contains match on any alias
      if (aliasesLower.some(a => a.includes(q))) return { ...major, score: 50 }
      
      // No match
      return { ...major, score: 0 }
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
}
