/* global d3 */
import scrollama from 'scrollama'

const $div = d3.select('#black');
const $graphic = $div.select('.graphic');
const $paragraph = $div.selectAll('.paragraph')
const $svg = $graphic.select('svg')
const $gVis = $svg.select('.graphic__chart')
const $gPop = $gVis.select('.chart__pop')
const $gStop = $gVis.select('.chart__stop')

const MARGIN = {
  top: 20,
  right: 40,
  bottom: 20,
  left: 20
}
let height = 0, 
    width = 0, 
    boundedWidth = 0, 
    boundedHeight = 0;

const popData = [
    {race: "Black",
    0: 0,
    1: 0.2507},
    {race: "white",
    0: 0.25075,
    1: 0.2507 + 0.5135},
    {race: "others",
    0: 0.2507 + 0.5135,
    1: 1}
]

const stopData = [
    {race: "Black",
    0: 0,
    1: 0.69},
    {race: "white",
    0: 0.69,
    1: 0.69+0.25},
    {race: "others",
    0: 0.69+0.25,
    1: 1}
]

const SEC = 1000;
const scroller = scrollama()
let currentStep = '0'

// const STEP = {
//   '0': () => {
//     drawChart()
//   },
//   '1': () => {

//   }
// }

const xScale = d3.scaleLinear()
const yScale = d3.scaleBand()

function drawChart(){
  
  xScale
    .domain([0, 1])
  yScale
    .domain(['pop', 'stop'])
    .paddingInner(0.5)
  const colorScale = d3.scaleOrdinal()
    .domain(['Black', 'white', 'others'])
    .range(['#FAB038', '#2A9D8F', '#C4C4C4'])

  const $popBars = $gPop.selectAll('.pop-bars')
    .data([popData])
  const $popEnter = $popBars.enter()
    .append('g')
    .attr('class', 'pop-bars')
    const $popMerge = $popEnter.merge($popBars)
    $popMerge.selectAll('rect')
        .data( d => d)
        .enter()
        .append('rect')
            .attr('x', d => xScale(d[0]))
            .attr('y', yScale('pop'))
            .attr('width', d => (xScale(d[1]) - xScale(d[0])-2))
            .attr('height', yScale.bandwidth())
            .attr('fill', d => colorScale(d.race))
   $gPop.append('text')
    .attr('class', 'stacked-bar-title')
    .text('Boston Population by Race')
    .attr('y', yScale('pop')-5)
   $gPop.selectAll('.stacked-bar-legend')
      .data(popData)
      .enter()
      .append('text')
        .attr('class', 'stacked-bar-legend')
        .text(d => `${d.race}: ${Math.round((d[1]-d[0])*10000)/100}%`)
        .attr('y', yScale('pop') + yScale.bandwidth() + 10)
        .attr('x', d => xScale(d[0]))
   const $stopBars = $gStop.selectAll('.stop-bars')
        .data([stopData])
   const $stopEnter = $stopBars.enter()
        .append('g')
        .attr('class', 'stop-bars')
        const $stopMerge = $stopEnter.merge($stopBars)
        $stopMerge.selectAll('rect')
            .data( d => d)
            .enter()
            .append('rect')
                .attr('x', d => xScale(d[0]))
                .attr('y', yScale('stop'))
                .attr('width', d => (xScale(d[1]) - xScale(d[0])-2))
                .attr('height', yScale.bandwidth())
                .attr('fill', d => colorScale(d.race))
    $gStop.append('text')
      .attr('class', 'stacked-bar-title')
      .text('Stopped Indivisual by Race')
      .attr('y', yScale('stop')-5)
    $gStop.selectAll('.stacked-bar-legend')
      .data(stopData)
      .enter()
      .append('text')
        .attr('class', 'stacked-bar-legend')
        .text(d => `${d.race}: ${Math.round((d[1]-d[0])*10000)/100}%`)
        .attr('y', yScale('stop') + yScale.bandwidth() + 10)
        .attr('x', d => xScale(d[0]))

}

function updateDimensions(){
  const h = window.innerHeight;
  const w = window.innerWidth;
  const isMobile = w <= 600 ? true : false
  height = isMobile ? Math.floor(h * 0.4) : Math.floor(h * 0.3);
  width = $graphic.node().offsetWidth;
  boundedWidth = width - MARGIN.left - MARGIN.right;
  boundedHeight = height - MARGIN.top - MARGIN.bottom;
}

function resize() {
  updateDimensions()
  $svg.attr('height', height)
    .attr('width', width)
  $gVis.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);
  xScale
    .range([0, boundedWidth])
  yScale
    .range([0, boundedHeight])
  $gPop.selectAll('.pop-bars').remove()
  $gStop.selectAll('.stop-bars').remove()
  $svg.selectAll('.stacked-bar-title').remove()
  $svg.selectAll('.stacked-bar-legend').remove()
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
    resize()
    // setupScroller()
}

export default { init, resize };
