"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
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
import { formatTonnes, formatUSD } from "@/lib/utils/calculations";

// Mock data
const exportTimeSeries = [
  { year: 2018, rcnVolume: 620000, rcnValue: 850, kernelVolume: 15000, kernelValue: 95 },
  { year: 2019, rcnVolume: 650000, rcnValue: 920, kernelVolume: 18000, kernelValue: 115 },
  { year: 2020, rcnVolume: 720000, rcnValue: 980, kernelVolume: 22000, kernelValue: 140 },
  { year: 2021, rcnVolume: 850000, rcnValue: 1200, kernelVolume: 28000, kernelValue: 180 },
  { year: 2022, rcnVolume: 920000, rcnValue: 1350, kernelVolume: 35000, kernelValue: 230 },
  { year: 2023, rcnVolume: 980000, rcnValue: 1420, kernelVolume: 42000, kernelValue: 280 },
  { year: 2024, rcnVolume: 1050000, rcnValue: 1530, kernelVolume: 50000, kernelValue: 340 },
];

const countryComparison = [
  { country: "Côte d'Ivoire", rcn: 1050000, kernels: 50000 },
  { country: "Vietnam", rcn: 150000, kernels: 450000 },
  { country: "Inde", rcn: 100000, kernels: 380000 },
  { country: "Nigeria", rcn: 250000, kernels: 15000 },
  { country: "Ghana", rcn: 180000, kernels: 8000 },
];

const destinationData = [
  { partner: "Vietnam", volumeKg: 450000000, valueUsd: 520000000, share: 43 },
  { partner: "Inde", volumeKg: 320000000, valueUsd: 380000000, share: 30 },
  { partner: "Chine", volumeKg: 110000000, valueUsd: 125000000, share: 10 },
  { partner: "Pays-Bas", volumeKg: 55000000, valueUsd: 68000000, share: 5 },
  { partner: "Singapour", volumeKg: 45000000, valueUsd: 52000000, share: 4 },
  { partner: "Autres", volumeKg: 70000000, valueUsd: 85000000, share: 8 },
];

export default function ExportsPage() {
  const [yearFilter, setYearFilter] = useState("2024");
  const [productFilter, setProductFilter] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Exports Anacarde - Côte d&apos;Ivoire
          </h1>
          <p className="text-muted-foreground">
            Données commerciales RCN et Kernels (Source: UN Comtrade)
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous produits</SelectItem>
              <SelectItem value="rcn">RCN (080131)</SelectItem>
              <SelectItem value="kernel">Kernels (080132)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="comparison">Comparaison pays</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Exports RCN {yearFilter}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.05M tonnes</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Badge variant="outline">HS 080131</Badge>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valeur RCN
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1.53 Mrd</div>
                <p className="text-xs text-green-600 mt-1">+7.7% vs 2023</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Exports Kernels {yearFilter}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">50K tonnes</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Badge variant="secondary">HS 080132</Badge>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valeur Kernels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$340M</div>
                <p className="text-xs text-green-600 mt-1">+21% vs 2023</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evolution Volumes Exports (tonnes)</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={exportTimeSeries}
                  xAxisKey="year"
                  lines={[
                    {
                      dataKey: "rcnVolume",
                      name: "RCN",
                      color: "hsl(142, 76%, 36%)",
                    },
                    {
                      dataKey: "kernelVolume",
                      name: "Kernels",
                      color: "hsl(262, 83%, 58%)",
                    },
                  ]}
                  height={300}
                  formatYAxis={(v) => `${(v / 1000).toFixed(0)}k`}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Evolution Valeurs Exports (M$)</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={exportTimeSeries}
                  xAxisKey="year"
                  lines={[
                    {
                      dataKey: "rcnValue",
                      name: "RCN",
                      color: "hsl(142, 76%, 36%)",
                    },
                    {
                      dataKey: "kernelValue",
                      name: "Kernels",
                      color: "hsl(262, 83%, 58%)",
                    },
                  ]}
                  height={300}
                  formatYAxis={(v) => `$${v}M`}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Destinations Tab */}
        <TabsContent value="destinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Destinations Exports RCN {yearFilter}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pays</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Valeur USD</TableHead>
                    <TableHead className="text-right">Part (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {destinationData.map((dest) => (
                    <TableRow key={dest.partner}>
                      <TableCell className="font-medium">{dest.partner}</TableCell>
                      <TableCell className="text-right">
                        {formatTonnes(dest.volumeKg / 1000)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatUSD(dest.valueUsd)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={dest.share > 20 ? "default" : "secondary"}>
                          {dest.share}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par destination</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={destinationData.slice(0, 5)}
                xAxisKey="partner"
                bars={[
                  {
                    dataKey: "share",
                    name: "Part de marché (%)",
                    color: "hsl(142, 76%, 36%)",
                  },
                ]}
                height={300}
                formatYAxis={(v) => `${v}%`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Country Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparaison Pays Producteurs {yearFilter}</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={countryComparison}
                xAxisKey="country"
                bars={[
                  {
                    dataKey: "rcn",
                    name: "RCN (tonnes)",
                    color: "hsl(142, 76%, 36%)",
                  },
                  {
                    dataKey: "kernels",
                    name: "Kernels (tonnes)",
                    color: "hsl(262, 83%, 58%)",
                  },
                ]}
                height={350}
                formatYAxis={(v) => `${(v / 1000).toFixed(0)}k`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analyse comparative</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pays</TableHead>
                    <TableHead className="text-right">Exports RCN</TableHead>
                    <TableHead className="text-right">Exports Kernels</TableHead>
                    <TableHead className="text-right">Ratio Kernels/RCN</TableHead>
                    <TableHead>Profil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryComparison.map((country) => {
                    const ratio = ((country.kernels / (country.rcn + country.kernels)) * 100).toFixed(1);
                    const profile = parseFloat(ratio) > 50 ? "Transformateur" : "Exportateur brut";
                    return (
                      <TableRow key={country.country}>
                        <TableCell className="font-medium">{country.country}</TableCell>
                        <TableCell className="text-right">
                          {formatTonnes(country.rcn)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatTonnes(country.kernels)}
                        </TableCell>
                        <TableCell className="text-right">{ratio}%</TableCell>
                        <TableCell>
                          <Badge variant={profile === "Transformateur" ? "default" : "secondary"}>
                            {profile}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
