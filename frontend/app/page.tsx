import { redirect } from "next/navigation";

export default function Home() {
  return <div>home page</div>;
}


export function HeroImage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="w-full bg-black rounded-2xl overflow-hidden">
        <img
          src="/hero.png"
          alt="Hero Image"
          className="w-full h-auto rounded-2xl"
        />
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="w-full my-4 mt-16 bg-card border-t border-card py-4 rounded-xl mt-2 flex flex-col items-center">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl px-4">
        <span className="text-white font-bold tracking-tight text-lg mb-2 md:mb-0">StockMaker</span>
        <div className="flex gap-4">
          <Link href="/dashboard" className="text-white/80 hover:text-white transition-colors text-sm">Dashboard</Link>
          <Link href="/login" className="text-white/80 hover:text-white transition-colors text-sm">Login</Link>
          <Link href="/register" className="text-white/80 hover:text-white transition-colors text-sm">Register</Link>
        </div>
        <span className="text-xs text-white/40 mt-2 md:mt-0">&copy; {new Date().getFullYear()} StockMaker. All rights reserved.</span>
      </div>
    </footer>
  )
}

export function Features() {
  return (
    <section className="bg-zinc-50 pt-16 md:pt-32 dark:bg-transparent">
      <div className="mx-auto max-w-[] lg:max-w-[1400px]">
        <div className="mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Inventory Managers & Warehouse Staff */}
          <FeatureCard>
            <CardHeader>
              <h3 className="text-lg font-bold">Inventory Managers</h3>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 text-muted-foreground text-sm">
                <li>Manage incoming & outgoing stock</li>
                <li>Monitor KPIs & dashboard</li>
                <li>Set reordering rules</li>
              </ul>
            </CardContent>
          </FeatureCard>
          <FeatureCard>
            <CardHeader>
              <h3 className="text-lg font-bold">Warehouse Staff</h3>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 text-muted-foreground text-sm">
                <li>Transfers, picking, shelving, counting</li>
                <li>Stock adjustments & internal moves</li>
              </ul>
            </CardContent>
          </FeatureCard>
          {/* Authentication & Access */}
          <FeatureCard>
            <CardHeader>
              <h3 className="text-lg font-bold">Authentication</h3>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 text-muted-foreground text-sm">
                <li>Sign up / Log in</li>
                <li>OTP-based password reset</li>
                <li>Redirect to Inventory Dashboard</li>
              </ul>
            </CardContent>
          </FeatureCard>
          {/* Dashboard KPIs */}
          <FeatureCard>
            <CardHeader>
              <h3 className="text-lg font-bold">Dashboard KPIs</h3>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 text-muted-foreground text-sm">
                <li>Total Products in Stock</li>
                <li>Low/Out of Stock Items</li>
                <li>Pending Receipts & Deliveries</li>
                <li>Internal Transfers Scheduled</li>
              </ul>
            </CardContent>
          </FeatureCard>
          {/* Dynamic Filters */}
          <FeatureCard>
            <CardHeader>
              <h3 className="text-lg font-bold">Dynamic Filters</h3>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 text-muted-foreground text-sm">
                <li>By document type: Receipts, Delivery, Internal, Adjustments</li>
                <li>By status: Draft, Waiting, Ready, Done, Canceled</li>
                <li>By warehouse/location or product category</li>
              </ul>
            </CardContent>
          </FeatureCard>
          {/* Core Features */}
          <FeatureCard>
            <CardHeader>
              <h3 className="text-lg font-bold">Core Features</h3>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 text-muted-foreground text-sm">
                <li>Create/update products (SKU, category, UOM, etc.)</li>
                <li>Stock availability per location</li>
                <li>Product categories & reordering rules</li>
                <li>Receipts (incoming), Deliveries (outgoing)</li>
                <li>Internal transfers & stock adjustments</li>
                <li>Move history & audit log</li>
              </ul>
            </CardContent>
          </FeatureCard>
          {/* Example Inventory Flow */}
          <FeatureCard className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <h3 className="text-lg font-bold text-center">Inventory Flow Example</h3>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-6 text-muted-foreground text-sm space-y-1">
                <li>Receive goods from vendor (e.g., +100kg steel)</li>
                <li>Internal transfer: Main Store → Production Rack</li>
                <li>Deliver finished goods (e.g., -20kg steel)</li>
                <li>Adjust damaged items (e.g., -3kg steel)</li>
                <li>All actions logged in Stock Ledger</li>
              </ol>
            </CardContent>
          </FeatureCard>
        </div>
      </div>
    </section>
  )
}

