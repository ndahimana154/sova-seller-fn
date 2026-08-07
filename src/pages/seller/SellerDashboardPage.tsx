import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Brand } from '../../components/ui/Brand'
import type { ClientUser } from '../../lib/clientAuth'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSellerSidebarOpen, toggleSellerSidebarCollapsed } from '../../store/uiSlice'
import { appPaths } from '../../router/paths'

interface SellerDashboardPageProps {
  onLogout: () => void
  onStorefrontOpen: () => void
  user: ClientUser
}

const groups = [
  {
    id: 'general',
    label: 'General',
    items: [{ label: 'Dashboard', icon: LayoutDashboard, active: true }],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      {
        label: 'Product management',
        icon: PackageSearch,
        children: [
          { label: 'Products', icon: ShoppingBag },
          { label: 'Product categories', icon: Tags },
        ],
      },
      { label: 'Orders', icon: ClipboardList },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { label: 'Shop profile', icon: Store },
      { label: 'Account settings', icon: Settings },
    ],
  },
]

export function SellerDashboardPage({
  onLogout,
  onStorefrontOpen,
  user,
}: SellerDashboardPageProps) {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const routerNavigate = useNavigate()
  const collapsed = useAppSelector((state) => state.ui.sellerSidebarCollapsed)
  const mobileOpen = useAppSelector((state) => state.ui.sellerSidebarOpen)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    general: true,
    settings: true,
    workspace: true,
  })
  const [productOpen, setProductOpen] = useState(true)
  const activeSection = sectionFromPath(location.pathname)
  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'S'

  function navigate(section: 'dashboard' | 'products' | 'categories') {
    const path = section === 'dashboard'
      ? appPaths.dashboard
      : section === 'products'
        ? appPaths.products
        : appPaths.categories
    routerNavigate(path)
  }

  return (
    <div className="seller-workspace">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-[#241f1a]/20 lg:hidden"
          onClick={() => dispatch(setSellerSidebarOpen(false))}
          type="button"
        />
      )}

      <aside className={`seller-sidebar ${mobileOpen ? 'translate-x-0' : ''} ${collapsed ? 'seller-sidebar-collapsed' : ''}`}>
        <div className="flex h-14 items-center justify-between border-b border-[#eee7de] px-3">
          <Brand compact={collapsed} />
          <button className="seller-icon-button lg:hidden" onClick={() => dispatch(setSellerSidebarOpen(false))} type="button"><X size={17} /></button>
          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="seller-icon-button hidden lg:grid"
            onClick={() => dispatch(toggleSellerSidebarCollapsed())}
            type="button"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav aria-label="Seller navigation" className="flex-1 overflow-y-auto px-2 py-3">
          {groups.map((group) => {
            const groupOpen = expandedGroups[group.id]
            return (
              <div className="seller-nav-group" key={group.id}>
                <button
                  aria-expanded={groupOpen}
                  className="seller-nav-group-trigger"
                  onClick={() => setExpandedGroups((current) => ({ ...current, [group.id]: !groupOpen }))}
                  type="button"
                >
                  <span className="seller-sidebar-label">{group.label}</span>
                  <ChevronDown className={`seller-sidebar-label transition-transform ${groupOpen ? '' : '-rotate-90'}`} size={13} />
                </button>
                {(groupOpen || collapsed) && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      if ('children' in item && item.children) {
                        return (
                          <div key={item.label}>
                            <button
                              className="seller-nav-item"
                              onClick={() => {
                                if (collapsed) dispatch(toggleSellerSidebarCollapsed())
                                setProductOpen((value) => !value)
                              }}
                              type="button"
                            >
                              <Icon size={15} />
                              <span className="seller-sidebar-label min-w-0 flex-1 truncate text-left">{item.label}</span>
                              <ChevronRight className={`seller-sidebar-label transition-transform ${productOpen ? 'rotate-90' : ''}`} size={13} />
                            </button>
                            {productOpen && !collapsed && (
                              <div className="seller-nav-children">
                                {item.children.map((child) => {
                                  const ChildIcon = child.icon
                                  const section = child.label === 'Products' ? 'products' : 'categories'
                                  return (
                                    <button
                                      className={`seller-nav-item ${activeSection === section ? 'seller-nav-item-active' : ''}`}
                                      key={child.label}
                                      onClick={() => {
                                        navigate(section)
                                        dispatch(setSellerSidebarOpen(false))
                                      }}
                                      type="button"
                                    >
                                      <ChildIcon size={15} />
                                      <span className="seller-sidebar-label truncate">{child.label}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      }
                      return (
                        <button
                          className={`seller-nav-item ${item.label === 'Dashboard' && activeSection === 'dashboard' ? 'seller-nav-item-active' : ''}`}
                          key={item.label}
                          onClick={() => {
                            if (item.label === 'Dashboard') navigate('dashboard')
                            dispatch(setSellerSidebarOpen(false))
                          }}
                          type="button"
                        >
                          <Icon size={15} />
                          <span className="seller-sidebar-label truncate">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="border-t border-[#eee7de] p-2">
          <button className="seller-signout" onClick={onStorefrontOpen} title={collapsed ? 'Storefront' : undefined} type="button">
            <Store size={16} /><span className="seller-sidebar-label">View storefront</span>
          </button>
          <button className="seller-signout" onClick={onLogout} title={collapsed ? 'Sign out' : undefined} type="button">
            <LogOut size={16} /><span className="seller-sidebar-label">Sign out</span>
          </button>
        </div>
      </aside>

      <header className={`seller-topbar ${collapsed ? 'seller-topbar-collapsed' : ''}`}>
        <button className="seller-icon-button lg:hidden" onClick={() => dispatch(setSellerSidebarOpen(true))} type="button"><Menu size={18} /></button>
        <label className="hidden h-8 w-72 items-center gap-2 rounded-md border border-[#eee7de] px-2.5 text-[#a69c92] lg:flex">
          <Search size={14} />
          <input className="min-w-0 flex-1 border-0 bg-transparent text-xs text-[#241f1a] outline-none" placeholder="Search" />
          <kbd className="rounded bg-[#fffaf3] px-1 py-0.5 text-[9px]">⌘ K</kbd>
        </label>
        <div className="ml-auto flex items-center gap-1.5">
          <button className="seller-icon-button" aria-label="Settings" type="button"><Settings size={16} /></button>
          <button className="seller-user-menu" type="button">
            <span className="grid size-7 place-items-center rounded-full bg-[#fff6e8] text-[10px] font-bold text-[#c96f00]">{initials}</span>
            <span className="hidden text-left sm:block">
              <strong className="block max-w-32 truncate text-[11px] text-[#241f1a]">{user.name || 'SOVA seller'}</strong>
              <small className="block max-w-32 truncate text-[9px] text-[#6f665d]">{user.email}</small>
            </span>
            <ChevronDown className="text-[#a69c92]" size={13} />
          </button>
        </div>
      </header>

      <main className={`seller-content ${collapsed ? 'seller-content-collapsed' : ''}`}>
        <header className="border-b border-[#eee7de] bg-white px-4 py-3 lg:px-5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[10px] text-[#a69c92]">
            <Link aria-label="Dashboard" className="transition-colors hover:text-[#c96f00]" to={appPaths.dashboard}><Home size={12} /></Link>
            {activeSection === 'dashboard' ? (
              <><ChevronRight size={11} /><span aria-current="page" className="font-medium text-[#6f665d]">Dashboard</span></>
            ) : (
              <>
                <ChevronRight size={11} />
                <Link className="transition-colors hover:text-[#c96f00]" to={appPaths.products}>Product management</Link>
                <ChevronRight size={11} />
                <span aria-current="page" className="font-medium text-[#6f665d]">{activeSection === 'products' ? 'Products' : 'Product categories'}</span>
              </>
            )}
          </nav>
        </header>
        <Outlet />
      </main>
    </div>
  )
}

function sectionFromPath(pathname: string): 'dashboard' | 'products' | 'categories' {
  if (pathname.startsWith('/seller/dashboard/product-categories')) return 'categories'
  if (pathname.startsWith('/seller/dashboard/products')) return 'products'
  return 'dashboard'
}
