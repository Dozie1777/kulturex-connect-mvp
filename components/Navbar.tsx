import Link from "next/link";
export default function Navbar() {
  return <div className="container"><nav className="nav"><Link href="/" className="logo">Kulturex Connect</Link><div className="navlinks"><Link className="button" href="/marketplace">Marketplace</Link><Link className="button" href="/dashboard">Seller Dashboard</Link><a className="button primary" href="#model">How it works</a></div></nav></div>;
}
