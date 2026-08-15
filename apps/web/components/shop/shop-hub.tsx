"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Boxes, CheckCircle2, ChevronLeft, CreditCard, Minus, Package, Plus, Search, ShoppingBag, ShoppingCart, Trash2, X } from "lucide-react";
import type { CheckoutPreview, CommerceCart, CommerceOrder, CommerceOrderListResponse, CommerceProduct, CommerceCategory, Payment, ProductListResponse, ProductVariant, Profile } from "@ninibu/types";
import { clientApi, NinibuApiError } from "@/lib/client-api";
import { shopRouteState } from "@/lib/routes";
import { advanceFunnel, completeFunnel, hasActiveFunnel, startFunnel, trackEvent } from "@/lib/analytics";
import { formatJalaliDateTime } from "@/lib/datetime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ModalPortal } from "@/components/ui/modal-portal";
import { SponsoredSlot } from "@/components/advertising/sponsored-slot";

function asciiDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function money(value?: number, currency = "IRR") {
  if (value === undefined || value === null) return "—";
  const normalized = currency === "IRR" ? value / 10 : value;
  return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 }).format(normalized)} ${currency === "IRR" ? "تومان" : currency}`;
}
function statusLabel(value: string) {
  const map: Record<string, string> = { active: "فعال", pending_payment: "منتظر پرداخت", paid: "پرداخت‌شده", confirmed: "تأییدشده", cancelled: "لغوشده", completed: "تکمیل‌شده", failed: "ناموفق" };
  return map[value] ?? value;
}

export function ShopHub({ profile }: { profile?: Profile }) {
  const pathname = usePathname();
  const route = shopRouteState(pathname);
  const router = useRouter();
  const cart = useQuery({ queryKey: ["commerce", "cart"], queryFn: () => clientApi<CommerceCart>("/api/ninibu/commerce/cart"), retry: false });
  const cartCount = cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  function navigate(target: string, action: string) {
    trackEvent("shop_navigation", { action, target_route: target });
    router.push(target);
  }

  return <section className="shop-page">
    <div className="shop-hero">
      <div><span className="eyebrow">فروشگاه نینیبو</span><h1>خریدهای خانواده، جدا از پرونده سلامت</h1><p>محصولات منتشرشده فروشندگان تأییدشده را ببینید. اطلاعات سلامت کودک در جست‌وجو، سبد خرید یا سفارش فروشگاه استفاده نمی‌شود.</p></div>
      <div className="shop-hero-actions">
        <button onClick={() => navigate("/shop/orders", "orders")}><Package size={18} /><span>سفارش‌های من</span></button>
        <button onClick={() => navigate("/shop/cart", "cart")} className="shop-cart-button"><ShoppingCart size={18} /><span>سبد خرید</span>{cartCount > 0 && <b>{new Intl.NumberFormat("fa-IR").format(cartCount)}</b>}</button>
      </div>
    </div>

    {route.view === "catalog" && <ProductCatalog />}
    {route.view === "product" && <><ProductCatalog /><ProductDetail productId={route.id} onClose={() => router.push("/shop")} /></>}
    {route.view === "cart" && <CartView />}
    {route.view === "checkout" && <CheckoutView profile={profile} />}
    {route.view === "orders" && <OrdersView />}
    {route.view === "order" && <OrderDetail orderId={route.id} />}
  </section>;
}

function ProductCatalog() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const categories = useQuery({ queryKey: ["commerce", "categories", "shop"], queryFn: () => clientApi<CommerceCategory[]>("/api/ninibu/commerce/categories") });
  const queryString = useMemo(() => {
    const params = new URLSearchParams({ limit: "40" });
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category_id", category);
    return params.toString();
  }, [search, category]);
  const products = useQuery({ queryKey: ["commerce", "products", queryString], queryFn: () => clientApi<ProductListResponse>(`/api/ninibu/commerce/products?${queryString}`) });

  return <div className="shop-catalog">
    <div className="shop-toolbar surface-card"><label><Search size={17} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی محصول…" /></label><Select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">همه دسته‌ها</option>{categories.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></div>
    <SponsoredSlot placement="public_content_list" className="shop-sponsored" />
    {products.isLoading && <div className="shop-state">در حال دریافت محصولات…</div>}
    {products.isError && <div className="shop-state error-state">فهرست محصولات دریافت نشد.</div>}
    <div className="shop-product-grid">{products.data?.items.map((product) => {
      const variant = product.variants?.[0];
      return <article className="shop-product-card surface-card" key={product.id}>
        <div className="shop-product-visual"><Boxes size={30} /></div>
        <div className="shop-product-meta"><span>{product.category_name || product.brand || "محصول"}</span>{product.seller_name && <small>{product.seller_name}</small>}</div>
        <h3>{product.name}</h3><p>{product.description || "اطلاعات بیشتر این محصول را در صفحه جزئیات ببینید."}</p>
        <footer><strong>{variant ? money(variant.price_amount, variant.currency) : "قیمت در جزئیات"}</strong><button onClick={() => { trackEvent("shop_product_opened", { product_id: product.id }); router.push(`/shop/products/${product.id}`); }}>مشاهده <ChevronLeft size={15} /></button></footer>
      </article>;
    })}</div>
    {!products.isLoading && products.data?.items.length === 0 && <div className="shop-state"><ShoppingBag size={26} /><strong>محصولی پیدا نشد</strong></div>}
  </div>;
}

function ProductDetail({ productId, onClose }: { productId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const product = useQuery({ queryKey: ["commerce", "product", productId], queryFn: () => clientApi<CommerceProduct>(`/api/ninibu/commerce/products/${productId}`) });
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const add = useMutation({
    mutationFn: (variant: ProductVariant) => clientApi<CommerceCart>("/api/ninibu/commerce/cart/items", { method: "POST", body: JSON.stringify({ item_type: "product_variant", reference_id: variant.id, quantity }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["commerce", "cart"] }); trackEvent("commerce_cart_item_added", { funnel: "commerce_checkout", product_id: productId, quantity }); }
  });
  const variants = product.data?.variants ?? [];
  const selected = variants.find((item) => item.id === selectedVariantId) ?? variants[0];

  return <ModalPortal ariaLabel="جزئیات محصول" onClose={onClose} backdropClassName="shop-modal-backdrop" contentClassName="shop-product-modal">
    <header><div><span>فروشگاه نینیبو</span><strong>{product.data?.name || "محصول"}</strong></div><button onClick={onClose} aria-label="بستن"><X size={18} /></button></header>
    {product.isLoading ? <div className="shop-state">در حال دریافت جزئیات…</div> : product.isError || !product.data ? <div className="shop-state error-state">جزئیات محصول دریافت نشد.</div> : <div className="shop-product-detail">
      <div className="shop-detail-visual"><ShoppingBag size={42} /></div>
      <div className="shop-detail-title"><div><small>{product.data.seller_name || "فروشنده تأییدشده"}</small><h2>{product.data.name}</h2></div>{product.data.brand && <span>{product.data.brand}</span>}</div>
      <p>{product.data.description || "برای این محصول توضیح تکمیلی ثبت نشده است."}</p>
      {variants.length > 1 && <div className="shop-variant-list">{variants.map((variant) => <button key={variant.id} className={selected?.id === variant.id ? "is-active" : ""} onClick={() => setSelectedVariantId(variant.id)}><strong>{variant.title || variant.sku || `مدل ${new Intl.NumberFormat("fa-IR").format(variant.id)}`}</strong><span>{money(variant.price_amount, variant.currency)}</span></button>)}</div>}
      {selected && <div className="shop-buy-row"><div className="quantity-control"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={15} /></button><strong>{new Intl.NumberFormat("fa-IR").format(quantity)}</strong><button onClick={() => setQuantity((value) => value + 1)}><Plus size={15} /></button></div><div><strong>{money(selected.price_amount * quantity, selected.currency)}</strong>{typeof selected.stock === "number" && <small>موجودی: {new Intl.NumberFormat("fa-IR").format(selected.stock)}</small>}</div></div>}
      {add.isError && <p className="shop-error">{add.error instanceof NinibuApiError ? add.error.message : "افزودن به سبد انجام نشد."}</p>}
      <Button disabled={!selected || add.isPending} onClick={() => selected && add.mutate(selected)}>{add.isPending ? "در حال افزودن…" : "افزودن به سبد خرید"}</Button>
    </div>}
  </ModalPortal>;
}

function CartView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const cart = useQuery({ queryKey: ["commerce", "cart"], queryFn: () => clientApi<CommerceCart>("/api/ninibu/commerce/cart"), retry: false });
  async function update(id: number, quantity: number) {
    if (quantity <= 0) return remove(id);
    await clientApi<CommerceCart>(`/api/ninibu/commerce/cart/items/${id}`, { method: "PATCH", body: JSON.stringify({ quantity }) });
    trackEvent("commerce_cart_quantity_changed", { cart_item_id: id, quantity });
    await queryClient.invalidateQueries({ queryKey: ["commerce", "cart"] });
  }
  async function remove(id: number) {
    await clientApi(`/api/ninibu/commerce/cart/items/${id}`, { method: "DELETE" });
    trackEvent("commerce_cart_item_removed", { cart_item_id: id });
    await queryClient.invalidateQueries({ queryKey: ["commerce", "cart"] });
  }
  const data = cart.data;
  const empty = !data?.items?.length;
  return <div className="shop-panel surface-card">
    <header className="shop-panel-heading"><div><span className="shop-panel-icon"><ShoppingCart size={20} /></span><div><span className="eyebrow">خرید</span><h2>سبد خرید</h2></div></div><button className="text-link" onClick={() => router.push("/shop")}>ادامه خرید <ArrowLeft size={14} /></button></header>
    {cart.isLoading && <div className="shop-state">در حال دریافت سبد…</div>}
    {(cart.isError || empty) && !cart.isLoading ? <div className="shop-empty"><ShoppingCart size={30} /><strong>سبد خرید خالی است</strong><p>محصولات موردنیازتان را از فروشگاه اضافه کنید.</p><Button onClick={() => router.push("/shop")}>رفتن به فروشگاه</Button></div> : <>
      <div className="cart-lines">{data?.items.map((item) => <article key={item.id}><span className="cart-line-icon"><Package size={19} /></span><div><strong>{item.title_snapshot || (item.item_type === "service" ? "خدمت" : "محصول فروشگاه")}</strong><small>{item.sku_snapshot || `شناسه ${new Intl.NumberFormat("fa-IR").format(item.reference_id)}`}</small></div><div className="quantity-control small"><button onClick={() => update(item.id, item.quantity - 1)}><Minus size={13} /></button><strong>{new Intl.NumberFormat("fa-IR").format(item.quantity)}</strong><button onClick={() => update(item.id, item.quantity + 1)}><Plus size={13} /></button></div><strong>{money(item.line_total, data.currency || item.currency)}</strong><button className="cart-remove" onClick={() => remove(item.id)} aria-label="حذف"><Trash2 size={15} /></button></article>)}</div>
      <div className="cart-summary"><div><span>جمع سبد</span><strong>{money(data?.items_subtotal, data?.currency)}</strong></div><Button onClick={() => { const itemCount = data?.items.length ?? 0; trackEvent("commerce_checkout_started", { funnel: "commerce_checkout", item_count: itemCount }); startFunnel("commerce_checkout", "active_cart", "checkout", { item_count: itemCount }); router.push("/shop/checkout"); }}>ادامه و بررسی سفارش</Button></div>
    </>}
  </div>;
}

function CheckoutView({ profile }: { profile?: Profile }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => ({
    customer_name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(),
    customer_mobile: profile?.mobile || "",
    province: profile?.province?.local_name || profile?.province?.name || "",
    city: profile?.city?.local_name || profile?.city?.name || "",
    address: profile?.residence_address || "",
    postal_code: "",
  }));
  useEffect(() => {
    if (!hasActiveFunnel("commerce_checkout", "active_cart")) startFunnel("commerce_checkout", "active_cart", "checkout");
  }, []);
  const preview = useQuery({
    queryKey: ["commerce", "checkout-preview"],
    queryFn: () => clientApi<CheckoutPreview>("/api/ninibu/commerce/checkout/preview", { method: "POST", body: JSON.stringify({}) }),
    retry: false,
  });
  const create = useMutation({
    mutationFn: () => clientApi<CommerceOrder>("/api/ninibu/commerce/orders", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({
        customer_name: form.customer_name.trim(),
        customer_mobile: asciiDigits(form.customer_mobile.trim()),
        shipping_address: {
          province: form.province.trim(),
          city: form.city.trim(),
          address: form.address.trim(),
          ...(form.postal_code.trim() ? { postal_code: asciiDigits(form.postal_code.trim()) } : {}),
        },
      }),
    }),
    onSuccess: (order) => {
      trackEvent("commerce_order_created", { funnel: "commerce_checkout", order_id: order.id });
      advanceFunnel("commerce_checkout", "active_cart", "payment", { order_id: order.id });
      queryClient.invalidateQueries({ queryKey: ["commerce", "cart"] });
      queryClient.invalidateQueries({ queryKey: ["commerce", "orders"] });
      router.push(`/shop/orders/${order.id}`);
    },
  });
  const canSubmit = Boolean(
    form.customer_name.trim() &&
    form.customer_mobile.trim() &&
    form.province.trim() &&
    form.city.trim() &&
    form.address.trim() &&
    preview.data,
  );

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return <ModalPortal
    ariaLabel="بررسی و ثبت سفارش"
    onClose={() => router.push("/shop/cart")}
    backdropClassName="shop-modal-backdrop"
    contentClassName="shop-checkout-modal"
  >
    <header className="shop-checkout-modal-header">
      <div><span className="eyebrow">مرحله نهایی</span><strong>بررسی و ثبت سفارش</strong></div>
      <button type="button" onClick={() => router.push("/shop/cart")} aria-label="بستن"><X size={18} /></button>
    </header>
    <form className="shop-checkout-form" onSubmit={(event) => {
      event.preventDefault();
      if (!canSubmit || create.isPending) return;
      trackEvent("commerce_checkout_confirmed", { funnel: "commerce_checkout", payment_ready: preview.data?.payment_ready ?? false });
      advanceFunnel("commerce_checkout", "active_cart", "order_creation", { payment_ready: preview.data?.payment_ready ?? false });
      create.mutate();
    }}>
      <section className="checkout-contact-fields">
        <div className="checkout-form-heading"><strong>تحویل‌گیرنده و آدرس</strong><p>این اطلاعات فقط برای ثبت و تحویل سفارش استفاده می‌شود و وارد Analytics نمی‌شود.</p></div>
        <div className="checkout-field-grid">
          <label><span>نام تحویل‌گیرنده</span><Input value={form.customer_name} onChange={(event) => update("customer_name", event.target.value)} autoComplete="name" required /></label>
          <label><span>شماره موبایل</span><Input value={form.customer_mobile} onChange={(event) => update("customer_mobile", event.target.value)} inputMode="tel" autoComplete="tel" required /></label>
          <label><span>استان</span><Input value={form.province} onChange={(event) => update("province", event.target.value)} autoComplete="address-level1" required /></label>
          <label><span>شهر</span><Input value={form.city} onChange={(event) => update("city", event.target.value)} autoComplete="address-level2" required /></label>
          <label className="checkout-address-field"><span>نشانی</span><Input value={form.address} onChange={(event) => update("address", event.target.value)} autoComplete="street-address" required /></label>
          <label><span>کد پستی <small>اختیاری</small></span><Input value={form.postal_code} onChange={(event) => update("postal_code", event.target.value)} inputMode="numeric" autoComplete="postal-code" /></label>
        </div>
      </section>

      <section className="checkout-summary checkout-summary-modal">
        {preview.isLoading && <div className="shop-state">در حال اعتبارسنجی قیمت و موجودی…</div>}
        {preview.isError && <div className="shop-empty error-state"><strong>امکان ادامه سفارش نیست</strong><p>{preview.error instanceof NinibuApiError ? preview.error.message : "قیمت یا موجودی سبد تغییر کرده است."}</p><Button type="button" variant="outline" onClick={() => router.push("/shop/cart")}>بازگشت به سبد</Button></div>}
        {preview.data && <>
          <div><span>جمع کالاها</span><strong>{money(preview.data.items_subtotal, preview.data.currency)}</strong></div>
          <div><span>تخفیف</span><strong>{money(preview.data.discount_amount, preview.data.currency)}</strong></div>
          <div><span>هزینه ارسال</span><strong>{money(preview.data.shipping_amount, preview.data.currency)}</strong></div>
          <div className="checkout-total"><span>مبلغ قابل پرداخت</span><strong>{money(preview.data.payable_amount, preview.data.currency)}</strong></div>
          {preview.data.notice && <p>{preview.data.notice}</p>}
        </>}
        {create.isError && <p className="shop-error">{create.error instanceof NinibuApiError ? create.error.message : "ساخت سفارش انجام نشد."}</p>}
      </section>
      <div className="shop-checkout-actions">
        <Button type="button" variant="outline" onClick={() => router.push("/shop/cart")}>بازگشت به سبد</Button>
        <Button type="submit" disabled={!canSubmit || create.isPending}>{create.isPending ? "در حال ساخت سفارش…" : "ثبت سفارش"}</Button>
      </div>
    </form>
  </ModalPortal>;
}

function OrdersView() {
  const router = useRouter();
  const orders = useQuery({ queryKey: ["commerce", "orders"], queryFn: () => clientApi<CommerceOrderListResponse>("/api/ninibu/commerce/orders?limit=50") });
  return <div className="shop-panel surface-card"><header className="shop-panel-heading"><div><span className="shop-panel-icon"><Package size={20} /></span><div><span className="eyebrow">سوابق خرید</span><h2>سفارش‌های من</h2></div></div></header>
    {orders.isLoading && <div className="shop-state">در حال دریافت سفارش‌ها…</div>}
    {orders.isError && <div className="shop-state error-state">سفارش‌ها دریافت نشدند.</div>}
    <div className="order-list">{orders.data?.items.map((order) => <button key={order.id} onClick={() => router.push(`/shop/orders/${order.id}`)}><span className="order-status-dot" /><div><strong>{order.order_number || `سفارش ${new Intl.NumberFormat("fa-IR").format(order.id)}`}</strong><small>{formatJalaliDateTime(order.created_at)}</small></div><span>{statusLabel(order.status)}</span><strong>{money(order.payable_amount ?? order.items_subtotal, order.currency)}</strong><ChevronLeft size={16} /></button>)}</div>
    {!orders.isLoading && orders.data?.items.length === 0 && <div className="shop-empty"><Package size={28} /><strong>هنوز سفارشی ندارید</strong><Button onClick={() => router.push("/shop")}>شروع خرید</Button></div>}
  </div>;
}

function OrderDetail({ orderId }: { orderId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const order = useQuery({ queryKey: ["commerce", "order", orderId], queryFn: () => clientApi<CommerceOrder>(`/api/ninibu/commerce/orders/${orderId}`) });
  const [payment, setPayment] = useState<Payment | null>(null);
  const [busy, setBusy] = useState(false);
  async function cancel() {
    setBusy(true);
    try { await clientApi(`/api/ninibu/commerce/orders/${orderId}/cancel`, { method: "POST", body: JSON.stringify({}) }); trackEvent("commerce_order_cancelled", { order_id: orderId }); await queryClient.invalidateQueries({ queryKey: ["commerce", "order", orderId] }); await queryClient.invalidateQueries({ queryKey: ["commerce", "orders"] }); } finally { setBusy(false); }
  }
  async function startPayment() {
    setBusy(true);
    try {
      const created = await clientApi<Payment>(`/api/ninibu/commerce/orders/${orderId}/payments`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ provider: process.env.NEXT_PUBLIC_NINIBU_PAYMENT_PROVIDER?.trim() || "sandbox" }) });
      setPayment(created); trackEvent("commerce_payment_started", { funnel: "commerce_checkout", order_id: orderId, provider: created.provider });
      advanceFunnel("commerce_checkout", "active_cart", "payment", { order_id: orderId, provider: created.provider });
      if (created.redirect_url && /^https?:\/\//.test(created.redirect_url)) window.location.assign(created.redirect_url);
    } finally { setBusy(false); }
  }
  async function sandbox(success: boolean) {
    if (!payment) return;
    setBusy(true);
    try { const updated = await clientApi<Payment>(`/api/ninibu/payments/sandbox/${payment.id}/${success ? "succeed" : "fail"}`, { method: "POST" }); setPayment(updated); trackEvent(success ? "commerce_payment_completed" : "commerce_payment_failed", { funnel: "commerce_checkout", order_id: orderId }); if (success) completeFunnel("commerce_checkout", "active_cart", { order_id: orderId, status: updated.status }); else advanceFunnel("commerce_checkout", "active_cart", "payment_failed", { order_id: orderId }); await queryClient.invalidateQueries({ queryKey: ["commerce", "order", orderId] }); } finally { setBusy(false); }
  }
  const data = order.data;
  useEffect(() => {
    if (data && ["paid", "confirmed", "completed", "fulfilled"].includes(data.status)) {
      completeFunnel("commerce_checkout", "active_cart", { order_id: data.id, status: data.status });
    }
  }, [data?.id, data?.status]);
  const payable = data && ["pending_payment", "created", "pending"].includes(data.status) && data.status !== "cancelled";
  return <div className="shop-panel surface-card order-detail"><header className="shop-panel-heading"><div><span className="shop-panel-icon"><Package size={20} /></span><div><span className="eyebrow">جزئیات سفارش</span><h2>{data?.order_number || `سفارش ${new Intl.NumberFormat("fa-IR").format(orderId)}`}</h2></div></div><button className="text-link" onClick={() => router.push("/shop/orders")}>همه سفارش‌ها <ArrowLeft size={14} /></button></header>
    {order.isLoading && <div className="shop-state">در حال دریافت سفارش…</div>}
    {order.isError && <div className="shop-state error-state">سفارش دریافت نشد.</div>}
    {data && <div className="order-detail-body"><div className="order-detail-status"><span><CheckCircle2 size={20} /></span><div><strong>{statusLabel(data.status)}</strong><small>{formatJalaliDateTime(data.created_at)}</small></div><b>{money(data.payable_amount ?? data.items_subtotal, data.currency)}</b></div>
      {data.items?.length ? <div className="order-items">{data.items.map((item, index) => <div key={item.id ?? index}><Package size={17} /><div><strong>{item.title_snapshot || "آیتم سفارش"}</strong><small>{new Intl.NumberFormat("fa-IR").format(item.quantity)} عدد</small></div><span>{money(item.line_total, data.currency)}</span></div>)}</div> : null}
      {payment && <div className="payment-result-box"><strong>پرداخت: {statusLabel(payment.status)}</strong>{payment.provider === "sandbox" && payment.status !== "paid" && <div><Button disabled={busy} onClick={() => sandbox(true)}>پرداخت آزمایشی موفق</Button><Button variant="outline" disabled={busy} onClick={() => sandbox(false)}>پرداخت آزمایشی ناموفق</Button></div>}</div>}
      <div className="order-actions">{payable && <Button disabled={busy} onClick={startPayment}>{busy ? "در حال پردازش…" : "پرداخت سفارش"}</Button>}{payable && <Button variant="outline" disabled={busy} onClick={cancel}>لغو سفارش</Button>}</div>
    </div>}
  </div>;
}
