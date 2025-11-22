"use client"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Eye, Edit2, Trash2 } from "lucide-react"
import { ProductCreateDialog } from "@/components/dialogs/product-create-dialog"
import { InventoryUpdateDialog } from "@/components/dialogs/inventory-update-dialog"
import { ReceiptGenerateDialog } from "@/components/dialogs/receipt-generate-dialog"
import { LocationCreateDialog } from "@/components/dialogs/location-create-dialog"
import { MoveHistoryDialog } from "@/components/dialogs/move-history-dialog"

interface ProductsListPageProps {
	products: Product[]
	onEditProduct: (id: string) => void
	onViewProduct: (id: string) => void
}

export function ProductsListPage({ products, onEditProduct, onViewProduct }: ProductsListPageProps) {
	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex  flex-wrap gap-2 mb-4 justify-end">
				<ProductCreateDialog />
			</div>
			<div className="overflow-x-auto border rounded-lg">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b">
							<th className="text-left p-2">Product</th>
							<th className="text-left p-2">SKU</th>
							<th className="text-left p-2">Category</th>
							<th className="text-right p-2">Price</th>
							<th className="text-center p-2">Qty</th>
							<th className="text-center p-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{products.map((product) => (
							<tr key={product.id} className="border-b hover:bg-secondary/50">
								<td className="p-2 font-medium">{product.name}</td>
								<td className="p-2 text-muted-foreground">{product.sku}</td>
								<td className="p-2 text-muted-foreground">{product.category}</td>
								<td className="p-2 text-right">${product.price.toFixed(2)}</td>
								<td className="p-2 text-center">{product.quantity}</td>
								<td className="p-2 text-center">
									<div className="flex gap-1 justify-center">
										<Button size="icon" variant="ghost" onClick={() => onViewProduct(product.id)} title="View">
											<Eye size={16} />
										</Button>
										<Button size="icon" variant="ghost" onClick={() => onEditProduct(product.id)} title="Edit">
											<Edit2 size={16} />
										</Button>
										<Button size="icon" variant="ghost" title="Delete">
											<Trash2 size={16} />
										</Button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

