<template>
  <div v-for="player in players" :key="player.name">
    <div>
      {{ player.name }}
    </div>
    <div>
      {{ player.text }}
    </div>
  </div>
</template>

<script>
export default {
  name: "Players",
  props: {
    players: Array,
  },
};
</script>

<style scoped></style>
