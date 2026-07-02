const CONFIG = {
    rows: 11,
    colors: [
        '#FF0000', '#FF3333', '#FF6666',
        '#00FF00', '#33FF33', '#66FF66',
        '#FFFF00', '#FFDD00', '#FFEE00',
        '#0088FF', '#0066CC', '#0099FF',
        '#FF00FF', '#CC00CC', '#FF66FF',
        '#FF8800', '#FF6600', '#FFAA00',
        '#FF1493', '#00CED1', '#7B68EE',
        '#32CD32', '#FF4500', '#9400D3'
    ],
    animationSpeed: 60
};

let lights = [];
let rows = [];
let treeFormed = false;
let litRows = new Set();

const lightsContainer = document.getElementById('lights-container');
const snowContainer = document.getElementById('snow');

function init() {
    createSnowflakes();
    createLights();
    
    setTimeout(() => {
        animateTreeFormation();
    }, 500);
    
    document.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        turnOffAllLights();
    }
}

function createSnowflakes() {
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        
        const size = Math.random() * 5 + 2;
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.top = `${Math.random() * -100}px`;
        
        const duration = Math.random() * 5 + 5;
        snowflake.style.animationDuration = `${duration}s`;
        
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        
        snowContainer.appendChild(snowflake);
    }
}

function createLights() {
    lightsContainer.innerHTML = '';
    lights = [];
    rows = [];
    litRows.clear();
    
    const treeWidth = 400;
    const treeHeight = 450;
    
    for (let rowIndex = 0; rowIndex < CONFIG.rows; rowIndex++) {
        const rowLights = [];
        
        let lightsInThisRow;
        switch(rowIndex) {
            case 0: lightsInThisRow = 3; break;
            case 1: lightsInThisRow = 5; break;
            case 2: lightsInThisRow = 7; break;
            case 3: lightsInThisRow = 9; break;
            case 4: lightsInThisRow = 11; break;
            case 5: lightsInThisRow = 13; break;
            case 6: lightsInThisRow = 15; break;
            case 7: lightsInThisRow = 17; break;
            case 8: lightsInThisRow = 19; break;
            case 9: lightsInThisRow = 21; break;
            default: lightsInThisRow = 23;
        }
        
        const rowZone = document.createElement('div');
        rowZone.className = 'light-row';
        rowZone.style.top = `${rowIndex * (treeHeight / CONFIG.rows) + 40}px`;
        rowZone.dataset.row = rowIndex;
        
        rowZone.addEventListener('mouseenter', () => {
            if (treeFormed && !litRows.has(rowIndex)) {
                turnOnRow(rowIndex);
            }
        });
        
        lightsContainer.appendChild(rowZone);
        
        for (let lightIndex = 0; lightIndex < lightsInThisRow; lightIndex++) {
            const light = document.createElement('div');
            light.className = 'light';
            light.dataset.row = rowIndex;
            light.dataset.index = lightIndex;
            
            const colorIndex = Math.floor(Math.random() * CONFIG.colors.length);
            const color = CONFIG.colors[colorIndex];
            
            light.style.backgroundColor = '#222';
            light.dataset.originalColor = color;
            
            const startX = 100 + Math.random() * 200;
            const startY = 350 + Math.random() * 150;
            light.style.left = `${startX}px`;
            light.style.top = `${startY}px`;
            
            const rowY = rowIndex * (treeHeight / CONFIG.rows) + 40;
            
            const triangleHeight = CONFIG.rows;
            const triangleBaseWidth = treeWidth * 0.85;
            
            const rowWidth = (rowIndex / triangleHeight) * triangleBaseWidth;
            
            const centerX = (treeWidth / 2) + 10;
            
            const startXForRow = centerX - (rowWidth / 2);
            const spacing = lightsInThisRow > 1 ? rowWidth / (lightsInThisRow - 1) : 0;
            const targetX = startXForRow + (lightIndex * spacing);
            
            light.dataset.targetX = targetX;
            light.dataset.targetY = rowY;
            
            lightsContainer.appendChild(light);
            
            rowLights.push(light);
            lights.push(light);
            
            light.addEventListener('mouseenter', handleLightMouseEnter);
        }
        
        rows.push(rowLights);
    }
    
    treeFormed = false;
}

function animateTreeFormation() {
    let delay = 0;
    
    rows.forEach((rowLights, rowIndex) => {
        rowLights.forEach((light, lightIndex) => {
            const randomDelay = Math.random() * 40;
            
            setTimeout(() => {
                const targetX = parseFloat(light.dataset.targetX);
                const targetY = parseFloat(light.dataset.targetY);
                
                light.style.transition = `left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)`;
                light.style.left = `${targetX}px`;
                light.style.top = `${targetY}px`;
                
                if (rowIndex === rows.length - 1 && lightIndex === rowLights.length - 1) {
                    setTimeout(() => {
                        treeFormed = true;
                        lights.forEach(l => {
                            l.style.transition = 'all 0.3s ease';
                        });
                    }, 800);
                }
            }, delay + randomDelay);
            
            delay += CONFIG.animationSpeed / rows.length;
        });
    });
}

function handleLightMouseEnter(event) {
    if (!treeFormed) return;
    
    const light = event.target;
    const rowIndex = parseInt(light.dataset.row);
    
    if (!litRows.has(rowIndex)) {
        turnOnRow(rowIndex);
    }
    
    const fromBelow = event.movementY < 0;
    if (fromBelow) {
        for (let i = 0; i < rowIndex; i++) {
            setTimeout(() => {
                if (!litRows.has(i)) {
                    turnOnRow(i);
                }
            }, (rowIndex - i) * 40);
        }
    }
}

function turnOnRow(rowIndex) {
    if (rowIndex < 0 || rowIndex >= rows.length) return;
    
    rows[rowIndex].forEach(light => {
        const originalColor = light.dataset.originalColor;
        light.classList.add('on');
        light.style.backgroundColor = originalColor;
        light.style.boxShadow = `0 0 10px 3px ${originalColor}`;
    });
    
    litRows.add(rowIndex);
}

function turnOffAllLights() {
    rows.forEach((rowLights, rowIndex) => {
        rowLights.forEach(light => {
            light.classList.remove('on');
            light.style.backgroundColor = '#222';
            light.style.boxShadow = '0 0 3px rgba(0, 0, 0, 0.5)';
        });
    });
    
    litRows.clear();
}

document.addEventListener('DOMContentLoaded', init);