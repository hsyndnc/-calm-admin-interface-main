import { LayoutDashboard, Package, Users, ShoppingCart, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "User"] },
  { title: "Products", url: "/dashboard/products", icon: Package, roles: ["Admin", "User"] },
  { title: "Customers", url: "/dashboard/customers", icon: Users, roles: ["Admin"] },
  { title: "Orders", url: "/dashboard/orders", icon: ShoppingCart, roles: ["Admin"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
const navigate = useNavigate();
  const { logout, user } = useAuth();
  const userRoles = user?.roles || ["User"];
  const filteredNavItems = navItems.filter((item) => item.roles.some((r) => userRoles.includes(r)));

  return (
    <Sidebar collapsible="icon">
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border shrink-0">
        {!collapsed && (
          <span className="text-lg font-semibold text-foreground tracking-tight">
            AdminPanel
          </span>
        )}
        {collapsed && (
          <span className="text-lg font-bold text-primary mx-auto">A</span>
        )}
      </div>

      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="w-5 h-5 mr-3 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => { logout(); navigate("/"); }}
              className="hover:bg-sidebar-accent hover:text-destructive rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3 shrink-0" />
              {!collapsed && <span>Log Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
