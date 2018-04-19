let Towers = [],
    Enemies = [],
    Shoots = [];
let Time = 0;
let backgroundSprite;
//SETUP
let Buttons = [];
let UI;
let cannonImg;
let popSound;
const ENEMYSTARTINGPOS = 0;
const ENEMYSPEED = 1;

function preload() {
    popSound = loadSound('sounds/popSound.mp3');
    cannonImg = loadImage('./icons/cannonIcon.png');
}

function setup() {
    UI = null;
    //Center all balls
    cannonImg.resize(80, 80);
    ellipseMode(CENTER);

    createCanvas(windowWidth, windowHeight);
    backgroundSprite = createSprite(width / 2, height / 2, width, height);
    backgroundSprite.shapeColor = 'green';
    backgroundSprite.onMousePressed = () => {
        UI = null;
    }
    Towers.push(new Plot(250, 250));
    Shoots.push(new Shoot(250, 250, 1));


    //CREATE LEVELS
    generateEnemies(100);
}

setInterval(function() {
    Shoots.forEach((item) => {
        item.fire();
    });
}, 150);

//GAME LOGIC
function draw() {
    drawSprite(backgroundSprite);
    Time += 1;
    Enemies.forEach((enemy) => {
        enemy.draw();
    });
    Shoots.forEach((shoot) => {
        shoot.draw();
    });
    Towers.forEach((tower) => {
        tower.update();
    });
    //GUI should always be rendered last
    try {
        UI.update();
    } catch (e) {

    }
}

//SPECIAL MOUSE EVENT HANDLING
function mousePressed() {

}

//------------------------FUNCTIONS-----------------------------------------

function getPosition(t) {
    let x = t;
    let y = height / 2;
    return {
        x,
        y
    };
}

function generateEnemies(val) {
    while (val > 0) {
        switch (true) {
            case val >= 100:
                val -= 100;
                Enemies.push(new Enemy(100));
                break;
            case val >= 50:
                val -= 50;
                Enemies.push(new Enemy(50));
                break;
            case val >= 25:
                val -= 25;
                Enemies.push(new Enemy(25));
                break;
            case val >= 10:
                val -= 10;
                Enemies.push(new Enemy(10));
                break;
            case val >= 1:
                val -= 1;
                Enemies.push(new Enemy(1));
                break;
        }
    }
}

//CLASSES ------------------------------------------------------------------------------

class Enemy {
    constructor(value) {
        console.log(value);
        this.xPos = 0;
        this.yPos = height / 2;
        this.radius = 50;
        this.time = 0; //random(0, -100);
        this.speed = 1;
        this.value = value;
        this.futureHealth = value;
        switch (value) {
            case 1:
                this.color = 'green';
                //this.speed = 1.5;
                break;
            case 5:
                this.color = 'blue';
                //this.speed = 1.3;
                break;
            case 10:
                this.color = 'red';
                //  this.speed = 1.1;
                break;
            case 25:
                this.color = 'purple';
                //    this.speed = 0.9;
                break;
            case 50:
                this.color = 'orange';
                //      this.speed = 0.7;
                break;
            case 100:
                this.color = 'black';
                //        this.speed = 0.5;
                break;
        }
    }
}
Enemy.prototype.hit = function(force) {
    this.value -= force;
    if (this.value <= 0) {
        popSound.play();
        this.delete();
    }
}
Enemy.prototype.delete = function() {
    Enemies.splice(Enemies.indexOf(this), 1);
}
Enemy.prototype.draw = function() {
    this.time += this.speed * ENEMYSPEED;
    this.xPos = getPosition(this.time).x;
    this.yPos = getPosition(this.time).y;
    fill(255 / this.futureHealth * 10, 0, 0);
    ellipse(this.xPos, this.yPos, this.radius, this.radius);
    if (this.time <= 0) {
        this.delete();
    }
}

var mouseInArea = (xMin, xMax, yMin, yMax) => {
    if (mouseX > xMin && mouseX < xMax && mouseY > yMin && mouseY < yMax) {
        return true;
    }
}
class Shoot {
    constructor(towerX, towerY, force, howManyframesForTheBulletToGetToTheEnemy) {
        this.Bullets = [];
        this.x = towerX;
        this.y = towerY;
        this.force = force || 1;
        this.time = howManyframesForTheBulletToGetToTheEnemy || 50;
    }
}

Shoot.prototype.findEnemy = function(howManyth) {
    let sortedEnemies = Enemies.slice(0).sort((a, b) => {
        return b.time - a.time;
    });
    return sortedEnemies[howManyth];
}

Shoot.prototype.fire = function() {
    let enemy = null;
    let tmp;
    for (let i = 0; i < Enemies.length; i++) {
        try {
            tmp = this.findEnemy(i);
            if (tmp.futureHealth > 0 && tmp.time - this.time > 0) {
                enemy = tmp;
                break;
            }
        } catch (e) {}
    }
    if (!enemy) { //no valid enemies
        return;
    }
    enemy.futureHealth -= this.force;
    let aimFor
    if (ENEMYSTARTINGPOS == 0) {
        aimFor = getPosition(enemy.time + this.time * ENEMYSPEED);
    } else {
        aimFor = getPosition(ENEMYSTARTINGPOS - enemy.time + this.time * ENEMYSPEED);
    }
    let Xinc = (aimFor.x - this.x) / this.time,
        Yinc = (aimFor.y - this.y) / this.time;
    let newObj = {
        x: this.x,
        y: this.y,
        aimX: aimFor.x,
        aimY: aimFor.y,
        Xinc,
        Yinc,
        force: this.force,
        type: this.type,
        enemy
    };

    this.Bullets.push(newObj);
}

Shoot.prototype.update = function() {
    this.Bullets.forEach((item, index) => {
        item.x += item.Xinc;
        item.y += item.Yinc;
        //CHECK FOR COLLISION
        if (Math.sqrt((item.enemy.xPos - item.x) * (item.enemy.xPos - item.x) + (item.enemy.yPos - item.y) * (item.enemy.yPos - item.y)) < item.enemy.radius / 2) {
            item.enemy.hit(this.force);
            this.Bullets.splice(index, 1);
        }
    });
}

Shoot.prototype.draw = function() {
    this.update();
    this.Bullets.forEach((item) => {
        fill('black');
        ellipse(item.x, item.y, 5, 5);
    });
}
