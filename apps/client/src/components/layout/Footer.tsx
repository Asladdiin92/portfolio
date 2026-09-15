const year = new Date().getFullYear();

const links = [
  { href: 'https://github.com/Asladdiin92', label: 'GitHub'   },
  { href: 'https://x.com/asladin15',        label: 'X / Twitter' },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
        <p className="text-sm text-[var(--color-muted)] m-0">
          &copy; {year} Asladdiin Abduqaadir. Built with React, Express &amp; MongoDB.
        </p>

        <nav aria-label="Social links" className="flex gap-5">
          {links.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-muted)] no-underline transition-colors duration-150 hover:text-[var(--color-accent)]"
            >
              {label} ↗
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
