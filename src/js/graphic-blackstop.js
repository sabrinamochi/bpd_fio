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
  top: 10,
  right: 10,
  bottom: 30,
  left: 10
}
let boundedHeight, boundedWidth;

let dataset;


const stopRScale = d3.scaleSqrt(),
  populationScale = d3.scaleLinear()

  function drawChart(data) {

    $gVis.selectAll("*").remove()
    $gLegend.selectAll("*").remove()

    stopRScale
      .domain(d3.extent(dataset, d => +d.stopped_per))
      .range([4, boundedWidth / 4])
  
    populationScale
      .domain(d3.extent(dataset, d => +d["%black"]))
      .range(['#9650A9', '#8DB77D'])
  
    //radials
    $gVis.selectAll(".stop-circle")
      .data(data)
      .enter()
      .append("circle")
      .attr('class', 'stop-circle')
      .attr('id', d => {
        return `stop-circle-${d.zip}`
      })
      .attr('cx', boundedWidth / 2)
      .attr('transform', d => `translate(0, ${boundedHeight-stopRScale(d["stopped_per"])})`)
      .attr("r", d => stopRScale(d["stopped_per"]))
      .attr("stroke", d => populationScale(d["%black"]))
      .attr('fill', 'none')
      .attr('opacity', 0.05)
      .attr('stroke-width', 2)
  
    $gVis.append('circle')
      .attr('class', 'stop-circle')
      .attr('id', 'boston')
      .attr('cx', boundedWidth / 2)
      .attr('transform', d => `translate(0, ${boundedHeight-stopRScale(1)})`)
      .attr("r", d => stopRScale(1))
      .attr('stroke', 'black')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('opacity', 0)
    
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
    $gLegend.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top + boundedHeight / 8})`)
    const rectWidth = 400
    const rectHeight = 30
    $gLegend.append("rect")
        .attr('class', 'legend-rect')
        .attr('x', boundedWidth/2 - rectWidth/2)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .style("fill", "url(#legendGradient)");
    
    $gLegend.append('text')
      .text('more White residents')
      .attr('x', boundedWidth/2 - rectWidth/2)
      .attr('dy', -1)
      .attr('class', 'legend-text')
    
    $gLegend.append('text')
      .text('more Black residents')
      .attr('x', boundedWidth/2 - rectWidth/2 + rectWidth)
      .attr('dy', -1)
      .attr('text-anchor', 'end')
      .attr('class', 'legend-text')
  
  }
  

function updateDimensions() {
  const h = window.innerHeight,
    w = window.innerWidth
  const isMobile = w <= 600 ? true : false
  height = isMobile ? Math.floor(h * 0.5) : Math.floor(h * 0.8);
  width = isMobile ? w * 0.9 : w * 0.6
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
      if (d.Name.split(", ")[1] === "Dorchester"){
        d.neighborhood = `${d.Name.split(", ")[1]}(${d.Name.split(", ")[0]})`
      }
      else {
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
