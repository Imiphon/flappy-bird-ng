export class Bird {
  x: number;
  y: number;
  width = 40;
  height = 30;
  velocity = 0;
  gravity = 0.07;
  lift = -0.7;
  image1: HTMLImageElement;
  image2: HTMLImageElement;
  frame = 0;
  maxVelocity = 3;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.image1 = new Image();
    this.image1.src = 'assets/images/flappy-bird1.png';
    this.image2 = new Image();
    this.image2.src = 'assets/images/flappy-bird2.png';
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if ((this.image1.complete && this.image1.naturalHeight !== 0) && (this.image2.complete && this.image1.naturalHeight !== 0)) {
      if (this.frame % 20 < 10) {
        ctx.drawImage(this.image1, this.x, this.y, this.width, this.height);
      } else {
        ctx.drawImage(this.image2, this.x, this.y, this.width, this.height);
      }
    }
  }

  update(spacePressed: boolean): void {
    if (spacePressed) {
      this.velocity += this.lift;
    } else {
      this.velocity += this.gravity; // Nur einmal Schwerkraft anwenden
    }
  
    if (this.velocity > this.maxVelocity) {
      this.velocity = this.maxVelocity; // Begrenzung der Fallgeschwindigkeit
    } else if (this.velocity < -this.maxVelocity) {
      this.velocity = -this.maxVelocity; // Begrenzung der Aufstiegsgeschwindigkeit
    }
    this.y += this.velocity;
    this.frame++;
  }

  reset(y: number): void {
    this.y = y;
    this.velocity = 0;
  }
}  