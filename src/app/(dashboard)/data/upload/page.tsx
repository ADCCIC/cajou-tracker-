"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileSpreadsheet, AlertCircle, Check, X, Download } from "lucide-react";
import { read, utils } from "xlsx";

interface UploadPreview {
  headers: string[];
  rows: Record<string, string | number>[];
  totalRows: number;
  fileName: string;
  fileSize: number;
}

interface ColumnMapping {
  date: string;
  productType: string;
  priceType: string;
  price: string;
  grade?: string;
  origin?: string;
  destination?: string;
}

export default function UploadPage() {
  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    setErrors([]);
    setSuccess(false);

    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      setErrors(["Format de fichier non supporté. Utilisez CSV ou Excel."]);
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json<Record<string, string | number>>(firstSheet);

      if (jsonData.length === 0) {
        setErrors(["Le fichier est vide ou ne contient pas de données valides."]);
        return;
      }

      const headers = Object.keys(jsonData[0]);

      setPreview({
        headers,
        rows: jsonData.slice(0, 10), // Preview first 10 rows
        totalRows: jsonData.length,
        fileName: file.name,
        fileSize: file.size,
      });

      // Try to auto-detect column mappings
      const autoMapping: Partial<ColumnMapping> = {};
      headers.forEach((header) => {
        const h = header.toLowerCase();
        if (h.includes("date")) autoMapping.date = header;
        if (h.includes("product") || h.includes("produit") || h.includes("type")) {
          autoMapping.productType = header;
        }
        if (h.includes("price") || h.includes("prix")) {
          autoMapping.price = header;
        }
        if (h.includes("grade") || h.includes("qualite")) {
          autoMapping.grade = header;
        }
        if (h.includes("origin") || h.includes("origine")) {
          autoMapping.origin = header;
        }
        if (h.includes("destination") || h.includes("dest")) {
          autoMapping.destination = header;
        }
      });
      setMapping(autoMapping);
    } catch {
      setErrors(["Erreur lors de la lecture du fichier."]);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleImport = async () => {
    if (!preview || !mapping.date || !mapping.price) {
      setErrors(["Veuillez mapper au minimum les colonnes Date et Prix."]);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 200));
      setUploadProgress(i);
    }

    // In production, this would call the API
    // const response = await fetch('/api/prices', {
    //   method: 'POST',
    //   body: JSON.stringify({ data: preview.rows, mapping }),
    // });

    setUploading(false);
    setSuccess(true);
    setUploadProgress(100);
  };

  const resetUpload = () => {
    setPreview(null);
    setMapping({});
    setErrors([]);
    setSuccess(false);
    setUploadProgress(0);
  };

  const downloadTemplate = () => {
    const template = [
      {
        Date: "2025-01-29",
        ProductType: "RCN",
        PriceType: "FOB",
        Price_USD: 1465,
        Grade: "",
        Origin: "CI",
        Destination: "VN",
      },
      {
        Date: "2025-01-29",
        ProductType: "KERNEL",
        PriceType: "FOB",
        Price_USD: 6530,
        Grade: "WW240",
        Origin: "CI",
        Destination: "US",
      },
    ];

    const ws = utils.json_to_sheet(template);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Prices");

    // Note: In a real app, you'd use xlsx.writeFile or create a blob
    const csv = utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_prices.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import de données</h1>
          <p className="text-muted-foreground">
            Importez vos données de prix depuis un fichier CSV ou Excel
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Télécharger template
        </Button>
      </div>

      {!preview ? (
        /* Upload Zone */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Charger un fichier
            </CardTitle>
            <CardDescription>
              Formats supportés: CSV, Excel (.xlsx, .xls)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg mb-2">
                Glissez-déposez votre fichier ici
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                ou cliquez pour sélectionner
              </p>
              <Button variant="secondary">
                Parcourir les fichiers
              </Button>
              <input
                id="file-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>

            {errors.length > 0 && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                {errors.map((error, i) => (
                  <p key={i} className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Preview & Mapping */
        <div className="space-y-6">
          {/* File Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  {preview.fileName}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={resetUpload}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
              <CardDescription>
                {preview.totalRows} lignes | {(preview.fileSize / 1024).toFixed(1)} Ko
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Column Mapping */}
          <Card>
            <CardHeader>
              <CardTitle>Mappage des colonnes</CardTitle>
              <CardDescription>
                Associez les colonnes de votre fichier aux champs requis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Required fields */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    Date <Badge variant="destructive" className="text-xs">Requis</Badge>
                  </label>
                  <Select
                    value={mapping.date}
                    onValueChange={(v) => setMapping({ ...mapping, date: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {preview.headers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    Prix <Badge variant="destructive" className="text-xs">Requis</Badge>
                  </label>
                  <Select
                    value={mapping.price}
                    onValueChange={(v) => setMapping({ ...mapping, price: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {preview.headers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de produit</label>
                  <Select
                    value={mapping.productType}
                    onValueChange={(v) => setMapping({ ...mapping, productType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {preview.headers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type de prix</label>
                  <Select
                    value={mapping.priceType}
                    onValueChange={(v) => setMapping({ ...mapping, priceType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {preview.headers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Grade</label>
                  <Select
                    value={mapping.grade}
                    onValueChange={(v) => setMapping({ ...mapping, grade: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Non mappé</SelectItem>
                      {preview.headers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <Select
                    value={mapping.destination}
                    onValueChange={(v) => setMapping({ ...mapping, destination: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Non mappé</SelectItem>
                      {preview.headers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Aperçu des données</CardTitle>
              <CardDescription>
                10 premières lignes sur {preview.totalRows}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {preview.headers.map((h) => (
                        <TableHead key={h} className="whitespace-nowrap">
                          {h}
                          {mapping.date === h && <Badge className="ml-1 text-xs">Date</Badge>}
                          {mapping.price === h && <Badge className="ml-1 text-xs">Prix</Badge>}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.rows.map((row, i) => (
                      <TableRow key={i}>
                        {preview.headers.map((h) => (
                          <TableCell key={h} className="whitespace-nowrap">
                            {String(row[h] ?? "")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Import Button */}
          <Card>
            <CardContent className="pt-6">
              {success ? (
                <div className="text-center py-4">
                  <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium text-green-600">
                    Import réussi
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {preview.totalRows} lignes importées avec succès
                  </p>
                  <Button onClick={resetUpload}>
                    Importer un autre fichier
                  </Button>
                </div>
              ) : uploading ? (
                <div className="space-y-4">
                  <Progress value={uploadProgress} />
                  <p className="text-center text-sm text-muted-foreground">
                    Import en cours... {uploadProgress}%
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {preview.totalRows} lignes prêtes à importer
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vérifiez le mappage avant de lancer l&apos;import
                    </p>
                  </div>
                  <Button onClick={handleImport} disabled={!mapping.date || !mapping.price}>
                    <Upload className="mr-2 h-4 w-4" />
                    Lancer l&apos;import
                  </Button>
                </div>
              )}

              {errors.length > 0 && (
                <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                  {errors.map((error, i) => (
                    <p key={i} className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
