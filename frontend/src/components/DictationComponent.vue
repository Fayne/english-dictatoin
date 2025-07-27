<template>
  <div class="dictation">
    <!-- 默写进行中 -->
    <div v-if="!dictationStore.showResult" class="dictation-active">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        <span class="progress-text">{{ dictationStore.currentWordIndex + 1 }} / {{ dictationStore.words.length }}</span>
      </div>
      
      <div class="word-card">
        <div class="word-info">
          <h2 class="translation">{{ dictationStore.currentWord?.translation }}</h2>
          <div class="pronunciation" v-if="dictationStore.currentWord?.pronunciation">
            发音: {{ dictationStore.currentWord.pronunciation }}
          </div>
        </div>
        
        <button 
          v-if="dictationStore.currentWord?.audioUrl" 
          @click="dictationStore.playAudio()"
          class="audio-btn"
          :class="{ 'disabled': !dictationStore.isAudioButtonEnabled, 'playing': dictationStore.isAutoPlaying }"
          :disabled="!dictationStore.isAudioButtonEnabled"
          :title="dictationStore.isAutoPlaying ? '音频播放中...' : dictationStore.isAudioButtonEnabled ? '播放发音' : '音频播放中，请稍候'"
        >
          <span v-if="dictationStore.isAutoPlaying">🔊 播放中...</span>
          <span v-else>🔊 播放发音</span>
        </button>
        
        <div class="input-section">
          <input 
            v-model="dictationStore.userInput"
            @keyup.enter="submitAnswer"
            type="text"
            placeholder="请输入英文单词"
            class="word-input"
            :class="{ 'correct': lastResult === true, 'incorrect': lastResult === false }"
            ref="inputRef"
          />
          
          <button @click="submitAnswer" class="btn btn-submit">
            {{ dictationStore.isLastWord ? '完成' : '下一个' }}
          </button>
        </div>
        
        <div v-if="lastResult !== null" class="result-feedback">
          <div v-if="lastResult" class="feedback correct-feedback">
            ✅ 正确！
          </div>
          <div v-else class="feedback incorrect-feedback">
            ❌ 错误！正确答案是: <strong>{{ lastCorrectWord }}</strong>
          </div>
        </div>
      </div>
      
      <button @click="dictationStore.resetDictation()" class="btn btn-secondary">
        退出练习
      </button>
    </div>
    
    <!-- 结果页面 -->
    <div v-else class="results">
      <div class="results-card">
        <h2>默写完成！</h2>
        
        <div class="score-summary">
          <div class="score-circle">
            <div class="score-number">{{ dictationStore.accuracy }}%</div>
            <div class="score-label">正确率</div>
          </div>
          
          <div class="score-details">
            <div class="score-item">
              <span class="label">总单词数:</span>
              <span class="value">{{ dictationStore.words.length }}</span>
            </div>
            <div class="score-item">
              <span class="label">正确数:</span>
              <span class="value correct">{{ dictationStore.correctCount }}</span>
            </div>
            <div class="score-item">
              <span class="label">错误数:</span>
              <span class="value incorrect">{{ dictationStore.words.length - dictationStore.correctCount }}</span>
            </div>
          </div>
        </div>
        
        <div class="results-list">
          <h3>详细结果</h3>
          <div class="result-item" v-for="(result, index) in dictationStore.results" :key="index">
            <div class="result-word">
              <span class="word">{{ result.word }}</span>
              <span class="translation">{{ result.translation }}</span>
            </div>
            <div class="result-input" :class="{ correct: result.isCorrect, incorrect: !result.isCorrect }">
              {{ result.userInput }}
            </div>
            <div class="result-status">
              {{ result.isCorrect ? '✅' : '❌' }}
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button @click="dictationStore.resetDictation()" class="btn btn-primary">
            再来一次
          </button>
          <button @click="goToHome" class="btn btn-secondary">
            返回首页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDictationStore } from '@/stores/dictation'

const dictationStore = useDictationStore()
const router = useRouter()
const inputRef = ref<HTMLInputElement>()
const lastResult = ref<boolean | null>(null)
const lastCorrectWord = ref('')

const progressPercentage = computed(() => {
  if (dictationStore.words.length === 0) return 0
  return ((dictationStore.currentWordIndex + 1) / dictationStore.words.length) * 100
})

