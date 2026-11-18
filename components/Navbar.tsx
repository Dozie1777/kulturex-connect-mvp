import Link from "next/link";

export default function Navbar() {
  return <div className="container"><nav className="nav" aria-label="Main navigation">
    <Link href="/" className="logo">Kulturex Connect</Link>
    <div className="navlinks">
      <Link className="button" href="/marketplace">Marketplace</Link>
      <Link className="button" href="/dashboard">Seller dashboard</Link>
      <Link className="button" href="/orders">Orders</Link>
      <Link className="button primary" href="/login">Sign in</Link>
    </div>
  </nav></div>;
}
