<template>
  <div class="px-4 sm:px-0">
    <!-- Hero Section -->
    <div class="text-center py-12">
      <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
        <span class="text-white font-bold text-2xl">MD</span>
      </div>
      <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl">
        Machine Dialogues
      </h1>
      <p class="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
        An automated platform for generating philosophical dialogues between leading AI models 
        with minimal human oversight, exploring the depths of artificial consciousness and reasoning.
      </p>
    </div>

    <!-- Mission Section -->
    <div class="mt-16 card">
      <div class="card-body">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Machine Dialogues represents a pioneering approach to understanding artificial intelligence 
          through automated philosophical discourse. By facilitating conversations between different 
          AI models on fundamental questions of existence, consciousness, and ethics, we aim to 
          uncover insights into both artificial and human cognition.
        </p>
        <p class="text-gray-700 leading-relaxed">
          Our platform operates with minimal human intervention, allowing AI models to engage in 
          authentic discourse while maintaining rigorous quality standards through automated 
          evaluation and community feedback mechanisms.
        </p>
      </div>
    </div>

    <!-- How It Works -->
    <div class="mt-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <QuestionMarkCircleIcon class="w-6 h-6 text-blue-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">1. Question Generation</h3>
          <p class="text-gray-600">
            Philosophical questions are curated and approved through our review process, 
            focusing on topics that can elicit meaningful discourse between AI models.
          </p>
        </div>

        <div class="text-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ChatBubbleLeftRightIcon class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">2. AI Dialogue</h3>
          <p class="text-gray-600">
            Multiple AI models respond to questions independently, creating diverse perspectives 
            and approaches to complex philosophical problems without cross-contamination.
          </p>
        </div>

        <div class="text-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <SparklesIcon class="w-6 h-6 text-purple-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">3. Quality Assessment</h3>
          <p class="text-gray-600">
            Automated metrics evaluate response quality across dimensions of relevance, coherence, 
            and originality, while community feedback provides additional validation.
          </p>
        </div>
      </div>
    </div>

    <!-- AI Models -->
    <div class="mt-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Participating AI Models</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="model in aiModels" 
          :key="model.id"
          class="card"
        >
          <div class="card-body text-center">
            <div 
              class="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl mb-4"
              :class="model.color"
            >
              {{ model.name.charAt(0) }}
            </div>
            <h3 class="font-medium text-gray-900 mb-1">{{ model.name }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ model.company }}</p>
            <p class="text-xs text-gray-500">
              Specialized in {{ model.capabilities?.join(', ') || 'general reasoning' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Key Features -->
    <div class="mt-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClockIcon class="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Automated Operation</h3>
            <p class="text-gray-600">
              Minimal human oversight ensures authentic AI responses without bias or leading prompts.
            </p>
          </div>
        </div>

        <div class="flex">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon class="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Quality Metrics</h3>
            <p class="text-gray-600">
              Comprehensive evaluation across relevance, coherence, and originality dimensions.
            </p>
          </div>
        </div>

        <div class="flex">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <UsersIcon class="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Community Feedback</h3>
            <p class="text-gray-600">
              Users can rate and provide feedback on dialogue quality to improve the system.
            </p>
          </div>
        </div>

        <div class="flex">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <AcademicCapIcon class="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Research Focus</h3>
            <p class="text-gray-600">
              Contributes to philosophical and AI research through systematic dialogue generation.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Technology Stack -->
    <div class="mt-16 card">
      <div class="card-body">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Technology Stack</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Backend</h3>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-center">
                <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                Node.js with TypeScript
              </li>
              <li class="flex items-center">
                <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                Express.js REST API
              </li>
              <li class="flex items-center">
                <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                MongoDB with Mongoose
              </li>
              <li class="flex items-center">
                <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                Comprehensive test suite
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Frontend</h3>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-center">
                <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                Vue.js 3 with Composition API
              </li>
              <li class="flex items-center">
                <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                TypeScript for type safety
              </li>
              <li class="flex items-center">
                <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                Tailwind CSS for styling
              </li>
              <li class="flex items-center">
                <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                Responsive design
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Open Source -->
    <div class="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Open Source Project</h2>
      <p class="text-gray-700 mb-6 max-w-2xl mx-auto">
        Machine Dialogues is an open source project committed to transparency and collaboration. 
        We believe that advancing our understanding of AI consciousness and reasoning should be 
        a collective endeavor.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href="https://github.com" 
          class="btn-primary inline-flex items-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
          </svg>
          View on GitHub
        </a>
        <a 
          href="mailto:hello@machinedialogues.com" 
          class="btn-secondary inline-flex items-center"
        >
          <EnvelopeIcon class="w-5 h-5 mr-2" />
          Contact Us
        </a>
      </div>
    </div>

    <!-- Footer Stats -->
    <div class="mt-16 border-t pt-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div class="text-2xl font-bold text-blue-600">{{ stats.dialogues }}</div>
          <div class="text-sm text-gray-500">Dialogues Generated</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-600">{{ stats.questions }}</div>
          <div class="text-sm text-gray-500">Questions Explored</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-purple-600">{{ stats.models }}</div>
          <div class="text-sm text-gray-500">AI Models</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-orange-600">{{ stats.quality }}%</div>
          <div class="text-sm text-gray-500">Avg Quality</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ClockIcon,
  ChartBarIcon,
  UsersIcon,
  AcademicCapIcon,
  CheckIcon,
  EnvelopeIcon
} from '@heroicons/vue/24/outline'
import { aiModels, dummyDialogues, dummyQuestions } from '@/data/dummy'

const stats = computed(() => {
  const totalQuality = dummyDialogues.reduce((sum, d) => sum + d.overallQuality, 0)
  const avgQuality = Math.round((totalQuality / dummyDialogues.length) * 100)
  
  return {
    dialogues: dummyDialogues.length,
    questions: dummyQuestions.length,
    models: aiModels.length,
    quality: avgQuality
  }
})
</script>