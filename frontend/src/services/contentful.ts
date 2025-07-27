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

// Get total count of entries (optimized approach)
export async function getTotalEntriesCount(): Promise<number> {
  try {
    const response = await client.getEntries({
      content_type: 'englishDictation',
      limit: 1, // Only get 1 entry to minimize data transfer
      select: ['sys.id'] // Only select the ID field
    })
    return response.total
  } catch (error) {
    console.error('Error getting total entries count:', error)
    throw error
  }
}

// Fetch random words using skip parameter (optimized approach)
export async function fetchRandomWords(count: number): Promise<WordEntry[]> {
  try {
    // First get the total count of entries
    const totalCount = await getTotalEntriesCount()
    
    if (totalCount === 0) {
      return []
    }
    
    // If we need more words than available, just get all
    if (count >= totalCount) {
      const response = await client.getEntries({
        content_type: 'englishDictation',
        limit: totalCount
      })
      
      const allWords = response.items.map((item: Entry<any>) => ({
        word: item.fields.english as string,
        pronunciation: '', // No pronunciation field in your model
        translation: item.fields.chinese as string,
        audioUrl: item.fields.voice && typeof item.fields.voice === 'object' && 'fields' in item.fields.voice && item.fields.voice.fields && typeof item.fields.voice.fields === 'object' && 'file' in item.fields.voice.fields && item.fields.voice.fields.file && typeof item.fields.voice.fields.file === 'object' && 'url' in item.fields.voice.fields.file
          ? `https:${item.fields.voice.fields.file.url}` 
          : undefined
      }))
      
      // Shuffle and return
      return allWords.sort(() => 0.5 - Math.random())
    }
    
    // Generate random skip values to get distributed random entries
    const randomWords: WordEntry[] = []
    const usedSkips = new Set<number>()
    
    // Generate unique random skip values
    while (randomWords.length < count && usedSkips.size < totalCount) {
      const randomSkip = Math.floor(Math.random() * totalCount)
      
      if (!usedSkips.has(randomSkip)) {
        usedSkips.add(randomSkip)
        
        try {
          const response = await client.getEntries({
            content_type: 'englishDictation',
            limit: 1,
            skip: randomSkip
          })
          
          if (response.items.length > 0) {
            const item = response.items[0]
            randomWords.push({
              word: item.fields.english as string,
              pronunciation: '', // No pronunciation field in your model
              translation: item.fields.chinese as string,
              audioUrl: item.fields.voice && typeof item.fields.voice === 'object' && 'fields' in item.fields.voice && item.fields.voice.fields && typeof item.fields.voice.fields === 'object' && 'file' in item.fields.voice.fields && item.fields.voice.fields.file && typeof item.fields.voice.fields.file === 'object' && 'url' in item.fields.voice.fields.file
                ? `https:${item.fields.voice.fields.file.url}` 
                : undefined
            })
          }
        } catch (entryError) {
          console.warn(`Failed to fetch entry at skip ${randomSkip}:`, entryError)
          // Continue to next iteration
        }
      }
    }
    
    return randomWords
  } catch (error) {
    console.error('Error fetching random words:', error)
    // Fallback to the old method if the optimized approach fails
    return fetchRandomWordsFallback(count)
  }
}

// Fallback method (original approach)
async function fetchRandomWordsFallback(count: number): Promise<WordEntry[]> {
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
    console.error('Error in fallback method:', error)
    throw error
  }
}