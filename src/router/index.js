import { createRouter, createWebHistory } from "vue-router";
import { useAnalysisStore } from "@/stores/analysis";

// Lazy load components for better performance
const Analysis = () => import("@/views/Analysis.vue");
const DashboardPage = () => import("@/views/DashboardPage.vue");
const HistoryPage = () => import("@/views/HistoryPage.vue");
const NotFoundPage = () => import("@/views/NotFoundPage.vue");

const routes = [
  {
    path: "/analysis",
    name: "analysis",
    component: Analysis,
    meta: {
      title: "Analysis Dashboard",
      description: "View your analysis results and insights",
      requiresAnalysis: true,
    },
  },
  {
    path: "/",
    name: "dashboard",
    component: DashboardPage,
    meta: {
      title: "AI Voice & File Analysis",
      description: "Upload or record audio files for AI-powered analysis",
    },
  },
  {
    path: "/history",
    name: "history",
    component: HistoryPage,
    meta: {
      title: "Analysis History",
      description: "Browse your previous analysis sessions",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundPage,
    meta: {
      title: "Page Not Found",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation guards
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = to.meta.title
    ? `${to.meta.title} | AI Voice Analysis`
    : "AI Voice Analysis";

  // Set meta description
  if (to.meta.description) {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", to.meta.description);
    }
  }

  // Check if route requires analysis data
  if (to.meta.requiresAnalysis) {
    const analysisStore = useAnalysisStore();
    // Allow navigation to analysis page even without current analysis
    // This will show the empty state in the Analysis component
    next();
    return;
  }

  next();
});

// Global navigation error handling
router.onError(function (error) {
  console.error("Router error:", error);

  // Navigate to error page or home
  router.push({ name: "dashboard" });
});

export default router;
