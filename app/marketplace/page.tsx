import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import BuyButton from "@/components/BuyButton";
import { prisma } from "@/lib/prisma";
import { LISTING_STATUS } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export default async function MarketplacePage({ searchParams }: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const category = typeof params.category === "string" ? params.category.slice(0, 80) : "";
  let unavailable = false;
  let listings: Array<{ id: string; title: string; origin: string; category: string; priceMinor: number | null; stock: number; sellerProfile: { name: string } | null }> = [];
  try {
    listings = await prisma.listing.findMany({
      where: {
        status: LISTING_STATUS.ACTIVE,
        sellerProfile: { is: { verified: true } },
        ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
        ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
      },
      select: { id: true, title: true, origin: true, category: true, priceMinor: true, stock: true, sellerProfile: { select: { name: true } } },
      orderBy: { createdAt: "desc" }, take: 50,
    });
  } catch {
    unavailable = true;
  }
  return <><Navbar/><main className="container">
    <section className="section"><div className="badge">Verified-seller marketplace</div>
      <h1>Cultural products from trusted sellers</h1>
      <p className="lead">Browse approved listings. New sellers and products are reviewed before appearing here.</p>
    </section>
    <section className="section"><form className="card filter-form" action="/marketplace" method="get">
      <label>Search products<input name="q" defaultValue={q} placeholder="Search listings" maxLength={100}/></label>
      <label>Category<input name="category" defaultValue={category} placeholder="Foodstuff, fashion, services" maxLength={80}/></label>
      <button className="button primary" type="submit">Search</button>
    </form></section>
    {unavailable ? <p className="notice">Listings are temporarily unavailable. Please try again later.</p>
      : listings.length === 0 ? <p className="notice">No approved listings match your search yet.</p>
      : <section className="section grid grid-3">{listings.map((listing) => <div key={listing.id}>
        <ProductCard title={listing.title} origin={listing.origin} category={listing.category}
          price={(listing.priceMinor ?? 0) / 100} seller={listing.sellerProfile?.name ?? "Seller"} tags={["Verified seller"]}/>
        <BuyButton listingId={listing.id} disabled={listing.stock < 1 || listing.priceMinor === null}/>
      </div>)}</section>}
  </main></>;
}
