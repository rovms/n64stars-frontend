<template>
  <button class="button" @click="showNewResultForm = !showNewResultForm">{{ showNewResultForm ? "Schliessen" : "Neue Resultate" }}</button>
  <new-result-form @close="addPoints" :players="players" v-if="showNewResultForm" />
  <canvas id="chartTotal" width="200" height="200"></canvas>
  <canvas id="chartTotalTime" width="200" height="200"></canvas>
  <players :players="players" />
</template>

<script>
import NewResultForm from "./components/NewResultForm.vue";
import Chart from "chart.js";
import Players from "./components/Players.vue";
import axios from "axios";

export default {
  name: "App",
  components: {
    NewResultForm,
    Players,
  },
  data() {
    return {
      players: [],
      showNewResultForm: false,
      chart1: null,
      chart2: null,
    };
  },
  methods: {
    addPoints(ppp) {
      const currentPoints = this.chart1.data.datasets[0].data;

      let i;
      for (i = 0; i < currentPoints.length; i++) {
        currentPoints[i] = parseInt(currentPoints[i], 10) + parseInt(ppp[i].newPoints, 10);
        const currentSummed = this.chart2.data.datasets[i].data;
        currentSummed.push(parseInt(currentSummed[currentSummed.length - 1], 10) + parseInt(ppp[i].newPoints, 10));
      }
      this.chart2.data.labels.push(parseInt(this.chart2.data.labels[this.chart2.data.labels.length - 1]) + 1);
      this.chart1.update();
      this.chart2.update();
      this.showNewResultForm = !this.showNewResultForm;
      this.players.forEach((p) => {
        p.newPoints = 0;
      });

      axios
        .post("https://n64-stars.herokuapp.com/api/player", ppp)
        .then((res) => {
          if (res.status !== 200) alert("something went wrong");
        })
        .catch((error) => alert(error));
    },
    getTimeSum(pts) {
      const summedPoints = [];
      let sum = 0;
      let pt;
      for (pt of pts) {
        sum = sum + pt;
        summedPoints.push(sum);
      }
      return sum;
    },
    createChartTotal() {
      var ctx = document.getElementById("chartTotal");

      this.chart1 = new Chart(ctx, {
        type: "bar",

        data: {
          labels: this.players.map((p) => p.name),
          datasets: [
            {
              label: "Punkte",
              data: this.players.map((p) => p.points.reduce((a, b) => a + b, 0)),
              backgroundColor: this.players.map((p) => p.color),
              borderColor: this.players.map((p) => p.color),
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });
    },
    createChartTotalTime() {
      var ctx = document.getElementById("chartTotalTime");
      const datasets = [];
      let counter;
      const length = this.players[0].points.length;
      const labels = [];
      for (counter = 1; counter <= length; counter++) {
        labels.push(counter);
      }
      this.players.forEach((p) => {
        const summedPoints = [];
        let sum = 0;
        let pt;
        for (pt of p.points) {
          sum = sum + pt;
          summedPoints.push(sum);
        }

        const dataset = {
          label: p.name,
          backgroundColor: p.color,
          borderColor: p.color,
          data: summedPoints,
          fill: false,
          lineTension: 0,
        };

        datasets.push(dataset);
      });

      this.chart2 = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
          responsive: true,
          title: {
            display: true,
            text: "Entwicklung",
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });
    },
    fetchPlayers() {
      axios
        .get("https://n64-stars.herokuapp.com/api/player")
        .then((response) => {
          console.log(response.data);
          this.players = response.data;
        })
        .catch((error) => alert(error));
    },
  },
  created() {
    Chart.defaults.global.defaultFontSize = 12;
    this.fetchPlayers();
    setTimeout(() => {
      this.createChartTotal();
      this.createChartTotalTime();
    }, 1000);
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#button {
  background-color: white;
  color: black;
  border: 2px solid black;
}
</style>
