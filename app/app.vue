<template>
  <div class="app-layout">
    <!-- Nuxt 4 Route Announcer -->
    <NuxtRouteAnnouncer />
    
    <!-- Lawyer Dom Global Header -->
    <LawHeader @reset-search="handleReset" />

    <!-- Main Page view wrapper -->
    <div class="page-viewport">
      <NuxtPage 
        ref="pageRef"
        @search-triggered="handleSearchTriggered"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const pageRef = ref<any>(null);

// Reset search state on header logo/new search button click
function handleReset() {
  if (pageRef.value && typeof pageRef.value.resetState === 'function') {
    pageRef.value.resetState();
  }
}

function handleSearchTriggered(q: string) {
  console.log(`Search triggered global intercept: ${q}`);
}
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-main);

  .page-viewport {
    flex: 1;
    width: 100%;
  }
}
</style>

