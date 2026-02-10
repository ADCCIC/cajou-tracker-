"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  calculateFOB,
  calculateCIF,
  DEFAULT_VALUES,
  formatFCFA,
  formatUSD,
} from "@/lib/utils/calculations";
import { Calculator, DollarSign, Truck, Ship, FileText } from "lucide-react";

const calculatorSchema = z.object({
  productType: z.enum(["RCN", "KERNEL"]),
  farmgatePrice: z.number().min(0, "Le prix doit être positif"),
  quantity: z.number().min(0.1, "Quantité minimum: 0.1 tonne"),
  transportCost: z.number().min(0),
  handlingCost: z.number().min(0),
  otherCosts: z.number().min(0),
  exchangeRate: z.number().min(1),
  destination: z.string().optional(),
  freightCost: z.number().min(0).optional(),
  insuranceRate: z.number().min(0).max(10).optional(),
});

type CalculatorFormData = z.infer<typeof calculatorSchema>;

const destinations = [
  { code: "VN", name: "Vietnam", freight: 85 },
  { code: "IN", name: "Inde", freight: 75 },
  { code: "CN", name: "Chine", freight: 90 },
  { code: "NL", name: "Pays-Bas (Europe)", freight: 60 },
  { code: "US", name: "USA", freight: 95 },
];

export default function CalculatorPage() {
  const [result, setResult] = useState<ReturnType<typeof calculateCIF> | null>(null);
  const [calculationType, setCalculationType] = useState<"fob" | "cif">("fob");

  const form = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      productType: "RCN",
      farmgatePrice: 270, // FCFA/kg
      quantity: 100, // tonnes
      transportCost: DEFAULT_VALUES.TRANSPORT_COST_DEFAULT,
      handlingCost: DEFAULT_VALUES.HANDLING_COST_DEFAULT,
      otherCosts: 5000, // FCFA/tonne
      exchangeRate: DEFAULT_VALUES.EXCHANGE_RATE,
      destination: "VN",
      freightCost: 85,
      insuranceRate: 0.5,
    },
  });

  const productType = form.watch("productType");
  const dusRate = productType === "RCN" ? DEFAULT_VALUES.DUS_RATE_RCN : DEFAULT_VALUES.DUS_RATE_KERNEL;

  const onSubmit = (data: CalculatorFormData) => {
    const baseInput = {
      farmgatePrice: data.farmgatePrice,
      quantity: data.quantity,
      transportCost: data.transportCost,
      handlingCost: data.handlingCost,
      dusRate,
      otherCosts: data.otherCosts,
      exchangeRate: data.exchangeRate,
    };

    if (calculationType === "cif" && data.destination) {
      const cifResult = calculateCIF({
        ...baseInput,
        destination: data.destination,
        freightCost: data.freightCost || DEFAULT_VALUES.FREIGHT_COSTS[data.destination] || 80,
        insuranceRate: (data.insuranceRate || 0.5) / 100,
      });
      setResult(cifResult);
    } else {
      const fobResult = calculateFOB(baseInput);
      setResult(fobResult);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Calculateur FOB / CIF
        </h1>
        <p className="text-muted-foreground">
          Calculez le prix FOB ou CIF à partir du prix bord-champ
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Paramètres de calcul
            </CardTitle>
            <CardDescription>
              Entrez les données pour calculer le prix export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={calculationType} onValueChange={(v) => setCalculationType(v as "fob" | "cif")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fob">Prix FOB</TabsTrigger>
                <TabsTrigger value="cif">Prix CIF</TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  {/* Product Type */}
                  <FormField
                    control={form.control}
                    name="productType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de produit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="RCN">
                              RCN - Noix brutes (DUS 5%)
                            </SelectItem>
                            <SelectItem value="KERNEL">
                              Kernels - Amandes (DUS 0%)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {productType === "RCN" ? (
                            <Badge>DUS 5%</Badge>
                          ) : (
                            <Badge variant="secondary">DUS 0%</Badge>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    {/* Farmgate Price */}
                    <FormField
                      control={form.control}
                      name="farmgatePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix bord-champ</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" {...field} />
                              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                FCFA/kg
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Quantity */}
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantité</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" step="0.1" {...field} />
                              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                tonnes
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Costs */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Coûts logistiques (FCFA/tonne)
                    </Label>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="transportCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Transport</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="handlingCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Manutention</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="otherCosts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Autres</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Exchange Rate */}
                  <FormField
                    control={form.control}
                    name="exchangeRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taux de change USD/FCFA</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CIF-specific fields */}
                  <TabsContent value="cif" className="mt-0 space-y-4">
                    <Separator />
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Ship className="h-4 w-4" />
                      Paramètres CIF
                    </Label>

                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const dest = destinations.find(d => d.code === value);
                              if (dest) {
                                form.setValue("freightCost", dest.freight);
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {destinations.map((dest) => (
                                <SelectItem key={dest.code} value={dest.code}>
                                  {dest.name} (~${dest.freight}/t fret)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="freightCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fret ($/t)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="insuranceRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assurance (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <Button type="submit" className="w-full">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculer prix {calculationType.toUpperCase()}
                  </Button>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Résultat du calcul
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Prix FOB</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatUSD(result.fobPricePerTonneUsd)}/t
                    </p>
                  </div>
                  {result.cifPricePerTonneUsd && (
                    <div className="p-4 bg-secondary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Prix CIF</p>
                      <p className="text-2xl font-bold text-secondary-foreground">
                        {formatUSD(result.cifPricePerTonneUsd)}/t
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-medium">Détail des coûts</h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Achat bord-champ</span>
                      <span>{formatFCFA(result.farmgateTotalFcfa)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transport</span>
                      <span>{formatFCFA(result.transportTotalFcfa)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manutention</span>
                      <span>{formatFCFA(result.handlingTotalFcfa)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Autres coûts</span>
                      <span>{formatFCFA(result.otherTotalFcfa)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        DUS ({productType === "RCN" ? "5%" : "0%"})
                      </span>
                      <span>{formatFCFA(result.dusTotalFcfa)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-medium">
                      <span>Total FOB (FCFA)</span>
                      <span>{formatFCFA(result.totalCostFcfa)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total FOB (USD)</span>
                      <span>{formatUSD(result.fobPriceUsd)}</span>
                    </div>

                    {result.freightTotalUsd !== undefined && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fret maritime</span>
                          <span>{formatUSD(result.freightTotalUsd)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Assurance</span>
                          <span>{formatUSD(result.insuranceTotalUsd || 0)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total CIF (USD)</span>
                          <span>{formatUSD(result.cifPriceUsd || 0)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Notes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>DUS (Droit Unique de Sortie): 5% pour RCN, 0% pour Kernels</li>
                    <li>Le DUS est calculé sur la valeur CAF</li>
                    <li>Taux de change utilisé: {form.getValues("exchangeRate")} FCFA/USD</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Remplissez le formulaire et cliquez sur Calculer</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
