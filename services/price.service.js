import getPriceQuery from '~/apollo/queries/getPrice'

export async function getPrice(apollo, pair, timestamp) {
  const {
    data: { pairDayDatas },
  } = await apollo.query({
    query: getPriceQuery,
    variables: { pair, timestamp },
  })
  if (pairDayDatas.length > 0) {
    return pairDayDatas.concat(
      await getPrice(
        apollo,
        pair,
        Number(pairDayDatas[pairDayDatas.length - 1].date) + 1
      )
    )
  } else {
    return pairDayDatas
  }
}
