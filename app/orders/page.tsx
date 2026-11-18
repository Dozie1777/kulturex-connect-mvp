import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { sessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function OrdersPage() {
  const user = await sessionUser((await cookies()).get("kulturex_session")?.value);
  if (!user) redirect("/login");
  const orders = await prisma.order.findMany({
    where: { OR: [{ buyerId: user.id }, ...(user.seller ? [{ sellerId: user.seller.id }] : [])] },
    select: { id: true, item: true, quantity: true, status: true, amountMinor: true, currency: true, createdAt: true },
    orderBy: { createdAt: "desc" }, take: 100,
  });
  return <><Navbar/><main className="container section"><h1>Orders</h1>
    <p className="lead">Payment confirmation is recorded by Stripe webhooks, not by the return page.</p>
    {orders.length === 0 ? <p className="notice">No orders yet.</p> : <div className="card"><ul>{orders.map(order => <li key={order.id}>
      {order.item} × {order.quantity} — {order.amountMinor === null ? "Legacy order" : `£${(order.amountMinor / 100).toFixed(2)}`} — {order.status}
    </li>)}</ul></div>}
  </main></>;
}
