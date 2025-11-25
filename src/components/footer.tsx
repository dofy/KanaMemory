export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 text-center text-xs text-muted-foreground">
        Copyright &copy; 2025 Powered by{" "}
        <a
          href="https://yahaha.net"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors underline"
        >
          yahaha.net
        </a>
      </div>
    </footer>
  );
}

