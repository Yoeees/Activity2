import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

// Scene, Camera, and Renderer
const scene = new THREE.Scene()
scene.fog = new THREE.Fog('#262837', 1, 15)

const canvas = document.querySelector('canvas.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#262837')
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(4, 5, 8)

// Orbit Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

function createHouse(position, scale = 1) {
    const houseGroup = new THREE.Group()

    // Walls
    const walls = new THREE.Mesh(
        new THREE.BoxGeometry(4, 2.5, 4),
        new THREE.MeshStandardMaterial({ color: '#ac8e82' })
    )
    walls.scale.set(scale, scale, scale)
    walls.position.y = 1.25 * scale
    houseGroup.add(walls)

    // Roof
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(3.5 * scale, 1 * scale, 4),
        new THREE.MeshStandardMaterial({ color: '#b35f45' })
    )
    roof.position.y = (2.5 + 0.5) * scale
    roof.rotation.y = Math.PI * 0.25
    houseGroup.add(roof)

    // Door
    const door = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2 * scale, 2.2 * scale),
        new THREE.MeshStandardMaterial({ color: '#aa7b7b' })
    )
    door.position.y = 1 * scale
    door.position.z = 2 * scale + 0.01
    houseGroup.add(door)

    // Bushes
    const bushGeometry = new THREE.SphereGeometry(1 * scale, 16, 16)
    const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

    const bushPositions = [
        { scale: 0.5 * scale, position: [0.8 * scale, 0.2 * scale, 2.2 * scale] },
        { scale: 0.25 * scale, position: [1.4 * scale, 0.1 * scale, 2.1 * scale] },
        { scale: 0.4 * scale, position: [-0.8 * scale, 0.1 * scale, 2.2 * scale] },
        { scale: 0.15 * scale, position: [-1 * scale, 0.05 * scale, 2.6 * scale] }
    ]

    bushPositions.forEach(bush => {
        const bushMesh = new THREE.Mesh(bushGeometry, bushMaterial)
        bushMesh.scale.set(bush.scale, bush.scale, bush.scale)
        bushMesh.position.set(...bush.position)
        houseGroup.add(bushMesh)
    })

    // Position the entire house group
    houseGroup.position.set(...position)

    return houseGroup
}

// Add Mini Houses
const miniHouses = [
    createHouse([5, 0, -5], 0.5),
    createHouse([-5, 0, -5], 0.6),
    createHouse([-6, 0, 6], 0.7),
    createHouse([6, 0, 6], 0.5),
]

miniHouses.forEach(miniHouse => scene.add(miniHouse))

class FloatingGhost extends THREE.Group {
    constructor(color = 0xffffff, size = 0.5, surveyBehavior = false) {
        super()

        // Ghost body
        const ghostGeometry = new THREE.SphereGeometry(size, 32, 32)
        const ghostMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.7,
            emissive: color,
            emissiveIntensity: 0.5
        })
        const ghostMesh = new THREE.Mesh(ghostGeometry, ghostMaterial)
        ghostMesh.position.y = 1
        this.add(ghostMesh)

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16)
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
        leftEye.position.set(-0.2, 1, 0.3)
        this.add(leftEye)

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
        rightEye.position.set(0.2, 1, 0.3)
        this.add(rightEye)

        // Surveying behavior properties
        this.surveyBehavior = surveyBehavior
        this.surveyTarget = null
        this.surveyRadius = 5
        this.surveySpeed = Math.random() * 0.5 + 0.2
        this.surveyDirection = Math.random() > 0.5 ? 1 : -1

        // Store initial position for floating animation
        this.initialY = this.position.y
    }

    setSurveyTarget(target) {
        this.surveyTarget = target
    }

    animate(elapsedTime) {
        // Floating animation
        this.position.y = this.initialY + Math.sin(elapsedTime) * 0.2
        
        // Gentle rotation
        this.rotation.y = elapsedTime * 0.2

        // Surveying behavior
        if (this.surveyBehavior && this.surveyTarget) {
            const angle = elapsedTime * this.surveySpeed * this.surveyDirection
            const targetVector = this.surveyTarget.position.clone()
            
            // Circle around the target
            this.position.x = targetVector.x + Math.cos(angle) * this.surveyRadius
            this.position.z = targetVector.z + Math.sin(angle) * this.surveyRadius

            // Look at the target
            this.lookAt(targetVector)
        }
    }
}


// Create floating ghosts

// Graves
const graves = new THREE.Group()
scene.add(graves)

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' })

