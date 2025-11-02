export default function SplashSvg() {
  return (
    // Usamos viewBox para que el SVG sea responsive y se adapte al contenedor.
    <svg className="splash-svg" viewBox="0 0 800 150">
      <text x="50%" y="50%" dy=".35em" textAnchor="middle">
        MANAGER DEMODA
      </text>
    </svg>
  );
}
