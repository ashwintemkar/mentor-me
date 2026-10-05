import Link from "next/link";

export default async function AuthCodeError({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <main className="container">
      <h1>Sign-in didn&apos;t go through</h1>
      <p>Something went wrong exchanging the sign-in code. Please try again.</p>
      {reason && <p className="error">Reason: {reason}</p>}
      <Link href="/">
        <button>Back to home</button>
      </Link>
    </main>
  );
}
