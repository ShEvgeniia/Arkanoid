class ArkanoidGame{
    constructor() {
        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x0f0f1e,
            antialias: true,
        });

        document.getElementById('game-container').appendChild(this.app.view);
        this.scene = this.app.stage;

        this.FIELD_WIDTH = 800;
        this.FIELD_HEIGHT = 600;

        this.PLATFORM_WIDTH = 110;
        this.PLATFORM_HEIGHT = 16;
        this.PLATFORM_Y = 560;

        this.BALL_RADIUS = 8;

        this.BRICK_ROWS = 6;
        this.BRICK_COLS = 10;
        this.BRICK_WIDTH = 64;
        this.BRICK_HEIGHT = 22;
        this.BRICK_GAP = 6;
        this.BRICK_TOP_OFFSET = 60;

        this.platform = this.createPlatform();
        this.ball = this.createBall();
        this.bricks = this.createBricks();

        this.setupControls();

        this.gameState = 'READY';

        // скорость мяча
        this.ballVX = 0;
        this.ballVY = 0;

        this.BALL_SPEED = 5;

        this.setupClickHandler();
        this.setupGameLoop();
    }

    createPlatform() {
        const platform = new PIXI.Graphics();

        platform.beginFill(0x00d9ff);
        platform.drawRect(0, 0, this.PLATFORM_WIDTH, this.PLATFORM_HEIGHT);
        platform.endFill();

        platform.x = this.FIELD_WIDTH / 2 - this.PLATFORM_WIDTH / 2;
        platform.y = this.PLATFORM_Y;

        this.scene.addChild(platform);
        return platform;
    }


    createBricks() {
        const bricks = [];

        const rosWidth = this.BRICK_COLS * this.BRICK_WIDTH + (this.BRICK_COLS - 1) * this.BRICK_GAP;

        const startX = (this.FIELD_WIDTH - rosWidth) / 2;

        const rowColors = [0xff3864, 0xff7b00, 0xffd400, 0x4ade80, 0x38bdf8, 0xa855f7,];
        
        for (let row = 0; row < this.BRICK_ROWS; row++) {
            for (let col = 0; col < this.BRICK_COLS; col++) {
                
                const brick = new PIXI.Graphics();

                brick.beginFill(rowColors[row]);
                brick.drawRect(0, 0, this.BRICK_WIDTH, this.BRICK_HEIGHT);
                brick.endFill();

                brick.x = startX + col * (this.BRICK_WIDTH + this.BRICK_GAP) 
                brick.y = this.BRICK_TOP_OFFSET + row * (this.BRICK_HEIGHT + this.BRICK_GAP);

                this.scene.addChild(brick);
                bricks.push(brick);
            }
        }
        return bricks;

    }
    createBall() {
        const ball = new PIXI.Graphics();

        ball.beginFill(0xffffff);
        ball.drawCircle(0, 0, this.BALL_RADIUS);
        ball.endFill();

        ball.x = this.FIELD_WIDTH / 2;
        ball.y = this.PLATFORM_Y - this.BALL_RADIUS - 2;

        this.scene.addChild(ball);
        return ball;
    }

    setupControls() {
        window.addEventListener('mousemove', (event) => {
            this.movePlatform(event);
        });
    }

    movePlatform(){
        const rect = this.app.view.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;

        let newX = mouseX - this.PLATFORM_WIDTH / 2;

        if (newX < 0) {
            newX = 0;
        }
        if (newX > this.FIELD_WIDTH - this.PLATFORM_WIDTH) {
            newX = rhis.FIELD_WIDTH - this.PLATFORM_WIDTH;
        }

        this.platform.x = newX;
    }

    setupClickHandler() {
        window.addEventListener('click', () => {
            if (this.gameState === 'READY') {
                this.launchBall();
            }
        });
    }

    launchBall() {
        this.gameState = 'PLAYING';

        this.ballVX = this.BALL_SPEED;
        this.ballVY = -this.BALL_SPEED;
    }

    setupGameLoop() {
        this.app.ticker.add(() => {
            if(this.gameState === 'PLAYING') {
                this.updateBall();
            } else if (this.gameState === 'READY') {
                this.stickBallToPLatform();
            }
        });
    }

    stickBallToPLatform() {
        this.ball.x = this.platform.x + this.PLATFORM_WIDTH / 2;

        this.ball.y = this.PLATFORM_Y - this.BALL_RADIUS - 2;
    }

    updateBall() {
        this.ball.x += this.ballVX;
        this.ball.y += this.ballVY;

        if (this.ball.x - this.BALL_RADIUS < 0) {
            this.ball.x = this.BALL_RADIUS;
            this.ballVX = -this.ballVX;
        }

        if (this.ball.x + this.BALL_RADIUS > this.FIELD_WIDTH) {
            this.ball.x = this.FIELD_WIDTH - this.BALL_RADIUS;
            this.ballVX = -this.ballVX;
        }

        if (this.ball.y - this.BALL_RADIUS < 0) {
            this.ball.y = this.BALL_RADIUS;
            this.ballVY = -this.ballVY;
        }

        if (this.ball.y - this.BALL_RADIUS > this.FIELD_HEIGHT) {
            this.resetBall();
        }
    }

    resetBall() {
        this.gameState = 'READY';
        this.ballVX = 0;
        this.ballVY = 0;
        this.stickBallToPLatform();
    }

}
window.addEventListener('load', () => {
    new ArkanoidGame();
});