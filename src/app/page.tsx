"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/charts/LineChart";
import { PieChart } from "@/components/charts/PieChart";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  TrendingUp,
  Globe,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data - will be replaced with API calls
const productionData = [
  { year: "2019", production: 792000, exports: 650000 },
  { year: "2020", production: 848000, exports: 720000 },
  { year: "2021", production: 1080000, exports: 850000 },
  { year: "2022", production: 1200000, exports: 920000 },
  { year: "2023", production: 1300000, exports: 980000 },
  { year: "2024", production: 1500000, exports: 1050000 },
];

const destinationData = [
  { name: "Vietnam", value: 45 },
  { name: "Inde", value: 30 },
  { name: "Chine", value: 10 },
  { name: "Autres", value: 15 },
];

const recentPrices = [
  { date: "2025-01-25", rcnFob: 1450, kernelFob: 6500 },
  { date: "2025-01-26", rcnFob: 1460, kernelFob: 6480 },
  { date: "2025-01-27", rcnFob: 1455, kernelFob: 6520 },
  { date: "2025-01-28", rcnFob: 1470, kernelFob: 6550 },
  { date: "2025-01-29", rcnFob: 1465, kernelFob: 6530 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Cajou - Côte d&apos;Ivoire
          </h1>
          <p className="text-muted-foreground">
            Suivi des exports et prix de noix de cajou (RCN) et amandes
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            Saison 2024/2025
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Données FAOSTAT & Comtrade
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Production RCN 2024"
          value="1.5M tonnes"
          trend={15.4}
          trendLabel="vs 2023"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Exports RCN 2024"
          value="1.05M tonnes"
          trend={7.1}
          trendLabel="vs 2023"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Taux transformation"
          value="36%"
          description="Objectif 2030: 44%"
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Prix FOB RCN"
          value="$1,465/t"
          trend={-2.1}
          trendLabel="cette semaine"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Production Evolution */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Production & Exports RCN</CardTitle>
            <Link href="/exports">
              <Button variant="ghost" size="sm">
                Voir détails
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <LineChart
              data={productionData}
              xAxisKey="year"
              lines={[
                {
                  dataKey: "production",
                  name: "Production (tonnes)",
                  color: "hsl(142, 76%, 36%)",
                },
                {
                  dataKey: "exports",
                  name: "Exports (tonnes)",
                  color: "hsl(221, 83%, 53%)",
                },
              ]}
              height={300}
              formatYAxis={(v) => `${(v / 1000).toFixed(0)}k`}
            />
          </CardContent>
        </Card>

        {/* Destinations */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Destinations Exports</CardTitle>
            <Link href="/exports/destinations">
              <Button variant="ghost" size="sm">
                Voir carte
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <PieChart
              data={destinationData}
              height={280}
              innerRadius={60}
              outerRadius={100}
              formatValue={(v) => `${v}%`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Prices & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Price Evolution */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Prix FOB (7 derniers jours)</CardTitle>
            <Link href="/prices">
              <Button variant="ghost" size="sm">
                Historique complet
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <LineChart
              data={recentPrices}
              xAxisKey="date"
              lines={[
                {
                  dataKey: "rcnFob",
                  name: "RCN ($/t)",
                  color: "hsl(142, 76%, 36%)",
                },
                {
                  dataKey: "kernelFob",
                  name: "Kernels ($/t)",
                  color: "hsl(262, 83%, 58%)",
                },
              ]}
              height={250}
              formatXAxis={(v) => {
                const d = new Date(v);
                return d.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                });
              }}
              formatYAxis={(v) => `$${v}`}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/prices/calculator" className="block">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Calculateur FOB/CIF
              </Button>
            </Link>
            <Link href="/prices/alerts" className="block">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Configurer alertes prix
              </Button>
            </Link>
            <Link href="/data/upload" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Importer données
              </Button>
            </Link>
            <Link href="/exports" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Globe className="mr-2 h-4 w-4" />
                Comparer pays producteurs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Market Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations marché</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Codes HS
              </p>
              <p className="text-sm">
                <code className="bg-muted px-1 rounded">0801.31</code> RCN
                (noix brutes)
              </p>
              <p className="text-sm">
                <code className="bg-muted px-1 rounded">0801.32</code> Kernels
                (amandes)
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                DUS (Droit Unique de Sortie)
              </p>
              <p className="text-sm">
                <Badge>5%</Badge> sur RCN (depuis nov. 2024)
              </p>
              <p className="text-sm">
                <Badge variant="secondary">0%</Badge> sur amandes
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Conversion RCN → Kernels
              </p>
              <p className="text-sm">
                1 tonne RCN = <strong>200-220 kg</strong> amandes
              </p>
              <p className="text-sm text-muted-foreground">
                KOR standard: 47-48 lbs/80kg
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
