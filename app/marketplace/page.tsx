import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
const listings = [
  { title: "Premium Jollof Rice Spice", origin: "Nigeria", category: "Foodstuff", price: 8, seller: "Kulturex Foods", tags: ["Authentic", "Wholesale ready", "Diaspora favourite"] },
  { title: "Handmade Ankara Tote Bag", origin: "Ghana", category: "Fashion", price: 35, seller: "Accra Craft Studio", tags: ["Handmade", "Cultural fashion", "Gift item"] },
  { title: "Online Yoruba Language Session", origin: "Nigeria", category: "Service", price: 25, seller: "Culture Tutor", tags: ["Online session", "Language", "Cultural learning"] }
];
export default function MarketplacePage() {
  return <><Navbar/><main className="container"><section className="section"><div className="badge">Demo Marketplace</div><h1 style={{fontSize:42}}>Explore cultural listings</h1><p className="lead">A marketplace view for products, services, events, and cultural experiences.</p></section><section className="section"><div className="card"><h3 style={{marginTop:0}}>Search filters</h3><div className="grid grid-3"><label>Origin<input placeholder="Nigeria, Ghana, India..."/></label><label>Category<select><option>Any category</option><option>Foodstuff</option><option>Fashion</option><option>Services</option><option>Events</option></select></label><label>Budget<input placeholder="£50"/></label></div></div></section><section className="section"><div className="grid grid-3">{listings.map(listing => <ProductCard key={listing.title} {...listing}/>)}</div></section></main></>;
}
