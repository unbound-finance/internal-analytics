import getMintsQuery from '~/apollo/queries/getMints'
import getBurnsQuery from '~/apollo/queries/getBurns'

export async function getMints(apollo, pair, timestamp) {
  const {
    data: { mints },
  } = await apollo.query({
    query: getMintsQuery,
    variables: { pair, timestamp },
  })
  if (mints.length > 0) {
    return mints.concat(
      await getMints(
        apollo,
        pair,
        Number(mints[mints.length - 1].timestamp) + 1
      )
    )
  } else {
    return mints
  }
}

export async function getBurns(apollo, pair, timestamp) {
  const {
    data: { burns },
  } = await apollo.query({
    query: getBurnsQuery,
    variables: { pair, timestamp },
  })
  if (burns.length > 0) {
    return burns.concat(
      await getBurns(
        apollo,
        pair,
        Number(burns[burns.length - 1].timestamp) + 1
      )
    )
  } else {
    return burns
  }
}
