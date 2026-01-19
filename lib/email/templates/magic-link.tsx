// Magic link email template - placeholder
export function MagicLinkEmail({ code }: { code: string }) {
  return (
    <div>
      <h2>Your login code is:</h2>
      <h1>{code}</h1>
      <p>This code expires in 10 minutes.</p>
    </div>
  );
}
