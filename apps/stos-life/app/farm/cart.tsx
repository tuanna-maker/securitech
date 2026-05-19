import { useState } from "react";
import { router } from "expo-router";
import { Screen } from "../../components/ui/Screen";
import { Button } from "../../components/ui/Button";
import { GroupedSection } from "../../components/ui/GroupedSection";
import { ListRow } from "../../components/ui/ListRow";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../lib/db";
import { spacing } from "../../lib/design";

type CartLine = { product_id: string; name: string; qty: number; price: number };

export default function FarmCartScreen() {
  const { resident } = useAuth();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);

  const checkout = async () => {
    if (!cart.length) return;
    setLoading(true);
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const { data: order } = await db
      .from("farm_orders")
      .insert({ tenant_id: resident!.tenant_id, building_id: resident!.building_id, resident_id: resident!.id, total_amount: total })
      .select()
      .single();
    if (order) {
      await db.from("farm_order_items").insert(
        cart.map((c) => ({ order_id: order.id, product_id: c.product_id, quantity: c.qty, unit_price: c.price }))
      );
    }
    setLoading(false);
    router.push("/farm/orders");
  };

  return (
    <Screen title="Giỏ hàng Farm">
      <GroupedSection>
        {cart.map((c, i) => (
          <ListRow key={c.product_id} title={c.name} right={`${c.qty} × ${c.price}`} isLast={i === cart.length - 1} />
        ))}
      </GroupedSection>
      <Button title="Đặt hàng" onPress={checkout} loading={loading} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}
