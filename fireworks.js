document.addEventListener("DOMContentLoaded", () => {
  function startFireworks() {
    const canvas = document.getElementById("fireworksCanvas");
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Cannot get canvas context");
      return;
    }
    const particles = [];
    const colors = [
      "#ff9aa2",
      "#ffb7b2",
      "#ffdac1",
      "#e2f0cb",
      "#b5ead7",
      "#c7ceea",
      "#f1cbff",
      "#c2c2f0",
      "#ffcfdf",
    ];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor(x, y, color, speed, angle) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.angle = angle;
        this.alpha = 1;
        this.size = 10; // 입자의 크기를 설정합니다 (기본 크기보다 큼)
        this.rotation = Math.random() * Math.PI * 2; // 회전 각도 설정
        this.rotationSpeed = (Math.random() - 0.5) * 0.2; // 회전 속도 설정
      }

      update() {
        this.speed *= 0.98;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.alpha -= 0.01; // alpha 감소 속도를 줄입니다
        this.rotation += this.rotationSpeed; // 회전 각도 업데이트
      }

      draw() {
        ctx.save(); // 현재 상태 저장
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y); // 입자 위치로 이동
        ctx.rotate(this.rotation); // 회전 적용
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size); // 사각형을 그립니다 (중심을 기준으로)
        ctx.restore(); // 저장된 상태 복원
        ctx.globalAlpha = 1;
      }
    }

    function createFirework() {
      const numParticles = 300; // 입자의 수를 늘립니다
      for (let i = 0; i < numParticles; i++) {
        const x = Math.random() * canvas.width; // 랜덤한 x 위치에서 생성
        const y = 0; // 화면의 상단에서 생성
        const color = colors[Math.floor(Math.random() * colors.length)];
        const speed = Math.random() * 4 + 2; // 속도를 유지합니다
        const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.2; // 약간의 각도로 아래로 내려오게 설정
        particles.push(new Particle(x, y, color, speed, angle));
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) {
          particles.splice(i, 1);
        }
      }
      requestAnimationFrame(animate);
    }

    function init() {
      createFirework();
      animate();
      setTimeout(() => {
        canvas.width = 0;
        canvas.height = 0;
      }, 5000); // 5초 후에 캔버스 초기화
    }

    init();
  }

  window.startFireworks = startFireworks; // startFireworks 함수를 전역으로 노출
});
