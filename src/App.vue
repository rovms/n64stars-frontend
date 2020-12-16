<template>
  <div class="loading-container" v-if="loadingPage">
    <div class="center-title">
      <h1>Loading...</h1>
    </div>
  </div>
  <div class="gaggi" v-if="!loadingPage">
    <button v-if="!showNewResultForm" class="button nrbutton pulsate" @click="showNewResultForm = true">Neue Resultate</button>
    <new-result-form class="nrform" @abort="showNewResultForm = false" @close="addPoints" :players="players" v-if="showNewResultForm" />
    <div class="chart-container">
      <canvas class="chart" id="chartTotalTime" width="200" height="200"></canvas>
      <canvas class="chart" id="chartTotal" width="200" height="200"></canvas>
    </div>
  </div>
</template>

<script>
import NewResultForm from "./components/NewResultForm.vue";
import Chart from "chart.js";
import axios from "axios";

export default {
  name: "App",
  components: {
    NewResultForm,
  },
  data() {
    return {
      loadingPage: true,
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
        p.newPoints = null;
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

      let datasets = [];

      this.players.forEach((p) => {
        datasets.push({
          label: p.name,
          data: p.points,
          backgroundColor: p.color,
          borderColor: "rgb(0,0,0)",
          borderWidth: 1,
        });
      });

      this.chart1 = new Chart(ctx, {
        type: "bar",

        data: {
          datasets: datasets,
        },
        options: {
          responsive: true,
          title: {
            display: true,
            text: "Total",
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
          borderWidth: 1,
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
          legend: {
            labels: {
              generateLabels: (chart) => {
                return chart.data.datasets.map((ds, i) => {
                  console.log(i);
                  return {
                    text: ds.label,
                    fillStyle: ds.backgroundColor,
                    strokeStyle: "rgb(0,0,0",
                    lineWidth: 1,
                  };
                });
              },
            },
          },
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
        .then(() => {
          setTimeout(() => {
            this.loadingPage = false;
          }, 500);
        })
        .catch((error) => alert(error));
    },
  },
  created() {
    Chart.defaults.global.defaultFontSize = 12;
    Chart.defaults.global.title.fontSize = 16;

    this.fetchPlayers();
    setTimeout(() => {
      this.createChartTotal();
      this.createChartTotalTime();
    }, 1000);
  },
};
</script>
