<template>
  <div class="container">
    <div v-if="isLoading">Auf Server warten...</div>
    <div v-if="!isLoading">
      <button v-if="!showNewResultForm" class="button primary" @add-points="submitPoints" @abort="closeNewPointsForm" @click="showNewResultForm = true">
        Resultate erfassen
      </button>
      <form v-if="showNewResultForm">
        <button class="button primary" @click="closeNewPointsForm()" type="button">Abbrechen</button>
        <button class="button success" @click="submitPoints()" type="button">Speichern</button>
        <div class="table-container">
          <table class="result-table">
            <tr v-for="player in players" :key="player">
              <td class="row-name">{{ player.name }}</td>
              <td class="row-points" style="padding: 0.3rem">
                <button class="round" type="button" @click="player.newPoints = player.newPoints <= 1 ? 0 : player.newPoints - 1">-</button>
              </td>
              <td class="row-points">
                <div>{{ player.newPoints || 0 }}</div>
              </td>
              <td class="row-points"><button class="round" type="button" @click="player.newPoints++">+</button></td>
            </tr>
          </table>
        </div>
      </form>
      <div class="chart-container">
        <canvas class="chart" ref="chartTotalTime" width="200" height="200"></canvas>
        <canvas class="chart" ref="chartTotal" width="200" height="200"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js";
import axios from "axios";
import router from "../router";
import authHeader from "../auth";

const API_URL = process.env.VUE_APP_BACKEND_BASE_URL;

export default {
  name: "Home",

  data() {
    return {
      isLoading: true,
      players: [],
      showNewResultForm: false,
      chart1: null,
      chart2: null,
      password: "",
    };
  },
  methods: {
    closeNewPointsForm() {
      this.players.map((player) => (player.newPoints = 0));
      this.showNewResultForm = false;
    },

    submitPoints() {
      for (let p of this.players) {
        console.log(p.newPoints);
      }
      const currentPoints = this.chart1.data.datasets[0].data;
      let i;
      for (i = 0; i < currentPoints.length; i++) {
        currentPoints[i] = parseInt(currentPoints[i], 10) + parseInt(this.players[i].newPoints, 10);
        const currentSummed = this.chart2.data.datasets[i].data;
        currentSummed.push(parseInt(currentSummed[currentSummed.length - 1], 10) + parseInt(this.players[i].newPoints, 10));
      }
      this.chart2.data.labels.push(parseInt(this.chart2.data.labels[this.chart2.data.labels.length - 1]) + 1);
      this.chart1.update();
      this.chart2.update();
      this.showNewResultForm = !this.showNewResultForm;
      this.players.forEach((p) => {
        p.newPoints = null;
      });

      axios
        .post(API_URL + "player", this.players, authHeader())
        .then((res) => {
          if (res.status !== 200) alert("something went wrong");
        })
        .catch((error) => {
          if (error && error.response) {
            if (error.response.status === 401) {
              router.go({ name: "Login" });
            }
          }
          alert(error);
        });
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
      const ctx = this.$refs.chartTotal;
      const labels = [];
      const data = [];
      const backgroundColor = [];
      const borderColors = [];
      this.players.forEach((p) => {
        labels.push(p.name);
        data.push(p.points.reduce((p1, p2) => p1 + p2, 0));
        backgroundColor.push(p.color);
        borderColors.push("rgb(0,0,0)");
      });

      let player;
      const years = [];
      for (player of this.players) {
        let score;
        for (score of player.scores) {
          const year = new Date(score.date).getFullYear();
          if (!years.includes(year)) {
            years.push(year);
          }
          if (player[year]) {
            player[year] += score.amount;
          } else {
            player[year] = score.amount;
          }
        }
      }

      let year;
      const datasets = [];
      for (year of years) {
        const yearDataset = { label: year, backgroundColor: "rgb(10,10,10)", borderColors: "rgb(100,100,100)", borderWidth: 1 };
        yearDataset["data"] = this.players.map((player) => player[year]);
        datasets.push(yearDataset);
      }

      this.chart1 = new Chart(ctx, {
        type: "bar",

        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
          legend: {
            onClick: function (e) {
              e.stopPropagation();
            },
            display: false,
          },
          responsive: true,
          title: {
            display: true,
            text: "Total",
          },
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
            },
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
      const ctx = this.$refs.chartTotalTime;
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
            onClick: function (e) {
              e.stopPropagation();
            },
            labels: {
              generateLabels: (chart) => {
                return chart.data.datasets.map((ds) => {
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
        .get(API_URL + "player", authHeader())
        .then((response) => {
          this.players = response.data;
          this.players.map((player) => {
            player.newPoints = 0;
          });
        })
        .then(() => {
          setTimeout(() => {
            this.isLoading = false;
          }, 50);
        })
        .catch((error) => {
          console.log(error);
          if (error && error.response && error.response.status === 401) {
            setTimeout(() => {
              router.push({ name: "Login" });
            }, 500);
          }
        });
    },

    retrieveData() {
      this.fetchPlayers();
      const MAX_WAIT_TIMES = 10;
      let waitedTimes = 0;
      const interval = setInterval(() => {
        if (this.isLoading) {
          if (waitedTimes >= MAX_WAIT_TIMES) {
            clearInterval(interval);
          }
          waitedTimes++;
        } else {
          this.createChartTotal();
          this.createChartTotalTime();
          clearInterval(interval);
        }
      }, 200);
    },
  },

  created() {
    Chart.defaults.global.defaultFontSize = 12;
    Chart.defaults.global.title.fontSize = 16;

    this.retrieveData();
  },
};
</script>

<style scoped>
.full {
  flex: 0 0 100%;
  display: flex;
  justify-content: center;
}

/* The flip card container - set the width and height to whatever you want. We have added the border property to demonstrate that the flip itself goes out of the box on hover (remove perspective if you don't want the 3D effect */
.flip-card {
  background-color: transparent;
  width: 300px;
  height: 300px;
  border: 1px solid #f1f1f1;
  perspective: 1000px; /* Remove this if you don't want the 3D effect */
}

/* This container is needed to position the front and back side */
.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

/* Do an horizontal flip when you move the mouse over the flip box container */
.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

/* Position the front and back side */
.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden; /* Safari */
  backface-visibility: hidden;
}

/* Style the front side (fallback if image is missing) */
.flip-card-front {
  background-color: #bbb;
  color: black;
}

/* Style the back side */
.flip-card-back {
  background-color: dodgerblue;
  color: white;
  transform: rotateY(180deg);
}
</style>
