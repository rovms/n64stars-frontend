<template>
  <form>
    <button class="button nrbutton pulsate" @click="$emit('abort')">Abbrechen</button>
    <button class="button sbutton pulsate" @click="onSubmit">Speichern</button>
    <div class="container" v-for="player in players" :key="player.name">
      <label class="label" :for="player.name">{{ player.name }}</label>
      <input class="input" placeholder="..." :name="player.name" :id="player.name" type="number" v-model="player.newPoints" />
    </div>
  </form>
</template>

<script>
export default {
  name: "NewResultForm",
  props: {
    players: Array,
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
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
.container {
  display: flex;
  /* justify-content: center; */
  justify-content: space-between;
  margin-right: 7rem;
  margin-left: 7rem;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.label {
  margin-right: 5px;
}

.input {
  font-family: supermario;
  text-align: center;
  max-width: 50px;
  -webkit-text-stroke: 0px black;
  border-radius: 4px;
}

.sbutton {
  margin-top: 10px;
  color: greenyellow;
  background-color: rgb(204, 255, 204);
  border-color: #00cc00;
}
</style>
