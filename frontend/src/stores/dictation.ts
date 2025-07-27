import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WordEntry } from '@/services/contentful'
import type { DictationResult, DictationSession } from '@/services/localStorage'
import { fetchRandomWords } from '@/services/contentful'
import { saveDictationSession, updateDictationSession } from '@/services/localStorage'

export const useDictationStore = defineStore('dictation', () => {
  // State
  const words = ref<WordEntry[]>([])
  const currentWordIndex = ref(0)
  const userInput = ref('')
  const results = ref<DictationResult[]>([])
  const isLoading = ref(false)
  const currentSession = ref<DictationSession | null>(null)
  const showResult = ref(false)

  // Getters
  const currentWord = computed(() => words.value[currentWordIndex.value])
  const isLastWord = computed(() => currentWordIndex.value >= words.value.length - 1)
  const correctCount = computed(() => results.value.filter(r => r.isCorrect).length)
  const accuracy = computed(() => {
    if (results.value.length === 0) return 0
    return Math.round((correctCount.value / results.value.length) * 100)
  })

  // Actions
  async function startDictation(wordCount: number) {
    try {
      isLoading.value = true
      words.value = await fetchRandomWords(wordCount)
      currentWordIndex.value = 0
      userInput.value = ''
      results.value = []
      showResult.value = false

      // Create new session
      currentSession.value = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        totalWords: wordCount,
        correctWords: 0,
        results: []
      }
    } catch (error) {
      console.error('Failed to start dictation:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function checkSpelling(): boolean {
    if (!currentWord.value) return false

    const isCorrect = userInput.value.toLowerCase().trim() === currentWord.value.word.toLowerCase().trim()
    
    const result: DictationResult = {
      word: currentWord.value.word,
      userInput: userInput.value.trim(),
      isCorrect,
      timestamp: Date.now(),
      translation: currentWord.value.translation
    }

    results.value.push(result)
    return isCorrect
  }

  function nextWord() {
    if (isLastWord.value) {
      finishDictation()
    } else {
      currentWordIndex.value++
      userInput.value = ''
    }
  }

  function finishDictation() {
    if (currentSession.value) {
      const updatedSession: DictationSession = {
        ...currentSession.value,
        correctWords: correctCount.value,
        results: results.value,
        completedAt: Date.now()
      }

      saveDictationSession(updatedSession)
      currentSession.value = updatedSession
    }
    showResult.value = true
  }

  function resetDictation() {
    words.value = []
    currentWordIndex.value = 0
    userInput.value = ''
    results.value = []
    currentSession.value = null
    showResult.value = false
  }

  function playAudio() {
    if (currentWord.value?.audioUrl) {
      const audio = new Audio(currentWord.value.audioUrl)
      audio.play().catch(error => {
        console.error('Failed to play audio:', error)
      })
    }
  }

  return {
    // State
    words,
    currentWordIndex,
    userInput,
    results,
    isLoading,
    currentSession,
    showResult,
    
    // Getters
    currentWord,
    isLastWord,
    correctCount,
    accuracy,
    
    // Actions
    startDictation,
    checkSpelling,
    nextWord,
    finishDictation,
    resetDictation,
    playAudio
  }
})