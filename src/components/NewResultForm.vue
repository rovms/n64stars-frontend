<template>
  <form v-on:submit.prevent="onSubmit">
    <div v-for="player in players" :key="player.name">
      <label class="label" :for="player.name">{{ player.name }}</label>
      <input class="input" :name="player.name" :id="player.name" type="number" v-model="player.newPoints" />
    </div>
    <button class="button" type="submit">Speichern</button>
  </form>
</template>

<script>
export default {
  name: "NewResultForm",
  props: {
    players: Array,
  },
  methods: {
    onSubmit() {
      const pointsPerPlayer = [];
      this.players.forEach((p) => {
        pointsPerPlayer.push({
          playerId: p._id,
          newPoints: p.newPoints || 0,
        });
      });
      this.$emit("close", pointsPerPlayer);
    },
  },
};
</script>

<style scoped>
.label {
  text-align: right;
}

.input {
  border: 1px;
  border-color: black;
}
</style>
