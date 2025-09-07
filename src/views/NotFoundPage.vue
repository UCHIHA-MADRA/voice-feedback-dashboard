<!-- src/views/NotFoundPage.vue -->
<template>
  <AppLayout>
    <div class="min-h-96 flex items-center justify-center">
      <div class="text-center">
        <div class="text-9xl font-bold text-blue-600 mb-4">404</div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p class="text-xl text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <router-link to="/" class="btn-primary"> Go Home </router-link>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
</script>
