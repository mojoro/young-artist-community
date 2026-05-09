import { describe, it, expect } from 'vitest'
import { containsProfanity, isClean } from './profanity'

describe('containsProfanity', () => {
  it('flags exact profane words', () => {
    expect(containsProfanity('this program is shit')).toBe(true)
    expect(containsProfanity('what the fuck')).toBe(true)
  })

  it('flags inflected forms via stem matching', () => {
    expect(containsProfanity('you are fucked')).toBe(true)
    expect(containsProfanity('absolutely fucking awful')).toBe(true)
    expect(containsProfanity('bullshitting their reviews')).toBe(true)
    expect(containsProfanity('shitty experience')).toBe(true)
    expect(containsProfanity('pissed off')).toBe(true)
  })

  it('is case insensitive', () => {
    expect(containsProfanity('FUCK this')).toBe(true)
    expect(containsProfanity('Bitch.')).toBe(true)
  })

  it('respects word boundaries (no false positives on innocent substrings)', () => {
    expect(containsProfanity('Scunthorpe')).toBe(false)
    expect(containsProfanity('analyst')).toBe(false)
    expect(containsProfanity('classical music')).toBe(false)
    expect(containsProfanity('Massachusetts')).toBe(false)
  })

  it('handles null, undefined, and empty', () => {
    expect(containsProfanity(null)).toBe(false)
    expect(containsProfanity(undefined)).toBe(false)
    expect(containsProfanity('')).toBe(false)
  })

  it('flags slurs', () => {
    expect(containsProfanity('a faggot review')).toBe(true)
  })

  it('passes clean text', () => {
    expect(containsProfanity('Best summer of my life')).toBe(false)
    expect(containsProfanity('faculty were world-class')).toBe(false)
  })
})

describe('isClean', () => {
  it('returns true when every field is clean', () => {
    expect(isClean('Great program', 'Loved it', 'Jane')).toBe(true)
  })

  it('returns false when any field has profanity', () => {
    expect(isClean('Great', 'this is shit', 'Jane')).toBe(false)
    expect(isClean('fuck this', 'great body', 'Jane')).toBe(false)
  })

  it('ignores null and undefined fields', () => {
    expect(isClean('Great program', null, undefined)).toBe(true)
  })
})
