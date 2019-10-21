document.addEventListener("DOMContentLoaded", () => {

    window.addEventListener("resize", () => {World.setCanvasSize()});
    World.setCanvas();
    World.createDrifts();
    setInterval(() => {World.createSnow()}, World.renderSpeed);
    World.moveSnow();

    window.addEventListener("mousemove", Mouse.updatePos);
});

//Object responsible for drawing snowflakes and modyfiing snowdrifts
let World =
{
    gravity: 0.05, //Speed of falling snowflakes
    wind: 0.1, //Speed of moving snowflakes to sides (value above 0 is move to the right)
    acceleration: 0.2, //speed of gaining maximum speed 1 means 100% 0.2 means 20% etc.
    canvas: {}, //main canvas for drawing snowflakes
    ctx: {}, //canvas ctx

    //setting canvas, run only once
    setCanvas: function () {
        this.canvas = document.querySelector("#flakesCanvas");
        this.setCanvasSize();
        this.ctx = this.canvas.getContext("2d");
    },

    //sets canvas size, runs on start and when window size changes
    setCanvasSize: function () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    //Renders snowflakes, runs every frame
    moveSnow: function () {
        //Clearing screen and setting render values
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "white";
        this.snowflakes.forEach((flake, i, obj) => {
            //If snowflake is lying on snowdrift
            if (flake.melting) {
                //is snowflake shrinkes to zero, deleting it
                if (flake.size > 0) flake.melt();
                else obj.splice(i, 1);
            }
            //if it is still on air, then moving it
            else flake.move();
        });

        requestAnimationFrame(() => { this.moveSnow() });
    },
    
    snowflakes: [], //list of all snowflakes on screen
    renderSpeed: 20, //speed of spawning snowflakes in miliseconds
    maxSnowflakes: 400, //Maximum number of snowflakes on screen
    //Renders snowflakes
    createSnow: function () {
        if (this.snowflakes.length < this.maxSnowflakes)
            this.snowflakes.push(new SnowFlake)
    
    },

    snowdrifts: [], //List of snowdrifts
    numberOfDrifts: 100, //Number of snow drifts on screen
    //creates snow drifts, runs only once on start
    createDrifts: function () {
        for (let i = 0; i < 100; i++) {
            let tmp = document.createElement("div");
            tmp.classList.add("snowDrift");
            tmp.style.width = 1 + "%";
            tmp.style.height = "20px";
            tmp.height = 20;
            tmp = document.querySelector("#snowdriftsContainer").appendChild(tmp);
            this.snowdrifts.push(tmp);
        }
    },
    
    //Makes snowdrifts grow
    snowdriftGrow: function (id, value) {
        this.snowdrifts[id].height += value / 3;
        this.snowdrifts[id].style.height = this.snowdrifts[id].height + "px";
    
        //making neibghour snow drifts grow
        if (value > 0.01) {
            if (id > 0 && this.snowdrifts[id].height > this.snowdrifts[id - 1].height)
                this.snowdriftGrow(id - 1, value / 1.5)
            if (id < 99 && this.snowdrifts[id].height > this.snowdrifts[id + 1].height)
                this.snowdriftGrow(id + 1, value / 1.5)
        }
    }
}

//Constructor of single snowflake
function SnowFlake() 
{
    this.Pos =
        {
            x: (Math.random() * 130 % 130) - 30, //Value in %
            y: -50 //Value in px
        }
    this.size = Math.random() * 22 + 15;
    this.melting = false; //flag that is blocking snowflake move
    this.velocity =
        {
            x: 0, //value in %
            y: 0 //value in px
        }
}

//Renders single snowflake, update it's position, and check is it on snowdrift
SnowFlake.prototype.move = function () 
{    
    //Change horizontal velocity of snowflake
    if (this.velocity.x < World.wind) this.velocity.x += World.wind * World.acceleration / this.size;
    else if (this.velocity.x > World.wind) this.velocity.x -= World.wind * World.acceleration / this.size;

    //Change vertical velocity of snowflake
    let forceY = World.gravity * this.size
    if (this.velocity.y < forceY) this.velocity.y += forceY * World.acceleration / this.size;
    else if (this.velocity.y > forceY) this.velocity.y -= forceY * World.acceleration / this.size;
    
    //Update position
    this.Pos.x += this.velocity.x;
    this.Pos.y += this.velocity.y;
    
    //Set size and position of snowflake
    World.ctx.font = this.size + "px  Arial";
    World.ctx.fillText("*", (this.Pos.x * window.innerWidth * 0.01), this.Pos.y);
    
    //Set snow drift id that snowflake is currently above of
    let sdId = parseInt(this.Pos.x);
    //If snowflake is within screen
    if (sdId < 100 && sdId > 0) {
        //If snowflake lands on snow drift
        if (this.Pos.y > window.innerHeight - World.snowdrifts[sdId].height + (this.size / 2)) {
            //Snow drift grow value is relative to snoflake size
            let value = this.size / 20;
            World.snowdriftGrow(sdId, value);

            this.melt(); //start shrinking snowflake
            this.melting = true; //stopping snowflake move
        }
        
        //Chcecks if cursor is near. Horizontaly
        if (sdId > Mouse.border.left && sdId < Mouse.border.right) {
            //and verticaly
            if (this.Pos.y < Mouse.pos.y + 50 && this.Pos.y > Mouse.pos.y - 50) {
                //Adds velocity to snowflake
                this.velocity.x = (Mouse.pushStrenght/2 - (Math.abs(Mouse.pos.x - this.Pos.x) / 25)) * Math.sign(Mouse.pos.x - this.Pos.x) * -1;
                this.velocity.y = (Mouse.pushStrenght - (Math.abs(Mouse.pos.y - this.Pos.y) / 20)) * Math.sign(Mouse.pos.y - this.Pos.y);
            }
        }
    }
    //If snowflake is outside screen then destroy it
    else if (this.Pos.y > window.innerHeight) {
        this.melting = true;
    }
}

//Shrinks snowflake every frame and renders it
SnowFlake.prototype.melt = function () 
{
    World.ctx.font = this.size + "px  Arial";
    World.ctx.fillText("*", (this.Pos.x * window.innerWidth * 0.01), this.Pos.y);
    this.size -= 0.2;
}

//Object holding cursor position, and its push strength
let Mouse =
{
    pos:
        {
            x: 0,
            y: 0
        },
    border:
        {
            left: 0,
            right: 0
        },
    rangeX: 7,
    pushStrenght: 0.8,
    updatePos: function (e) {
        Mouse.pos.x = parseInt((e.offsetX / window.innerWidth) * 100 % 100)
        Mouse.pos.y = e.offsetY;
        Mouse.border.left = Mouse.pos.x - Mouse.rangeX;
        Mouse.border.right = Mouse.pos.x + Mouse.rangeX;

    }
}