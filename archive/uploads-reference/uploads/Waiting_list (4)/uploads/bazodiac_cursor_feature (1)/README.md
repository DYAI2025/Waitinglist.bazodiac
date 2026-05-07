# BAZODIAC Cursor FX — portable feature

## Was extrahiert wurde

Die Originalanimation aus `insight.bazodiac-main` besteht aus fünf zusammenwirkenden Teilen:

1. **Custom cursor dot**  
   Ein 4×4px weißer Punkt mit `mix-blend-mode: difference`, der dem Mauszeiger fast direkt folgt.

2. **Cursor ring**  
   Ein 40×40px Ring mit Gold-Border. Er folgt langsamer als der Dot und expandiert auf Hover über interaktive Elemente.

3. **Nebula lens**  
   Ein 560–600px großer, stark geblurrter indigo Radial-Glow, der mit großer Verzögerung der Maus folgt.

4. **Vignette**  
   Eine Fullscreen-Radial-Gradient-Ebene, deren Mittelpunkt über CSS-Variablen auf die Mausposition gesetzt wird.

5. **Optionaler Connected Vortex**  
   Ein Canvas mit 40/90 Partikeln. Partikel werden in der Nähe der Maus angezogen, erhalten eine tangentiale Orbit-Kraft und zeichnen transparente Linien zum Cursor.

## Quelldateien im analysierten Repo

- `styles.css`: Cursor-CSS, Vignette, Lens, Dot, Ring.
- `interactions.js`: GSAP-Tracking für Dot/Ring/Lens und Vignette-Variablen.
- `investor.css` + `investor.js`: Dependency-free Variante mit Hover-Aktivierung für Ring.
- `engine.js`: `ConnectedVortex` mit Cursor-Linien und Maus-Anziehung.
- `index.html`: DOM-Layer für `vignette`, `nebula-lens`, `custom-cursor`, `cursor-ring`.

## Integration

```html
<link rel="stylesheet" href="/path/to/cursor-fx.css">

<div class="cursorfx-vignette" id="vignette"></div>
<div class="cursorfx-nebula-lens" id="nebula-lens"></div>
<div class="cursorfx-dot" id="custom-cursor"></div>
<div class="cursorfx-ring" id="cursor-ring"></div>

<script src="/path/to/cursor-fx.js"></script>
```

Die Layer können auch weggelassen werden; `cursor-fx.js` erzeugt sie automatisch.

## Optionaler Vortex

```html
<section style="position:relative; min-height:100vh">
  <canvas id="hero-vortex" class="cursorfx-vortex"></canvas>
  <!-- content -->
</section>

<script>
  new window.BazodiacCursorFX.ConnectedCursorVortex("#hero-vortex");
</script>
```

## Exakte Kernparameter

| Teil | Parameter |
|---|---|
| Dot | 4×4px, weiß, `mix-blend-mode:difference`, z-index 9999 |
| Ring | 40×40px, Gold `rgba(212,175,55,1)` auf Hover, Start-Skala 0.55, Hover-Skala 1.2 |
| Ring Transition | `0.4s cubic-bezier(0.16, 1, 0.3, 1)` |
| Lens | 600×600px, `rgba(99,102,241,0.04)`, Blur 50px |
| Vignette | Transparent bis 20%, `rgba(5,7,10,0.40)` bis 100% |
| Vortex nodeCount | 40 mobil, 90 desktop |
| Vortex attractRadius | 450 |
| Vortex tangentForce | 0.75 |
| Vortex friction | 0.96 |
| Vortex baseSpeed | 0.12 |
| Vortex line alpha | `(1 - distance / 450) * 0.28` |

## Abweichung gegenüber Original

Diese portable Fassung behebt zwei Integrationsrisiken:

1. Der Hover-Zustand wird zuverlässig per JS-Klasse gesetzt. Im Haupt-`styles.css` des Originals ist `.interactive:hover ~ .cursor-ring` aufgrund der DOM-Reihenfolge nicht zuverlässig wirksam.
2. Der Vortex rechnet die Mausposition in lokale Canvas-Koordinaten um. Das ist portabler als die Originalvariante mit Viewport-Koordinaten.
