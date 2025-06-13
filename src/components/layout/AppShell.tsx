"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  Pill,
  FileText,
  BarChart3,
  MapPin,
  User,
  LogOut,
  Settings,
  Activity,
  QrCode,
  type LucideIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageToggle } from "@/components/language/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import React, { useState, useEffect } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { NotificationPopover } from "@/components/ui/NotificationPopover";

interface NavItemConfig {
  href: string;
  labelKey: import('@/locales/translations').TranslationKey | 'monitor' | 'healthQrCode';
  icon: LucideIcon;
}

const navItemConfigs: NavItemConfig[] = [
  { href: '/', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/visits', labelKey: 'appointments', icon: CalendarDays },
  { href: '/reminders', labelKey: 'medicationReminder', icon: Pill },
  { href: '/documents', labelKey: 'medicalDocuments', icon: FileText },
  { href: '/monitoring', labelKey: 'monitor' as any, icon: Activity },
  { href: '/analytics', labelKey: 'analytics', icon: BarChart3 },
  { href: '/nearby-facility', labelKey: 'nearbyFacility', icon: MapPin },
  { href: '/health-summary-qr', labelKey: 'healthQrCode' as any, icon: QrCode },
  { href: '/profile', labelKey: 'profile', icon: User },
];

interface AppShellProps {
  children: ReactNode;
}

function AppShellContent({ children }: AppShellProps) {
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const { state: sidebarState } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLabel = (labelKey: NavItemConfig['labelKey']) => {
    if (!mounted) {
      if (labelKey === 'monitor') return 'Monitor';
      if (labelKey === 'healthQrCode') return 'Health QR Code';
      return labelKey.toString().charAt(0).toUpperCase() + labelKey.toString().slice(1);
    }
    if (labelKey === 'monitor') return 'Monitor';
    if (labelKey === 'healthQrCode') return t('healthQrCode');
    return t(labelKey as import('@/locales/translations').TranslationKey);
  };

  const userName = mounted ? t('kishan', 'User') : 'User';
  const userFallback = mounted ? t('kishan', 'K').charAt(0).toUpperCase() : 'U';

  // Sample notifications for demonstration
  const [notifications] = useState([
    {
      id: "1",
      message: "New appointment scheduled for tomorrow.",
      read: false,
      timestamp: "2025-06-12 09:00 AM"
    },
    {
      id: "2",
      message: "Lab results uploaded.",
      read: true,
      timestamp: "2025-06-11 04:30 PM"
    },
    {
      id: "3",
      message: "Prescription updated by Dr. Sharma.",
      read: false,
      timestamp: "2025-06-10 01:15 PM"
    }
  ]);

  return (
    <>
      <Sidebar 
        collapsible="icon" 
        className="border-r bg-gradient-to-b from-card to-card/90 backdrop-blur-sm"
      >
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarImage src="https://placehold.co/40x40.png" alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {userFallback}
              </AvatarFallback>
            </Avatar>
            {!sidebarState.collapsed && (
              <div className="flex flex-col">
                <span className="font-medium text-foreground truncate max-w-[160px]">
                  {userName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {mounted ? t('premiumMember') : 'Premium Member'}
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="mt-2">
          <SidebarMenu>
            {navItemConfigs.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              const itemLabel = getLabel(item.labelKey);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={itemLabel}
                    className="w-full justify-start group"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span>{itemLabel}</span>
                      {isActive && (
                        <div className="ml-auto h-1 w-1 rounded-full bg-primary" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-2 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/settings')}
                tooltip={mounted ? t('settings') : 'Settings'}
                className="w-full justify-start group"
              >
                <Link href="/settings">
                  <Settings className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span>{mounted ? t('settings') : 'Settings'}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={mounted ? t('logOut') : 'Log Out'}
                className="w-full justify-start text-destructive hover:bg-destructive/5 hover:text-destructive-foreground group"
              >
                <a 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    alert("Logout action (to be implemented)"); 
                  }}
                  className="focus-visible:ring-0"
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span>{mounted ? t('logOut') : 'Log Out'}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6">
          <SidebarTrigger className="rounded-full p-1.5 hover:bg-accent">
            {sidebarState.collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </SidebarTrigger>
          <div className="flex items-center gap-2 ml-auto">
            <NotificationPopover notifications={notifications} />
            <LanguageToggle variant="ghost" className="rounded-full" />
            <ThemeToggle variant="ghost" className="rounded-full" />
            <div className="h-8 w-px bg-border mx-1" />
            <button className="flex items-center gap-2 rounded-full p-1.5 hover:bg-accent">
              <span className="text-sm font-medium hidden sm:inline-flex">
                {userName}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/32x32.png" alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {userFallback}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto bg-background">
          <div className="max-w-[1800px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background w-full">
        <AppShellContent>{children}</AppShellContent>
      </div>
    </SidebarProvider>
  );
}