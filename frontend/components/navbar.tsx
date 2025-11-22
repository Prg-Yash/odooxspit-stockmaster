

"use client";

import Link from "next/link";
import { useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';



const navMenu: IMenu[] = [
  {
    id: 1,
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    id: 2,
    title: "Operations",
    url: "#",
    dropdown: true,
    items: [
      { id: 21, title: "Moves", url: "/dashboard/moves" },
      { id: 22, title: "Receipts", url: "/dashboard/receipts" },
    ],
  },
  {
    id: 3,
    title: "Stock",
    url: "#",
    dropdown: true,
    items: [
      { id: 31, title: "Products", url: "/dashboard/products" },
      { id: 32, title: "Inventory", url: "/dashboard/inventory" },
      { id: 33, title: "Warehouses", url: "/dashboard/warehouse" },
      { id: 34, title: "Locations", url: "/dashboard/warehouse-locations" },
      { id: 35, title: "Vendors", url: "/dashboard/vendors" },
    ],
  },
  {
    id: 4,
    title: "Move History",
    url: "/dashboard/move-history",
  },
  {
    id: 5,
    title: "Settings",
    url: "#",
    dropdown: true,
    items: [
      { id: 51, title: "Account", url: "/dashboard/account" },
      { id: 52, title: "Settings", url: "/dashboard/settings" },
    ],
  },
];


export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-xl font-bold mr-6">StockMaster</Link>
        <Menu list={navMenu} />
      </div>
    </nav>
  );
}



export type IMenu = {
  id: number;
  title: string;
  url: string;
  dropdown?: boolean;
  items?: IMenu[];
};

type MenuProps = {
  list: IMenu[];
};

const Menu = ({ list }: MenuProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <MotionConfig transition={{ bounce: 0, type: 'tween' }}>
      <nav className={'relative'}>
        <ul className={'flex items-center'}>
          {list?.map((item) => {
            return (
              <li key={item.id} className={'relative'}>
                <Link
                  className={`
                    relative flex items-center justify-center rounded px-8 py-3 transition-all
                    hover:bg-foreground/10
                    ${hovered === item?.id ? 'bg-foreground/10' : ''}
                  `}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  href={item?.url}
                >
                  {item?.title}
                </Link>
                {hovered === item?.id && !item?.dropdown && (
                  <motion.div
                    layout
                    layoutId={`cursor`}
                    className={'absolute h-0.5 w-full bg-foreground'}
                  />
                )}
                {item?.dropdown && hovered === item?.id && (
                  <div
                    className='absolute left-0 top-full z-50'
                    onMouseEnter={() => setHovered(item.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div
                      className='mt-4 flex w-64 flex-col rounded bg-popover text-popover-foreground border border-border shadow-lg'
                      style={{ borderRadius: '8px' }}
                    >
                      {item?.items?.map((nav) => (
                        <Link
                          key={`link-${nav?.id}`}
                          href={nav?.url}
                          className={'w-full'}
                          passHref
                        >
                          <div className={'p-4 rounded transition-colors hover:bg-background hover:text-accent-foreground'}>
                            {nav?.title}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </MotionConfig>
  );
};

export default Menu;
