import Link from "next/link";

export default function AuthCodeError() {
  return (
    <main className="container">
      <h1>Sign-in didn&apos;t go through</h1>
      <p>Something went wrong exchanging the sign-in code. Please try again.</p>
      <Link href="/">
        <button>Back to home</button>
      </Link>
    </main>
  );
}
