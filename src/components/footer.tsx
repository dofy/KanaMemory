export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 text-center text-xs text-muted-foreground">
        <span className="font-mono">Copyright © 2025 Powered by</span>{" "}
        <a
          href="https://yahaha.net"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors underline font-mono"
        >
          yahaha.net
        </a>
      </div>
    </footer>
  );
}
