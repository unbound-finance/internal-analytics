<template>
  <div class="container">
    <form @submit.prevent="fetchData">
      <input v-model="pair" type="text" placeholder="Pair Address" />
      <input v-model="blocks" type="number" placeholder="Last blocks" />
      <span style="font-size: 8pt">OR</span>
      <input v-model="date" type="date" placeholder="Select Date" />
      <button type="submit">Search</button>
    </form>
    <div v-if="loading">Loading...</div>
    <div v-else style="margin-top: 2rem">
      <ul>
        <li>Total Adds: ${{ analytics.totalMints.toFixed(2) }}</li>
        <li>Total Removes: ${{ analytics.totalBurns.toFixed(2) }}</li>
        <li>Total Liquidity: ${{ analytics.totalLiq.toFixed(2) }}</li>
        <li>Min. Liquidity: ${{ analytics.minLiq }}</li>
        <li>Max. Liquidity: ${{ analytics.maxLiq }}</li>
        <li>10M transaction: {{ analytics.tenMillionTx }}</li>
        <li>Min. Price: ${{ analytics.minPrice }}</li>
        <li>Max. Price: ${{ analytics.maxPrice }}</li>
      </ul>
    </div>
    <!-- <div class="chart">
      <LineChart
        :data="liquidityData"
        :options="lineChartOptions"
        style="width: 50%"
      />
      <LineChart
        :data="priceData"
        :options="lineChartOptions"
        style="width: 50%"
      />
    </div> -->
  </div>
</template>

<script>
// import LineChart from '~/components/Chart/LineChart'

import { getMints, getBurns } from '~/services/liquidity.service.js'
import { getPrice } from '~/services/price.service.js'

export default {
  data() {
    return {
      loading: false,
      pair: '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11',
      timestamp: null,
      blocks: null,
      date: null,
      analytics: {
        totalMints: 0,
        totalBurns: 0,
        totalLiq: 0,
        minLiq: 0,
        maxLiq: 0,
        tenMillionTx: false,
        minPrice: 0,
        maxPrice: 0,
      },

      priceData: {
        labels: [],
        datasets: [],
      },
      liquidityData: {
        labels: [],
        datasets: [],
      },
      lineChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
    }
  },
  watch: {
    blocks(newBlock) {
      this.date = null
      this.timestamp = this.blockTimestamp(newBlock)
    },
    date(newDate) {
      this.blocks = null
      this.timestamp = this.dateToEpoch(newDate)
    },
  },
  methods: {
    blockTimestamp(blocks) {
      const now = new Date()
      const epoch = Math.round(now.getTime() / 1000) // get epoch of current time
      const perBlockTime = 13 // source: etherscan.io
      return epoch - blocks * perBlockTime
    },
    dateToEpoch(date) {
      return Math.round(new Date(date).valueOf() / 1000)
    },
    // async fetchData() {
    //   if (this.mints.length > 0 && this.burns.length > 0) {
    //     const uniMints = await Promise.all(
    //       this.mints.map((a) => {
    //         return Number(a.amountUSD)
    //       })
    //     )
    //     const uniBurns = await Promise.all(
    //       this.burns.map((a) => {
    //         return Number(a.amountUSD)
    //       })
    //     )

    //     const sortedMints = uniMints.sort((a, b) => a - b)

    //     this.analytics.tenMillionTx = sortedMints.find((x) => x >= 10000000)
    //       ? sortedMints.find((x) => x >= 10000000)
    //       : false
    //     this.analytics.totalMints = sortedMints.reduce((a, b) => a + b || 0, 0)
    //     this.analytics.totalBurns = (
    //       await Promise.all(
    //         this.burns.map((a) => {
    //           return Number(a.amountUSD)
    //         })
    //       )
    //     ).reduce((a, b) => a + b || 0, 0)
    //     this.analytics.totalLiq =
    //       this.analytics.totalMints - this.analytics.totalBurns
    //     this.analytics.minLiq = sortedMints[0].toFixed(2)
    //     this.analytics.maxLiq = sortedMints[sortedMints.length - 1].toFixed(2)

    //     this.liquidityData.labels = await Promise.all(
    //       this.mints.map((a) => {
    //         return this.$dayjs.unix(a.timestamp).format('DD-MM-YYYY HH:mm')
    //       })
    //     )
    //     this.liquidityData.datasets.push(
    //       {
    //         label: 'Adds',
    //         data: uniMints,
    //         borderColor: '#3861fb',
    //         backgroundColor: '#ffffff00',
    //       },
    //       {
    //         label: 'Burns',
    //         data: uniBurns,
    //         borderColor: '#ffbb1f',
    //         backgroundColor: '#ffffff00',
    //       }
    //     )
    //   }
    //   if (this.pairDayDatas.length > 0) {
    //     const uniPrice = await Promise.all(
    //       this.pairDayDatas.map((a) => {
    //         return Number(a.reserve0 * 2) / Number(a.totalSupply)
    //       })
    //     )
    //     const sortedPrice = uniPrice.sort((a, b) => a - b)

    //     this.analytics.minPrice = sortedPrice[0].toFixed(2)
    //     this.analytics.maxPrice = sortedPrice[sortedPrice.length - 1].toFixed(2)

    //     this.priceData.labels = await Promise.all(
    //       this.pairDayDatas.map((a) => {
    //         return this.$dayjs.unix(a.date).format('DD-MM-YYYY')
    //       })
    //     )
    //     this.priceData.datasets.push({
    //       label: 'Price',
    //       data: uniPrice,
    //       borderColor: '#1dc683',
    //       backgroundColor: '#ffffff00',
    //     })
    //   }
    // },

    async fetchData() {
      this.loading = true
      const uniMints = await getMints(this.$apollo, this.pair, this.timestamp)
      const uniBurns = await getBurns(this.$apollo, this.pair, this.timestamp)
      const uniPrice = await getPrice(this.$apollo, this.pair, this.timestamp)

      const sortedMints = uniMints.sort(
        (a, b) => Number(a.amountUSD) - Number(b.amountUSD)
      )

      const sortedPrice = (
        await Promise.all(
          uniPrice.map((a) => {
            return Number(a.reserve0 * 2) / Number(a.totalSupply)
          })
        )
      ).sort((a, b) => Number(a) - Number(b))

      this.analytics.totalMints = sortedMints.reduce(
        (total, obj) => Number(obj.amountUSD) + total || 0,
        0
      )
      this.analytics.totalBurns = uniBurns.reduce(
        (total, obj) => Number(obj.amountUSD) + total || 0,
        0
      )
      this.analytics.totalLiq =
        this.analytics.totalMints - this.analytics.totalBurns

      this.analytics.minLiq = Number(sortedMints[0].amountUSD).toFixed(2)
      this.analytics.maxLiq = Number(
        sortedMints[sortedMints.length - 1].amountUSD
      ).toFixed(2)
      this.analytics.tenMillionTx = sortedMints.find(
        (x) => Number(x.amountUSD) >= 10000000
      )
        ? sortedMints.find((x) => Number(x.amountUSD) >= 10000000)
        : false

      this.analytics.minPrice = Number(sortedPrice[0]).toFixed(2)
      this.analytics.maxPrice = Number(
        sortedPrice[sortedPrice.length - 1]
      ).toFixed(2)
      this.loading = false
    },
  },
}
</script>

<style>
.container {
  padding: 1rem;
}
.chart {
  display: flex;
  align-items: center;
}
</style>