async function submitAnswer() {
  if (!dictationStore.userInput.trim()) return
  
  const isCorrect = dictationStore.checkSpelling()
  lastResult.value = isCorrect
  lastCorrectWord.value = dictationStore.currentWord?.word || ''
  
  // 显示结果反馈
  await nextTick()
  
  // 2秒后自动进入下一个单词
  setTimeout(() => {
    dictationStore.nextWord()
    lastResult.value = null
    
    // 如果还有下一个单词，聚焦输入框
    if (!dictationStore.showResult) {
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  }, 2000)
}

function goToHome() {
  dictationStore.resetDictation()
  router.push({ name: 'home' })
}

onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus()
  })
})
</script>

<style scoped>
.dictation {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dictation-active {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.progress-bar {
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  height: 20px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #4CAF50, #45a049);
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 10px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.word-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  text-align: center;
}

.word-info {
  margin-bottom: 1.5rem;
}

.translation {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.pronunciation {
  color: #666;
  font-style: italic;
}

.audio-btn {
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.audio-btn:hover:not(.disabled) {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.audio-btn.disabled {
  background: #d6d6d6;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.audio-btn.playing {
  background: #667eea;
  color: white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.input-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  justify-content: center;
}

.word-input {
  flex: 1;
  max-width: 300px;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1.1rem;
  text-align: center;
  transition: all 0.3s;
}

.word-input:focus {
  outline: none;
  border-color: #667eea;
}

.word-input.correct {
  border-color: #4CAF50;
  background: #f1f8e9;
}

.word-input.incorrect {
  border-color: #f44336;
  background: #ffebee;
}

.btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit {
  background: #667eea;
  color: white;
}

.btn-submit:hover {
  background: #5a6fd8;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  align-self: center;
}

.btn-secondary:hover {
  background: #5a6268;
}

.result-feedback {
  margin-top: 1rem;
}

.feedback {
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
}

.correct-feedback {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.incorrect-feedback {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.results {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.results-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 600px;
}

.results-card h2 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.score-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.score-number {
  font-size: 2rem;
  font-weight: bold;
}

.score-label {
  font-size: 0.9rem;
}

.score-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.score-item {
  display: flex;
  justify-content: space-between;
  min-width: 150px;
}

.score-item .label {
  color: #666;
}

.score-item .value {
  font-weight: bold;
}

.score-item .value.correct {
  color: #4CAF50;
}

.score-item .value.incorrect {
  color: #f44336;
}

.results-list {
  margin-bottom: 2rem;
}

.results-list h3 {
  color: #333;
  margin-bottom: 1rem;
}

.result-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.result-word {
  display: flex;
  flex-direction: column;
}

.result-word .word {
  font-weight: bold;
  color: #333;
}

.result-word .translation {
  font-size: 0.9rem;
  color: #666;
}

.result-input {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.result-input.correct {
  background: #d4edda;
  color: #155724;
}

.result-input.incorrect {
  background: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 桌面端优化 */
@media (min-width: 1024px) {
  .dictation {
    padding: 3rem 2rem;
  }
  
  .container {
    max-width: 1000px;
  }
  
  .dictation-card {
    padding: 3rem;
    min-height: 500px;
  }
  
  .word-display {
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }
  
  .word-input {
    max-width: 400px;
    font-size: 1.2rem;
    padding: 1rem;
  }
  
  .input-section {
    gap: 2rem;
  }
  
  .btn {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }
  
  .results-card {
    max-width: 800px;
    padding: 3rem;
  }
  
  .score-circle {
    width: 140px;
    height: 140px;
  }
  
  .score-number {
    font-size: 2.5rem;
  }
  
  .result-item {
    grid-template-columns: 2fr 1fr auto;
    padding: 1rem;
  }
}

/* 平板端优化 */
@media (min-width: 768px) and (max-width: 1023px) {
  .dictation {
    padding: 2.5rem 1.5rem;
  }
  
  .dictation-card {
    padding: 2.5rem;
  }
  
  .word-display {
    font-size: 2.2rem;
  }
  
  .word-input {
    max-width: 350px;
    font-size: 1.1rem;
  }
  
  .results-card {
    max-width: 700px;
  }
  
  .result-item {
    grid-template-columns: 2fr 1fr auto;
  }
}

/* 移动端优化 */
@media (max-width: 767px) {
  .input-section {
    flex-direction: column;
  }
  
  .word-input {
    max-width: 100%;
  }
  
  .score-summary {
    flex-direction: column;
    gap: 1rem;
  }
  
  .result-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>