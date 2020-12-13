<template>
  <button @click="showNewResultForm = !showNewResultForm">{{ showNewResultForm ? "Schliessen" : "Neue Resultate" }}</button>
  <new-result-form @close="addPoints" :players="players" v-if="showNewResultForm" />
  <canvas id="chartTotal" width="200" height="200"></canvas>
  <canvas id="chartTotalTime" width="200" height="200"></canvas>
  <players :players="players" />
</template>

<script>
import NewResultForm from "./components/NewResultForm.vue";
import Chart from "chart.js";
import Players from "./components/Players.vue";

const players = [
  { color: "rgba(255, 99, 132, 0.2)", newPoints: 0, points: [7, 3], name: "Tobi", text: "I cha Chance Time ned!" },
  { color: "rgba(54, 162, 235, 0.2)", newPoints: 0, points: [11, 4], name: "Michi", text: "Wer het iez de Donkey Kong gno?!" },
  { color: "rgba(255, 206, 86, 0.2)", newPoints: 0, points: [9, 5], name: "Joni", text: "I glaub mis Grätli esch kabott!" },
  { color: "rgba(75, 192, 192, 0.2)", newPoints: 0, points: [2, 3], name: "Römu", text: "Wer het s'letscht mol gonne?" },
];

export default {
  name: "App",
  components: {
    NewResultForm,
    Players,
  },
  data() {
    return {
      players: players,
      showNewResultForm: false,
      chart1: null,
      chart2: null,
    };
  },
  methods: {
    addPoints(newPoints) {
      const currentPoints = this.chart1.data.datasets[0].data;

      let i;
      for (i = 0; i < currentPoints.length; i++) {
        currentPoints[i] += newPoints[i];
        const currentSummed = this.chart2.data.datasets[i].data;
        currentSummed.push(currentSummed[currentSummed.length - 1] + newPoints[i]);
      }
      this.chart2.data.labels.push(this.chart2.data.labels[this.chart2.data.labels.length - 1] + 1);
      this.chart1.update();
      this.chart2.update();
      this.showNewResultForm = !this.showNewResultForm;
      this.players.forEach((p) => (p.newPoints = 0));
      // store on DB TODO
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
    // createChartTotalTime() {
    //   var ctx = document.getElementById("chartTotalTime");

    //   new Chart(ctx, {
    //     type: "line",
    //     data: {
    //       labels: this.players.map((p) => p.name),
    //       datasets: [
    //         {
    //           label: "Punkte",
    //           data: this.players.map((p) => p.points),
    //           backgroundColor: this.players.map((p) => p.color),
    //         },
    //       ],
    //     },
    //   });
    // },
  },
  mounted() {
    Chart.defaults.global.defaultFontSize = 12;
    this.createChartTotal();
    this.createChartTotalTime();
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
</style>
