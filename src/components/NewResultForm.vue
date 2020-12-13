<template>
  <form v-on:submit.prevent="onSubmit">
    <div v-for="player in players" :key="player.name">
      <label class="label" :for="player.name">{{ player.name }}</label>
      <input class="input" :name="player.name" :id="player.name" type="number" v-model="player.newPoints" />
    </div>
    <button type="submit">Speichern</button>
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
      this.$emit(
        "close",
        this.players.map((p) => p.newPoints)
      );
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
