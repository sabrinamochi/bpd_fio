/* global d3 */

import loadData from './load-data'
import scrollama from 'scrollama'

const $div = d3.select('#declined');
const $graphic = $div.select('.graphic');
const $paragraph = $div.selectAll('.paragraph')
const $svg = $graphic.select('svg')
const $gVis = $svg.select('.chart')
const $xAxis = $svg.select('.x-axis')
const $yAxis = $svg.select('.y-axis')

const MARGIN = {
  top: 10,
  right: 10,
  bottom: 30,
  left: 60
}
let height = 0, 
    width = 0, 
    boundedWidth = 0, 
    boundedHeight = 0;


const xScale = d3.scaleBand()
const yScale = d3.scaleLinear()
let xAxis, yAxis;

let dataset;

const SEC = 1000;
const scroller = scrollama()
let currentStep = '0'

const STEP = {
  '0': () => {
    drawChart()
  },
  '1': () => {

  }
}

function resetLine(){
    const $s = d3.select(this)
    const $path = $s.select('path')
    const totalLength = $path.node().getTotalLength()

    $path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
}

function drawChart(){
  $svg.selectAll('.label').remove()

  xScale
    .domain(dataset.map(d => d.year))
  yScale
    .domain([0, d3.max(dataset, d => d.number_of_fio_subjects)])
  
  xAxis = $xAxis
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top + boundedHeight})`)
    .call(d3.axisBottom(xScale))
  yAxis = $yAxis
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
    .call(d3.axisLeft(yScale))
  
  const yLabel = $svg.append('text')
    .attr('class', 'label y-label')
    .text('Number of people')
    .attr('transform', `rotate(-90)`)
    .attr('y', 12)
    .attr('x', -(height/2))
    .attr('text-anchor', 'middle')
  const xLabel = $svg.append('text')
    .attr('class', 'label', 'x-label')
    .text('Year')
    .attr('transform', `translate(${MARGIN.left + boundedWidth/2}, ${MARGIN.top + boundedHeight + 30})`)
    .attr('text-anchor', 'middle')
  
  const lineGen = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.number_of_fio_subjects))
    .curve(d3.curveMonotoneX)
  const $subjectNum = $gVis.selectAll('.subject-num')
    .data([dataset])
  const $subjectNumEnter = $subjectNum
    .enter()
    .append('g')
      .attr('class', 'subject-num')
    $subjectNumEnter.append('path')
  const $subjectNumMerge = $subjectNumEnter
    .merge($subjectNum);
  $subjectNumMerge.select('path')
    .datum(d => d)
    .attr('d', lineGen)

  // animate line
  $subjectNumMerge.each(resetLine)

  $subjectNumMerge.select('path')
    .transition()
    .duration(SEC*3)
    .attr('stroke-dashoffset', 0)

  // circle
  const $subjectNumCircle = $gVis.selectAll('.subject-num-circle')
    .data(dataset);
  const $subjectNumCircleEnter = $subjectNumCircle.enter()
    .append('circle')
      .attr('class', 'subject-num-circle')
      
  const $subjectNumCircleMerge = $subjectNumCircleEnter.merge($subjectNumCircle)
  $gVis
  .selectAll('circle')
    .attr('cx', d => xScale(d.year))
    .attr('cy', d => yScale(d.number_of_fio_subjects))
    .attr('r', 2)
      
}

function updateDimensions(){
  const h = window.innerHeight;
  const w = window.innerWidth;
  const isMobile = w <= 600 ? true : false
  height = isMobile ? Math.floor(h * 0.4) : Math.floor(h * 0.5);
  width = $graphic.node().offsetWidth;
}

function resize() {
  updateDimensions()
  $svg.attr('height', height)
    .attr('width', width)
  $gVis.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);
  boundedWidth = width - MARGIN.left - MARGIN.right;
  boundedHeight = height - MARGIN.top - MARGIN.bottom;
  xScale
    .range([0, boundedWidth])
  yScale
    .range([boundedHeight, 0])
  drawChart()
}

function handleStepEnter({index, element, direction}){
  currentStep = `${index}`
  // console.log(index)
  STEP[currentStep]()
}

function setupScroller(){
  scroller.setup({
    step: $paragraph.nodes(),
    offset: 0.6
  })
  .onStepEnter(handleStepEnter)
  // .onStepLeave(handleStepLeave)
}

function init() {
  loadData('number_of_fio_subjects_by_year.csv').then(result => {
    console.log(result);
    dataset = result;
    resize()
    setupScroller()
	}).catch(console.error);
}

export default { init, resize };
