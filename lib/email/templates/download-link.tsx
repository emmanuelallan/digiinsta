// Download link email template - placeholder
export function DownloadLinkEmail({ links }: { links: Array<{ url: string; name: string }> }) {
  return (
    <div>
      <h1>Your Downloads</h1>
      <ul>
        {links.map((link) => (
          <li key={link.url}>
            <a href={link.url}>{link.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
