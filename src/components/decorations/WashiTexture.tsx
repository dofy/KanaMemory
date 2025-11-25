export function WashiTexture() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 washi-texture" />
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--wafuu-pink)) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, hsl(var(--wafuu-green)) 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, hsl(var(--wafuu-orange)) 0%, transparent 50%)`,
        }}
      />
    </div>
  );
}

