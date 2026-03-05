
import './style.css'
import Stats from "stats.js"
import World from './Experience/World'

const canvas = document.querySelector('.webgl')
const stats = new Stats()

stats.showPanel(0) // 0 = FPS
document.body.appendChild(stats.dom)

stats.dom.style.position = "absolute"
stats.dom.style.top = "0px"
stats.dom.style.left = "0px"
new World(canvas)