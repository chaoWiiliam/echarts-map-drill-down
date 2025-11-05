<!-- src/components/Map.vue -->
<template>
  <div ref="mapContainer" class="map-chart"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
// import * as echarts from 'echarts'
import cityMapByName from '@/assets/json/cityMapByNameSimple.json'
import cityMapByCode from '@/assets/json/cityMapByCodeSimple.json'
import STATIC_DATA from '@/data/staticData'
import getJson from '@/utils/getJson'
import judgeArea from '@/utils/judgeArea'

const emit = defineEmits(['area-change'])

const mapContainer = ref(null)
const mapIns = ref(null)
let watcher = null

// 区域信息
let areaInfo = {}
let prevAdcode = null
let provName = null
let cityName = null
let districtName = null

// 初始化地图
const initMap = () => {
  if (!mapContainer.value) return

  mapContainer.value.style.width = '100%'
  mapContainer.value.style.height = window.innerHeight - 56 * 2 + 'px'

  // 创建 watcher
  createWatcher()

  // 初始化地图
  watcher.adcode = '100000'
}

// 创建 watcher
const createWatcher = () => {
  watcher = new Proxy(
    {
      adcode: null,
    },
    {
      get(target, key) {
        return target[key]
      },
      set(target, key, value) {
        target[key] = value
        handleAreaChange()
        return true
      },
    }
  )
}

// 处理区域变化
const handleAreaChange = async () => {
  areaInfo = judgeArea(watcher.adcode)

  // 获取省市区三级全称
  getNames()

  // 控制地图生成
  await mapController()

  // 发送事件到父组件
  emit('area-change', areaInfo)
}

// 控制地图生成
const mapController = async () => {
  if ([0, 1].includes(areaInfo.districtRank)) {
    prevAdcode = STATIC_DATA.CHINA_ADCODE
    await pipeLine()
  } else if ([2, 3].includes(areaInfo.districtRank)) {
    if (areaInfo.isSpecialArea) {
      prevAdcode = STATIC_DATA.CHINA_ADCODE
    } else {
      prevAdcode = areaInfo.provAdcode
    }
    // 仅点击市级可下钻
    if (areaInfo.districtRank == 2) {
      await pipeLine()
    }
  }
}

// 获取名称
const getNames = () => {
  [provName, cityName, districtName] = [
    areaInfo.provAdcode ? cityMapByCode[areaInfo.provAdcode] : '',
    areaInfo.cityAdcode ? cityMapByCode[areaInfo.cityAdcode] : '',
    areaInfo.districtAdcode ? cityMapByCode[areaInfo.districtAdcode] : '',
  ]
}

// 管道流程
const pipeLine = async () => {
  try {
    const mapJson = await getJson(watcher.adcode)
    initMapChart(mapJson)
  } catch (error) {
    console.error('获取地图数据失败:', error)
  }
}

// 初始化 echarts 地图
const initMapChart = (mapJson) => {
  if (!mapIns.value) {
    mapIns.value = echarts.init(mapContainer.value)

    mapIns.value.on('click', (params) => {
      const adcode = cityMapByName[params.name]
      if (adcode) {
        watcher.adcode = adcode
      }
    })
  }

  echarts.registerMap('统计地图', mapJson)

  // 使用 merge 模式更新配置
  mapIns.value.setOption({
    tooltip: {
      show: true,
      trigger: 'item',
      formatter(v) {
        return `${v.name}`
      },
      backgroundColor: 'rgba(0,0,0,.5)',
      borderColor: 'transparent',
      textStyle: {
        color: '#fff',
        fontSize: '14',
      },
    },

    series: [
      {
        layoutCenter: ['50%', '50%'],
        layoutSize: '100%',
        type: 'map',
        map: '统计地图',
        roam: true,
        zoom: 1,
        center: null,
        label: {                     // 添加这一部分来控制文字显示
          show: true,                // 显示标签
          color: '#000000',          // 设置文字颜色为黑色
          fontSize: 12,              // 可选：设置字体大小
        },
        itemStyle: {
          borderWidth: '2',
          color: 'green',
          borderColor: '#fff',
        },
        emphasis: {
          label: {
            show: true,              // 高亮时也显示标签
            color: '#000000',        // 高亮时文字颜色为黑色
          },
        },
        select: {
          label: {
            show: true,              // 选中时也显示标签
            color: '#000000',        // 选中时文字颜色为黑色
          },
        },
        data: [],
      },
    ]
  }, { replaceMerge: ['series'] })

  // 确保地图正确渲染后调整大小
  setTimeout(() => {
    if (mapIns.value) {
      mapIns.value.resize()
    }
  }, 100)
}

// 返回上一级
const goBack = () => {
  if (prevAdcode) {
    watcher.adcode = prevAdcode
  }
}

// 组件卸载时销毁 echarts 实例
onUnmounted(() => {
  if (mapIns.value) {
    mapIns.value.dispose()
  }
})

// 暴露方法给父组件
defineExpose({
  initMap,
  goBack
})

onMounted(() => {
  initMap()
  const handleResize = () => {
    if (mapIns.value) {
      mapContainer.value.style.height = window.innerHeight - 56 * 2 + 'px'
      mapIns.value.resize()
    }
  }

  window.addEventListener('resize', handleResize)

  // 组件卸载时清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})
</script>

<style scoped>
.map-chart {
  width: 100%;
  height: 100%;
}
</style>