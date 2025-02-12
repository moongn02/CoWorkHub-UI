<template>
  <div class="blank-layout">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BlankLayout'
})
</script>

<style scoped>
.blank-layout {
  height: 100%;
  width: 100%;
}
</style>
