/* global d3 */
import loadData from './load-data'
import scrollama from 'scrollama'
import Stickyfill from 'stickyfilljs'
import * as ss from 'simple-statistics'

const $div = d3.select('#scatter');
const $graphic = $div.select('.scroll__graphic');
var $tip = $div.select(".tool-tip");
const $text = $div.select('.scroll__text');
const $step = $text.selectAll('.step')
const $svg = $graphic.select('svg')
const $gVis = $svg.select('.vis')
const $xAxis = $svg.select('.x-axis')
const $yAxis = $svg.select('.y-axis')

let height = 0,
  width = 0;
const MARGIN = {
  top: 20,
  right: 10,
  bottom: 50,
  left: 30
}
let boundedWidth, boundedHeight;

const xScale = d3.scaleLinear()
const yScale = d3.scaleLinear()
let xAxis, yAxis;

let dataset;


// function getLinearRegression(){
//     return ss.linearRegression(dataset.map(d => [d.crime, d.stopped_per]))
// }

// function getLineGen(x, y){
//     return d3.line()
//         .x(d => x(d.x))
//         .y(d => y(d.y))
// }

function getColor() {
  return d3.scaleOrdinal()
    .domain(dataset.map(d => d.Name))
    // color generator: http://jnnnnn.github.io/category-colors-constrained.html
    .range(["#3957ff", "#c9080a", "#fec7f8", "#0b7b3e", "#0bf0e9", "#c203c8", "#fd9b39", "#888593", "#906407", "#98ba7f", "#fe6794", "#10b0ff", "#ac7bff", "#fee7c0", "#964c63", "#1da49c", "#0ad811", "#bbd9fd", "#fe6cfe", "#297192", "#d1a09c", "#78579e", "#81ffad", "#739400", "#ca6949", "#d9bf01", "#646a58", "#d5097e", "#bb73a9"])
}


