<template>
  <div class="card hover:shadow-lg transition-shadow cursor-pointer group">
    <div class="card-body">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
            {{ dialogue.question }}
          </h3>
          <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>{{ dialogue.responses.length }} responses</span>
            <span>•</span>
            <span>{{ formatDate(dialogue.date) }}</span>
            <span>•</span>
            <span class="flex items-center">
              <SparklesIcon class="w-4 h-4 mr-1" />
              {{ (dialogue.overallQuality * 100).toFixed(0) }}%
            </span>
          </div>
        </div>
        
        <!-- Status Badge -->
        <div class="ml-4">
          <span 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="statusClasses"
          >
            {{ dialogue.status }}
          </span>
        </div>
      </div>

      <!-- Preview of top response -->
      <div v-if="topResponse" class="mt-4 p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center mb-2">
          <div 
            class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white mr-2"
            :class="topResponse.aiModel.color"
          >
            {{ topResponse.aiModel.name.charAt(0) }}
          </div>
          <span class="text-sm font-medium text-gray-900">{{ topResponse.aiModel.name }}</span>
          <span class="ml-auto text-xs text-gray-500">
            {{ (getResponseQuality(topResponse) * 100).toFixed(0) }}% quality
          </span>
        </div>
        <p class="text-sm text-gray-700 line-clamp-3">
          {{ topResponse.text }}
        </p>
      </div>

      <!-- AI Models -->
      <div class="mt-4 flex items-center justify-between">
        <div class="flex items-center space-x-1">
          <span class="text-sm text-gray-500 mr-2">Models:</span>
          <div 
            v-for="response in dialogue.responses.slice(0, 4)" 
            :key="response.id"
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
            :class="response.aiModel.color"
            :title="`${response.aiModel.name} - ${(getResponseQuality(response) * 100).toFixed(0)}% quality`"
          >
            {{ response.aiModel.name.charAt(0) }}
          </div>
          <div 
            v-if="dialogue.responses.length > 4"
            class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
          >
            +{{ dialogue.responses.length - 4 }}
          </div>
        </div>

        <!-- Feedback Summary -->
        <div v-if="totalFeedback > 0" class="flex items-center space-x-3 text-xs text-gray-500">
          <div class="flex items-center">
            <HeartIcon class="w-4 h-4 mr-1" />
            {{ totalFeedback }}
          </div>
          <div v-if="topFeedback" class="flex items-center">
            <span class="capitalize">{{ topFeedback.reaction }}</span>
            <span class="ml-1">({{ topFeedback.count }})</span>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div class="mt-4 flex flex-wrap gap-2">
        <span 
          v-for="tag in dialogue.tags.slice(0, 3)" 
          :key="tag"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {{ tag }}
        </span>
        <span 
          v-if="dialogue.tags.length > 3"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
        >
          +{{ dialogue.tags.length - 3 }} more
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SparklesIcon, HeartIcon } from '@heroicons/vue/24/outline'
import type { DialogueData } from '@/data/dummy'

interface Props {
  dialogue: DialogueData
}

const props = defineProps<Props>()

const statusClasses = computed(() => {
  switch (props.dialogue.status) {
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

const topResponse = computed(() => {
  return props.dialogue.responses.reduce((best, current) => {
    return getResponseQuality(current) > getResponseQuality(best) ? current : best
  })
})

const totalFeedback = computed(() => {
  return props.dialogue.feedback.reduce((sum, f) => sum + f.count, 0)
})

const topFeedback = computed(() => {
  return props.dialogue.feedback.reduce((top, current) => {
    return current.count > (top?.count || 0) ? current : top
  }, null as any)
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>