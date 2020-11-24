import loadData from './load-data';

const $div = d3.select('#stop-by-race')
const $graphic = $div.select('.scroll .scroll__graphic .graphic');
const $widthRef = d3.select('#declined .graphic')
const $svg = $graphic.select('svg')
const $gVis = $svg.select('.chart')
const $border = $svg.select('.border-lines')
var $titles = $svg.select(".title")

let height = 0,
  width = 0
const MARGIN = {
  top: 100,
  right: 10,
  bottom: 60,
  left: 100
}

const config = {
  labelPositioning: {
    alpha: 0.5,
    spacing: 18
  },
  labelGroupOffset: 5,
  labelKeyOffset: 0,
  radius: 6,
  // Reduce this to turn on detail-on-hover version
  unfocusOpacity: 0.3
}

let boundedHeight, boundedWidth;

let dataset;

const yScale = d3.scaleBand(),
  xScale = d3.scaleLinear(),
  populationScale = d3.scaleLinear()
// lineGen = d3.line();


function drawChart(data) {
  $border.selectAll("*").remove()
  $titles.selectAll('text').remove()
  $gVis.selectAll("*").remove()

  xScale
    .domain([0, d3.max(data, d => d.per_white_stopped_within_whites)])
    .range([0, boundedWidth])

  yScale
    .range([boundedHeight, 0])
    .domain(data.map(d => d.neighborhood))
    .padding(.2);

  // lineGen
  //   .x(d => xScale(d.per_black_stopped_within_blacks))
  //   .y(d => yScale(d.neighborhood))

  populationScale
    .domain(d3.extent(dataset, d => +d["%black"]))
    .range(['#E8AA46', '#81A8AD'])

  $border
    .append("line")
    .attr('id', 'border-line-left')
    .attr("x1", MARGIN.left).attr("y1", MARGIN.top)
    .attr("x2", MARGIN.left).attr("y2", MARGIN.top + boundedHeight)
    .attr('stroke', 'rgba(0,0,0,0.5')
  $border.append("line")
    .attr('id', 'border-line-right')
    .attr("x1", MARGIN.left + boundedWidth).attr("y1", MARGIN.top)
    .attr("x2", MARGIN.left + boundedWidth).attr("y2", MARGIN.top + boundedHeight)
    .attr('stroke', 'rgba(0,0,0,0.5')

  const circleLegendG = $gVis.append('g')
    .attr('class', 'circle-legend-group')
    .attr('transform', `translate(${boundedWidth/2}, ${-MARGIN.top / 2})`)
    .selectAll('.circle-legend')
    .data(['white', 'Black'])
  circleLegendG .enter().append('text')
    .text(d => d)
    .attr('y', 10)
    .attr('x', (d, i) => {
      if (i == 0) {
        return -35
      } else {
        return 45
      }
    })
  circleLegendG .enter().append('circle')
    .attr('class', 'circle-legend')
    .attr('fill', d => {
      if (d == 'white') {
        return 'white'
      } else {
        return 'black'
      }
    })
    .attr('stroke', d => {
      if (d == 'white') {
        return 'black'
      } else {
        return 'none'
      }
    })
    .attr('cy', 5)
    .attr('r', 5)
    .attr('cx', (d, i) => {
      if (i == 0) {
        return -40
      } else {
        return 40
      }
    })


  //slopes
  const $slopeGroups = $gVis.selectAll(".slope-group")
    .data(data)
    .enter().append("g")
    .attr("class", "slope-group")
    .attr("id", function (d, i) {
      d.id = "group" + i;
      // d.values[0].group = this;
      // d.values[1].group = this;
    });
  const $slopeLines = $slopeGroups.append("line")
    .attr("class", "slope-line")
    .attr('id', d => `slope-line-${d.zip}`)
    .attr("x1", d => xScale(d.per_white_stopped_within_whites))
    .attr("y1", function (d) {
      return yScale(d.neighborhood);
    })
    .attr("x2", d => xScale(d.per_black_stopped_within_blacks))
    .attr("y2", function (d) {
      return yScale(d.neighborhood)
    })
    .attr('stroke', d => populationScale(d['%black']))
    .attr('fill', 'none')
    .attr('stroke-width', 5)
  const radius = 5
  var leftSlopeCircle = $slopeGroups.append("circle")
    .attr('class', 'slope-circle left-slope-circle')
    .attr('id', d => `left-circle-${d.zip}`)
    .attr("r", radius)
    .attr('cx', d => xScale(d.per_white_stopped_within_whites))
    .attr("cy", d => yScale(d.neighborhood))

  var leftSlopeLabels = $slopeGroups.append("g")
    .attr("class", "slope-label slope-label-left")
    .each(function (d) {
      d.xLeftPosition = -config.labelGroupOffset;
      d.yLeftPosition = yScale(d.per_white_stopped_within_whites)
    });

  //   leftSlopeLabels.append("text")
  //     .attr("class", "label-figure")
  //     .attr("x", d => d.xLeftPosition)
  //     .attr("y", d => d.yLeftPosition)
  //     .attr("dx", -10)
  //     .attr("dy", 3)
  //     .attr("text-anchor", "end")
  //     .text(d => d.per_white_stopped_within_whites);

  leftSlopeLabels.append("text")
    .attr("class", "slope-label-left-text")
    .attr('id', d => `left-label-${d.zip}`)
    .attr("x", d => d.xLeftPosition)
    .attr("y", d => yScale(d.neighborhood))
    .attr("dx", -config.labelKeyOffset)
    .attr("dy", 3)
    .attr("text-anchor", "end")
    .text(d => {
      return d.neighborhood
    })

  var rightSlopeCircle = $slopeGroups.append("circle")
    .attr('class', 'slope-circle right-slope-circle')
    .attr('id', d => `right-circle-${d.zip}`)
    .attr("r", radius)
    .attr('cx', d => xScale(d.per_black_stopped_within_blacks))
    .attr("cy", d => yScale(d.neighborhood))
    .attr('fill', d => populationScale(d['%black']))

  // var rightSlopeLabels = $slopeGroups.append("g")
  //   .attr("class", "slope-label slope-label-right")
  //   .each(function (d) {
  //     d.xRightPosition = boundedWidth + config.labelGroupOffset;
  //     d.yRightPosition = yScale(d.per_black_stopped_within_blacks);
  //   });

  //   rightSlopeLabels.append("text")
  //     .attr("class", "label-figure")
  //     .attr("x", d => d.xRightPosition)
  //     .attr("y", d => d.yRightPosition)
  //     .attr("dx", 10)
  //     .attr("dy", 3)
  //     .attr("text-anchor", "start")
  //     .text(d => (d.values[1].max / d.values[1].min).toPrecision(3));

  // rightSlopeLabels.append("text")
  //   .attr("class", "slope-label-right-text")
  //   .attr('id', d => `right-label-${d.zip}`)
  //   .attr("x", d => d.xRightPosition)
  //   .attr("y", d => yScale(d.neighborhood))
  //   .attr("dx", config.labelKeyOffset)
  //   .attr("dy", 3)
  //   .attr("text-anchor", "start")
  //   .text(d => {
  //     return d.neighborhood
  //   })

  // $titles.append("text")
  //   .attr("text-anchor", "middle")
  //   .attr("x", MARGIN.left)
  //   .attr("dx", 0)
  //   .attr("dy", MARGIN.top)
  //   .text(config.leftTitle);

  //   $titles.append("text")
  //   .attr("x", MARGIN.left+boundedWidth)
  //   .attr("dx", 0)
  //   .attr("dy", MARGIN.top)
  //   .text(config.rightTitle);
}

function updateDimensions() {
  const h = window.innerHeight,
    w = window.innerWidth
  const isMobile = w <= 600 ? true : false
  height = isMobile ? Math.floor(h * 0.9) : Math.floor(h * 0.95)
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
    result = result.filter(d => +d.resident_employee_ratio >= 1)

    result.forEach(d => {
      if (d.Name.split(", ")[1] === "Dorchester") {
        d.neighborhood = `${d.Name.split(", ")[1]}(${d.Name.split(", ")[0]})`
      } else {
        d.neighborhood = `${d.Name.split(", ")[1]}`
      }
      d.group1 == "white"
      d.group2 == "black"

    })
    dataset = result;
    dataset.sort((a, b) => +b["%white"] - (+a["%white"]))
    resize()
  })
}

export default {
  init,
  resize
}
