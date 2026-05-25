type Props = { title:string; origin:string; category:string; price:number; seller:string; tags:string[] };
export default function ProductCard({ title, origin, category, price, seller, tags }: Props) {
  return <div className="card"><div className="product-img"/><div className="muted">{origin} • {category}</div><h3 style={{marginBottom:6}}>{title}</h3><div className="price">£{price.toLocaleString()}</div><div className="muted">Seller: <strong>{seller}</strong></div><div style={{marginTop:12}}>{tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div></div>;
}
