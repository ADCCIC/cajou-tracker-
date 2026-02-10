"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart } from "@/components/charts/LineChart";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

// Mock price data
const priceHistory = [
  { date: "2025-01-01", rcnFarmgate: 250, rcnFob: 1420, kernelFob: 6200 },
  { date: "2025-01-05", rcnFarmgate: 255, rcnFob: 1435, kernelFob: 6280 },
  { date: "2025-01-10", rcnFarmgate: 260, rcnFob: 1450, kernelFob: 6350 },
  { date: "2025-01-15", rcnFarmgate: 258, rcnFob: 1445, kernelFob: 6400 },
  { date: "2025-01-20", rcnFarmgate: 265, rcnFob: 1460, kernelFob: 6480 },
  { date: "2025-01-25", rcnFarmgate: 270, rcnFob: 1470, kernelFob: 6520 },
  { date: "2025-01-29", rcnFarmgate: 268, rcnFob: 1465, kernelFob: 6530 },
];

const kernelGrades = [
  { grade: "WW180", price: 7200, change: 2.1 },
  { grade: "WW240", price: 6530, change: 1.8 },
  { grade: "WW320", price: 5850, change: 1.5 },
  { grade: "WW450", price: 5200, change: 0.9 },
  { grade: "SW", price: 4800, change: -0.5 },
  { grade: "LP", price: 3200, change: 0.2 },
];

const recentTransactions = [
  { date: "2025-01-29", type: "RCN", grade: "-", origin: "CI", destination: "Vietnam", price: 1465, volume: 500 },
  { date: "2025-01-28", type: "Kernel", grade: "WW240", origin: "CI", destination: "USA", price: 6550, volume: 50 },
  { date: "2025-01-27", type: "RCN", grade: "-", origin: "CI", destination: "Inde", price: 1455, volume: 750 },
  { date: "2025-01-26", type: "Kernel", grade: "WW320", origin: "CI", destination: "Pays-Bas", price: 5880, volume: 30 },
  { date: "2025-01-25", type: "RCN", grade: "-", origin: "CI", destination: "Vietnam", price: 1450, volume: 600 },
];

export default function PricesPage() {
  const [period, setPeriod] = useState("30d");
  const [productType, setProductType] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Prix Anacarde
          </h1>
          <p className="text-muted-foreground">
            Suivi des prix RCN et Kernels (FOB, bord-champ)
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="rcn">RCN</SelectItem>
              <SelectItem value="kernel">Kernels</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Prices */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Prix bord-champ RCN"
          value="268 FCFA/kg"
          trend={-0.7}
          trendLabel="vs hier"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Prix FOB RCN"
          value="$1,465/t"
          trend={0.3}
          trendLabel="vs hier"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Prix FOB Kernels WW240"
          value="$6,530/t"
          trend={0.8}
          trendLabel="vs hier"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Taux USD/FCFA"
          value="600"
          description="Taux CCA officiel"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="grades">Grades Kernels</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Prix RCN</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={priceHistory}
                  xAxisKey="date"
                  lines={[
                    {
                      dataKey: "rcnFob",
                      name: "FOB ($/t)",
                      color: "hsl(142, 76%, 36%)",
                    },
                  ]}
                  height={300}
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
            <Card>
              <CardHeader>
                <CardTitle>Prix Kernels (WW240)</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={priceHistory}
                  xAxisKey="date"
                  lines={[
                    {
                      dataKey: "kernelFob",
                      name: "FOB ($/t)",
                      color: "hsl(262, 83%, 58%)",
                    },
                  ]}
                  height={300}
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Prix bord-champ RCN (FCFA/kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={priceHistory}
                xAxisKey="date"
                lines={[
                  {
                    dataKey: "rcnFarmgate",
                    name: "Bord-champ (FCFA/kg)",
                    color: "hsl(47, 100%, 50%)",
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
                formatYAxis={(v) => `${v} F`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prix par Grade - Kernels FOB</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Prix FOB ($/t)</TableHead>
                    <TableHead className="text-right">Variation 7j</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kernelGrades.map((grade) => (
                    <TableRow key={grade.grade}>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{grade.grade}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${grade.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`flex items-center justify-end gap-1 ${
                            grade.change >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {grade.change >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {grade.change > 0 ? "+" : ""}
                          {grade.change}%
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {grade.grade === "WW180" && "Premium, 180 noix/livre"}
                        {grade.grade === "WW240" && "Standard, 240 noix/livre"}
                        {grade.grade === "WW320" && "Courant, 320 noix/livre"}
                        {grade.grade === "WW450" && "Petit calibre, 450 noix/livre"}
                        {grade.grade === "SW" && "Scorched Wholes (légèrement grillées)"}
                        {grade.grade === "LP" && "Large Pieces (morceaux)"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transactions récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-right">Prix ($/t)</TableHead>
                    <TableHead className="text-right">Volume (t)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {new Date(tx.date).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.type === "RCN" ? "default" : "secondary"}>
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.grade}</TableCell>
                      <TableCell>{tx.destination}</TableCell>
                      <TableCell className="text-right font-mono">
                        ${tx.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{tx.volume}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
