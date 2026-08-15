import {
  Clapperboard,
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
import type { ClientUser } from '../../lib/sellerAuth'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setSellerSidebarOpen, toggleSellerSidebarCollapsed } from '../../store/uiSlice'
import { appPaths } from '../../router/paths'
import { ui } from '../../components/ui/styles'

type Section = 'dashboard' | 'products' | 'categories' | 'videos' | 'settings'

const SECTION_PATHS: Record<Section, string> = {
  categories: appPaths.categories,
  dashboard: appPaths.dashboard,
  products: appPaths.products,
  settings: appPaths.settings,
  videos: appPaths.videos,
}

interface SellerDashboardPageProps {
  onLogout: () => void
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
          { label: 'Videos', icon: Clapperboard },
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
  const sectionLabels = { categories: 'Product categories', dashboard: 'Dashboard', products: 'Products', settings: 'Account settings', videos: 'Videos' } as const
  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'S'

  const label = collapsed ? 'lg:hidden' : ''
  const navItem = `relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-muted transition-colors hover:bg-soft hover:text-ink ${collapsed ? 'lg:justify-center lg:px-0' : ''}`
  const navItemActive = "bg-soft font-bold text-ink before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-ink before:content-['']"
  const sidebarAction = `flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-muted transition-colors hover:bg-soft hover:text-ink ${collapsed ? 'lg:justify-center lg:px-0' : ''}`

  function navigate(section: Section) {
    routerNavigate(SECTION_PATHS[section])
  }

