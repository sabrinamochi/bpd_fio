import scrollama from 'scrollama'
import Stickyfill from 'stickyfilljs'

const imgPath = 'assets/images'

const $section = d3.select('#warren-scroll')
const $scrollImg = $section.select('.scroll__img')
const $step = $section.selectAll('.step')
const $img = $scrollImg.select('.warren-img')
const scroller = scrollama()

let currentStep = 'cold-night'

const STEP = {
    'cold-night': () => {
        $img.attr('src', `${imgPath}/cold-night.jpg`)
            .style('-webkit-filter', 'grayscale(80%)')
            .style('filter', 'grayscale(80%)')  
    },
    'chase': () => {
        $img.attr('src', `${imgPath}/chase.jpg`)
            .style('-webkit-filter', 'grayscale(0)')
            .style('filter', 'grayscale(0)')
    },
    'arrest': () => {
        $img.attr('src', `${imgPath}/arrest.jpg`)
            .style('-webkit-filter', 'grayscale(0)')
            .style('filter', 'grayscale(0)')
    }
}

function handleStepEnter({index, element, direction}){
    currentStep = d3.select(element).attr('data-step')
    STEP[currentStep]()
}

function handleStepExit({index, element, direction}){

}


function setupScroller(){
    Stickyfill.add($scrollImg.node());
    scroller.setup({
        step: $step.nodes(),
        offset: 0.8
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit)
}

function resize(){
    // console.log('resized')
}

function init(){
    $img.attr('src', `${imgPath}/cold-night.jpg`)
    setupScroller()
}

export default { init, resize };