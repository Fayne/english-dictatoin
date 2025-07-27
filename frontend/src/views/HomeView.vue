<template>
  <div class="home">
    <div class="container">
      <h1 class="title">英语默写练习</h1>
      
      <div v-if="!dictationStore.currentSession" class="setup-section">
        <div class="card">
          <h2>开始新的默写练习</h2>
          <div class="input-group">
            <label for="wordCount">选择默写单词数量：</label>
            <select v-model="wordCount" id="wordCount" class="select">
              <option value="5">5个单词</option>
              <option value="10">10个单词</option>
              <option value="15">15个单词</option>
              <option value="20">20个单词</option>
              <option value="30">30个单词</option>
            </select>
          </div>
          
          <button 
            @click="startDictation" 
            :disabled="dictationStore.isLoading"
            class="btn btn-primary"
          >
            <span v-if="dictationStore.isLoading">加载中...</span>
            <span v-else>开始默写</span>
          </button>
        </div>
        
        <div class="stats-section">
          <div class="stats-header" @click="toggleStats">
            <h3>历史统计</h3>
            <div class="toggle-icon" :class="{ 'expanded': showStats }">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
          </div>
          <div class="stats-content" :class="{ 'collapsed': !showStats }">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">{{ statistics.totalSessions }}</div>
                <div class="stat-label">总练习次数</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ statistics.totalWords }}</div>
                <div class="stat-label">总默写单词</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ statistics.accuracy }}%</div>
                <div class="stat-label">平均正确率</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <DictationComponent v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDictationStore } from '@/stores/dictation'
import { getStatistics } from '@/services/localStorage'
import DictationComponent from '@/components/DictationComponent.vue'

const dictationStore = useDictationStore()
const wordCount = ref(10)
const showStats = ref(false)
const statistics = ref({
  totalSessions: 0,
  totalWords: 0,
  totalCorrect: 0,
  accuracy: 0
})

function toggleStats() {
  showStats.value = !showStats.value
}

async function startDictation() {
  try {
    await dictationStore.startDictation(wordCount.value)
  } catch (error) {
    alert('加载单词失败，请检查网络连接和Contentful配置')
  }
}

onMounted(() => {
  statistics.value = getStatistics()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 800px;
  width: 100%;
}

.title {
  text-align: center;
  color: white;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.setup-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  text-align: center;
}

.card h2 {
  color: #333;
  margin-bottom: 1.5rem;
}

.input-group {
  margin-bottom: 2rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.select {
  width: 200px;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.select:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 150px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  overflow: hidden;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid #f0f0f0;
}

.stats-header:hover {
  background-color: #f8f9fa;
}

.stats-header h3 {
  color: #333;
  margin: 0;
}

.toggle-icon {
  transition: transform 0.3s ease;
  color: #666;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.stats-content {
  padding: 0 2rem 2rem 2rem;
  max-height: 300px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stats-content.collapsed {
  max-height: 0;
  padding: 0 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* 桌面端优化 */
@media (min-width: 1024px) {
  .home {
    padding: 3rem 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .container {
    max-width: 1200px;
    width: 100%;
  }
  
  .title {
    font-size: 3rem;
    margin-bottom: 3rem;
  }
  
  .setup-section {
    flex-direction: row;
    align-items: stretch;
    gap: 3rem;
    justify-content: center;
  }
  
  .card {
    flex: 1;
    min-width: 400px;
  }
  
  .stats-section {
    flex: 1;
    min-width: 400px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 平板端优化 */
@media (min-width: 768px) and (max-width: 1023px) {
  .home {
    padding: 2.5rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .title {
    font-size: 2.8rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 移动端优化 */
@media (max-width: 767px) {
  .title {
    font-size: 2rem;
  }
  
  .card {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
