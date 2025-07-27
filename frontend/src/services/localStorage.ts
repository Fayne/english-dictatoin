export interface DictationResult {
  word: string
  userInput: string
  isCorrect: boolean
  timestamp: number
  translation: string
}

export interface DictationSession {
  id: string
  date: string
  totalWords: number
  correctWords: number
  results: DictationResult[]
  completedAt?: number
}

const STORAGE_KEY = 'english-dictation-sessions'

// Get all dictation sessions
export function getDictationSessions(): DictationSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return []
  }
}

// Save a new dictation session
export function saveDictationSession(session: DictationSession): void {
  try {
    const sessions = getDictationSessions()
    sessions.push(session)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Update an existing session
export function updateDictationSession(sessionId: string, updates: Partial<DictationSession>): void {
  try {
    const sessions = getDictationSessions()
    const index = sessions.findIndex(s => s.id === sessionId)
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    }
  } catch (error) {
    console.error('Error updating localStorage:', error)
  }
}

// Get today's sessions
export function getTodaySessions(): DictationSession[] {
  const today = new Date().toDateString()
  return getDictationSessions().filter(session => 
    new Date(session.date).toDateString() === today
  )
}

// Get statistics
export function getStatistics() {
  const sessions = getDictationSessions()
  const totalSessions = sessions.length
  const totalWords = sessions.reduce((sum, session) => sum + session.totalWords, 0)
  const totalCorrect = sessions.reduce((sum, session) => sum + session.correctWords, 0)
  const accuracy = totalWords > 0 ? (totalCorrect / totalWords) * 100 : 0

  return {
    totalSessions,
    totalWords,
    totalCorrect,
    accuracy: Math.round(accuracy * 100) / 100
  }
}