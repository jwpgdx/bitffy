<template>
  <div class="absolute left-0 top-0 z-0 h-fit w-full max-w-[100vw] overflow-hidden">
    <div class="background-wrapper">
    <img
      class="mobile-scale object-cover"
      :src="`/images/background-gradient-0${background}.webp`"
      decoding="async"
      @load="onLoad"
    />
  </div>
    <div
      v-if="loaded"
      class="absolute bottom-0 left-0 right-0 top-0 flex-none overflow-visible opacity-20 mix-blend-soft-light"
    >
      <div
        class="absolute bottom-0 left-0 right-0 top-0 border-0 bg-center bg-repeat"
        style="
          border-radius: inherit;
          background-size: 420px auto;
          background-image: url(/images/background-filter.webp);
        "
      ></div>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ background?: number }>();
const background = props.background ?? 1;
import { ref } from "vue";
const loaded = ref(false);
const onLoad = () => {
  loaded.value = true;
};
</script>

<style lang="scss" scoped>
.background-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 300vw;
  height: fit-content;
  @include desktop {
    width: 100%;
  }
}
.mobile-scale {
  position: relative;
  display: block;
  width: 100%;
  height: auto;


}
</style>
