let main = async () => {
  await ti.init();
  let n = 320;
  let pixels = ti.Vector.field(4, ti.f32, [2 * n, n]);

  let complex_mul = (a, b) => {
    return [a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]];
  };

  ti.addToKernelScope({ pixels, n, complex_mul });

  let kernel = ti.kernel((t) => {
    for (let I of ndrange(n * 2, n)) {
      const i = I[0];
      const j = I[1];
      let c = [0.8 * ti.cos(t), 0.8 * ti.sin(t)]; // Vary c over time
      let z = [i / n - 1, j / n - 0.5] * 2;
      var iterations = 0;
      while (z.norm() < 20 && iterations < 50) {
        z = complex_mul(z, z) + c;
        iterations = iterations + 1;
      }
      pixels[[i, j]] = 1 - iterations * 0.02;
      pixels[[i, j]][3] = 1;
    }
  });

  let htmlCanvas = document.getElementById('result_canvas');
  htmlCanvas.width = 2 * n;
  htmlCanvas.height = n;
  let canvas = new ti.Canvas(htmlCanvas);

  let i = 0;
  async function frame() {
    if (window.shouldStop) {
      return;
    }
    kernel(i * 0.02);
    i = i + 1;
    canvas.setImage(pixels);
    requestAnimationFrame(frame);
  }
  await frame();
};

const script = document.createElement('script');
script.addEventListener('load', function () {
  main();
});
script.src = 'https://unpkg.com/taichi.js/dist/taichi.umd.js';
document.head.appendChild(script);
