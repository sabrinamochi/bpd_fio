import scrollama from 'scrollama'

const imgPath = 'assets/images'

const $section = d3.select('#warren-scroll')
const $step = $section.selectAll('.step')
const $img = $section.select('.warren-img')
const scroller = scrollama()

let currentStep = 'cold-night'

const STEP = {
    'cold-night': () => {
        $img.attr('src', `${imgPath}/cold-night.jpg`)
    },
    'chase': () => {
        $img.attr('src', `${imgPath}/chase.jpg`)
    },
    'arrest': () => {
        $img.attr('src', `${imgPath}/arrest.jpg`)
    }
}

function handleStepEnter({index, element, direction}){
    currentStep = d3.select(element).attr('data-step')
    STEP[currentStep]()
}

function handleStepExit({index, element, direction}){

}


function setupScroller(){
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