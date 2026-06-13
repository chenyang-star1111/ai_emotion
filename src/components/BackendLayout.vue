<template>
  <div class="backend-layout">
    <Sidebar />
    <div class="main-container">
      <Navbar />
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'
</script>

<style scoped>
.backend-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.main-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.main-content {
  flex: 1;
  background-color: #f1f4f6;
  padding: 20px;
  overflow-y: auto;
}
</style>
