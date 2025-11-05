// import axios from 'axios'

// const JSON_URL = 'https://cdn.jsdelivr.net/gh/AnZhou99/geoJsons';

// function getJson(adcode) {
//   return new Promise((resolve, reject) => {
//     axios
//       .get(`${JSON_URL}/${adcode}_full.json`)
//       .then(res => {
//         resolve(res.data);
//       })
//       .catch(err => {
//         console.log('geoJson获取失败: ', err);
//         reject('');
//       });
//   });
// }

async function getJson(adcode) {
  try {
    // 直接动态导入本地JSON文件
    const data = await import(`../data/geo/${adcode}_full.json`);
    return data.default;
  } catch (err) {
    console.log('geoJson获取失败: ', err);
    return '';
  }
}

export default getJson