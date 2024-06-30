document.getElementById('fileInput').addEventListener('change', handleFileUpload);

const canvas = document.getElementById('animationCanvas');
const context = canvas.getContext('2d');

const config = {
    screenWidth: canvas.width,
    screenHeight: canvas.height,
    backgroundColor: '#FFF2D7',
    ballColor: '#000000',
    ballRadius: 5,
    pathThickness: 4,
    ballSpeed: 1,  // Adjust ball speed here (lower value means slower)
    hueOffset: 0,  // Initial hue offset for path color
    hueIncrement: 0.04,  // Hue increment for color change along path
    viewFullPath: false,  // Toggle to view full path
    rgbPath: true  // Toggle to use RGB path or single color path
};

let path = [];
let index = 0;
let animationRequestId = null; // To store requestAnimationFrame ID

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            path = parseCoordinates(content);
            index = 0;  // Reset the animation
            if (config.viewFullPath) {
                drawFullPaths();  // Draw full path if view full path is enabled
            } else {
                animate();  // Otherwise, start animation after loading coordinates
            }
        };
        reader.readAsText(file);
    }
}

function parseCoordinates(data) {
    const lines = data.trim().split('\n');
    const coordinates = [];
    for (const line of lines) {
        if (line.startsWith('#')) continue;
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
            const theta = parseFloat(parts[0]);
            const rho = parseFloat(parts[1]);
            if (!isNaN(theta) && !isNaN(rho)) {
                coordinates.push({ theta, rho });
            }
        }
    }
    return coordinates;
}

function polarToCartesian(theta, rho) {
    const x = rho * Math.cos(theta);
    const y = rho * Math.sin(theta);
    return { x, y };
}

function drawPath(startIndex = 0, endIndex = path.length - 1) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = config.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.lineWidth = config.pathThickness;

    let hue = config.hueOffset;
    for (let i = startIndex + 1; i <= endIndex; i++) {
        const { theta: theta1, rho: rho1 } = path[i - 1];
        const { theta: theta2, rho: rho2 } = path[i];
        const { x: x1, y: y1 } = polarToCartesian(theta1, rho1);
        const { x: x2, y: y2 } = polarToCartesian(theta2, rho2);

        let strokeStyle = config.rgbPath ? `hsl(${hue}, 100%, 50%)` : '#FFE0B5'; // Beige color

        if (config.rgbPath) {
            const startColor = `hsl(${hue}, 100%, 50%)`;
            const endColor = `hsl(${hue + config.hueIncrement}, 100%, 50%)`;

            const gradient = context.createLinearGradient(
                x1 * config.screenWidth / 2 + config.screenWidth / 2,
                y1 * config.screenHeight / 2 + config.screenHeight / 2,
                x2 * config.screenWidth / 2 + config.screenWidth / 2,
                y2 * config.screenHeight / 2 + config.screenHeight / 2
            );
            gradient.addColorStop(0, startColor);
            gradient.addColorStop(1, endColor);

            strokeStyle = gradient;
        }

        context.strokeStyle = strokeStyle;
        context.beginPath();
        context.moveTo(x1 * config.screenWidth / 2 + config.screenWidth / 2, y1 * config.screenHeight / 2 + config.screenHeight / 2);
        context.lineTo(x2 * config.screenWidth / 2 + config.screenWidth / 2, y2 * config.screenHeight / 2 + config.screenHeight / 2);
        context.stroke();

        hue += config.hueIncrement;
    }
}

function drawFullPaths() {
    cancelAnimationFrame(animationRequestId); // Stop any ongoing animation
    drawPath(0, path.length - 1); // Draw the full path
}

function drawBall() {
    if (index < path.length) {
        const { theta, rho } = path[index];
        const { x, y } = polarToCartesian(theta, rho);
        context.fillStyle = config.ballColor;
        context.beginPath();
        context.arc(x * config.screenWidth / 2 + config.screenWidth / 2, y * config.screenHeight / 2 + config.screenHeight / 2, config.ballRadius, 0, 2 * Math.PI);
        context.fill();
    }
}

function animate() {
    drawPath(0, index);
    drawBall();
    index += config.ballSpeed;
    if (index <= path.length) {
        animationRequestId = requestAnimationFrame(animate);
    }
}

// Event listener for checkboxes
document.getElementById('viewFullPathCheckbox').addEventListener('change', function() {
    config.viewFullPath = this.checked;
    if (config.viewFullPath) {
        drawFullPaths();
    } else {
        animate();
    }
});

document.getElementById('rgbPathCheckbox').addEventListener('change', function() {
    config.rgbPath = this.checked;
    if (config.viewFullPath) {
        drawFullPaths();
    } else {
        animate();
    }
});
