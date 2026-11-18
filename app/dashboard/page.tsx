import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SellerForm from "@/components/SellerForm";
import ListingForm from "@/components/ListingForm";
import LogoutButton from "@/components/LogoutButton";
import { sessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await sessionUser((await cookies()).get("kulturex_session")?.value);
  if (!user) redirect("/login");
  const listings = user.seller ? await prisma.listing.findMany({
    where: { sellerId: user.seller.id }, orderBy: { createdAt: "desc" }, take: 30,
    select: { id: true, title: true, status: true, stock: true, priceMinor: true },
  }) : [];
  const totalListings = user.seller ? await prisma.listing.count({ where: { sellerId: user.seller.id } }) : 0;
  const approvedListings = user.seller ? await prisma.listing.count({ where: { sellerId: user.seller.id, status: "ACTIVE" } }) : 0;
  const paidOrders = user.seller ? await prisma.order.count({ where: { sellerId: user.seller.id, status: "PAID" } }) : 0;
  return <><Navbar/><main className="container">
    <section className="section"><div className="badge">Account dashboard</div>
      <h1>Welcome, {user.name}</h1>
      <p className="lead">Your account, listings and orders are shown from actual database records.</p>
      <div className="navlinks"><Link className="button" href="/orders">My orders</Link><LogoutButton/></div>
    </section>
    {!user.seller ? <section className="section"><h2>Become a seller</h2><SellerForm/></section> : <>
      <section className="section"><h2>{user.seller.name}</h2>
        <p className="notice">Verification: <strong>{user.seller.verified ? "Verified" : "Pending administrator review"}</strong>. Only verified sellers with approved listings appear in the marketplace.</p>
        <div className="grid grid-3">
          <div className="card"><p className="muted">Listings</p><div className="stat">{totalListings}</div></div>
          <div className="card"><p className="muted">Paid orders</p><div className="stat">{paidOrders}</div></div>
          <div className="card"><p className="muted">Approved listings</p><div className="stat">{approvedListings}</div></div>
        </div>
      </section>
      <section className="section"><h2>Submit a listing</h2><ListingForm/></section>
      <section className="section"><h2>My recent listings</h2>
        {listings.length === 0 ? <p>No listings submitted yet.</p> : <div className="card"><ul>
          {listings.map(x => <li key={x.id}>{x.title} — {x.status} — {x.stock} in stock</li>)}
        </ul></div>}
      </section>
    </>}
  </main></>;
}