interface FeatureCardProps {
  children: ReactNode
  className?: string
}

const FeatureCard = ({ children, className }: FeatureCardProps) => (
  <Card className={cn('group relative rounded-none shadow-zinc-950/5', className)}>
    <CardDecorator />
    {children}
  </Card>
)

const CardDecorator = () => (
  <>
    <span className="border-primary absolute -left-px -top-px block size-2 border-l-2 border-t-2"></span>
    <span className="border-primary absolute -right-px -top-px block size-2 border-r-2 border-t-2"></span>
    <span className="border-primary absolute -bottom-px -left-px block size-2 border-b-2 border-l-2"></span>
    <span className="border-primary absolute -bottom-px -right-px block size-2 border-b-2 border-r-2"></span>
  </>
)

interface CardHeadingProps {
  icon: LucideIcon
  title: string
  description: string
}

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
  <div className="p-6">
    <span className="text-muted-foreground flex items-center gap-2">
      <Icon className="size-4" />
      {title}
    </span>
    <p className="mt-8 text-2xl font-semibold">{description}</p>
  </div>
)

interface DualModeImageProps {
  darkSrc: string
  lightSrc: string
  alt: string
  width: number
  height: number
  className?: string
}

const DualModeImage = ({ darkSrc, lightSrc, alt, width, height, className }: DualModeImageProps) => (
  <>
    <img
      src={darkSrc}
      className={cn('hidden dark:block', className)}
      alt={`${alt} dark`}
      width={width}
      height={height}
    />
    <img
      src={lightSrc}
      className={cn('shadow dark:hidden', className)}
      alt={`${alt} light`}
      width={width}
      height={height}
    />
  </>
)

interface CircleConfig {
  pattern: 'none' | 'border' | 'primary' | 'blue'
}

interface CircularUIProps {
  label: string
  circles: CircleConfig[]
  className?: string
}

const CircularUI = ({ label, circles, className }: CircularUIProps) => (
  <div className={className}>
    <div className="bg-gradient-to-b from-border size-fit rounded-2xl to-transparent p-px">
      <div className="bg-gradient-to-b from-background to-muted/25 relative flex aspect-square w-fit items-center -space-x-4 rounded-[15px] p-4">
        {circles.map((circle, i) => (
          <div
            key={i}
            className={cn('size-7 rounded-full border sm:size-8', {
              'border-primary': circle.pattern === 'none',
              'border-primary bg-[repeating-linear-gradient(-45deg,hsl(var(--border)),hsl(var(--border))_1px,transparent_1px,transparent_4px)]': circle.pattern === 'border',
              'border-primary bg-background bg-[repeating-linear-gradient(-45deg,hsl(var(--primary)),hsl(var(--primary))_1px,transparent_1px,transparent_4px)]': circle.pattern === 'primary',
              'bg-background z-1 border-blue-500 bg-[repeating-linear-gradient(-45deg,theme(colors.blue.500),theme(colors.blue.500)_1px,transparent_1px,transparent_4px)]': circle.pattern === 'blue',
            })}></div>
        ))}
      </div>
    </div>
    <span className="text-muted-foreground mt-1.5 block text-center text-sm">{label}</span>
  </div>
)
