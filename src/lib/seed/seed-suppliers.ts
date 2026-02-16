import type { SupabaseClient } from '@supabase/supabase-js';

export async function seedSuppliers(supabase: SupabaseClient, salonId: string) {
  // Clean up existing supplier data for this salon
  await supabase.from('auto_order_rules').delete().eq('salon_id', salonId);
  await supabase.from('supplier_order_items').delete().match({ /* join through orders */ });
  // Actually, just delete suppliers - CASCADE will handle the rest
  await supabase.from('suppliers').delete().eq('salon_id', salonId);

  // 1. Create 3 suppliers
  
  // Supplier 1: Shine Shop
  const { data: shineShop } = await supabase.from('suppliers').insert({
    salon_id: salonId,
    name: 'Shine Shop',
    slug: 'shine-shop',
    type: 'shine_shop',
    website: 'https://shineshopb2b.com',
    phone: '+380937443889',
    api_config: { base_url: 'https://shineshopb2b.com', api_key: 'demo-key' },
    capabilities: ['catalog_sync', 'price_sync', 'stock_check', 'auto_order'],
    sync_status: 'success',
    last_sync_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    delivery_days: 2,
    payment_terms: 'Передоплата',
    discount_percent: 10,
    is_active: true,
  }).select().single();

  // Supplier 2: Nail Market (Prom)
  const { data: promSupplier } = await supabase.from('suppliers').insert({
    salon_id: salonId,
    name: 'Nail Market (Prom)',
    slug: 'nail-market-prom',
    type: 'prom_ua',
    website: 'https://prom.ua/ua/c4627420-nail-market.html',
    api_config: { api_key: 'demo-prom-key', company_id: '4627420' },
    capabilities: ['catalog_sync', 'price_sync'],
    sync_status: 'never',
    delivery_days: 3,
    payment_terms: 'Післяплата',
    is_active: true,
  }).select().single();

  // Supplier 3: Manual supplier "Марина"
  const { data: marinaSupplier } = await supabase.from('suppliers').insert({
    salon_id: salonId,
    name: 'Марина',
    slug: 'marina-manual',
    type: 'manual',
    phone: '+380501234567',
    email: 'marina.nails@gmail.com',
    manager_name: 'Марина',
    capabilities: [],
    payment_terms: 'Готівка',
    delivery_days: 1,
    is_active: true,
  }).select().single();

  if (!shineShop || !promSupplier || !marinaSupplier) {
    console.error('Failed to create suppliers');
    return;
  }

  // 2. Create 15 supplier_products for Shine Shop
  const shineShopProducts = [
    { name: 'KODI Base Gel Extra 12ml', brand: 'KODI', category: 'Бази', price: 180, external_id: crypto.randomUUID() },
    { name: 'KODI Rubber Top No Wipe 12ml', brand: 'KODI', category: 'Топи', price: 175, external_id: crypto.randomUUID() },
    { name: 'KODI Matte Top 12ml', brand: 'KODI', category: 'Топи', price: 170, external_id: crypto.randomUUID() },
    { name: 'Komilfo Gel Polish 045 8ml', brand: 'Komilfo', category: 'Гель-лаки', price: 155, external_id: crypto.randomUUID() },
    { name: 'Komilfo Gel Polish 112 8ml', brand: 'Komilfo', category: 'Гель-лаки', price: 155, external_id: crypto.randomUUID() },
    { name: 'OXXI Cover Base 03 15ml', brand: 'OXXI', category: 'Бази', price: 165, external_id: crypto.randomUUID() },
    { name: 'OXXI Cover Base 01 15ml', brand: 'OXXI', category: 'Бази', price: 165, external_id: crypto.randomUUID() },
    { name: 'Strong Nail Bits фреза полум\'я синя 0.23мм', brand: 'Strong Nail Bits', category: 'Фрези', price: 44, external_id: crypto.randomUUID() },
    { name: 'Strong Nail Bits фреза конус червона 0.42мм', brand: 'Strong Nail Bits', category: 'Фрези', price: 48, external_id: crypto.randomUUID() },
    { name: 'Безворсові серветки 200шт', brand: 'Shine Shop', category: 'Витратники', price: 65, external_id: crypto.randomUUID() },
    { name: 'Апельсинові палички 100шт', brand: 'Shine Shop', category: 'Витратники', price: 45, external_id: crypto.randomUUID() },
    { name: 'Рідина для зняття липкого шару 250мл', brand: 'Shine Shop', category: 'Рідини', price: 85, external_id: crypto.randomUUID() },
    { name: 'Дезінфектор DEZIK для інструментів 1л', brand: 'DEZIK', category: 'Дезінфекція', price: 180, external_id: crypto.randomUUID() },
    { name: 'DEZIK спрей для поверхонь 500мл', brand: 'DEZIK', category: 'Дезінфекція', price: 120, external_id: crypto.randomUUID() },
    { name: 'Крафт-пакети для стерилізації 100x200мм (100шт)', brand: 'Shine Shop', category: 'Стерилізація', price: 95, external_id: crypto.randomUUID() },
  ];

  // Try to match some products with existing inventory_items
  const { data: existingItems } = await supabase
    .from('inventory_items')
    .select('id, name')
    .eq('salon_id', salonId);

  const insertedProducts = [];
  for (const product of shineShopProducts) {
    // Try fuzzy match
    const matchedItem = (existingItems ?? []).find(item => 
      item.name.toLowerCase().includes(product.brand.toLowerCase()) ||
      product.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
    );

    const { data: inserted } = await supabase.from('supplier_products').insert({
      salon_id: salonId,
      supplier_id: shineShop.id,
      external_id: product.external_id,
      external_sku: `SS-${Math.floor(Math.random() * 90000) + 10000}`,
      external_url: `https://shineshopb2b.com/product/${product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      currency: 'UAH',
      unit: 'шт',
      in_stock: true,
      stock_quantity: Math.floor(Math.random() * 50) + 5,
      inventory_item_id: matchedItem?.id ?? null,
      last_synced_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    }).select().single();

    if (inserted) insertedProducts.push(inserted);
  }

  // 3. Create 2 auto_order_rules for products that have inventory_item_id
  const linkedProducts = insertedProducts.filter(p => p.inventory_item_id);
  if (linkedProducts.length >= 2) {
    await supabase.from('auto_order_rules').insert([
      {
        salon_id: salonId,
        supplier_product_id: linkedProducts[0].id,
        inventory_item_id: linkedProducts[0].inventory_item_id,
        is_enabled: true,
        min_stock_threshold: 3,
        reorder_quantity: 10,
      },
      {
        salon_id: salonId,
        supplier_product_id: linkedProducts[1].id,
        inventory_item_id: linkedProducts[1].inventory_item_id,
        is_enabled: true,
        min_stock_threshold: 5,
        reorder_quantity: 20,
      },
    ]);
  }

  // 4. Create 1 delivered supplier_order
  const orderItems = insertedProducts.slice(0, 3);
  if (orderItems.length === 3) {
    const subtotal = orderItems.reduce((sum, p) => sum + p.price * 5, 0);
    const { data: order } = await supabase.from('supplier_orders').insert({
      salon_id: salonId,
      supplier_id: shineShop.id,
      status: 'delivered',
      subtotal,
      discount_amount: 0,
      delivery_cost: 0,
      total: subtotal,
      notes: 'Тестове замовлення',
      is_auto_generated: true,
      auto_order_trigger: 'low_stock',
      ordered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      confirmed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      shipped_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      delivered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    }).select().single();

    if (order) {
      await supabase.from('supplier_order_items').insert(
        orderItems.map(p => ({
          order_id: order.id,
          supplier_product_id: p.id,
          inventory_item_id: p.inventory_item_id,
          quantity: 5,
          price_per_unit: p.price,
          total: p.price * 5,
          quantity_received: 5,
          received_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        }))
      );
    }
  }

  // 5. Create sync log entry for Shine Shop
  await supabase.from('supplier_sync_log').insert({
    salon_id: salonId,
    supplier_id: shineShop.id,
    sync_type: 'catalog',
    status: 'completed',
    items_synced: shineShopProducts.length,
    items_added: shineShopProducts.length,
    items_updated: 0,
    duration_ms: 2340,
    started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2340).toISOString(),
  });

  console.log(`Seeded suppliers: 3 suppliers, ${insertedProducts.length} products, auto-order rules, 1 order`);
}