for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 3 + Math.random() * 6
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius
    
    const grave = new THREE.Mesh(graveGeometry, graveMaterial)
    grave.position.set(x, 0.3, z)
    grave.rotation.y = (Math.random() - 0.5) * 0.4
    grave.rotation.z = (Math.random() - 0.5) * 0.4
    graves.add(grave)
}

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: '#a9c388' })
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

// Lights
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
scene.add(ambientLight)

const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12)
moonLight.position.set(4, 5, -2)
scene.add(moonLight)

// Point Light Ghosts
const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
const ghost4 = new THREE.PointLight('#00ff00', 2, 3)
const ghost5 = new THREE.PointLight('#ff6600', 2, 3)
const ghost6 = new THREE.PointLight('#6600ff', 2, 3)

const floatingGhosts = [
    // Regular ghosts
    new FloatingGhost(0xff00ff, 0.4),
    new FloatingGhost(0x00ffff, 0.3),
    new FloatingGhost(0xffff00, 0.5),
    
    // Surveying ghosts
    new FloatingGhost(0x00ff00, 0.45, true),  // Green surveying ghost
    new FloatingGhost(0xff6600, 0.35, true),  // Orange surveying ghost
    new FloatingGhost(0x6600ff, 0.55, true)   // Purple surveying ghost
]

// Position ghosts around the scene
floatingGhosts[0].position.set(4, 1, 2)
floatingGhosts[1].position.set(-3, 1, -4)
floatingGhosts[2].position.set(2, 1, -2)

// Position surveying ghosts
floatingGhosts[3].position.set(6, 1, 0)  // Near house
floatingGhosts[4].position.set(-5, 1, 3)  // Near graves
floatingGhosts[5].position.set(0, 1, -5)  // Center of scene

const surveyTargets = [
    { position: new THREE.Vector3(4, 1, 2) },   // House target
    { position: new THREE.Vector3(0, 0, 0) },  // Scene center
    { position: new THREE.Vector3(-3, 0, -4) } // Graves area
]

floatingGhosts[3].setSurveyTarget(surveyTargets[0])  // Green ghost surveys house
floatingGhosts[4].setSurveyTarget(surveyTargets[1])  // Orange ghost surveys scene center
floatingGhosts[5].setSurveyTarget(surveyTargets[2])  // Purple ghost surveys graves

const gui = new dat.GUI()
// Add ghosts to scene
floatingGhosts.forEach(ghost => scene.add(ghost))
scene.add(ghost1, ghost2, ghost3, ghost4, ghost5, ghost6)

const ghost1Folder = gui.addFolder('Ghost 1')
ghost1Folder.add(ghost1.position, 'x').min(-10).max(10).step(0.1).name('Position X')
ghost1Folder.add(ghost1.position, 'y').min(-10).max(10).step(0.1).name('Position Y')
ghost1Folder.add(ghost1.position, 'z').min(-10).max(10).step(0.1).name('Position Z')
ghost1Folder.addColor(ghost1, 'color').name('Color')

const ghost2Folder = gui.addFolder('Ghost 2')
ghost2Folder.add(ghost2.position, 'x').min(-10).max(10).step(0.1).name('Position X')
ghost2Folder.add(ghost2.position, 'y').min(-10).max(10).step(0.1).name('Position Y')
ghost2Folder.add(ghost2.position, 'z').min(-10).max(10).step(0.1).name('Position Z')
ghost2Folder.addColor(ghost2, 'color').name('Color')

const ghost3Folder = gui.addFolder('Ghost 3')
ghost3Folder.add(ghost3.position, 'x').min(-10).max(10).step(0.1).name('Position X')
ghost3Folder.add(ghost3.position, 'y').min(-10).max(10).step(0.1).name('Position Y')
ghost3Folder.add(ghost3.position, 'z').min(-10).max(10).step(0.1).name('Position Z')
ghost3Folder.addColor(ghost3, 'color').name('Color')


// Animation
const clock = new THREE.Clock()

const animate = () => {
    const elapsedTime = clock.getElapsedTime()

    // Animate point light ghosts
    const ghost1Angle = elapsedTime * 0.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    ghost1.position.y = Math.sin(elapsedTime * 3)
    
    const ghost2Angle = - elapsedTime * 0.32
    ghost2.position.x = Math.cos(ghost2Angle) * 5
    ghost2.position.z = Math.sin(ghost2Angle) * 5
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)
    
    const ghost3Angle = elapsedTime * 0.18
    ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
    ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
    ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

    // Animate floating ghosts
    floatingGhosts.forEach(ghost => ghost.animate(elapsedTime))

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(animate)
}

animate()

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})