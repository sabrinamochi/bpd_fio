/* global d3 */
import loadData from './load-data'
import * as topojson from 'topojson';

const zipData = require('./ZIP_Codes')
const mapData = zipData.geoData;

const $div = d3.select('#map');
const $graphicContainer = $div.select('.graphic-container')
const $graphic = $graphicContainer.select('.graphic')
// const $title = $graphic.select('.map-title')
// const $svg = $graphic.select('svg')
// const $gVis = $svg.select('g')
// const $leftArrow = $graphicContainer.select('.left-arrow')
// const $rightArrow = $graphicContainer.select('.right-arrow')

let height = 0,
  width = 0,
  scale = 0;
const MARGIN = {
  top: 10,
  right: 10,
  bottom: 30,
  left: 40
}
let boundedWidth, boundedHeight;
let stopData, geoData;

const columnNameList = ['crime', 'stopped_per', 'percent_black']
const colorList = ['#498AD4', '#D01E11', '#FAB038']
let count = 0;

// $leftArrow.on('click', () => {
//   count -= 1
//   if (count < 0) {
//     count = 0
//   }
//   updateChart(columnNameList[count], colorList[count])
//   $leftArrow.classed('arrow-bounce', false)
// })

// $rightArrow.on('click', () => {
//   count += 1
//   if (count > 2) {
//     count = 2
//   }
//   updateChart(columnNameList[count], colorList[count])
//   $rightArrow.classed('arrow-bounce', false)
// })
const albersProjection = d3.geoAlbers()
const geoPath = d3.geoPath()

function drawChart(columnName, color) {
  const $map = $graphic.select(`.${columnName}-map`)
  const $title = $map.select(`.${columnName}-map-title`)
  const $svg = $map.select('svg')
    .attr('width', width)
    .attr('height', height)
  const $gVis = $svg.select('g')
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
  const $tip = $map.select(`.${columnName}-map-tip`)
    .classed('hidden', true)

    $gVis.selectAll(".map-path")
    .data(topojson.feature(geoData, geoData.objects["ZIP_Codes (1)"]).features)
    .enter()
    .append("path")
    .attr('class', 'map-path')
    .attr("d", d => geoPath(d))
    .attr("stroke", "black") 


  const colorScale = d3.scaleLinear()
    .domain(d3.extent(geoData.objects["ZIP_Codes (1)"].geometries, d => d.properties[columnName]))
    .range(['white', color])

  $gVis.selectAll(".map-path")
    .attr("fill", d => {
      if (d.properties.hasOwnProperty(columnName)) {
        return colorScale(d.properties[columnName])
      } else {
        return "rgba(0,0,0,0.2)"
      }
    })

  let title = ''

  if (columnName == 'crime') {
    title = 'Crime Index'
  } else if (columnName == 'stopped_per') {
    title = 'Stops per 100 People'
  } else {
    title = 'Percentage of Blacks'
  }

  $title.html(title)
}

function updateDimensions() {
  const h = window.innerHeight;
  const w = window.innerWidth;
  const isMobile = w <= 600 ? true : false
  height = isMobile ? Math.floor(h * 0.4) : Math.floor(h * 0.6);
  width = isMobile ? w : $graphic.node().offsetWidth / 3
  scale = isMobile ? 80000 : 120000
  boundedWidth = width - MARGIN.left - MARGIN.right;
  boundedHeight = height - MARGIN.top - MARGIN.bottom;
}

function resize() {
  updateDimensions();

  albersProjection
    .scale(scale)
    .rotate([71.057, 0])
    .center([0, 42.313])
    .translate([width / 2, height / 2])

  geoPath.projection(albersProjection);
  columnNameList.forEach((c, i) => {
    drawChart(c, colorList[i])
  })


}

function init() {
  loadData(['shape_with_stops.csv', 'ZIP_Codes.json']).then(result => {
    stopData = result[0].filter(d => +d.resident_employee_ratio >= 1)
    geoData = result[1]

    geoData.objects["ZIP_Codes (1)"].geometries.forEach(g => {
      stopData.forEach(d => {
        if ("0" + String(d.zip) == g.properties.ZIP5) {
          g.properties.total_population = +d["population"]
          g.properties.black_pop = +d["black_pop"]
          g.properties.white_pop = +d["white_pop"]
          g.properties.percent_black = +d["%black"]
          g.properties.percent_white = +d["%white"]
          g.properties.num_of_stop = +d["num_of_stops"]
          g.properties.stopped_per = +d["stopped_per"]
          g.properties.per_black_stopped_within_blacks = +d["per_black_stopped_within_blacks"]
          g.properties.per_white_stopped_within_whites = +d["per_white_stopped_within_whites"]
          g.properties.crime = +d["crime"]
        }
      })
    })
    resize()
  }).catch(console.error);

}

export default {
  init,
  resize
};
