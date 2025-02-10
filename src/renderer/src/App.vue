<template>
  <div>
    <button @click="generateAndSaveData">生成并保存数据</button>
    <button @click="getCurrentTime">获取当前时间</button>
  </div>
</template>

<script setup>
// 生成心率数据的函数
function generateHeartRateData(durationInSeconds, intervalInSeconds) {
  const data = []
  const startTime = new Date()
  const totalIntervals = Math.floor(durationInSeconds / intervalInSeconds)

  const scenarios = {
    resting: { min: 60, max: 100 },
    exercise: { min: 120, max: 200 },
    sleep: { min: 40, max: 60 },
    walking: { min: 80, max: 120 }
  }

  let currentScenario =
    Object.keys(scenarios)[Math.floor(Math.random() * Object.keys(scenarios).length)]

  for (let i = 0; i < totalIntervals; i++) {
    const currentTime = new Date(startTime.getTime() + i * intervalInSeconds * 1000)
    const formattedTime = currentTime.toLocaleString()

    if (Math.random() < 0.1) {
      const newScenarios = Object.keys(scenarios).filter((scenario) => scenario !== currentScenario)
      currentScenario = newScenarios[Math.floor(Math.random() * newScenarios.length)]
    }

    const { min, max } = scenarios[currentScenario]
    const heartRate = Math.floor(Math.random() * (max - min + 1)) + min
    data.push({ time: formattedTime, heartRate, scenario: currentScenario })
  }

  return data
}

const generateAndSaveData = async () => {
  const heartRateData = generateHeartRateData(300, 5)
  let fileContent = '时间,心率,场景\n'
  heartRateData.forEach((item) => {
    fileContent += `${item.time},${item.heartRate},${item.scenario}\n`
  })
  const success = await window.api.saveFile(fileContent)
  if (success) {
    console.log('文件保存成功')
  } else {
    console.log('文件保存失败或用户取消操作')
  }
}

const getCurrentTime = () => {
  const currentTime = window.api.getCurrentTime()
  console.log('当前时间:', currentTime)
}
</script>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 16px;
}
</style>
