"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Download } from "lucide-react"
import type { Vendor, Product } from "@/app/page"

interface GenerateReceiptPageProps {
  vendors: Vendor[]
  products: Product[]
}

interface ReceiptItem {
  productId: string
  quantity: number
  unitPrice: number
}

export function GenerateReceiptPage({ vendors, products }: GenerateReceiptPageProps) {
  const [formData, setFormData] = useState({
    vendorId: "",
    receiptDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const [items, setItems] = useState<ReceiptItem[]>([])
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    quantity: "",
    unitPrice: "",
  })

  const handleAddItem = () => {
    if (currentItem.productId && currentItem.quantity && currentItem.unitPrice) {
      setItems([
        ...items,
        {
          productId: currentItem.productId,
          quantity: Number.parseInt(currentItem.quantity),
          unitPrice: Number.parseFloat(currentItem.unitPrice),
        },
      ])
      setCurrentItem({ productId: "", quantity: "", unitPrice: "" })
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const handleGenerateReceipt = () => {
    if (formData.vendorId && items.length > 0) {
      const receiptData = {
        vendor: vendors.find((v) => v.id === formData.vendorId)?.name,
        date: formData.receiptDate,
        items: items.map((item) => {
          const product = products.find((p) => p.id === item.productId)
          return {
            name: product?.name,
            sku: product?.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          }
        }),
        notes: formData.notes,
        total: calculateTotal(),
      }

      const receiptText = `
PURCHASE RECEIPT
================
Date: ${receiptData.date}
Vendor: ${receiptData.vendor}

ITEMS:
------
${receiptData.items.map((item) => `${item.name} (${item.sku})\nQty: ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}`).join("\n\n")}

------
TOTAL: $${receiptData.total.toFixed(2)}

NOTES:
${receiptData.notes || "N/A"}
      `

      const element = document.createElement("a")
      element.href = "data:text/plain;charset=utf-8," + encodeURIComponent(receiptText)
      element.download = `receipt-${formData.receiptDate}.txt`
      element.click()

      alert("Receipt generated and downloaded successfully!")
    }
  }

  const selectedVendor = vendors.find((v) => v.id === formData.vendorId)

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <Button variant="outline" className="gap-2 border-2 w-full sm:w-auto bg-transparent">
        <ArrowLeft size={18} /> Back to Receipts
      </Button>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Generate Purchase Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 md:space-y-6">
            {/* Receipt Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor *</Label>
                <select
                  id="vendor"
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-border rounded-lg bg-input text-foreground"
                  required
                >
                  <option value="">Select a vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt-date">Receipt Date *</Label>
                <Input
                  id="receipt-date"
                  type="date"
                  value={formData.receiptDate}
                  onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                  className="border-2"
                  required
                />
              </div>
            </div>

            {/* Vendor Details */}
            {selectedVendor && (
              <div className="p-4 bg-secondary/30 rounded-lg space-y-2">
                <h3 className="font-semibold text-foreground">Vendor Information</h3>
                <p className="text-sm text-muted-foreground">Email: {selectedVendor.email}</p>
                {selectedVendor.phone && <p className="text-sm text-muted-foreground">Phone: {selectedVendor.phone}</p>}
                {selectedVendor.address && (
                  <p className="text-sm text-muted-foreground">
                    {selectedVendor.address}, {selectedVendor.city}, {selectedVendor.country}
                  </p>
                )}
              </div>
            )}

            {/* Items Section */}
            <div className="space-y-4 border-t border-border pt-4 md:pt-6">
              <h3 className="font-semibold text-foreground">Receipt Items</h3>

              {/* Add Item Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 p-4 bg-secondary/30 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="product" className="text-sm">
                    Product
                  </Label>
                  <select
                    id="product"
                    value={currentItem.productId}
                    onChange={(e) => setCurrentItem({ ...currentItem, productId: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-border rounded-lg bg-input text-foreground text-sm"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qty" className="text-sm">
                    Quantity
                  </Label>
                  <Input
                    id="qty"
                    type="number"
                    placeholder="Qty"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                    className="border-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm">
                    Unit Price
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="price"
                      type="number"
                      placeholder="Price"
                      value={currentItem.unitPrice}
                      onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: e.target.value })}
                      className="border-2 text-sm flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      className="bg-accent hover:bg-accent/90 px-3 md:px-4 text-sm"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No items added yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-sm">
                      <thead>
                        <tr className="border-b-2 border-border">
                          <th className="text-left py-2 px-3 font-semibold">Product</th>
                          <th className="text-center py-2 px-3 font-semibold">Qty</th>
                          <th className="text-right py-2 px-3 font-semibold">Unit Price</th>
                          <th className="text-right py-2 px-3 font-semibold">Total</th>
                          <th className="text-center py-2 px-3 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => {
                          const product = products.find((p) => p.id === item.productId)
                          return (
                            <tr key={idx} className="border-b border-border">
                              <td className="py-2 px-3 text-foreground truncate">{product?.name}</td>
                              <td className="py-2 px-3 text-center">{item.quantity}</td>
                              <td className="py-2 px-3 text-right">${item.unitPrice.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-semibold">
                                ${(item.quantity * item.unitPrice).toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="p-1 hover:bg-destructive/10 rounded transition-colors"
                                >
                                  <Trash2 size={16} className="text-destructive" />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-end p-4 bg-secondary/30 rounded-lg">
                <div className="text-right">
                  <p className="text-muted-foreground mb-2">Grand Total:</p>
                  <p className="text-2xl md:text-3xl font-bold text-primary">${calculateTotal().toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 border-t border-border pt-4 md:pt-6">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes for this receipt..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="border-2 resize-none"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 flex-wrap">
              <Button
                type="button"
                onClick={handleGenerateReceipt}
                className="bg-accent hover:bg-accent/90 gap-2 flex-1 sm:flex-none"
              >
                <Download size={18} /> Generate & Download Receipt
              </Button>
              <Button type="button" variant="outline" className="border-2 flex-1 sm:flex-none bg-transparent">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
