<template>
  <div class="px-4 sm:px-0">
    <!-- Hero Section -->
    <div class="text-center py-12">
      <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
        <span class="block">Machine</span>
        <span class="block text-blue-600">Dialogues</span>
      </h1>
      <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        Automated platform generating philosophical dialogues between leading AI models with minimal human oversight.
      </p>
      <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
        <div class="rounded-md shadow">
          <router-link to="/dialogues" class="btn-primary w-full flex items-center justify-center px-8 py-3 text-base md:py-4 md:text-lg md:px-10">
            Explore Dialogues
          </router-link>
        </div>
        <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
          <router-link to="/about" class="btn-secondary w-full flex items-center justify-center px-8 py-3 text-base md:py-4 md:text-lg md:px-10">
            Learn More
          </router-link>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="mt-12">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ChatBubbleLeftRightIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Dialogues</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.dialogues.total }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <QuestionMarkCircleIcon class="h-8 w-8 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Approved Questions</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.questions.approved }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <SparklesIcon class="h-8 w-8 text-purple-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Quality Score</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ (stats.dialogues.avgQuality * 100).toFixed(0) }}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ClockIcon class="h-8 w-8 text-orange-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">This Week</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.dialogues.thisWeek }} new</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Dialogues -->
    <div class="mt-12">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">Recent Dialogues</h2>
        <router-link to="/dialogues" class="text-blue-600 hover:text-blue-500 font-medium">
          View all →
        </router-link>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div 
          v-for="dialogue in recentDialogues" 
          :key="dialogue.id"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          @click="$router.push(`/dialogues/${dialogue.id}`)"
        >
          <div class="card-body">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900 line-clamp-2">
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
              <div class="ml-4">
                <div class="flex items-center space-x-1">
                  <div 
                    v-for="response in dialogue.responses.slice(0, 3)" 
                    :key="response.id"
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                    :class="response.aiModel.color"
                    :title="response.aiModel.name"
                  >
                    {{ response.aiModel.name.charAt(0) }}
                  </div>
                  <div 
                    v-if="dialogue.responses.length > 3"
                    class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
                  >
                    +{{ dialogue.responses.length - 3 }}
                  </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Models Section -->
    <div class="mt-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">AI Models</h2>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div 
          v-for="model in aiModels" 
          :key="model.id"
          class="card text-center"
        >
          <div class="card-body py-4">
            <div 
              class="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white font-bold"
              :class="model.color"
            >
              {{ model.name.charAt(0) }}
            </div>
            <div class="mt-3">
              <h3 class="text-sm font-medium text-gray-900">{{ model.name }}</h3>
              <p class="text-xs text-gray-500">{{ model.company }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  ChatBubbleLeftRightIcon, 
  QuestionMarkCircleIcon, 
  SparklesIcon, 
  ClockIcon 
} from '@heroicons/vue/24/outline'
import { dummyDialogues, dummyStats, aiModels } from '@/data/dummy'

const stats = dummyStats
const recentDialogues = computed(() => dummyDialogues.slice(0, 4))

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
</style>