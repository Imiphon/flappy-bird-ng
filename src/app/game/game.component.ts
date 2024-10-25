import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Bird } from './../models/bird.class';
import { Column } from './../models/column.class';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;

  bird!: Bird;
  columns: Column[] = [];
  columnWidth = 60;
  columnGap = 150;
  columnSpeed = 2;
  columnFrequency = 150; // Frames

  frameCount = 0;
  gameRunning = false;
  gamePaused = false;
  spacePressed = false;

  // Zähler für passierte Columns
  passedColumns = 0;

  // Rekord
  record = 0;

  // Button properties
  buttonImage = new Image();
  buttonWidth = 50;
  buttonHeight = 50;
  buttonX = 0; // to be calculated dynamically
  buttonY = 0; // to be calculated dynamically

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.bird = new Bird(100, 300);

    // load localStorage if exist
    const storedRecord = localStorage.getItem('flappyBirdRecord');
    if (storedRecord) {
      this.record = parseInt(storedRecord, 10); // string to nr
    }

    // Load the button image
    this.buttonImage.src = 'assets/images/flappy-bird1.png';
    this.buttonImage.onload = () => {
      this.buttonX = this.canvas.nativeElement.width - this.buttonWidth - 20; // 10px padding from right
      this.buttonY = this.canvas.nativeElement.height - this.buttonHeight - 20; // 10px padding from bottom
    };
    this.resizeCanvas();
    this.startGame();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.resizeCanvas();
  }

  resizeCanvas(): void {
    this.canvas.nativeElement.width = window.innerWidth;
    this.canvas.nativeElement.height = window.innerHeight;
    this.buttonX = this.canvas.nativeElement.width - this.buttonWidth - 20; // Adjust button position
    this.buttonY = this.canvas.nativeElement.height - this.buttonHeight - 20;
    this.draw();  // Redraw the canvas after resizing
  }

  startGame(): void {
    this.gameRunning = true;
    this.passedColumns = 0;  // Zähler zurücksetzen, wenn das Spiel startet
    this.gameLoop();
  }

  gameLoop(): void {
    if (!this.gameRunning) return;

    if (!this.gamePaused) {
      this.update();
      this.draw();
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  update(): void {
    this.bird.update(this.spacePressed);

    // Create new columns
    this.frameCount++;
    if (this.frameCount % this.columnFrequency === 0) {
      this.addColumn();
    }

    // Update columns
    for (let column of this.columns) {
      column.update();

      // Überprüfen, ob der Vogel die Column erfolgreich passiert hat
      if (!column.passed && column.x + this.columnWidth < this.bird.x) {
        column.passed = true;
        this.passedColumns++;  // Zähler erhöhen
      }
    }

    // Remove off-screen columns
    this.columns = this.columns.filter(column => !column.isOffScreen());

    // Check collisions
    this.checkCollisions();
  }

  draw(): void {
    // Clear the canvas and set background color
    this.ctx.fillStyle = 'blue';
    this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    // Draw the bird
    this.bird.draw(this.ctx);

    // Draw columns
    for (let column of this.columns) {
      column.draw(this.ctx, this.canvas.nativeElement.height);
    }

    // Draw the button at the bottom right corner
    this.ctx.drawImage(this.buttonImage, this.buttonX, this.buttonY, this.buttonWidth, this.buttonHeight);

    // Draw the pause button
    this.ctx.fillStyle = 'red';  // Button Farbe
    this.ctx.fillRect(20, 20, 100, 40); // Pause-Button oben links
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Pause', 35, 45);  // Text auf dem Pause-Button

    // Anzahl der passierten Columns und Rekord oben links anzeigen
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Passed Columns: ${this.passedColumns}`, 10, 80);
    this.ctx.fillText(`Record: ${this.record}`, 10, 110); // Zeige den Rekord an
  }


  addColumn(): void {
    const canvasHeight = this.canvas.nativeElement.height;
    const minHeight = 50;
    const maxHeight = canvasHeight - this.columnGap - 50;
    const columnY = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    this.columns.push(new Column(
      this.canvas.nativeElement.width,
      columnY,
      this.columnWidth,
      this.columnGap,
      this.columnSpeed
    ));
  }

  checkCollisions(): void {
    if (this.bird.y + this.bird.height > this.canvas.nativeElement.height || this.bird.y < 0) {
      this.endGame(); // Spiel abbrechen, wenn der Vogel mit dem Boden/Decke kollidiert
    }

    for (let column of this.columns) {
      if (
        this.bird.x < column.x + column.width &&
        this.bird.x + this.bird.width > column.x &&
        (this.bird.y < column.y || this.bird.y + this.bird.height > column.y + this.columnGap)
      ) {
        this.endGame(); // Spiel abbrechen, wenn der Vogel eine Column trifft
      }
    }
  }

  endGame(): void {
    // Vergleiche die Anzahl der passierten Columns mit dem Rekord
    if (this.passedColumns > this.record) {
      this.record = this.passedColumns; // Neuer Rekord
      localStorage.setItem('flappyBirdRecord', this.record.toString()); // Im localStorage speichern
    }

    this.resetGame();
  }

  resetGame(): void {
    this.bird.reset(300);
    this.columns = [];
    this.frameCount = 0;
    this.passedColumns = 0;  // Zähler zurücksetzen, wenn das Spiel neu gestartet wird
    this.gamePaused = false; 
  }

  // restartGame(): void {
  //   this.resetGame();
  //   this.gamePaused = false;
  // }

  togglePause(): void {
    this.gamePaused = !this.gamePaused;
    console.log('togglePause');
  }

  //for keyboard
  @HostListener('window:keydown', ['$event'])
handleKeyDown(event: KeyboardEvent): void {
  if (event.code === 'Space') {
    this.spacePressed = true;  // Simulate space press
  } else if (event.code === 'KeyP') {
    this.togglePause();  // Simulate pause toggle when 'P' is pressed
  }
}
     
@HostListener('window:keyup', ['$event'])
handleKeyUp(event: KeyboardEvent): void {
  if (event.code === 'Space') {
    this.spacePressed = false;  // Stop space press simulation
  }
}

//four mouse
@HostListener('mousedown', ['$event'])
handleMouseDown(event: MouseEvent): void {
  const rect = this.canvas.nativeElement.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Check if mousedown is within the space button area
  if (
    x >= this.buttonX &&
    x <= this.buttonX + this.buttonWidth &&
    y >= this.buttonY &&
    y <= this.buttonY + this.buttonHeight
  ) {
    this.spacePressed = true;  // Simulate space press
  }

  // Check if mousedown is within the pause button area (assumed at position (20, 20))
  if (x >= 20 && x <= 120 && y >= 20 && y <= 60) {
    this.togglePause();  // Pause button clicked
  }
}

@HostListener('mouseup', ['$event'])
handleMouseUp(event: MouseEvent): void {
  this.spacePressed = false;  // Stop simulating space press when mouse is released
}

//for touchscreen
@HostListener('touchstart', ['$event'])
handleTouchStart(event: TouchEvent): void {
  event.preventDefault();  // Prevent default scrolling or selection behavior
  const rect = this.canvas.nativeElement.getBoundingClientRect();
  const x = event.touches[0].clientX - rect.left;
  const y = event.touches[0].clientY - rect.top;

  // Check if touchstart is within the space button area
  if (
    x >= this.buttonX &&
    x <= this.buttonX + this.buttonWidth &&
    y >= this.buttonY &&
    y <= this.buttonY + this.buttonHeight
  ) {
    this.spacePressed = true;  // Simulate space press
  }

  // Check if touchstart is within the pause button area (assumed at position (20, 20))
  if (x >= 20 && x <= 120 && y >= 20 && y <= 60) {
    this.togglePause();  // Pause button touched
  }
}

@HostListener('touchend', ['$event'])
handleTouchEnd(event: TouchEvent): void {
  event.preventDefault();  // Prevent default behavior like scroll or zoom
  this.spacePressed = false;  // Stop simulating space press when touch ends
}

}
