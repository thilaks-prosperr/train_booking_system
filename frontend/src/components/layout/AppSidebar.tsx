import React from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Train, BarChart3, Radio } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  {
    title: 'Add Station',
    url: '/admin/stations',
    icon: MapPin,
    description: 'Manage railway stations',
  },
  {
    title: 'Add Train',
    url: '/admin/trains',
    icon: Train,
    description: 'Configure trains & schedules',
  },
  {
    title: 'Stats & Bookings',
    url: '/admin/stats',
    icon: BarChart3,
    description: 'Analytics & booking management',
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar
      className="border-r border-border/10 bg-sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-border/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0 glow-primary shadow-lg ring-1 ring-white/10">
            <Train className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-xl gradient-text tracking-tight">RailBook</span>
              <span className="text-xs text-muted-foreground font-medium">Admin Portal</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 gap-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-2 px-4 py-2">
            {!isCollapsed && 'MANAGEMENT'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/');
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-auto py-1"
                    >
                      <NavLink
                        to={item.url}
                        className={`
                          group flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 relative overflow-hidden
                          ${isActive
                            ? 'bg-primary/15 text-primary'
                            : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                          }
                        `}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}

                        <div className={`p-1.5 rounded-md transition-colors ${isActive ? 'bg-primary/20' : 'bg-transparent group-hover:bg-white/10'}`}>
                          <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        </div>

                        {!isCollapsed && (
                          <div className="flex flex-col">
                            <span className={`font-medium text-sm ${isActive ? 'text-foreground' : ''}`}>{item.title}</span>
                            <span className="text-[11px] text-muted-foreground/70 line-clamp-1">{item.description}</span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/10">
        {!isCollapsed && (
          <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-950 border border-white/5 p-4 text-center shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1 relative z-10">
              System Version
            </p>
            <div className="flex items-center justify-center gap-2 relative z-10">
              <Radio className="w-3 h-3 text-green-500 animate-pulse" />
              <p className="text-xs text-foreground font-semibold">v1.0.0 Online</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
