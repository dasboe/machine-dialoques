<template>
  <div class="px-4 sm:px-0">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-500">Loading dialogue...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <ExclamationTriangleIcon class="h-12 w-12 text-red-400 mx-auto" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">Dialogue not found</h3>
      <p class="mt-1 text-sm text-gray-500">The dialogue you're looking for doesn't exist.</p>
      <div class="mt-6">
        <router-link to="/dialogues" class="btn-primary">
          <ArrowLeftIcon class="w-4 h-4 mr-2" />
          Back to Dialogues
        </router-link>
      </div>
    </div>

    <!-- Dialogue Content -->
    <div v-else-if="dialogue">
      <!-- Header -->
      <div class="mb-6">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li>
              <router-link to="/dialogues" class="text-gray-400 hover:text-gray-500">
                <ChevronLeftIcon class="flex-shrink-0 h-5 w-5" />
                <span class="sr-only">Back</span>
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <ChevronRightIcon class="flex-shrink-0 h-5 w-5 text-gray-400" />
                <span class="ml-4 text-sm font-medium text-gray-500">Dialogue Details</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Question and Metadata -->
      <div class="card mb-6">
        <div class="card-body">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 mb-4">
                {{ dialogue.question }}
              </h1>
              
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <div class="flex items-center">
                  <CalendarIcon class="w-4 h-4 mr-1" />
                  {{ formatDate(dialogue.date) }}
                </div>
                <div class="flex items-center">
                  <ChatBubbleLeftRightIcon class="w-4 h-4 mr-1" />
                  {{ dialogue.responses.length }} responses
                </div>
                <div class="flex items-center">
                  <SparklesIcon class="w-4 h-4 mr-1" />
                  {{ (dialogue.overallQuality * 100).toFixed(0) }}% overall quality
                </div>
                <div v-if="totalFeedback > 0" class="flex items-center">
                  <HeartIcon class="w-4 h-4 mr-1" />
                  {{ totalFeedback }} reactions
                </div>
              </div>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span 
                  v-for="tag in dialogue.tags" 
                  :key="tag"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="ml-6">
              <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                :class="statusClasses"
              >
                {{ dialogue.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quality Metrics Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="card">
          <div class="card-body text-center">
            <div class="text-2xl font-bold text-blue-600">{{ (avgRelevance * 100).toFixed(0) }}%</div>
            <div class="text-sm text-gray-500">Avg Relevance</div>
          </div>
        </div>
        <div class="card">
          <div class="card-body text-center">
            <div class="text-2xl font-bold text-green-600">{{ (avgCoherence * 100).toFixed(0) }}%</div>
            <div class="text-sm text-gray-500">Avg Coherence</div>
          </div>
        </div>
        <div class="card">
          <div class="card-body text-center">
            <div class="text-2xl font-bold text-purple-600">{{ (avgOriginality * 100).toFixed(0) }}%</div>
            <div class="text-sm text-gray-500">Avg Originality</div>
          </div>
        </div>
      </div>

      <!-- Sorting Controls -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">AI Responses</h2>
        <div class="flex items-center space-x-4">
          <select v-model="sortBy" class="text-sm border-gray-300 rounded-md">
            <option value="quality">Sort by Quality</option>
            <option value="model">Sort by Model</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      <!-- AI Responses -->
      <div class="space-y-6">
        <div 
          v-for="(response, index) in sortedResponses" 
          :key="response.id"
          class="card"
        >
          <div class="card-body">
            <!-- Response Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center">
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4"
                  :class="response.aiModel.color"
                >
                  {{ response.aiModel.name.charAt(0) }}
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">{{ response.aiModel.name }}</h3>
                  <p class="text-sm text-gray-500">{{ response.aiModel.company }}</p>
                </div>
              </div>
              
              <!-- Quality Score -->
              <div class="text-right">
                <div class="text-lg font-semibold text-gray-900">
                  {{ (getResponseQuality(response) * 100).toFixed(0) }}%
                </div>
                <div class="text-xs text-gray-500">Quality Score</div>
              </div>
            </div>

            <!-- Response Text -->
            <div class="prose prose-gray max-w-none mb-4">
              <p class="text-gray-700 leading-relaxed">{{ response.text }}</p>
            </div>

            <!-- Detailed Metrics -->
            <div class="border-t pt-4">
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Relevance</span>
                    <span class="font-medium">{{ (response.qualityMetrics.relevance * 100).toFixed(0) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      class="bg-blue-600 h-2 rounded-full" 
                      :style="{ width: `${response.qualityMetrics.relevance * 100}%` }"
                    ></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Coherence</span>
                    <span class="font-medium">{{ (response.qualityMetrics.coherence * 100).toFixed(0) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      class="bg-green-600 h-2 rounded-full" 
                      :style="{ width: `${response.qualityMetrics.coherence * 100}%` }"
                    ></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Originality</span>
                    <span class="font-medium">{{ (response.qualityMetrics.originality * 100).toFixed(0) }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      class="bg-purple-600 h-2 rounded-full" 
                      :style="{ width: `${response.qualityMetrics.originality * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Response Actions -->
            <div class="flex items-center justify-between mt-4 pt-4 border-t">
              <div class="flex items-center space-x-4">
                <span class="text-xs text-gray-500">
                  Generated in {{ response.responseTime }}ms
                </span>
                <span class="text-xs text-gray-500">
                  {{ response.tokens }} tokens
                </span>
              </div>
              
              <!-- Feedback Actions -->
              <div class="flex items-center space-x-2">
                <button class="p-2 text-gray-400 hover:text-green-500 rounded-full hover:bg-green-50">
                  <HandThumbUpIcon class="w-4 h-4" />
                </button>
                <button class="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50">
                  <HandThumbDownIcon class="w-4 h-4" />
                </button>
                <button class="p-2 text-gray-400 hover:text-yellow-500 rounded-full hover:bg-yellow-50">
                  <HeartIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Summary -->
      <div v-if="dialogue.feedback.length > 0" class="mt-8 card">
        <div class="card-body">
          <h3 class="font-medium text-gray-900 mb-4">Community Feedback</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              v-for="feedback in dialogue.feedback" 
              :key="feedback.reaction"
              class="text-center"
            >
              <div class="text-2xl mb-1">{{ getReactionEmoji(feedback.reaction) }}</div>
              <div class="text-sm font-medium text-gray-900 capitalize">{{ feedback.reaction }}</div>
              <div class="text-xs text-gray-500">{{ feedback.count }} votes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  HeartIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'
import { dummyDialogues, type DialogueData } from '@/data/dummy'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref(false)
const dialogue = ref<DialogueData | null>(null)
const sortBy = ref('quality')

const statusClasses = computed(() => {
  if (!dialogue.value) return ''
  
  switch (dialogue.value.status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const getResponseQuality = (response: any) => {
  const metrics = response.qualityMetrics
  return (metrics.relevance + metrics.coherence + metrics.originality) / 3
}

const sortedResponses = computed(() => {
  if (!dialogue.value) return []
  
  const responses = [...dialogue.value.responses]
  
  switch (sortBy.value) {
    case 'quality':
      return responses.sort((a, b) => getResponseQuality(b) - getResponseQuality(a))
    case 'model':
      return responses.sort((a, b) => a.aiModel.name.localeCompare(b.aiModel.name))
    case 'date':
      return responses.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    default:
      return responses
  }
})

const avgRelevance = computed(() => {
  if (!dialogue.value) return 0
  const sum = dialogue.value.responses.reduce((acc, r) => acc + r.qualityMetrics.relevance, 0)
  return sum / dialogue.value.responses.length
})

const avgCoherence = computed(() => {
  if (!dialogue.value) return 0
  const sum = dialogue.value.responses.reduce((acc, r) => acc + r.qualityMetrics.coherence, 0)
  return sum / dialogue.value.responses.length
})

const avgOriginality = computed(() => {
  if (!dialogue.value) return 0
  const sum = dialogue.value.responses.reduce((acc, r) => acc + r.qualityMetrics.originality, 0)
  return sum / dialogue.value.responses.length
})

const totalFeedback = computed(() => {
  if (!dialogue.value) return 0
  return dialogue.value.feedback.reduce((sum, f) => sum + f.count, 0)
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getReactionEmoji = (reaction: string) => {
  const emojiMap: { [key: string]: string } = {
    'insightful': '💡',
    'thought-provoking': '🤔',
    'inspiring': '✨',
    'helpful': '👍'
  }
  return emojiMap[reaction] || '👍'
}

onMounted(() => {
  const dialogueId = route.params.id as string
  loading.value = true
  
  // Simulate API call
  setTimeout(() => {
    const foundDialogue = dummyDialogues.find(d => d.id === dialogueId)
    
    if (foundDialogue) {
      dialogue.value = foundDialogue
    } else {
      error.value = true
    }
    
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.prose p {
  margin-bottom: 1rem;
  line-height: 1.7;
}
</style>