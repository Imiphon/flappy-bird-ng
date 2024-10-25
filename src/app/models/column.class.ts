// src/app/models/column.class.ts
export class Column {
  x: number;
  y: number;
  width: number;
  gap: number;
  speed: number;
  passed: boolean;

  constructor(x: number, y: number, width: number, gap: number, speed: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.gap = gap;
    this.speed = speed;
    this.passed = false;
  }

  update(): void {
    this.x -= this.speed;
  }

  draw(ctx: CanvasRenderingContext2D, canvasHeight: number): void {
    ctx.fillStyle = 'green';
    // Draw top column
    ctx.fillRect(this.x, 0, this.width, this.y);
    // Draw bottom column
    ctx.fillRect(this.x, this.y + this.gap, this.width, canvasHeight - this.y - this.gap);
  }

  isOffScreen(): boolean {
    return this.x + this.width < 0;
  }
}
