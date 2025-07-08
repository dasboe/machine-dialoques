<template>
  <div class="px-4 sm:px-0">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Analytics</h1>
      <p class="mt-2 text-sm text-gray-700">
        Insights and performance metrics for AI dialogues
      </p>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ChartBarIcon class="h-8 w-8 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Avg Quality Score</dt>
                <dd class="text-2xl font-bold text-gray-900">{{ (analytics.avgQuality * 100).toFixed(1) }}%</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ClockIcon class="h-8 w-8 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Avg Response Time</dt>
                <dd class="text-2xl font-bold text-gray-900">{{ analytics.avgResponseTime }}ms</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ChatBubbleLeftRightIcon class="h-8 w-8 text-purple-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Dialogues/Week</dt>
                <dd class="text-2xl font-bold text-gray-900">{{ analytics.dialoguesPerWeek }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <HeartIcon class="h-8 w-8 text-red-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">User Satisfaction</dt>
                <dd class="text-2xl font-bold text-gray-900">{{ (analytics.userSatisfaction * 100).toFixed(0) }}%</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Quality Trends -->
      <div class="card">
        <div class="card-body">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Quality Trends (Last 30 Days)</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Relevance</span>
              <div class="flex items-center">
                <div class="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div class="bg-blue-600 h-2 rounded-full" style="width: 87%"></div>
                </div>
                <span class="text-sm font-medium">87%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Coherence</span>
              <div class="flex items-center">
                <div class="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div class="bg-green-600 h-2 rounded-full" style="width: 92%"></div>
                </div>
                <span class="text-sm font-medium">92%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Originality</span>
              <div class="flex items-center">
                <div class="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div class="bg-purple-600 h-2 rounded-full" style="width: 83%"></div>
                </div>
                <span class="text-sm font-medium">83%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Model Performance -->
      <div class="card">
        <div class="card-body">
          <h3 class="text-lg font-medium text-gray-900 mb-4">AI Model Performance</h3>
          <div class="space-y-3">
            <div 
              v-for="model in modelPerformance" 
              :key="model.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center">
                <div 
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white mr-3"
                  :class="model.color"
                >
                  {{ model.name.charAt(0) }}
                </div>
                <span class="text-sm text-gray-900">{{ model.name }}</span>
              </div>
              <div class="flex items-center">
                <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    class="h-2 rounded-full"
                    :class="model.color"
                    :style="{ width: `${model.performance}%` }"
                  ></div>
                </div>
                <span class="text-sm font-medium">{{ model.performance }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Usage Statistics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Topic Distribution -->
      <div class="card">
        <div class="card-body">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Popular Topics</h3>
          <div class="space-y-3">
            <div 
              v-for="topic in topicDistribution" 
              :key="topic.name"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-gray-600 capitalize">{{ topic.name }}</span>
              <div class="flex items-center">
                <div class="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div class="bg-blue-500 h-2 rounded-full" :style="{ width: `${topic.percentage}%` }"></div>
                </div>
                <span class="text-sm font-medium">{{ topic.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Response Times -->
      <div class="card">
        <div class="card-body">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Response Time Distribution</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">< 1 second</span>
              <div class="flex items-center">
                <div class="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: 45%"></div>
                </div>
                <span class="text-sm font-medium">45%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">1-3 seconds</span>
              <div class="flex items-center">
                <div class="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div class="bg-yellow-500 h-2 rounded-full" style="width: 35%"></div>
                </div>
                <span class="text-sm font-medium">35%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">3+ seconds</span>
              <div class="flex items-center">
                <div class="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div class="bg-red-500 h-2 rounded-full" style="width: 20%"></div>
                </div>
                <span class="text-sm font-medium">20%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card">
      <div class="card-body">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div class="flow-root">
          <ul class="-mb-8">
            <li v-for="(activity, index) in recentActivity" :key="activity.id">
              <div class="relative pb-8">
                <span 
                  v-if="index !== recentActivity.length - 1"
                  class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                ></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span 
                      class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                      :class="getActivityIconClass(activity.type)"
                    >
                      <component :is="getActivityIcon(activity.type)" class="w-4 h-4 text-white" />
                    </span>
                  </div>
                  <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p class="text-sm text-gray-500">
                        {{ activity.description }}
                      </p>
                    </div>
                    <div class="text-right text-sm whitespace-nowrap text-gray-500">
                      {{ formatRelativeTime(activity.timestamp) }}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  ChartBarIcon, 
  ClockIcon, 
  ChatBubbleLeftRightIcon, 
  HeartIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'
import { dummyDialogues, aiModels, dummyQuestions } from '@/data/dummy'

const analytics = computed(() => {
  const totalResponses = dummyDialogues.reduce((sum, d) => sum + d.responses.length, 0)
  const totalQuality = dummyDialogues.reduce((sum, d) => sum + d.overallQuality, 0)
  const avgQuality = totalQuality / dummyDialogues.length

  const allResponseTimes = dummyDialogues.flatMap(d => 
    d.responses.map(r => r.responseTime)
  )
  const avgResponseTime = Math.round(
    allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length
  )

  const dialoguesPerWeek = Math.round(dummyDialogues.length / 4) // Assume 4 weeks of data

  const totalFeedback = dummyDialogues.reduce((sum, d) => 
    sum + d.feedback.reduce((fSum, f) => fSum + f.count, 0), 0
  )
  const positiveFeedback = dummyDialogues.reduce((sum, d) => 
    sum + d.feedback.filter(f => ['insightful', 'inspiring', 'helpful'].includes(f.reaction))
      .reduce((fSum, f) => fSum + f.count, 0), 0
  )
  const userSatisfaction = totalFeedback > 0 ? positiveFeedback / totalFeedback : 0

  return {
    avgQuality,
    avgResponseTime,
    dialoguesPerWeek,
    userSatisfaction
  }
})

const modelPerformance = computed(() => {
  const modelStats = new Map()
  
  dummyDialogues.forEach(dialogue => {
    dialogue.responses.forEach(response => {
      const modelId = response.aiModel.id
      if (!modelStats.has(modelId)) {
        modelStats.set(modelId, {
          ...response.aiModel,
          totalQuality: 0,
          count: 0
        })
      }
      
      const stats = modelStats.get(modelId)
      const quality = (response.qualityMetrics.relevance + 
                      response.qualityMetrics.coherence + 
                      response.qualityMetrics.originality) / 3
      stats.totalQuality += quality
      stats.count++
    })
  })
  
  return Array.from(modelStats.values()).map(stats => ({
    ...stats,
    performance: Math.round((stats.totalQuality / stats.count) * 100)
  })).sort((a, b) => b.performance - a.performance)
})

const topicDistribution = computed(() => {
  const topicCounts = new Map()
  
  dummyDialogues.forEach(dialogue => {
    dialogue.tags.forEach(tag => {
      topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1)
    })
  })
  
  const total = Array.from(topicCounts.values()).reduce((sum, count) => sum + count, 0)
  
  return Array.from(topicCounts.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const recentActivity = [
  {
    id: '1',
    type: 'dialogue_created',
    description: 'New dialogue generated on consciousness and AI sentience',
    timestamp: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'question_approved',
    description: 'Question "What is the nature of understanding?" approved for use',
    timestamp: '2025-01-15T09:15:00Z'
  },
  {
    id: '3',
    type: 'high_quality',
    description: 'Dialogue achieved 95% quality score with Claude and GPT-4',
    timestamp: '2025-01-15T08:45:00Z'
  },
  {
    id: '4',
    type: 'question_rejected',
    description: 'Question rejected due to insufficient philosophical depth',
    timestamp: '2025-01-14T16:20:00Z'
  }
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'dialogue_created':
      return ChatBubbleLeftRightIcon
    case 'question_approved':
      return CheckIcon
    case 'question_rejected':
      return XMarkIcon
    case 'high_quality':
      return SparklesIcon
    default:
      return PlusIcon
  }
}

const getActivityIconClass = (type: string) => {
  switch (type) {
    case 'dialogue_created':
      return 'bg-blue-500'
    case 'question_approved':
      return 'bg-green-500'
    case 'question_rejected':
      return 'bg-red-500'
    case 'high_quality':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

const formatRelativeTime = (timestamp: string) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}
</script>