// Genera las capturas del README. Uso: npm run screenshots
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3]);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  p.on('dialog', d => d.accept());
  await p.goto('file://' + file);
  await p.click('text=Acepto y quiero usar el check-in');
  await p.click('nav >> text=Ramos y syllabus');
  await p.click('text=Cargar datos de ejemplo');
  await p.click('nav >> text=Hoy');
  // un día difícil: energía baja, ánimo normal, sueño regular
  await p.locator('.ci-row').nth(0).locator('.sc').nth(1).click();
  await p.locator('.ci-row').nth(1).locator('.sc').nth(2).click();
  await p.locator('.ci-row').nth(2).locator('.sc').nth(2).click();
  await p.click('text=Guardar y ajustar mi plan');
  await p.waitForTimeout(400);
  if (await p.locator('text=Ahora no').count()) await p.click('text=Ahora no');   // la demo usa datos al azar: evita una alerta casual
  await p.evaluate(() => document.getElementById('toast').classList.remove('on'));
  const shot = async (name, label, full = true) => {
    if (label) await p.click('nav >> text="' + label + '"');
    await p.waitForTimeout(250);
    await p.screenshot({ path: path.join(out, name), fullPage: full });
  };
  await shot('01-hoy.png');
  await shot('02-semana.png', 'Semana');
  await shot('03-bienestar.png', 'Bienestar');
  await shot('04-apoyo.png', 'Apoyo');
  await p.setViewportSize({ width: 390, height: 800 });
  await shot('05-movil-hoy.png', 'Hoy', false);
  await b.close();
  console.log('Capturas guardadas en', out);
})();
