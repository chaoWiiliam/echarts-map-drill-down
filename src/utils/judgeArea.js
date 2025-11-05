import STATIC_DATA from '@/data/staticData'

let [provAdcode, cityAdcode, districtAdcode, districtRank, isSpecialArea] = [
  ...Array(4).fill(null),
  false,
]

function judgeArea(adcode) {
  adcode = adcode + ''

  let result = null
  if (adcode === '100000') {
    result = [...Array(3).fill(null), 0, false]
  } else if (/^\d{2}0{4}$/.test(adcode)) {
    if (STATIC_DATA.SPECIAL_AREA.includes(adcode)) {
      result = [adcode, adcode, null, 1, true]
    } else {
      result = [adcode, null, null, 1, false]
    }
  } else if (/^\d{4}0{2}$/.test(adcode)) {
    result = [adcode.substring(0, 2) + '0000', adcode, null, 2, isSpecialArea]
  } else {
    result = [
      adcode.substring(0, 2) + '0000',
      adcode.substring(0, 4) + '00',
      adcode,
      3,
      isSpecialArea,
    ]
  }

  ;[provAdcode, cityAdcode, districtAdcode, districtRank, isSpecialArea] = result

  return {
    provAdcode,
    cityAdcode,
    districtAdcode,
    districtRank,
    isSpecialArea,
  }
}

export default judgeArea