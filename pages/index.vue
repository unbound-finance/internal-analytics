<template>
  <div class="container">
    <form @submit.prevent="fetchData">
      <select id="pools" v-model="pair" name="pools">
        <option v-for="p in pools" :key="p.address" :value="p.address">
          {{ p.name }}
        </option>
      </select>
      <input v-model="blocks" type="number" placeholder="Last blocks" />
      <span style="font-size: 8pt">OR</span>
      <input v-model="date" type="date" placeholder="Select Date" />
      <button type="submit">Search</button>
    </form>
    <div v-if="loading">Loading...</div>
    <div v-else style="margin-top: 2rem">
      <ul>
        <li :title="analytics.totalMints">
          Total Adds: ${{ nFormatter(analytics.totalMints, 2) }}
        </li>
        <li :title="analytics.totalBurns">
          Total Removes: ${{ nFormatter(analytics.totalBurns, 2) }}
        </li>
        <li :title="analytics.totalLiq">
          Total Liquidity: ${{ nFormatter(analytics.totalLiq, 2) }}
        </li>
        <li :title="analytics.minLiq">
          Min. Liquidity: ${{ nFormatter(analytics.minLiq, 2) }}
        </li>
        <li :title="analytics.maxLiq">
          Max. Liquidity: ${{ nFormatter(analytics.maxLiq, 2) }}
          <button @click="showTop10 = !showTop10">
            {{ showTop10 ? 'hide' : 'show' }} top 10
          </button>
        </li>
        <template v-if="showTop10">
          <ol style="padding: 1rem 2rem">
            <li
              v-for="liq in analytics.top10"
              :key="liq.timestamp"
              :title="liq.amountUSD"
            >
              {{ nFormatter(Number(liq.amountUSD) || 0, 2) }}
            </li>
          </ol>
        </template>
        <li :title="analytics.minPrice">
          Min. Price: ${{ nFormatter(analytics.minPrice, 2) }}
        </li>
        <li :title="analytics.maxPrice">
          Max. Price: ${{ nFormatter(analytics.maxPrice, 2) }}
        </li>
      </ul>
    </div>
    <div class="chart">
      <!-- <LineChart
        v-if="liquidityData.datasets.length > 0"
        :data="liquidityData"
        :options="lineChartOptions"
        style="width: 50%"
      /> -->
      <LineChart
        v-if="priceData.datasets.length > 0"
        :data="priceData"
        :options="lineChartOptions"
        style="width: 50%"
      />
    </div>
  </div>
</template>

<script>
import LineChart from '~/components/Chart/LineChart'

import { getMints, getBurns } from '~/services/liquidity.service.js'
import { getPrice } from '~/services/price.service.js'

import { nFormatter } from '~/utils'

export default {
  components: { LineChart },
  data() {
    return {
      loading: false,
      showTop10: false,
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
        top10: [],
      },

      pools: [
        {
          name: 'DAI-USDT',
          address: '0xb20bd5d04be54f870d5c0d3ca85d82b34b836405',
        },
        {
          name: 'DAI-USDC',
          address: '0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5',
        },
        {
          name: 'USDC-USDT',
          address: '0x3041cbd36888becc7bbcbc0045e3b1f144466f5f',
        },
        {
          name: 'DAI-ETH',
          address: '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11',
        },
        {
          name: 'USDC-ETH',
          address: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
        },
        {
          name: 'USDT-ETH',
          address: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
        },
      ],

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
    nFormatter,
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
      this.liquidityData.labels = []
      this.liquidityData.datasets = []
      this.priceData.labels = []
      this.priceData.datasets = []
      this.loading = true
      const uniMints = await getMints(this.$apollo, this.pair, this.timestamp)
      const uniBurns = await getBurns(this.$apollo, this.pair, this.timestamp)
      const uniPrice = await getPrice(this.$apollo, this.pair, this.timestamp)

      if (uniMints.length > 0 && uniBurns.length > 0) {
        const sortedMints =
          uniMints.sort((a, b) => Number(a.amountUSD) - Number(b.amountUSD)) ||
          []

        const mintAmount =
          (await Promise.all(
            uniMints.map((a) => {
              return Number(a.amountUSD)
            })
          )) || []
        const burnAmount =
          (await Promise.all(
            uniBurns.map((a) => {
              return Number(a.amountUSD)
            })
          )) || []

        this.analytics.totalMints =
          sortedMints.reduce(
            (total, obj) => Number(obj.amountUSD) + total || 0,
            0
          ) || 0
        this.analytics.totalBurns =
          uniBurns.reduce(
            (total, obj) => Number(obj.amountUSD) + total || 0,
            0
          ) || 0
        this.analytics.totalLiq =
          this.analytics.totalMints - this.analytics.totalBurns

        this.analytics.minLiq = Number(sortedMints[0].amountUSD).toFixed(2) || 0
        this.analytics.maxLiq =
          Number(sortedMints[sortedMints.length - 1].amountUSD).toFixed(2) || 0
        this.analytics.top10 = uniMints
          .slice(Math.max(uniMints.length - 10, 0))
          .reverse()
        this.analytics.tenMillionTx = sortedMints.find(
          (x) => (Number(x.amountUSD) || 0) >= 10000000
        )
          ? sortedMints.find((x) => Number(x.amountUSD) >= 10000000)
          : false

        this.liquidityData.labels =
          (await Promise.all(
            uniMints.map((a) => {
              return this.$dayjs.unix(a.timestamp).format('DD-MM-YYYY HH:mm')
            })
          )) || []

        this.liquidityData.datasets.push(
          {
            label: 'Adds',
            data: mintAmount,
            borderColor: '#3861fb',
            backgroundColor: '#ffffff00',
          },
          {
            label: 'Burns',
            data: burnAmount,
            borderColor: '#ffbb1f',
            backgroundColor: '#ffffff00',
          }
        )

        if (uniPrice.length > 0) {
          const lptPrice =
            (await Promise.all(
              uniPrice.map((a) => {
                return Number(a.reserve0 * 2) / Number(a.totalSupply)
              })
            )) || []

          const sortedPrice =
            (
              await Promise.all(
                uniPrice.map((a) => {
                  return Number(a.reserve0 * 2) / Number(a.totalSupply)
                })
              )
            ).sort((a, b) => Number(a) - Number(b)) || []

          this.analytics.minPrice = Number(sortedPrice[0]).toFixed(2) || 0
          this.analytics.maxPrice =
            Number(sortedPrice[sortedPrice.length - 1]).toFixed(2) || 0

          this.priceData.labels =
            (await Promise.all(
              uniPrice.map((a) => {
                return this.$dayjs.unix(a.date).format('DD-MM-YYYY')
              })
            )) || []
          this.priceData.datasets.push({
            label: 'Price',
            data: lptPrice,
            borderColor: '#1dc683',
            backgroundColor: '#ffffff00',
          })
        }
        this.loading = false
      } else {
        this.loading = false
      }
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
