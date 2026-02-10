"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Bell, Plus, Trash2, Mail, AlertTriangle, Check } from "lucide-react";
import { KERNEL_GRADES } from "@/types";

interface Alert {
  id: string;
  productType: "RCN" | "KERNEL";
  priceType: "FARMGATE" | "FOB" | "CIF";
  grade?: string;
  condition: "ABOVE" | "BELOW" | "CHANGE_PERCENT";
  thresholdValue: number;
  isActive: boolean;
  notifyEmail: boolean;
  lastTriggered?: string;
}

// Mock alerts data
const mockAlerts: Alert[] = [
  {
    id: "1",
    productType: "RCN",
    priceType: "FOB",
    condition: "ABOVE",
    thresholdValue: 1500,
    isActive: true,
    notifyEmail: true,
  },
  {
    id: "2",
    productType: "RCN",
    priceType: "FARMGATE",
    condition: "BELOW",
    thresholdValue: 250,
    isActive: true,
    notifyEmail: true,
    lastTriggered: "2025-01-25",
  },
  {
    id: "3",
    productType: "KERNEL",
    priceType: "FOB",
    grade: "WW240",
    condition: "CHANGE_PERCENT",
    thresholdValue: 5,
    isActive: false,
    notifyEmail: false,
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    productType: "RCN",
    priceType: "FOB",
    condition: "ABOVE",
    thresholdValue: 0,
    isActive: true,
    notifyEmail: true,
  });

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const addAlert = () => {
    if (!newAlert.thresholdValue) return;

    const alert: Alert = {
      id: Date.now().toString(),
      productType: newAlert.productType || "RCN",
      priceType: newAlert.priceType || "FOB",
      grade: newAlert.grade,
      condition: newAlert.condition || "ABOVE",
      thresholdValue: newAlert.thresholdValue,
      isActive: true,
      notifyEmail: newAlert.notifyEmail ?? true,
    };

    setAlerts([...alerts, alert]);
    setDialogOpen(false);
    setNewAlert({
      productType: "RCN",
      priceType: "FOB",
      condition: "ABOVE",
      thresholdValue: 0,
      isActive: true,
      notifyEmail: true,
    });
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case "ABOVE": return "au-dessus de";
      case "BELOW": return "en-dessous de";
      case "CHANGE_PERCENT": return "variation de";
      default: return condition;
    }
  };

  const getUnit = (priceType: string, condition: string) => {
    if (condition === "CHANGE_PERCENT") return "%";
    if (priceType === "FARMGATE") return "FCFA/kg";
    return "$/t";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alertes Prix</h1>
          <p className="text-muted-foreground">
            Configurez des alertes pour être notifié des variations de prix
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle alerte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Créer une alerte</DialogTitle>
              <DialogDescription>
                Configurez les conditions de déclenchement de l&apos;alerte
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Product Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Produit</Label>
                <Select
                  value={newAlert.productType}
                  onValueChange={(v) => setNewAlert({ ...newAlert, productType: v as "RCN" | "KERNEL" })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RCN">RCN</SelectItem>
                    <SelectItem value="KERNEL">Kernels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grade (for Kernels) */}
              {newAlert.productType === "KERNEL" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Grade</Label>
                  <Select
                    value={newAlert.grade || ""}
                    onValueChange={(v) => setNewAlert({ ...newAlert, grade: v })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Tous grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous grades</SelectItem>
                      {KERNEL_GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Type prix</Label>
                <Select
                  value={newAlert.priceType}
                  onValueChange={(v) => setNewAlert({ ...newAlert, priceType: v as "FARMGATE" | "FOB" | "CIF" })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FARMGATE">Bord-champ</SelectItem>
                    <SelectItem value="FOB">FOB</SelectItem>
                    <SelectItem value="CIF">CIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Condition</Label>
                <Select
                  value={newAlert.condition}
                  onValueChange={(v) => setNewAlert({ ...newAlert, condition: v as "ABOVE" | "BELOW" | "CHANGE_PERCENT" })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ABOVE">Au-dessus de</SelectItem>
                    <SelectItem value="BELOW">En-dessous de</SelectItem>
                    <SelectItem value="CHANGE_PERCENT">Variation (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Threshold */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Seuil</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    type="number"
                    value={newAlert.thresholdValue || ""}
                    onChange={(e) => setNewAlert({ ...newAlert, thresholdValue: parseFloat(e.target.value) })}
                    placeholder="0"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {getUnit(newAlert.priceType || "FOB", newAlert.condition || "ABOVE")}
                  </span>
                </div>
              </div>

              {/* Email notification */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Switch
                    checked={newAlert.notifyEmail}
                    onCheckedChange={(v) => setNewAlert({ ...newAlert, notifyEmail: v })}
                  />
                  <span className="text-sm text-muted-foreground">
                    Notification par email
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={addAlert}>Créer l&apos;alerte</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertes actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Déclenchées (7j)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {alerts.filter(a => a.lastTriggered).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Mes alertes
          </CardTitle>
          <CardDescription>
            Liste de vos alertes configurées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Aucune alerte configurée</p>
              <p className="text-sm">Créez votre première alerte pour être notifié des variations de prix</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Type prix</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Notification</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.productType === "RCN" ? "default" : "secondary"}>
                          {alert.productType}
                        </Badge>
                        {alert.grade && (
                          <span className="text-sm text-muted-foreground">
                            {alert.grade}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {alert.priceType === "FARMGATE" ? "Bord-champ" : alert.priceType}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getConditionLabel(alert.condition)}{" "}
                        <strong>
                          {alert.thresholdValue}
                          {getUnit(alert.priceType, alert.condition)}
                        </strong>
                      </span>
                    </TableCell>
                    <TableCell>
                      {alert.notifyEmail && (
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {alert.lastTriggered ? (
                          <Badge variant="outline" className="text-orange-500 border-orange-500">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {new Date(alert.lastTriggered).toLocaleDateString("fr-FR")}
                          </Badge>
                        ) : alert.isActive ? (
                          <Badge variant="outline" className="text-green-500 border-green-500">
                            <Check className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={alert.isActive}
                          onCheckedChange={() => toggleAlert(alert.id)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
