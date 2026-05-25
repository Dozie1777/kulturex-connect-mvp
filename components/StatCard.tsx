type Props = { title:string; value:string; subtitle:string };
export default function StatCard({ title, value, subtitle }: Props) {
  return <div className="card"><div className="muted">{title}</div><div className="stat">{value}</div><div className="muted" style={{marginTop:8}}>{subtitle}</div></div>;
}
