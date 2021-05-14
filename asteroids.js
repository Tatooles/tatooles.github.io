/* jshint -W069, -W141, esversion:6 */
export {};

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
const context = canvas.getContext("2d");

let mouseX = -10;
let mouseY = -10;
let clicked = false;
canvas.onmousemove = function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    let box = /** @type {HTMLCanvasElement} */(event.target).getBoundingClientRect();
    mouseX -= box.left;
    mouseY -= box.top;
};

canvas.onmousedown = function(event) {
    clicked = true;
};
canvas.onmouseup = function(event) {
    clicked = false;
};

let locationX = 50;
let locationY = 50;

let left = false;
let right = false;
let up = false;
let down = false;
let shoot = false;

document.onkeydown = function(event){
    if(event.key == 'w'){
        up = true;
    }
    if(event.key == 's'){
        down = true;
    }
    if(event.key == 'a'){
        left = true;
    }
    if(event.key == 'd'){
        right = true;
    }
    if(event.key == ' '){
        shoot = true;
    }
}

document.onkeyup = function(event){
    if(event.key == 'w'){
        up = false;
    }
    if(event.key == 's'){
        down = false;
    }
    if(event.key == 'a'){
        left = false;
    }
    if(event.key == 'd'){
        right = false;
    }
    if(event.key == ' '){
        shoot = false;
    }
}

function drawArms(timestamp){
    context.save();
    context.rotate(Math.PI/4);
    context.fillStyle = "black";
    context.strokeStyle = "black";
    for(let i = 0; i < 4; i++){
        context.fillRect(0, -3, 40, 6);
        context.stroke();
        context.save();
        // Move to edge of propeller
        context.translate(40, 0);
        if(i < 2) { // Front two propellers spin fast
            context.rotate(timestamp/50);
        }
        else { // Back two spin slower
            context.rotate(timestamp/50);
        }
        context.fillStyle = "gray";
        context.fillRect(-13, -2, 26, 3);
        context.restore();
        context.rotate(Math.PI/2);
    }
    context.restore();
}

function drawCopter(timestamp){
    drawArms(timestamp);

    context.fillStyle = "black";
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.beginPath();
    context.arc(0, 0, 12, 0, Math.PI*2);
    context.closePath();
    context.fill();
    context.stroke();
    context.beginPath();
    context.fillStyle = "lightgreen";
    context.arc(0, 4, 4, 0, Math.PI*2);
    context.fill();
    context.closePath();
}

let enemies = [];

function drawEnemy(x, y){
    // We'll start with just an orange square
    context.save();
    context.fillStyle = "orange";
    context.fillRect(x-10, y-10, 20, 20);
    context.restore();
}

function calculateVelocity(x1, y1, x2, y2){
    let velocityX = x2 - x1;
    let velocityY = y2 - y1;
    let magnitude = Math.sqrt(velocityX*velocityX + velocityY*velocityY);
    velocityX = velocityX/magnitude;
    velocityY = velocityY/magnitude;

    return [velocityX, velocityY];
}

function spawnEnemies(delta){
    // Spawn one on each edge
    let starty1 = Math.random() * canvas.height;
    let velocity1 = calculateVelocity(0, starty1, canvas.width/2, canvas.height/2);
    enemies.push({x: 0, y: starty1, vx: velocity1[0], vy: velocity1[1]});

    let starty2 = Math.random() * canvas.height;
    let velocity2 = calculateVelocity(canvas.width, starty2, canvas.width/2, canvas.height/2);
    enemies.push({x: canvas.width, y: starty2, vx: velocity2[0], vy: velocity2[1]});

    let starty3 = Math.random() * canvas.width;
    let velocity3 = calculateVelocity(starty3, 0, canvas.width/2, canvas.height/2);
    enemies.push({x: starty3, y: 0, vx: velocity3[0], vy: velocity3[1]});

    let starty4 = Math.random() * canvas.width;
    let velocity4 = calculateVelocity(starty4, canvas.height, canvas.width/2, canvas.height/2);
    enemies.push({x: starty4, y: canvas.height, vx: velocity4[0], vy: velocity4[1]});


    // enemies.push({x: Math.random() * canvas.width, y:0, vx: 0, vy: 1});
    // enemies.push({x: 1000, y: Math.random() * canvas.height, vx: -1, vy: 0});
    // enemies.push({x: Math.random() * canvas.width, y: 500, vx: 0, vy: -1});
    // Have them move towards the middle of the screen (500, 250) for now
}

let bullets = [];
let skip = 0;
let enemyCooldown = 0;
let score = 0;

