"use client"
import { Product } from "@/lib/api/product"
import { Button } from "@/components/ui/button"
import { Eye, Edit2, Trash2, RefreshCw, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ProductsListPageProps {
	products: Product[]
	warehouseId: string
	onEditProduct: (id: string) => void
	onViewProduct: (id: string) => void
	onDeleteProduct: (id: string) => void
	onRefresh: () => void
	onCreateProduct: () => void
}

export function ProductsListPage({
	products,
	warehouseId,
	onEditProduct,
	onViewProduct,
	onDeleteProduct,
	onRefresh,
	onCreateProduct
}: ProductsListPageProps) {
	// Calculate total stock from stockLevels if available
	const getTotalStock = (product: Product) => {
		if (product.stockLevels && product.stockLevels.length > 0) {
			return product.stockLevels.reduce((sum, level) => sum + level.quantity, 0)
		}
		return 0
	}

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Products</h1>
					<p className="text-muted-foreground mt-1">
						Manage your warehouse products and inventory
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={onRefresh}>
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
					<Button size="sm" onClick={onCreateProduct}>
						<Package className="h-4 w-4 mr-2" />
						Add Product
					</Button>
				</div>
			</div>

			{products.length === 0 ? (
				<div className="flex flex-col items-center justify-center min-h-[400px] border rounded-lg bg-secondary/20">
					<Package className="h-16 w-16 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">No products found</h3>
					<p className="text-sm text-muted-foreground mb-4">
						Get started by creating your first product
					</p>
					<Button onClick={onCreateProduct}>
						<Package className="h-4 w-4 mr-2" />
						Create Product
					</Button>
				</div>
			) : (
				<div className="overflow-x-auto border rounded-lg">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b bg-secondary/50">
								<th className="text-left p-3 font-semibold">Product</th>
								<th className="text-left p-3 font-semibold">SKU</th>
								<th className="text-left p-3 font-semibold">Category</th>
								<th className="text-right p-3 font-semibold">Price</th>
								<th className="text-center p-3 font-semibold">Stock</th>
								<th className="text-center p-3 font-semibold">Status</th>
								<th className="text-center p-3 font-semibold">Actions</th>
							</tr>
						</thead>
						<tbody>
							{products.map((product) => {
								const totalStock = getTotalStock(product)
								const isLowStock = product.reorderLevel > 0 && totalStock <= product.reorderLevel

								return (
									<tr key={product.id} className="border-b hover:bg-secondary/30 transition-colors">
										<td className="p-3">
											<div className="flex items-center gap-2">
												<div className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
												<div>
													<div className="font-medium">{product.name}</div>
													{product.description && (
														<div className="text-xs text-muted-foreground line-clamp-1">
															{product.description}
														</div>
													)}
												</div>
											</div>
										</td>
										<td className="p-3">
											<code className="text-xs bg-secondary px-2 py-1 rounded">
												{product.sku}
											</code>
										</td>
										<td className="p-3 text-muted-foreground">
											{product.category?.name || "-"}
										</td>
										<td className="p-3 text-right font-medium">
											{product.price ? `$${product.price.toFixed(2)}` : "-"}
										</td>
										<td className="p-3 text-center">
											<span className={`font-semibold ${isLowStock ? 'text-destructive' : ''}`}>
												{totalStock}
											</span>
											{product.reorderLevel > 0 && (
												<span className="text-xs text-muted-foreground ml-1">
													/ {product.reorderLevel}
												</span>
											)}
										</td>
										<td className="p-3 text-center">
											{isLowStock ? (
												<Badge variant="destructive" className="text-xs">
													Low Stock
												</Badge>
											) : product.isActive ? (
												<Badge variant="default" className="text-xs bg-green-500">
													Active
												</Badge>
											) : (
												<Badge variant="secondary" className="text-xs">
													Inactive
												</Badge>
											)}
										</td>
										<td className="p-3 text-center">
											<div className="flex gap-1 justify-center">
												<Button
													size="icon"
													variant="ghost"
													onClick={() => onViewProduct(product.id)}
													title="View Details"
													className="h-8 w-8"
												>
													<Eye size={16} />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => onEditProduct(product.id)}
													title="Edit Product"
													className="h-8 w-8"
												>
													<Edit2 size={16} />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => onDeleteProduct(product.id)}
													title="Delete Product"
													className="h-8 w-8 text-destructive hover:text-destructive"
												>
													<Trash2 size={16} />
												</Button>
											</div>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			)}

			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<div>
					Showing {products.length} product{products.length !== 1 ? 's' : ''}
				</div>
			</div>
		</div>
	)
}

