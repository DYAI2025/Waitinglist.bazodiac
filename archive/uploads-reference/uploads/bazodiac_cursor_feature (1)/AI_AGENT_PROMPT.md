# AI Agent Prompt: BAZODIAC Cursor Animation exakt nachbauen

Du bist ein Frontend-Agent. Baue eine portable Cursor-Animation im Stil der analysierten BAZODIAC-Seite. Implementiere sie als isolierbares Feature mit `cursor-fx.css` und `cursor-fx.js`, ohne Framework-Zwang.

## Ziel

Erzeuge einen luxuriösen, dunklen, technisch-kosmischen Cursor-Effekt mit:

1. weißem 4×4px Cursor-Dot,
2. verzögert folgendem Gold-Ring,
3. großem, langsam driftendem Indigo-Nebula-Glow,
4. Maus-zentrierter Vignette,
5. optionalem Canvas-Vortex, dessen Partikel zur Maus Linien ziehen.

## DOM-Layer

Erzeuge automatisch, falls sie nicht existieren:

```html
<div class="cursorfx-vignette" id="vignette"></div>
<div class="cursorfx-nebula-lens" id="nebula-lens"></div>
<div class="cursorfx-dot" id="custom-cursor"></div>
<div class="cursorfx-ring" id="cursor-ring"></div>
```

Für den optionalen Vortex:

```html
<canvas id="hero-vortex" class="cursorfx-vortex"></canvas>
```

## CSS-Spezifikation

- Root-Farben:
  - Background: `#05070a`
  - Gold: `#D4AF37`
  - Indigo RGB: `99, 102, 241`
  - Gold RGB: `212, 175, 55`
- Auf Fine-Pointer-Geräten:
  - `body`, Links, Buttons, `[role="button"]`, `.interactive`: `cursor:none`
  - Inputs/Textareas/Selects/Labels behalten Text-/Native-Cursor.
- `.cursorfx-dot`:
  - `position:fixed; width:4px; height:4px; border-radius:50%; background:white;`
  - `mix-blend-mode:difference; z-index:9999; pointer-events:none;`
  - transformiert mit `translate3d(x,y,0) translate(-50%,-50%)`.
- `.cursorfx-ring`:
  - `position:fixed; width:40px; height:40px; z-index:9998; pointer-events:none;`
  - Border über `::before`: `1px solid rgba(212,175,55,0)`, rund.
  - Grundskala `0.55`; bei `.is-active` Skala `1.2` und Border `rgba(212,175,55,1)`.
  - Transition: `transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.4s`.
- `.cursorfx-nebula-lens`:
  - `position:fixed; width:600px; height:600px; border-radius:50%;`
  - `background: radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%);`
  - `filter: blur(50px); z-index:1; pointer-events:none;`
- `.cursorfx-vignette`:
  - `position:fixed; inset:0; pointer-events:none; z-index:9997;`
  - `background: radial-gradient(circle at var(--cursorfx-x,50%) var(--cursorfx-y,50%), transparent 20%, rgba(5,7,10,0.40) 100%);`
- Mobile, coarse pointer und `prefers-reduced-motion: reduce`: Cursor-Layer ausblenden und native Cursor verwenden.

## JavaScript-Spezifikation

- Kein Framework voraussetzen.
- Bei `pointermove`:
  - Zielposition `target.x/y = event.clientX/Y`.
  - CSS-Variablen `--cursorfx-x` und `--cursorfx-y` auf dem Body setzen.
- Animation per `requestAnimationFrame`:
  - Dot folgt schnell: Lerp ca. `0.45`.
  - Ring folgt verzögert: Lerp ca. `0.24`.
  - Lens folgt sehr langsam: Lerp ca. `0.045`.
- Interaktive Elemente:
  - Selector: `a, button, [role='button'], .interactive`.
  - Auf `mouseenter`: Ring bekommt `.is-active`.
  - Auf `mouseleave`: `.is-active` entfernen.
- Exportiere global:
  - `window.BazodiacCursorFX.init(options)`
  - `window.BazodiacCursorFX.ConnectedCursorVortex`

## Optionaler ConnectedCursorVortex

Implementiere eine Klasse `ConnectedCursorVortex(canvasOrSelector, config)`:

- Defaults:
  - `nodeCount`: 40 mobil, 90 desktop
  - `attractRadius`: 450
  - `tangentForce`: 0.75
  - `friction`: 0.96
  - `baseSpeed`: 0.12
  - `cursorLineColor`: `"99, 102, 241"`
  - `dotColor`: `"212, 175, 55"`
  - `maxCursorAlpha`: 0.28
- Partikel:
  - Startposition zufällig im Canvas.
  - Startgeschwindigkeit `(Math.random() - 0.5) * 1.5`.
- Pro Frame:
  - Distanz zur Maus in lokalen Canvas-Koordinaten berechnen.
  - Wenn `dist < attractRadius`:
    - `pct = 1 - dist / attractRadius`
    - `vx += dx * pct * 0.003`
    - `vy += dy * pct * 0.003`
    - `vx += (dy / dist) * tangentForce * pct`
    - `vy -= (dx / dist) * tangentForce * pct`
    - Linie von Partikel zur Maus zeichnen mit Alpha `pct * maxCursorAlpha`, LineWidth `0.7`.
  - Bewegung:
    - `x += vx + baseSpeed`
    - `y += vy`
    - `vx *= friction`
    - `vy *= friction`
  - Screen-Wrap an Canvas-Rändern.
  - Dot zeichnen: Radius `1.2`, Farbe `rgba(212,175,55,0.6)`.

## Akzeptanzkriterien

- Auf Desktop ist der native Cursor über normalen/interaktiven Elementen nicht sichtbar.
- Dot, Ring und Lens bewegen sich mit klar unterschiedlichen Verzögerungen.
- Ring expandiert auf Hover über Links/Buttons/.interactive.
- Vignette folgt sofort dem Mauspunkt.
- Auf mobilen/coarse-pointer Geräten ist der Effekt deaktiviert.
- Optionaler Vortex funktioniert in jeder Section, weil Pointer-Koordinaten in Canvas-Koordinaten umgerechnet werden.
- Keine Secrets, keine externen Abhängigkeiten, keine globalen CSS-Kollisionen außer den dokumentierten Klassen.
