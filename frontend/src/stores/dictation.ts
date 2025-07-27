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
  const isAudioButtonEnabled = ref(false)
  const isAutoPlaying = ref(false)

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
      isAudioButtonEnabled.value = false
      isAutoPlaying.value = false

      // Create new session
      currentSession.value = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        totalWords: wordCount,
        correctWords: 0,
        results: []
      }
      
      // Auto play audio for first word
      autoPlayAudio()
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
      // Reset audio button state for new word
      isAudioButtonEnabled.value = false
      // Auto play audio for new word
      autoPlayAudio()
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
    isAudioButtonEnabled.value = false
    isAutoPlaying.value = false
  }

  function playAudio() {
    if (currentWord.value?.audioUrl && isAudioButtonEnabled.value) {
      const audio = new Audio(currentWord.value.audioUrl)
      audio.play().catch(error => {
        console.error('Failed to play audio:', error)
      })
    }
  }

  function autoPlayAudio() {
    if (!currentWord.value?.audioUrl) return
    
    isAutoPlaying.value = true
    isAudioButtonEnabled.value = false
    
    let playCount = 0
    const maxPlays = 2
    
    function playOnce() {
      if (playCount >= maxPlays) {
        isAutoPlaying.value = false
        isAudioButtonEnabled.value = true
        return
      }
      
      const audio = new Audio(currentWord.value!.audioUrl!)
      
      audio.addEventListener('ended', () => {
        playCount++
        // Add a small delay between plays
        setTimeout(() => {
          playOnce()
        }, 500)
      })
      
      audio.addEventListener('error', (error) => {
        console.error('Failed to play audio:', error)
        isAutoPlaying.value = false
        isAudioButtonEnabled.value = true
      })
      
      audio.play().catch(error => {
        console.error('Failed to play audio:', error)
        isAutoPlaying.value = false
        isAudioButtonEnabled.value = true
      })
    }
    
    playOnce()
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
    isAudioButtonEnabled,
    isAutoPlaying,
    
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
    playAudio,
    autoPlayAudio
  }
})