import { createClient, type Entry } from 'contentful'

// Contentful entry types
export interface WordEntry {
  word: string
  pronunciation?: string
  translation: string
  audioUrl?: string
}

// Create Contentful client
const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
  environment: import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || 'master'
})

// Fetch words from Contentful
export async function fetchWords(limit: number = 10): Promise<WordEntry[]> {
  try {
    const response = await client.getEntries({
      content_type: 'englishDictation', // This should match your Contentful content type ID
      limit,
      order: ['sys.createdAt']
    })

    return response.items.map((item: Entry<any>) => ({
      word: item.fields.english as string,
      pronunciation: '', // No pronunciation field in your model
      translation: item.fields.chinese as string,
      audioUrl: item.fields.voice && typeof item.fields.voice === 'object' && 'fields' in item.fields.voice && item.fields.voice.fields && typeof item.fields.voice.fields === 'object' && 'file' in item.fields.voice.fields && item.fields.voice.fields.file && typeof item.fields.voice.fields.file === 'object' && 'url' in item.fields.voice.fields.file
        ? `https:${item.fields.voice.fields.file.url}` 
        : undefined
    }))
  } catch (error) {
    console.error('Error fetching words from Contentful:', error)
    throw error
  }
}

// Fetch random words
export async function fetchRandomWords(count: number): Promise<WordEntry[]> {
  try {
    const response = await client.getEntries({
      content_type: 'englishDictation',
      limit: 1000 // Get more entries to randomize from
    })

    const allWords = response.items.map((item: Entry<any>) => ({
      word: item.fields.english as string,
      pronunciation: '', // No pronunciation field in your model
      translation: item.fields.chinese as string,
      audioUrl: item.fields.voice && typeof item.fields.voice === 'object' && 'fields' in item.fields.voice && item.fields.voice.fields && typeof item.fields.voice.fields === 'object' && 'file' in item.fields.voice.fields && item.fields.voice.fields.file && typeof item.fields.voice.fields.file === 'object' && 'url' in item.fields.voice.fields.file
        ? `https:${item.fields.voice.fields.file.url}` 
        : undefined
    }))

    // Shuffle and return requested count
    const shuffled = allWords.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  } catch (error) {
    console.error('Error fetching random words:', error)
    throw error
  }
}