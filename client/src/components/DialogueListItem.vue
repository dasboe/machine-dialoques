<template>
  <div class="card hover:shadow-md transition-shadow cursor-pointer group">
    <div class="card-body py-4">
      <div class="flex items-center justify-between">
        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-medium text-gray-900 group-hover:text-blue-600 truncate">
                {{ dialogue.question }}
              </h3>
              <div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span>{{ dialogue.responses.length }} responses</span>
                <span>•</span>
                <span>{{ formatDate(dialogue.date) }}</span>
                <span>•</span>
                <span class="flex items-center">
                  <SparklesIcon class="w-4 h-4 mr-1" />
                  {{ (dialogue.overallQuality * 100).toFixed(0) }}% quality
                </span>
                <span v-if="totalFeedback > 0">•</span>
                <span v-if="totalFeedback > 0" class="flex items-center">
                  <HeartIcon class="w-4 h-4 mr-1" />
                  {{ totalFeedback }} reactions
                </span>
              </div>

              <!-- Tags (mobile-friendly) -->
              <div class="mt-2 flex flex-wrap gap-1">
                <span 
                  v-for="tag in dialogue.tags.slice(0, 4)" 
                  :key="tag"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Status and Quality -->
            <div class="ml-4 flex flex-col items-end space-y-2">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="statusClasses"
              >
                {{ dialogue.status }}
              </span>
              
              <!-- AI Models -->
              <div class="flex items-center space-x-1">
                <div 
                  v-for="response in dialogue.responses.slice(0, 3)" 
                  :key="response.id"
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                  :class="response.aiModel.color"
                  :title="`${response.aiModel.name} - ${(getResponseQuality(response) * 100).toFixed(0)}% quality`"
                >
                  {{ response.aiModel.name.charAt(0) }}
                </div>
                <div 
                  v-if="dialogue.responses.length > 3"
                  class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
                >
                  +{{ dialogue.responses.length - 3 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chevron -->
        <div class="ml-4">
          <ChevronRightIcon class="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SparklesIcon, HeartIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
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

const totalFeedback = computed(() => {
  return props.dialogue.feedback.reduce((sum, f) => sum + f.count, 0)
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>