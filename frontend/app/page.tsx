
"use client"
import Navbar from "@/components/landing/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Calendar, MapIcon, LucideIcon } from 'lucide-react'
import Link from "next/link"
import { redirect } from "next/navigation"
import { useState, ReactNode } from "react"

export default function Home() {
  const [isBannerVisible, setIsBannerVisible] = useState(true)

  return (
    <>
      <Navbar />
      <div
        className={`min-h-screen bg-background text-white font-geist transition-all duration-300 pt-10 `}
      >
        <div className="max-w-[1450px] mx-auto relative px-6 md:px-8">
          <section className="relative rounded-[16px] rounded-all-devices mt-16 mb-6 md:h-[calc(100vh-144px)] font-geist text-white flex flex-col">
            {/* Gradient Background Image */}
            <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[16px]">
              <div
                className="absolute inset-0 w-full h-full rounded-[16px]"
                style={{
                  background: "linear-gradient(135deg, #22D3EE 0%, #FF5C28 50%, #FF5C9D 100%)",
                }}
              />
              <div
                className="absolute inset-0 w-full h-full rounded-[16px]"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                }}
              />
            </div>

            {/* Content */}
            <div className="relative w-full px-4 sm:px-6 lg:px-8 text-center pt-[38px] sm:pt-[50px] pb-8 md:pt-[70px] md:pb-12 z-10 flex flex-col h-full">
              {/* Mobile Layout (Stack: Text -> Image -> Buttons) */}
              <div className="flex flex-col md:hidden">
                <div className="mb-4">
                  <h1
                    className="font-semibold mb-2 overflow-visible select-text heading-with-selection"
                    style={{
                      fontSize: "clamp(36px, 8vw, 80px)",
                      lineHeight: "1.1",
                      letterSpacing: "-1.5px",
                      fontFamily: 'var(--font-geist-sans), "GeistSans Fallback", sans-serif',
                      color: "#FFFFFF",
                      textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}
                    aria-label="StockMaker"
                  >
                    StockMaker
                  </h1>
                  <p
                    className="mx-auto h-auto select-text mb-3"
                    style={{
                      fontFamily:
                        'GeistMono, ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Monaco, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
                      fontSize: "clamp(14px, 4vw, 22px)",
                      lineHeight: "1.3",
                      fontWeight: "400",
                      letterSpacing: "normal",
                      maxWidth: "2xl",
                      color: "#FFFFFF",
                      backgroundColor: "transparent",
                    }}
                  >
                    Simple stock & inventory management for your business.
                  </p>
                </div>

                {/* Image in the middle for mobile */}
                <div className="flex items-center justify-center mb-6">
                  <div className="w-full">
                    <HeroImage />
                  </div>
                </div>

                {/* Buttons at the bottom for mobile */}
                <div>
                  <div className="flex flex-col gap-3 sm:gap-4 mb-4">
                    <Link
                      href="/register"
                      className="bg-white hover:bg-gray-100 flex items-center justify-center px-4 sm:px-6 w-full rounded-lg shadow-lg font-mono text-xs sm:text-sm md:text-base font-semibold tracking-wider text-background h-[50px] sm:h-[60px] transition-colors"
                    >
                      Get Started Free
                    </Link>
                    <a
                      href="#features"
                      className="bg-background hover:bg-background/80 flex items-center justify-center px-4 sm:px-6 w-full rounded-lg shadow-lg font-mono text-xs sm:text-sm md:text-base font-semibold tracking-wider text-white h-[50px] sm:h-[60px] border border-white/10"
                    >
                      {/* <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg> */}
                      See Features
                    </a>
                  </div>
                </div>
              </div>

              {/* Desktop Layout (Original) */}
              <div className="hidden md:flex md:flex-col md:flex-grow">
                <h1
                  className="font-semibold mb-2 whitespace-nowrap overflow-visible select-text heading-with-selection"
                  style={{
                    fontSize: "clamp(36px, 8vw, 80px)",
                    lineHeight: "1.1",
                    letterSpacing: "-1.5px",
                    fontFamily: 'var(--font-geist-sans), "GeistSans Fallback", sans-serif',
                    color: "#FFFFFF",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                  aria-label="StockMaker"
                >
                  StockMaker
                </h1>
                <p
                  className="mb-6 sm:mb-8 mx-auto h-auto select-text"
                  style={{
                    fontFamily:
                      'GeistMono, ui-monospace, SFMono-Regular, "Roboto Mono", Menlo, Monaco, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
                    fontSize: "clamp(16px, 4vw, 22px)",
                    lineHeight: "1.3",
                    fontWeight: "400",
                    letterSpacing: "normal",
                    maxWidth: "2xl",
                    color: "#FFFFFF",
                    backgroundColor: "transparent",
                  }}
                >
                  Simple stock & inventory management for your business.
                </p>
                <div className="flex flex-row justify-center gap-3 md:gap-4 mb-8">
                  <Link
                    href="/register"
                    className="bg-white hover:bg-gray-100 flex items-center justify-center px-4 md:px-6 lg:px-8 rounded-lg shadow-lg font-mono text-sm md:text-base font-semibold tracking-wider text-background h-[50px] md:h-[60px] min-w-[180px] md:min-w-[220px] transition-colors"
                  >
                    Get Started Free
                  </Link>
                  <a
                    href="#features"
                    className="bg-background hover:bg-background/80 flex items-center justify-center px-4 md:px-6 lg:px-8 rounded-lg shadow-lg font-mono text-sm md:text-base font-semibold tracking-wider text-white h-[50px] md:h-[60px] min-w-[180px] md:min-w-[220px] border border-white/10"
                  >
                    {/* <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg> */}
                    See Features
                  </a>
                </div>
                <div className="relative w-full flex-grow flex items-center justify-center rounded-md overflow-hidden">
                  <div className="w-full sm:w-[85%] md:max-w-[1200px] mx-auto">
                    <HeroImage />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Features />

          <section >
            <Footer />
          </section>
        </div>
      </div>
    </>
  )
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
