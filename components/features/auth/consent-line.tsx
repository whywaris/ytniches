import Link from "next/link";

// YouTube Developer Policies III.A.2: users agree to the privacy policy
// (and our terms, which bind them to YouTube's) before using the product.
// Shown under every button that can create an account (D-067c).
function ConsentLine() {
  return (
    <p className="text-center text-caption text-text-secondary">
      By continuing, you agree to our{" "}
      <Link href="/legal/terms" className="text-accent-text hover:underline">
        Terms
      </Link>{" "}
      and{" "}
      <Link href="/legal/privacy" className="text-accent-text hover:underline">
        Privacy Policy
      </Link>
      .
    </p>
  );
}

export { ConsentLine };
