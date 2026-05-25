type Props = { title: string; description: string };
export default function FeatureCard({ title, description }: Props) {
  return <div className="card"><h3 style={{marginTop:0}}>{title}</h3><p className="muted" style={{lineHeight:1.7}}>{description}</p></div>;
}
