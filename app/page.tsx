import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Wishlist</h1>
          <p className="text-lg text-muted-foreground">
            Create and share your wishlist with friends and family
          </p>
        </div>

        <div className="pt-8">
          <Link
            href="/admin/mock-admin-token"
            data-test-id="create-wishlist-button"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Create Wishlist
          </Link>
        </div>

        <div className="pt-8 text-sm text-muted-foreground">
          <p>
            No sign-up required. Share your wishlist link with guests to let
            them reserve items anonymously.
          </p>
        </div>
      </div>
    </main>
  );
}
