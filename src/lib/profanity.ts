// Stems are matched as `\b<stem>\w*`, so "fuck" catches "fucked"/"fucking"/"fucker",
// "shit" catches "shitty"/"shitting", and so on. Word-boundary at the start prevents
// false positives like "Scunthorpe" or "Massachusetts".
const PROFANE_STEMS = [
  'fuck',
  'shit',
  'piss',
  'cunt',
  'bitch',
  'whore',
  'slut',
  'twat',
  'wank',
  'bullshit',
  'asshole',
  'bastard',
  'douche',
  'motherfuck',
  'fag',
  'nigger',
  'nigga',
  'kike',
  'spic',
  'chink',
  'tranny',
  'wetback',
  'retard',
] as const

// eslint-disable-next-line security/detect-non-literal-regexp -- pattern built from a static const list
const PROFANE_REGEX = new RegExp(`\\b(?:${PROFANE_STEMS.join('|')})\\w*`, 'i')

export function containsProfanity(text: string | null | undefined): boolean {
  if (!text) return false
  return PROFANE_REGEX.test(text)
}

export function isClean(...texts: Array<string | null | undefined>): boolean {
  return !texts.some(containsProfanity)
}