  return (
    <div className="min-h-screen bg-canvas text-[15px] text-ink">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-ink/20 lg:hidden"
          onClick={() => dispatch(setSellerSidebarOpen(false))}
          type="button"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-60 -translate-x-full flex-col border-r border-line bg-white shadow-[8px_0_30px_rgb(23_26_31/0.04)] transition-[width,transform] lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : ''} ${collapsed ? 'lg:w-14' : ''}`}>
        <div className="flex h-14 items-center justify-between border-b border-line px-3">
          <Brand compact={collapsed} />
          <button className={`${ui.iconButton} lg:hidden`} onClick={() => dispatch(setSellerSidebarOpen(false))} type="button"><X size={17} /></button>
          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`${ui.iconButton} hidden lg:grid`}
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
              <div className="mb-3" key={group.id}>
                <button
                  aria-expanded={groupOpen}
                  className={`mb-1 flex w-full items-center justify-between px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-faint ${collapsed ? 'lg:mx-auto lg:mb-1.5 lg:h-px lg:w-6 lg:bg-line lg:p-0' : ''}`}
                  onClick={() => setExpandedGroups((current) => ({ ...current, [group.id]: !groupOpen }))}
                  type="button"
                >
                  <span className={label}>{group.label}</span>
                  <ChevronDown className={`${label} transition-transform ${groupOpen ? '' : '-rotate-90'}`} size={13} />
                </button>
                {(groupOpen || collapsed) && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      if ('children' in item && item.children) {
                        return (
                          <div key={item.label}>
                            <button
                              className={navItem}
                              onClick={() => {
                                if (collapsed) dispatch(toggleSellerSidebarCollapsed())
                                setProductOpen((value) => !value)
                              }}
                              type="button"
                            >
                              <Icon size={15} />
                              <span className={`${label} min-w-0 flex-1 truncate text-left`}>{item.label}</span>
                              <ChevronRight className={`${label} transition-transform ${productOpen ? 'rotate-90' : ''}`} size={13} />
                            </button>
                            {productOpen && !collapsed && (
                              <div className="relative ml-[17px] border-l border-line pl-2.5">
                                {item.children.map((child) => {
                                  const ChildIcon = child.icon
                                  const section: Section =
                                    child.label === 'Products'
                                      ? 'products'
                                      : child.label === 'Videos'
                                        ? 'videos'
                                        : 'categories'
                                  return (
                                    <button
                                      className={`${navItem} py-1.5 text-[11px] ${activeSection === section ? navItemActive : ''}`}
                                      key={child.label}
                                      onClick={() => {
                                        navigate(section)
                                        dispatch(setSellerSidebarOpen(false))
                                      }}
                                      type="button"
                                    >
                                      <ChildIcon size={15} />
                                      <span className={`${label} truncate`}>{child.label}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      }
                      const target = item.label === 'Dashboard' ? 'dashboard' : item.label === 'Account settings' ? 'settings' : undefined
                      return (
                        <button
                          className={`${navItem} ${target && activeSection === target ? navItemActive : ''}`}
                          key={item.label}
                          onClick={() => {
                            if (target) navigate(target)
                            dispatch(setSellerSidebarOpen(false))
                          }}
                          type="button"
                        >
                          <Icon size={15} />
                          <span className={`${label} truncate`}>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="border-t border-line p-2">
          <a
            className={sidebarAction}
            href={appPaths.storefront}
            rel="noreferrer"
            target="_blank"
            title={collapsed ? 'Storefront' : undefined}
          >
            <Store size={16} /><span className={label}>View storefront</span>
          </a>
          <button className={sidebarAction} onClick={onLogout} title={collapsed ? 'Sign out' : undefined} type="button">
            <LogOut size={16} /><span className={label}>Sign out</span>
          </button>
        </div>
      </aside>

      <header className={`sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line bg-white/95 px-4 backdrop-blur transition-[margin] lg:px-6 ${collapsed ? 'lg:ml-14' : 'lg:ml-60'}`}>
        <button className={`${ui.iconButton} lg:hidden`} onClick={() => dispatch(setSellerSidebarOpen(true))} type="button"><Menu size={18} /></button>
        <label className="hidden h-8 w-72 items-center gap-2 rounded-md border border-line px-2.5 text-faint lg:flex">
          <Search size={14} />
          <input className="min-w-0 flex-1 border-0 bg-transparent text-xs text-ink outline-none" placeholder="Search" />
          <kbd className="rounded bg-soft px-1 py-0.5 text-[9px]">⌘ K</kbd>
        </label>
        <div className="ml-auto flex items-center gap-1.5">
          <Link aria-label="Account settings" className={ui.iconButton} to={appPaths.settings}><Settings size={16} /></Link>
          <button className="flex items-center gap-2 rounded-full border border-line bg-white px-1.5 py-1 transition-colors hover:bg-soft" type="button">
            <span className="grid size-7 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">{initials}</span>
            <span className="hidden text-left sm:block">
              <strong className="block max-w-32 truncate text-[11px] text-ink">{user.name || 'SOVA seller'}</strong>
              <small className="block max-w-32 truncate text-[9px] text-muted">{user.email}</small>
            </span>
            <ChevronDown className="text-faint" size={13} />
          </button>
        </div>
      </header>

      <main className={`transition-[margin] ${collapsed ? 'lg:ml-14' : 'lg:ml-60'}`}>
        <header className="border-b border-line bg-white px-4 py-3 lg:px-5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[10px] text-faint [&_[aria-current]]:font-medium [&_[aria-current]]:text-muted [&_a:hover]:text-ink">
            <Link aria-label="Dashboard" to={appPaths.dashboard}><Home size={12} /></Link>
            {activeSection === 'dashboard' || activeSection === 'settings' ? (
              <><ChevronRight size={11} /><span aria-current="page">{sectionLabels[activeSection]}</span></>
            ) : (
              <>
                <ChevronRight size={11} />
                <span>Product management</span>
                <ChevronRight size={11} />
                {/* On a record page the section stays a link, which is what
                    replaces the per-page back button. */}
                {location.pathname === SECTION_PATHS[activeSection] ? (
                  <span aria-current="page">{sectionLabels[activeSection]}</span>
                ) : (
                  <>
                    <Link to={SECTION_PATHS[activeSection]}>{sectionLabels[activeSection]}</Link>
                    <ChevronRight size={11} />
                    <span aria-current="page">Details</span>
                  </>
                )}
              </>
            )}
          </nav>
        </header>
        <Outlet />
      </main>
    </div>
  )
}

function sectionFromPath(pathname: string): Section {
  if (pathname.startsWith(appPaths.categories)) return 'categories'
  if (pathname.startsWith(appPaths.videos)) return 'videos'
  if (pathname.startsWith(appPaths.products)) return 'products'
  if (pathname.startsWith(appPaths.settings)) return 'settings'
  return 'dashboard'
}
