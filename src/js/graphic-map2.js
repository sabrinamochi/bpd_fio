/* global d3 */
import loadData from './load-data'
import * as topojson from 'topojson';

const zipData = require('./ZIP_Codes')
const mapData = zipData.geoData;

const $div = d3.select('#map2');
const $graphicContainer = $div.select('.graphic-container')
const $graphic = $graphicContainer.select('.graphic')
const $title = $graphic.select('.map-title')
const $biSvg = $graphic.select('.bi-map')
const $gBiMap = $biSvg.select('.map')
// const $smallOneSvg = $graphic.select('.small-map-one')
// const $smallTwoSvg = $graphic.select('.small-map-two')
// const $gSmallOne = $smallOneSvg.select('g')
// const $gSmallTwo = $smallTwoSvg.select('g')
const $legend = $graphic.select('table')
const $cell = $legend.selectAll('.cell')
const $topLegendText = $graphic.append('div')
  .attr('class', 'legend-text top')
  .html('<p>more Blacks</br>more stops<p>')
const $rightLegendText = $graphic.append('div')
  .attr('class', 'legend-text right')
  .html('<p>more Blacks</br>less stops<p>')
const $bottomLegendText = $graphic.append('div')
  .attr('class', 'legend-text bottom')
  .html('<p>less Blacks</br>less stops<p>')
const $leftLegendText = $graphic.append('div')
  .attr('class', 'legend-text left')
  .html('<p>less Blacks</br>more stops<p>')
$biSvg
  .append('defs')
  .append('pattern')
  .attr('id', 'diagonalHatch')
  .attr('patternUnits', 'userSpaceOnUse')
  .attr('width', 4)
  .attr('height', 4)
  .append('path')
  .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
  .attr('stroke', '#000000')
  .attr('stroke-width', 0.5);


let height = 0,
  width = 0,
  biScale = 0,
  smallScale;
const MARGIN = {
  top: 0,
  right: 5,
  bottom: 10,
  left: 5
}
let boundedWidth, boundedHeight;
let stopData, geoData;

let isMobile;

// const columnNameList = ['crime', 'stopped_per', 'percent_black']
// const colorList = ['#498AD4', '#D01E11', '#FAB038']

const biGeoPath = d3.geoPath(),
  smallGeoPath = d3.geoPath();


function monoMapFill(data, col, color) {
  const colorScale = d3.scaleLinear()
    .domain(d3.extent(geoData.objects["ZIP_Codes (1)"].geometries, d => d.properties[col]))
    .range(['white', color])
  if (data.properties.hasOwnProperty(col)) {
    return colorScale(data.properties[col])
  } else {
    return 'url(#diagonalHatch)'
  }
}

function biMapFill(data, col1, col2, colorRange) {
  const selData1 = geoData.objects["ZIP_Codes (1)"].geometries.slice().sort((a, b) => ((+a.properties[col1]) - (+b.properties[col1])))
  const minNum1 = d3.quantile(selData1.map(d => d.properties[col1]), 0.33)
  const maxNum1 = d3.quantile(selData1.map(d => d.properties[col1]), 0.66)

  const selData2 = geoData.objects["ZIP_Codes (1)"].geometries.slice().sort((a, b) => ((+a.properties[col2]) - (+b.properties[col2])))
  const minNum2 = d3.quantile(selData2.map(d => d.properties[col2]), 0.33)
  const maxNum2 = d3.quantile(selData2.map(d => d.properties[col2]), 0.66)
  const percentScale1 = d3.scaleThreshold()
    .domain([minNum1, maxNum1])
    .range(['low', 'medium', 'high'])
  const percentScale2 = d3.scaleThreshold()
    .domain([33, 66])
    .range(['low', 'medium', 'high'])

  const bivariateColorScale = d3.scaleOrdinal()
    .domain([
      'high_high',
      'high_medium',
      'high_low',
      'medium_high',
      'medium_medium',
      'medium_low',
      'low_high',
      'low_medium',
      'low_low'
    ])
    .range(colorRange)

  $cell.nodes().map(el => {
    const sel = el.className.split(" ")[1]
    el.style.background = bivariateColorScale(`${sel}`)
  })

  if (data.properties.hasOwnProperty(col1) || data.properties.hasOwnProperty(col2)) {
    const prop1 = percentScale1(data.properties[col1])
    const prop2 = percentScale2(data.properties[col2])
    return bivariateColorScale(`${prop1}_${prop2}`)
  } else {
    return 'url(#diagonalHatch)'
  }


}


