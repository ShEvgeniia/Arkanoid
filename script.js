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


}
window.addEventListener('load', () => {
    new ArkanoidGame();
});