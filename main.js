// =====================
// Explora Marte - Phaser Quiz (MVP)
// =====================

const QUESTIONS = [
  {
    q: "¿Por qué Marte es conocido como el planeta rojo?",
    options: ["Por su agua", "Por el óxido de hierro", "Por volcanes activos", "Por su atmósfera azul"],
    correct: 1,
    fact: "El polvo rico en óxido de hierro (herrumbre) le da el color rojizo."
  },
  {
    q: "¿Cuánto dura aproximadamente un día en Marte (un sol)?",
    options: ["12 horas", "24 horas", "24h 39m", "30 horas"],
    correct: 2,
    fact: "Un 'sol' dura ~24 horas y 39 minutos."
  },
  {
    q: "¿Qué rover aterrizó en Marte en 2021?",
    options: ["Spirit", "Curiosity", "Perseverance", "Sojourner"],
    correct: 2,
    fact: "Perseverance llegó en 2021 para buscar señales de vida pasada."
  },
  {
    q: "¿Cuál es el volcán más grande del Sistema Solar, en Marte?",
    options: ["Olympus Mons", "Mauna Kea", "Etna", "Vesubio"],
    correct: 0,
    fact: "Olympus Mons es gigantesco comparado con volcanes terrestres."
  }
];

class BootScene extends Phaser.Scene {
  constructor() { super("boot"); }
  create() {
    this.cameras.main.setBackgroundColor("#0b1d3a");

    const { width, height } = this.scale;
    this.add.text(width/2, height/2 - 80, "Explora Marte 🚀", {
      fontFamily: "Arial",
      fontSize: "48px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(width/2, height/2 - 20, "Responde y aprende datos del planeta rojo", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#cfe3ff"
    }).setOrigin(0.5);

    const btn = this.add.rectangle(width/2, height/2 + 60, 260, 56, 0xff6a00)
      .setInteractive({ useHandCursor: true });

    this.add.text(width/2, height/2 + 60, "COMENZAR", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#1b0c00",
      fontStyle: "bold"
    }).setOrigin(0.5);

    btn.on("pointerdown", () => this.scene.start("quiz"));
  }
}

class QuizScene extends Phaser.Scene {
  constructor() { super("quiz"); }

  init() {
    this.index = 0;
    this.score = 0;
    this.locked = false;
  }

  create() {
    this.cameras.main.setBackgroundColor("#08162c");
    const { width, height } = this.scale;

    // HUD
    this.scoreText = this.add.text(20, 18, "Puntaje: 0", { fontFamily:"Arial", fontSize:"18px", color:"#ffffff" });
    this.progressText = this.add.text(width - 20, 18, "", { fontFamily:"Arial", fontSize:"18px", color:"#cfe3ff" }).setOrigin(1, 0);

    // Card
    this.card = this.add.rectangle(width/2, height/2, Math.min(760, width - 40), 420, 0x0f2a52, 0.95);
    this.card.setStrokeStyle(2, 0x1d4d8f, 1);

    this.questionText = this.add.text(width/2, height/2 - 150, "", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#ffffff",
      wordWrap: { width: Math.min(700, width - 80) },
      align: "center"
    }).setOrigin(0.5);

    // Feedback
    this.feedbackText = this.add.text(width/2, height/2 + 120, "", {
      fontFamily:"Arial", fontSize:"16px", color:"#cfe3ff",
      wordWrap: { width: Math.min(700, width - 80) },
      align: "center"
    }).setOrigin(0.5);

    // Buttons container
    this.answerButtons = [];

    this.renderQuestion();
  }

  renderQuestion() {
    this.locked = false;
    this.feedbackText.setText("");

    const { width, height } = this.scale;
    const total = QUESTIONS.length;
    const qObj = QUESTIONS[this.index];

    this.progressText.setText(`Pregunta ${this.index + 1} / ${total}`);
    this.questionText.setText(qObj.q);

    // limpiar botones previos
    this.answerButtons.forEach(b => b.destroy());
    this.answerButtons = [];

    const startY = height/2 - 60;
    const gap = 64;

    qObj.options.forEach((opt, i) => {
      const y = startY + i * gap;

      const btnBg = this.add.rectangle(width/2, y, Math.min(680, width - 80), 48, 0x173a70, 1)
        .setInteractive({ useHandCursor: true });

      btnBg.setStrokeStyle(2, 0x2e6bc2, 1);

      const btnText = this.add.text(width/2, y, opt, {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff"
      }).setOrigin(0.5);

      btnBg.on("pointerover", () => btnBg.setFillStyle(0x1f4b8f, 1));
      btnBg.on("pointerout", () => {
        if (!this.locked) btnBg.setFillStyle(0x173a70, 1);
      });

      btnBg.on("pointerdown", () => this.pickAnswer(i, btnBg));

      this.answerButtons.push(btnBg, btnText);
    });
  }

  pickAnswer(i, btnBg) {
    if (this.locked) return;
    this.locked = true;

    const qObj = QUESTIONS[this.index];
    const correct = (i === qObj.correct);

    if (correct) {
      this.score += 10;
      this.scoreText.setText(`Puntaje: ${this.score}`);
      btnBg.setFillStyle(0x1f8f3a, 1);
      this.feedbackText.setText(`✅ Correcto. ${qObj.fact}`);
    } else {
      btnBg.setFillStyle(0x9b1c1c, 1);
      this.feedbackText.setText(`❌ Incorrecto. ${qObj.fact}`);
    }

    // pasar a siguiente
    this.time.delayedCall(1200, () => {
      this.index++;
      if (this.index < QUESTIONS.length) {
        this.renderQuestion();
      } else {
        this.scene.start("end", { score: this.score, total: QUESTIONS.length });
      }
    });
  }
}

class EndScene extends Phaser.Scene {
  constructor() { super("end"); }

  init(data) {
    this.finalScore = data.score || 0;
    this.total = data.total || 0;
  }

  create() {
    this.cameras.main.setBackgroundColor("#0b1d3a");
    const { width, height } = this.scale;

    this.add.text(width/2, height/2 - 120, "Misión completada 🛰️", {
      fontFamily:"Arial", fontSize:"44px", color:"#ffffff", fontStyle:"bold"
    }).setOrigin(0.5);

    this.add.text(width/2, height/2 - 40, `Puntaje final: ${this.finalScore} / ${this.total * 10}`, {
      fontFamily:"Arial", fontSize:"22px", color:"#cfe3ff"
    }).setOrigin(0.5);

    this.add.text(width/2, height/2 + 10,
      "Tip: agrega más preguntas, niveles y una barra de progreso para hacerlo más adictivo 😉",
      { fontFamily:"Arial", fontSize:"16px", color:"#cfe3ff", align:"center",
        wordWrap:{ width: Math.min(700, width - 80) } }
    ).setOrigin(0.5);

    const btn = this.add.rectangle(width/2, height/2 + 90, 280, 56, 0xff6a00)
      .setInteractive({ useHandCursor: true });

    this.add.text(width/2, height/2 + 90, "JUGAR DE NUEVO", {
      fontFamily: "Arial", fontSize: "20px", color: "#1b0c00", fontStyle:"bold"
    }).setOrigin(0.5);

    btn.on("pointerdown", () => this.scene.start("boot"));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  parent: "game",
  backgroundColor: "#0b1d3a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, QuizScene, EndScene]
};

new Phaser.Game(config);