function playGame(delta, timestamp){
    const speed = delta/150;

    

    bullets.forEach(bullet => {
        bullet.x += 2*speed*bullet.vx;
        bullet.y += 2*speed*bullet.vy;
        context.save();
        context.fillStyle = "black";
        context.beginPath();
        context.arc(bullet.x, bullet.y, 1, 0, Math.PI*2);
        context.fill();
        context.restore();

        // Also check if bullet collides with an enemy
        if(enemies.length > 0){
            for(let i = enemies.length-1; i >= 0; i--){
                if(bullet.x > enemies[i].x && bullet.x < enemies[i].x + 20 && bullet.y > enemies[i].y && bullet.y < enemies[i].y + 20){
                    enemies.splice(i, 1);
                    score++;
                }
            }
        }
    });
    // This copter uses WASD keys from the user to move
    if(up == true){
        locationY -= 10;
    }
    if(down == true){
        locationY += 10;
    }
    if(left == true){
        locationX -= 10;
    }
    if(right == true){
        locationX += 10;
    }
    if(locationX < 0){
        locationX = 0;
    }
    if(locationY < 0){
        locationY = 0;
    }
    if(locationX > canvas.width){
        locationX = canvas.width;
    }
    if(locationY > canvas.height){
        locationY = canvas.height;
    }
    
    context.save();
        context.translate(locationX, locationY);
        context.rotate(Math.atan2(locationY - mouseY, locationX - mouseX) + Math.PI/2);
        drawCopter(timestamp);
    context.restore();

    enemyCooldown++;
    const enemySpeed = 200; // TODO: Change this to a normal variable and decrement it to speed up enemy spawning over time
    if(enemyCooldown >= enemySpeed){
        enemyCooldown = 0;
        spawnEnemies(delta);
    }
    //spawnEnemies(delta);

    drawEnemy();

    let i = 0;

    enemies.forEach(enemy => {
        let velocity = calculateVelocity(enemy.x, enemy.y, locationX, locationY);
        enemy.x += speed*velocity[0];
        enemy.y += speed*velocity[1];
        drawEnemy(enemy.x, enemy.y);

        // Check if enemy had hit player and therefore game over
        if(enemy.x < locationX + 30 && enemy.x > locationX - 30 && enemy.y < locationY + 30 && locationY > locationY - 30){
            game = false;
            gameOver = true;
        }
    });

    //skip++;
    //const shootSpeed = 10;

    if((shoot || clicked)){
        //skip = 0;
        // TODO: Slow attack speed by limiting how often this can happen
        let velocityX = mouseX - locationX;
        let velocityY = mouseY - locationY;
        let magnitude = Math.sqrt(velocityX*velocityX + velocityY*velocityY);
        velocityX = velocityX/magnitude;
        velocityY = velocityY/magnitude;
        bullets.push({x: locationX, y: locationY, vx: velocityX, vy:velocityY});
    }

    context.save();
    context.textAlign = "center";
    context.fillStyle = "black";
    context.font = "50px Arial";
    context.fillText(`Score: ${score}`, canvas.width - 140, canvas.height - 20);
    context.restore();
}

function playGameOver(timestamp){
    //console.log(`mouseX: ${mouseX}, mouseY: ${mouseY}`);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.textAlign = "center";
    context.fillStyle = "red";
    context.font = "50px Arial";
    context.fillText("Game Over", canvas.width/2, canvas.height/2 + 10);
    context.restore();
}

function playStartScreen(timestamp){
    //console.log(`mouseX: ${mouseX}, mouseY: ${mouseY}`);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let width = canvas.width/2;
    let height = canvas.height/2;

    let button = [width - width/4, height-height/4, width/2, height/2];

    context.fillStyle = "red";
    context.fillRect(button[0], button[1], button[2], button[3]);

    if(mouseX >= button[0] && mouseX <= button[0] + button[2] && mouseY >= button[1] && mouseY <= button[1] + button[3]){
        if(clicked){
            startScreen = false;
            game = true;
        }
        context.fillStyle = "green";
        context.fillRect(button[0], button[1], button[2], button[3]);
    }

    context.save();
    context.textAlign = "center";
    context.fillStyle = "black";
    context.font = "50px Arial";
    context.fillText("Start", canvas.width/2, canvas.height/2 + 10);
    context.restore();
}

let startScreen = true;
let game = false;
let gameOver = false;

let lastTime;

/**
 * the animation loop gets a timestamp from requestAnimationFrame
 * 
 * @param {DOMHighResTimeStamp} timestamp 
 */
function loop(timestamp) {
    // time step - convert to 1/60th of a second frames
    // 1000ms / 60fps

    const delta = (lastTime ? timestamp-lastTime : 0) * 1000.0/60.0;
    lastTime = timestamp;

    context.clearRect(0, 0, canvas.width, canvas.height);
    
    if(startScreen){
        playStartScreen(timestamp);
    }

    if(game){
        //context.fillStyle = "blue";
        playGame(delta, timestamp);
        context.fillStyle = "orange";
        // let width = 40;
        // context.fillRect(locationX - width, locationY - width, 2*width, 2*width);
    }

    if(gameOver){
        playGameOver(timestamp);
    }

    window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(loop);