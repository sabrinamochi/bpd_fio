import loadData from './load-data';

const $div = d3.select('#large-black')
const $graphic = $div.select('.graphic');
const $widthRef = d3.select('#declined .graphic')
const $svg = $graphic.select('svg')
const $gVis = $svg.select('.chart')
const $gLegend = $svg.select('.legend')

let height = 0,
  width = 0
const MARGIN = {
  top: 150,
  right: 10,
  bottom: 100,
  left: 100
}
let boundedHeight, boundedWidth;
let isMobile;

let dataset;


const stopScale = d3.scaleLinear(),
  areaScale = d3.scaleBand(),
  populationScale = d3.scaleLinear()

function drawChart(data) {

  $gVis.selectAll("*").remove()
  $gLegend.selectAll("*").remove()

  // Add X axis
  stopScale
    .domain(d3.extent(dataset, d => +d.stopped_per))
    .range([0, boundedWidth])

  $gVis.append("g")
    .attr('class', 'axis x-axis')
    .attr("transform", `translate(0, ${boundedHeight})`)
    .call(d3.axisBottom(stopScale).tickSize(-boundedHeight).ticks(5).tickFormat(x => `${x}%`))
    .selectAll("text")
    .style("text-anchor", "middle")

  const xLabel = $gVis.append('g')
    .attr('transform', `translate(${boundedWidth / 2}, ${boundedHeight + 30})`)
    .append('text')
      .attr('text-anchor', 'middle')
      .attr('class', 'label x-label')
      .text('Chances of getting stopped')

  // Y axis
  areaScale
    .range([0, boundedHeight])
    .domain(dataset.map(function (d) {
      return d.neighborhood;
    }))
    .padding(.1);

  $gVis.append("g")
    .attr('class', 'axis y-axis')
    .call(d3.axisLeft(areaScale))

  populationScale
    .domain(d3.extent(dataset, d => +d["%black"]))
    .range(['#E8AA46', '#81A8AD'])

  //Bars
  $gVis.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr('class', 'stop-bar')
    .attr('id', d => {
      if (d.zip === '2134') {
        return 'stop-bar-2134'
      } else if (d.zip === '2119') {
        return 'stop-bar-2119'
      } else if (d.zip === '2121') {
        return 'stop-bar-2121'
      }
    })
    .attr("x", stopScale(0))
    .attr("y", function (d) {
      return areaScale(d.neighborhood);
    })
    .attr("width", function (d) {
      return stopScale(d.stopped_per);
    })
    .attr("height", areaScale.bandwidth())
    .attr("fill", d => populationScale(d["%black"]))

  $gVis.append('line')
    .attr('class', 'boston-avg')
    .attr('x1', stopScale(1))
    .attr('x2', stopScale(1))
    .attr('y1', boundedHeight)
    .attr('y2', 0)
    .attr('stroke', 'rgba(0,0,0,0.8)')

  $gVis.append('text')
    .attr('class', 'boston-avg')
    .text('Boston Average')
    .attr('x', stopScale(1.1))
    .attr('y', boundedHeight / 2)


  // legend
  const colorData = [{
      color: populationScale.range()[0],
      value: populationScale.domain()[0]
    },
    {
      color: populationScale.range()[1],
      value: populationScale.domain()[1]
    }
  ]
  var extent = d3.extent(colorData, d => d.value);
  var defs = $svg.append("defs");
  var linearGradient = defs.append("linearGradient").attr("id", "legendGradient");
  linearGradient.selectAll("stop")
    .data(colorData)
    .enter().append("stop")
    .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
    .attr("stop-color", d => d.color);

  const rectWidth = isMobile ? boundedWidth * 0.8 : boundedWidth * 0.5
  const rectHeight = isMobile ? 15 : 25
  const offset = isMobile ? 20 : 50
  $gLegend.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top - rectHeight - offset})`)
  $gLegend.append("rect")
    .attr('class', 'legend-rect')
    .attr('x', boundedWidth / 2 - rectWidth / 2)
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    .style("fill", "url(#legendGradient)");

  $gLegend.append('text')
    .text('more Whites')
    .attr('x', boundedWidth / 2 - rectWidth / 2)
    .attr('y', rectHeight + 10)
    .attr('class', 'legend-text')


  $gLegend.append('text')
    .text('more Blacks')
    .attr('x', boundedWidth / 2 - rectWidth / 2 + rectWidth)
    .attr('y', rectHeight + 10)
    .attr('text-anchor', 'end')
    .attr('class', 'legend-text')


}


function updateDimensions() {
  const h = window.innerHeight,
    w = window.innerWidth
  isMobile = w <= 600 ? true : false
  height = isMobile ? Math.floor(h * 0.9) : Math.floor(h * 0.95);
  width = $widthRef.node().offsetWidth
  boundedHeight = height - MARGIN.top - MARGIN.bottom
  boundedWidth = width - MARGIN.left - MARGIN.right

}

function resize() {
  updateDimensions()
  $svg.attr('width', width)
    .attr('height', height)
  $gVis.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
  drawChart(dataset)
}

function init() {
  loadData('shape_with_stops.csv').then(result => {
    dataset = result.filter(d => +d.resident_employee_ratio >= 1)
    dataset.map(d => {
      if (d.Name.split(", ")[1] === "Dorchester") {
        d.neighborhood = `${d.Name.split(", ")[1]}(${d.Name.split(", ")[0]})`
      } else {
        d.neighborhood = `${d.Name.split(", ")[1]}`
      }

    })
    dataset.sort((a, b) => +b["stopped_per"] - (+a["stopped_per"]))
    resize()
  })
}

export default {
  init,
  resize
}
