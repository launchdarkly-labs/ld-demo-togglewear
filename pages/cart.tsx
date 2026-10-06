import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartList from "@/components/cart/CartList";
import ShippingEstimator from "@/components/cart/ShippingEstimator";
import UpsellGrid from "@/components/cart/UpsellGrid";
import OrderSummary from "@/components/cart/OrderSummary";
import HelpCard from "@/components/cart/HelpCard";
import SwagAssistant from "@/components/ui/SwagAssistant";
import { useShopper } from "@/components/ui/ShopperProvider";

// Figma "Cart" (70:1354). This is the first screen Jen drew outside her
// rounded panel on LD Black, so it has no SectionPanel — the hairline-bordered
// cards do the separating instead.
//
// At 1440 the two columns are 844 and 420 with a 48px gutter inside 64px
// page padding; below xl they stack.
export default function CartPage() {
  const { persona, variant } = useShopper();

  return (
    <>
      <Header persona={persona} />

      {/* Jen's workspace sits on Gray 01, full bleed, with the cards centred
          inside it. */}
      <div className="bg-grays-01">
        <main className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-10 md:px-10 xl:flex-row xl:gap-12 xl:px-16">
          <div className="flex min-w-0 flex-1 flex-col gap-10">
            <CartList />
            <ShippingEstimator />
            <UpsellGrid />
          </div>

          <div className="flex flex-col gap-6 xl:w-[420px] xl:shrink-0">
            <OrderSummary variant={variant} />
            <HelpCard />
          </div>
        </main>
      </div>

      <Footer />

      <SwagAssistant />
    </>
  );
}