function drawChart() {
  $gVis.selectAll('.neighborhood').remove()
  $gVis.selectAll('.more-black-text').remove()
  $gVis.selectAll('.more-white-text').remove()
  $gVis.selectAll('.label').remove()
  $gVis.selectAll('.usa-average').remove()
  xScale
    .domain(d3.extent(dataset, d => d.crime))
  yScale
    .domain(d3.extent(dataset, d => d.stopped_per))
  xAxis = $xAxis
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top + boundedHeight})`)
    .call(d3.axisBottom(xScale))
  yAxis = $yAxis
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
    .call(d3.axisLeft(yScale).tickSize(-(boundedWidth)).ticks(5))
  const yLabel = $gVis.append('text')
    .attr('class', 'label y-label')
    .selectAll('.y-label-tspan')
    .data(['Stops', 'per', '100 people'])
    .enter().append('tspan')
  yLabel
    .text(d => d)
    // .attr('transform', `rotate(-90)`)
    // .attr('y', 12)
    .attr('x', -10)
    .attr('y', (d, i) => -MARGIN.top / 2 + i * 15)
  const xLabel = $gVis.append('text')
    .attr('class', 'label', 'x-label')
    .text('Crime Index')
    .attr('transform', `translate(${boundedWidth/2}, ${height - 20})`)
    .attr('text-anchor', 'middle')

  const usaAvg = $gVis.append('g')
    .attr('class', 'usa-average')
  usaAvg
    .append('line')
    .attr('x1', xScale(100))
    .attr('x2', xScale(100))
    .attr('y1', boundedHeight)
    .attr('y2', 0)
    .attr('stroke', 'rgba(0,0,0,0.5)')
    .attr('stroke-dasharray', '4 1')
  usaAvg.append('text')
    .text('USA average')
    .attr('x', xScale(101))
    .attr('y', yScale(3.5))
    .attr('fill', 'rgba(0,0,0,0.5)')

  const colorScale = getColor()

  function handleMouseOver(d) {
  
    const x = d3.select(this).attr('cx')
    const y = d3.select(this).attr('cy')
    const selDot = d3.select(this).datum()
    $tip
      .style("left", x + "px")
      .style("top", y + "px")
      .style("visibility", "visible")
      .html(function () {
        return '<div>' +
          '<p>' + selDot.neighborhood + '</p>' +
          '</div>';
      })
  }

  function handleMouseOut(d) {
    $tip
      .style("visibility", "hidden")
  }

  const $neighborhood = $gVis.selectAll('.neighborhood')
    .data(dataset)
  const $neighborhoodEnter = $neighborhood.enter()
    .append('circle')
    .attr('class', 'neighborhood')
    .attr('cx', d => xScale(d.crime))
    .attr('cy', d => yScale(d.stopped_per))
    .attr('r', 5)
    .attr('fill', d => d.color)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
  const $neighborhoodMerge = $neighborhoodEnter.merge($neighborhood);

  $gVis.selectAll('.neighborhood-text')
    .data(dataset)
    .enter()
    .append('text')
    .attr('class', d => {
      if (+d["%black"] / 100 >= 0.5) {
        return 'more-black-text'
      } else if (d.neighborhood == 'Brighton' || d.neighborhood == 'Allston' ||
        d.neighborhood == 'East Boston' || d.neighborhood == 'North End') {
        return 'more-white-text'
      } else {
        return;
      }
    })
    .text(d => {
      if (+d["%black"] / 100 >= 0.5 || (d.neighborhood == 'Brighton' || d.neighborhood == 'Allston' ||
          d.neighborhood == 'East Boston' || d.neighborhood == 'North End')) {
        return d.neighborhood
      } else {
        return;
      }
    })
    .attr('x', d => xScale(d.crime) - 10)
    .attr('y', d => yScale(d.stopped_per) - 6)
    .attr('font-size', 12)
    .attr('font-family', 'Helvetica')
    .attr('opacity', 0)
    .attr('text-anchor', 'middle')
}

// const linearRegression = getLinearRegression()
// const linearRegressionLine = ss.linearRegressionLine(linearRegression)
// function regressionPoints() {
//         const firstX = dataset[1].crime;
//         const lastX = dataset.slice(-1)[0].crime;
//         const xCoordinates = [firstX, lastX];

//         return xCoordinates.map(d => ({
//             x: d,   // We pick x and y arbitrarily, just make sure they match d3.line accessors
//             y: linearRegressionLine(d)
//         }));
//         }
// const lineGen = getLineGen(xScale, yScale);
// $gVis.append('path')
//     // .classed('regressionLine', true)
//     .datum(regressionPoints())
//     .attr('d', lineGen)
//     .attr('stroke', 'black')
//     .attr('stroke-width', 5)


const scroller = scrollama()
let currentStep = 'explain'

const STEP = {
  'explain': () => {
    $gVis.select('.usa-average').attr('opacity', 1)
    $gVis.selectAll('.neighborhood')
      .attr('fill', d => d.color)
    $gVis.selectAll('.more-white-text')
      .attr('opacity', 0)
    $gVis.selectAll('.more-black-text')
      .attr('opacity', 0)
  },
  'high-crime': () => {
    $gVis.select('.usa-average').attr('opacity', 0)
    const colorScale = getColor()
    $gVis.selectAll('.neighborhood')
      .attr('fill', d => {
        if (+d["%black"] / 100 >= 0.5) {
          return d.color
        } else {
          return 'rgba(0,0,0,0.1)'
        }
      })
    $gVis.selectAll('.more-black-text')
      .attr('opacity', 1)

    $gVis.selectAll('.more-white-text')
      .attr('opacity', 0)

  },
  'exceptions': () => {
    const colorScale = getColor()
    $gVis.selectAll('.neighborhood')
      .attr('fill', d => {
        if ((d.neighborhood == 'Brighton' || d.neighborhood == 'Allston' ||
            d.neighborhood == 'East Boston' || d.neighborhood == 'North End')) {
          return d.color
        } else {
          return 'rgba(0,0,0,0.1)'
        }
      })
    $gVis.selectAll('.more-black-text')
      .attr('opacity', 0)
    $gVis.selectAll('.more-white-text')
      .attr('opacity', 1)
  }
}

function handleStepEnter({
  index,
  element,
  direction
}) {
  currentStep = d3.select(element).attr('data-step')
  STEP[currentStep]();
}


function setupScroller() {
  Stickyfill.add($graphic.node());
  scroller.setup({
      step: $step.nodes(),
      offset: 0.5
    })
    .onStepEnter(handleStepEnter)

}

function updateDimensions() {
  const h = window.innerHeight;
  const w = window.innerWidth;
  const isMobile = w <= 600 ? true : false
  height = isMobile ? Math.floor(h * 0.6) : Math.floor(h * 0.7);
  width = $graphic.node().offsetWidth;

  boundedWidth = width - MARGIN.left - MARGIN.right
  boundedHeight = height - MARGIN.top - MARGIN.bottom
  $svg.attr('width', width)
    .attr('height', height)
  $gVis.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
  xScale
    .range([0, boundedWidth])
  yScale
    .range([boundedHeight, 0])

}

function resize() {
  updateDimensions();
  drawChart()
}

function init() {
  loadData('shape_with_stops.csv').then(result => {

    dataset = result.filter(d => +d.resident_employee_ratio >= 1 && d.ZIP5 !== "")
    dataset.map(d => {
      d.crime = +d.crime
      d.stopped_per = +d.stopped_per
      d.neighborhood = d.Name.split(', ')[1]
    })
    dataset.sort((a, b) => a.crime - b.crime)
    console.log(dataset)
    resize()
    drawChart()
    setupScroller()
  }).catch(console.error);
}

export default {
  init,
  resize
};
