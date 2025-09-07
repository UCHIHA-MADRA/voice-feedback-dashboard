<!-- src/components/features/ScoreChart.vue -->
<template>
  <div class="card p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Score Breakdown</h3>
      
      <!-- Chart Type Selector -->
      <div class="flex space-x-2">
        <button 
          @click="chartType = 'bar'" 
          class="px-3 py-1 text-sm rounded-md transition-colors" 
          :class="chartType === 'bar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          Bar
        </button>
        <button 
          @click="chartType = 'radar'" 
          class="px-3 py-1 text-sm rounded-md transition-colors" 
          :class="chartType === 'radar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          Radar
        </button>
        <button 
          @click="chartType = 'polarArea'" 
          class="px-3 py-1 text-sm rounded-md transition-colors" 
          :class="chartType === 'polarArea' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          Polar
        </button>
      </div>
    </div>

    <div class="relative h-64 mb-6">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- Interactive Legend -->
    <div class="flex flex-wrap justify-center gap-4 text-sm">
      <div 
        v-for="(metric, index) in metrics" 
        :key="metric.id"
        @click="toggleMetric(metric.id)"
        class="flex items-center cursor-pointer px-3 py-1.5 rounded-full transition-all"
        :class="{
          'opacity-40': !metric.visible,
          'hover:bg-gray-100': true,
          'bg-blue-50': metric.id === 'overall' && metric.visible,
          'bg-green-50': metric.id === 'clarity' && metric.visible,
          'bg-purple-50': metric.id === 'engagement' && metric.visible,
          'bg-yellow-50': metric.id === 'sentiment' && metric.visible,
        }"
      >
        <div 
          class="w-3 h-3 rounded-full mr-2" 
          :class="{
            'bg-blue-500': metric.id === 'overall',
            'bg-green-500': metric.id === 'clarity',
            'bg-purple-500': metric.id === 'engagement',
            'bg-yellow-500': metric.id === 'sentiment',
          }"
        ></div>
        <span class="text-gray-700 font-medium">{{ metric.label }}</span>
        <span 
          class="ml-2 font-semibold" 
          :class="{
            'text-blue-600': metric.id === 'overall',
            'text-green-600': metric.id === 'clarity',
            'text-purple-600': metric.id === 'engagement',
            'text-yellow-600': metric.id === 'sentiment',
          }"
        >
          {{ metric.value }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
Chart.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

// Props
const props = defineProps({
  analysis: {
    type: Object,
    required: true,
  },
});

// Refs
const chartCanvas = ref(null);
let chartInstance = null;

// Chart state
const chartType = ref('bar');

// Metrics data with visibility toggle
const metrics = ref([
  {
    id: 'overall',
    label: 'Overall',
    value: 0,
    visible: true,
    color: '#3B82F6',
    borderColor: '#2563EB',
  },
  {
    id: 'clarity',
    label: 'Clarity',
    value: 0,
    visible: true,
    color: '#10B981',
    borderColor: '#059669',
  },
  {
    id: 'engagement',
    label: 'Engagement',
    value: 0,
    visible: true,
    color: '#8B5CF6',
    borderColor: '#7C3AED',
  },
  {
    id: 'sentiment',
    label: 'Sentiment',
    value: 0,
    visible: true,
    color: '#F59E0B',
    borderColor: '#D97706',
  },
]);

// Update metrics values from analysis
function updateMetricsFromAnalysis() {
  if (!props.analysis?.results) return;
  
  metrics.value[0].value = props.analysis.results.overallScore || 0;
  metrics.value[1].value = props.analysis.results.clarity?.score || 0;
  metrics.value[2].value = props.analysis.results.engagement?.score || 0;
  metrics.value[3].value = props.analysis.results.sentiment?.score || 0;
}

// Toggle metric visibility
function toggleMetric(metricId) {
  const metricIndex = metrics.value.findIndex(m => m.id === metricId);
  if (metricIndex !== -1) {
    metrics.value[metricIndex].visible = !metrics.value[metricIndex].visible;
    createChart();
  }
}

// Filtered metrics for chart data
const visibleMetrics = computed(() => {
  return metrics.value.filter(metric => metric.visible);
});

// Generate chart data based on visible metrics
function getChartData() {
  const labels = visibleMetrics.value.map(m => m.label);
  const data = visibleMetrics.value.map(m => m.value);
  const backgroundColor = visibleMetrics.value.map(m => m.color);
  const borderColor = visibleMetrics.value.map(m => m.borderColor);
  
  // Prepare data for chart based on chart type
  return {
    labels,
    datasets: [
      {
        label: 'Score',
        data,
        backgroundColor,
        borderColor,
        borderWidth: 2,
        borderRadius: chartType.value === 'bar' ? 8 : 0,
        borderSkipped: false,
        pointBackgroundColor: borderColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: borderColor,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: chartType.value === 'radar' ? true : false,
        tension: 0.1,
      },
    ],
  };
}

// Create chart
function createChart() {
  if (!chartCanvas.value || !props.analysis?.results) return;

  // Update metrics from analysis
  updateMetricsFromAnalysis();

  const ctx = chartCanvas.value.getContext("2d");
  const data = getChartData();

  // Base options for all chart types
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}/100`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  // Chart type specific options
  let chartOptions = {};

  if (chartType.value === 'bar') {
    chartOptions = {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: "#6B7280",
            font: {
              size: 12,
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#6B7280",
            font: {
              size: 12,
              weight: "500",
            },
          },
        },
      },
    };
  } else if (chartType.value === 'radar') {
    chartOptions = {
      ...baseOptions,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            backdropColor: 'transparent',
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
          angleLines: {
            color: "rgba(0, 0, 0, 0.1)",
          },
          pointLabels: {
            color: "#6B7280",
            font: {
              size: 12,
            },
          },
        },
      },
    };
  } else if (chartType.value === 'polarArea') {
    chartOptions = {
      ...baseOptions,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            backdropColor: 'transparent',
            display: false,
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
      },
    };
  }

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create new chart with animation
  chartInstance = new Chart(ctx, {
    type: chartType.value,
    data,
    options: chartOptions,
  });
}

// Watch for analysis changes
watch(
  () => props.analysis,
  async () => {
    await nextTick();
    updateMetricsFromAnalysis();
    createChart();
  },
  { immediate: true }
);

onMounted(() => {
  updateMetricsFromAnalysis();
  createChart();
});
</script>