function draw() {
  $gBiMap.selectAll('*').remove()
  if (isMobile) {
    MARGIN.top = 40
  }
  $gBiMap
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
  // let title = ''
  // $title.html(title)

  const crimeStopColorRange = [
    "#491800", // high prop1, high prop2
    "#455778",
    "#427ec1", // high prop1, low prop2
    "#992000",
    "#91757d", // medium prop1, medium prop2
    "#8ba9ca",
    "#e82800", // low prop1, high prop2
    "#db9283",
    "#d3d3d3" // low prop1, low prop2
  ]
  const stopBlackColorRange = [
    "#731608",
    "#99180c",
    "#bd1b0f",
    "#7b6946",
    "#a37864",
    "#ca8681",
    "#80a672",
    "#aabda3",
    "#d3d3d3"
  ]

  const map = $gBiMap.selectAll(".map-path")
    .data(topojson.feature(geoData, geoData.objects["ZIP_Codes (1)"]).features)

  const mapEnter = map.enter()
    .append("path")
    .attr('class', 'map-path')
    .attr('id', d => {
      if (d.properties.ZIP5 == "02124") {
        return 'dorchester'
      }
    })
    .attr("d", d => biGeoPath(d))
    .attr("stroke", "black")
    .attr("fill", d => biMapFill(d, "stopped_per", "percent_black", stopBlackColorRange))

  const mapMerge = mapEnter.merge(map)

  const boundary = document.querySelector('#dorchester').getBBox()


  const legendTop = isMobile ? 50 : boundary.y + boundary.height + 30
  const legendLeft = isMobile ? boundedWidth / 2 : boundary.x + boundary.width + 70
  const legendTextHeight = document.querySelector('.top').getBoundingClientRect().height
  const legendTextWidth = document.querySelector('.top').getBoundingClientRect().width
  const legendHeight = document.querySelector('.map-legend').getBoundingClientRect().height
  const legendWidth = document.querySelector('.map-legend').getBoundingClientRect().width
  const topLegendLeft = isMobile ? boundedWidth / 2 - legendTextWidth / 8 : legendLeft + legendTextWidth / 2.4;
  const topLegendTop = isMobile ? legendTop - legendTextHeight : legendTop - legendTextHeight * 1.8
  const rightLegendLeft = isMobile ? legendLeft + legendWidth - legendTextWidth / 5 : legendLeft + legendWidth - legendTextWidth / 4
  const rightLegendTop = legendTop + legendWidth / 2 - legendTextHeight
  const bottomLegendTop = legendTop + legendHeight - legendTextHeight / 2
  const leftLegendLeft = legendLeft - legendTextWidth
  $legend
    .style('top', `${legendTop}px`)
    .style('left', `${legendLeft}px`)
  $topLegendText
    .style('left', `${topLegendLeft}px`)
    .style('top', `${topLegendTop}px`)
  $rightLegendText
    .style('left', `${rightLegendLeft}px`)
    .style('top', `${rightLegendTop}px`)
  $bottomLegendText
    .style('left', `${topLegendLeft}px`)
    .style('top', `${bottomLegendTop}px`)
  $leftLegendText
    .style('left', `${leftLegendLeft}px`)
    .style('top', `${rightLegendTop}px`)
    .style('text-align', 'right')
  // $gSmallOne.selectAll(".map-path")
  //   .data(topojson.feature(geoData, geoData.objects["ZIP_Codes (1)"]).features)
  //   .enter()
  //   .append("path")
  //   .attr('class', 'map-path')
  //   .attr("d", d => smallGeoPath(d))
  //   .attr("stroke", "black")
  //   .attr("fill", d => monoMapFill(d, "stopped_per", "#d01e11"))

  // $gSmallTwo.selectAll(".map-path")
  //   .data(topojson.feature(geoData, geoData.objects["ZIP_Codes (1)"]).features)
  //   .enter()
  //   .append("path")
  //   .attr('class', 'map-path')
  //   .attr("d", d => smallGeoPath(d))
  //   .attr("stroke", "black")
  //   .attr("fill", d => monoMapFill(d, "percent_black", "#8DB77D" ))
}


function updateDimensions() {
  const h = window.innerHeight;
  const w = window.innerWidth;
  isMobile = w <= 767 ? true : false
  height = isMobile ? Math.floor(h * 0.4) : Math.floor(h * 0.7)
  width = $graphic.node().offsetWidth
  biScale = isMobile ? 60000 : 130000
  smallScale = isMobile ? 13000 : 35000
  boundedWidth = width - MARGIN.left - MARGIN.right;
  boundedHeight = height - MARGIN.top - MARGIN.bottom;
}

function resize() {
  updateDimensions();
  // const smallWidth = boundedWidth / 3
  // const smallHeight = boundedHeight / 4

  $biSvg.attr('width', width)
    .attr('height', height)

  // $smallOneSvg
  //   .attr('width', smallWidth)
  //   .attr('height', smallHeight)
  // $smallTwoSvg
  //   .attr('width', smallWidth)
  //   .attr('height', smallHeight)

  biGeoPath.projection(
    d3.geoAlbers()
    .scale(biScale)
    .rotate([71.057, 0])
    .center([0, 42.313])
    .translate([width / 2, height / 2])
  );
  // smallGeoPath.projection(
  //   d3.geoAlbers()
  //   .scale(smallScale)
  //   .rotate([71.057, 0])
  //   .center([0, 42.313])
  //   .translate([smallWidth / 2, smallHeight / 2])
  // );
  // columnNameList.forEach((c, i) => {
  //   drawChart(c, colorList[i])
  // })


  draw()


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
          g.properties.neighborhood = +d["Name"].split(", ")[1]
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
