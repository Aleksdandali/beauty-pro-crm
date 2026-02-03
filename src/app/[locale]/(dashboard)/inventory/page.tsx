"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/features/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, AlertCircle, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const t = useTranslations("inventory");

  // Mock data
  const brands = [
    { id: "1", name: "DEZIK", slug: "dezik", productsCount: 15, isActive: true },
    { id: "2", name: "GETLOUD", slug: "getloud", productsCount: 12, isActive: true },
    { id: "3", name: "Other", slug: "other", productsCount: 8, isActive: true },
  ];

  const products = [
    {
      id: "1",
      name: "Шампунь для об'єму",
      brand: "DEZIK",
      category: "Догляд за волоссям",
      sku: "DZK-SH-001",
      quantity: 12,
      minQuantity: 5,
      unit: "шт",
      costPrice: 350,
      retailPrice: 650,
    },
    {
      id: "2",
      name: "Фарба для волосся 6.0",
      brand: "GETLOUD",
      category: "Фарбування",
      sku: "GTL-CLR-060",
      quantity: 3,
      minQuantity: 5,
      unit: "шт",
      costPrice: 280,
      retailPrice: 450,
    },
    {
      id: "3",
      name: "Кондиціонер зволожуючий",
      brand: "DEZIK",
      category: "Догляд за волоссям",
      sku: "DZK-CN-002",
      quantity: 18,
      minQuantity: 5,
      unit: "шт",
      costPrice: 320,
      retailPrice: 580,
    },
  ];

  return (
    <div>
      <Header title={t("title")} />
      <div className="p-6">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">{t("products")}</TabsTrigger>
            <TabsTrigger value="brands">{t("brands")}</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Products ({products.length})</h3>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("newProduct")}
              </Button>
            </div>

            <div className="space-y-3">
              {products.map((product) => {
                const isLowStock = product.quantity <= product.minQuantity;
                const isOutOfStock = product.quantity === 0;

                return (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-lg">{product.name}</h4>
                              <p className="text-sm text-zinc-500">
                                {product.brand} • {product.category}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-zinc-500">{t("sku")}</p>
                              <p className="font-medium">{product.sku}</p>
                            </div>
                            <div>
                              <p className="text-zinc-500">{t("quantity")}</p>
                              <p className={cn(
                                "font-medium",
                                isOutOfStock && "text-red-600",
                                isLowStock && !isOutOfStock && "text-orange-600"
                              )}>
                                {product.quantity} {product.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-zinc-500">{t("costPrice")}</p>
                              <p className="font-medium">₴{product.costPrice}</p>
                            </div>
                            <div>
                              <p className="text-zinc-500">{t("retailPrice")}</p>
                              <p className="font-medium">₴{product.retailPrice}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isOutOfStock && (
                            <span className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              {t("outOfStock")}
                            </span>
                          )}
                          {isLowStock && !isOutOfStock && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              {t("lowStock")}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="brands" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Brands ({brands.length})</h3>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("newBrand")}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {brands.map((brand) => (
                <Card key={brand.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{brand.name}</span>
                      <Package className="h-5 w-5 text-zinc-400" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-zinc-600">
                        {brand.productsCount} products
                      </p>
                      <span className={cn(
                        "inline-flex text-xs px-2 py-1 rounded",
                        brand.isActive 
                          ? "bg-green-100 text-green-800"
                          : "bg-zinc-100 text-zinc-800"
                      )}>
                        {brand.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
