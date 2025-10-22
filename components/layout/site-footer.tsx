export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
        <p>© {currentYear} 위루다 선교 공동체. All Rights Reserved.</p>
        <p>
          문의: <a href="mailto:mission@wiruda.com" className="underline hover:text-foreground">mission@wiruda.com</a>
        </p>
      </div>
    </footer>
  );
}
