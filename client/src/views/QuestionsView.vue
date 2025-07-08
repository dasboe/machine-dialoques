<template>
  <div class="px-4 sm:px-0">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Questions</h1>
        <p class="mt-2 text-sm text-gray-700">
          Manage and review philosophical questions for AI dialogues
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
        <button class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-2" />
          Add New Question
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <QuestionMarkCircleIcon class="h-8 w-8 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Questions</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.total }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-8 w-8 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Approved</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.approved }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ClockIcon class="h-8 w-8 text-yellow-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.pending }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ChartBarIcon class="h-8 w-8 text-purple-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Usage Rate</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.usageRate }}%</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="mt-6 bg-white rounded-lg shadow p-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select v-model="filters.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Category</label>
          <select v-model="filters.category" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">All Categories</option>
            <option value="consciousness">Consciousness</option>
            <option value="ethics">Ethics</option>
            <option value="philosophy">Philosophy</option>
            <option value="existence">Existence</option>
            <option value="understanding">Understanding</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Usage</label>
          <select v-model="filters.usage" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">Any Usage</option>
            <option value="unused">Unused</option>
            <option value="low">Low (1-3 times)</option>
            <option value="medium">Medium (4-10 times)</option>
            <option value="high">High (10+ times)</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Sort By</label>
          <select v-model="filters.sort" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="created-desc">Newest First</option>
            <option value="created-asc">Oldest First</option>
            <option value="usage-desc">Most Used</option>
            <option value="usage-asc">Least Used</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="mt-6 space-y-4">
      <div 
        v-for="question in filteredQuestions" 
        :key="question.id"
        class="card hover:shadow-md transition-shadow"
      >
        <div class="card-body">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ question.text }}
              </h3>
              
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                <div class="flex items-center">
                  <CalendarIcon class="w-4 h-4 mr-1" />
                  {{ formatDate(question.createdAt) }}
                </div>
                <div class="flex items-center">
                  <TagIcon class="w-4 h-4 mr-1" />
                  {{ question.category }}
                </div>
                <div class="flex items-center">
                  <ArrowPathIcon class="w-4 h-4 mr-1" />
                  Used {{ question.usageCount }} times
                </div>
                <div v-if="question.lastUsed" class="flex items-center">
                  <ClockIcon class="w-4 h-4 mr-1" />
                  Last used {{ formatRelativeDate(question.lastUsed) }}
                </div>
              </div>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mb-3">
                <span 
                  v-for="tag in question.tags" 
                  :key="tag"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- AI Model Preferences -->
              <div v-if="question.aiModelPreferences.length > 0" class="flex items-center">
                <span class="text-sm text-gray-500 mr-2">Preferred models:</span>
                <div class="flex items-center space-x-1">
                  <div 
                    v-for="modelId in question.aiModelPreferences.slice(0, 3)" 
                    :key="modelId"
                    class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-medium text-white"
                    :title="getModelName(modelId)"
                  >
                    {{ getModelName(modelId).charAt(0) }}
                  </div>
                  <span v-if="question.aiModelPreferences.length > 3" class="text-xs text-gray-500">
                    +{{ question.aiModelPreferences.length - 3 }} more
                  </span>
                </div>
              </div>
            </div>

            <!-- Status and Actions -->
            <div class="ml-6 flex flex-col items-end space-y-3">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusClasses(question.status)"
              >
                {{ question.status }}
              </span>

              <div class="flex items-center space-x-2">
                <button 
                  class="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50"
                  title="Edit question"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button 
                  class="p-2 text-gray-400 hover:text-green-500 rounded-full hover:bg-green-50"
                  title="Generate dialogue"
                >
                  <ChatBubbleLeftRightIcon class="w-4 h-4" />
                </button>
                <button 
                  class="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                  title="Delete question"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredQuestions.length === 0" class="text-center py-12">
      <QuestionMarkCircleIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No questions found</h3>
      <p class="mt-1 text-sm text-gray-500">Try adjusting your filters or add a new question.</p>
      <div class="mt-6">
        <button class="btn-primary">
          <PlusIcon class="w-4 h-4 mr-2" />
          Add New Question
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredQuestions.length > 0" class="mt-8 flex items-center justify-between">
      <p class="text-sm text-gray-700">
        Showing {{ filteredQuestions.length }} of {{ totalQuestions }} questions
      </p>
      <div class="flex items-center space-x-2">
        <button class="btn-secondary">Previous</button>
        <button class="btn-secondary">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  PlusIcon, 
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CalendarIcon,
  TagIcon,
  ArrowPathIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import { dummyQuestions, aiModels } from '@/data/dummy'

const totalQuestions = dummyQuestions.length

const filters = ref({
  status: '',
  category: '',
  usage: '',
  sort: 'created-desc'
})

const stats = computed(() => {
  const approved = dummyQuestions.filter(q => q.status === 'approved').length
  const pending = dummyQuestions.filter(q => q.status === 'pending').length
  const total = dummyQuestions.length
  const totalUsage = dummyQuestions.reduce((sum, q) => sum + q.usageCount, 0)
  const usageRate = total > 0 ? Math.round((totalUsage / total) * 10) : 0

  return {
    total,
    approved,
    pending,
    usageRate
  }
})

const filteredQuestions = computed(() => {
  let result = [...dummyQuestions]

  // Filter by status
  if (filters.value.status) {
    result = result.filter(q => q.status === filters.value.status)
  }

  // Filter by category
  if (filters.value.category) {
    result = result.filter(q => q.category === filters.value.category)
  }

  // Filter by usage
  if (filters.value.usage) {
    switch (filters.value.usage) {
      case 'unused':
        result = result.filter(q => q.usageCount === 0)
        break
      case 'low':
        result = result.filter(q => q.usageCount >= 1 && q.usageCount <= 3)
        break
      case 'medium':
        result = result.filter(q => q.usageCount >= 4 && q.usageCount <= 10)
        break
      case 'high':
        result = result.filter(q => q.usageCount > 10)
        break
    }
  }

  // Sort
  switch (filters.value.sort) {
    case 'created-desc':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'created-asc':
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      break
    case 'usage-desc':
      result.sort((a, b) => b.usageCount - a.usageCount)
      break
    case 'usage-asc':
      result.sort((a, b) => a.usageCount - b.usageCount)
      break
    case 'alphabetical':
      result.sort((a, b) => a.text.localeCompare(b.text))
      break
  }

  return result
})

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getModelName = (modelId: string) => {
  const model = aiModels.find(m => m.id === modelId)
  return model ? model.name : 'Unknown'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatRelativeDate = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'today'
  if (diffInDays === 1) return 'yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return `${Math.floor(diffInDays / 30)} months ago`
}
</script>