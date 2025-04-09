
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu,
  X,
  LogOut,
  Package,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would navigate to search results
    console.log('Searching for:', searchQuery);
  };

  const renderAuthLinks = () => {
    if (isAuthenticated) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="capitalize">{user?.name}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{user?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            {user?.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link to="/admin/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
            )}
            
            {user?.role === 'seller' && (
              <DropdownMenuItem asChild>
                <Link to="/seller/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Seller Dashboard
                </Link>
              </DropdownMenuItem>
            )}
            
            {user?.role === 'buyer' && (
              <DropdownMenuItem asChild>
                <Link to="/profile/orders" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  My Orders
                </Link>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem 
              onClick={logout}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link to="/login">
          <Button variant="ghost" size="sm">Login</Button>
        </Link>
        <Link to="/register">
          <Button variant="default" size="sm">Register</Button>
        </Link>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-heading text-2xl font-bold text-brand-primary">Kichu Lagbe</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <form onSubmit={handleSearch} className="relative w-64">
              <Input
                type="text"
                placeholder="Search products..."
                className="pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <nav className="ml-6">
              <ul className="flex items-center gap-6">
                <li>
                  <Link to="/" className="text-foreground hover:text-brand-primary">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-foreground hover:text-brand-primary">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="text-foreground hover:text-brand-primary">
                    Categories
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right section with cart and profile */}
          <div className="flex items-center gap-4">
            <Link to="/cart">
              <Button variant="ghost" className="relative" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cart.totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent text-xs font-bold text-black">
                    {cart.totalItems}
                  </span>
                )}
              </Button>
            </Link>

            <div className="hidden md:block">
              {renderAuthLinks()}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "fixed inset-x-0 top-16 z-50 h-[calc(100vh-4rem)] bg-background md:hidden transform transition-transform duration-300",
            isMenuOpen ? "translate-y-0" : "-translate-y-full"
          )}
        >
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={handleSearch} className="relative mb-6">
              <Input
                type="text"
                placeholder="Search products..."
                className="pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <nav className="space-y-6">
              <ul className="space-y-4">
                <li>
                  <Link 
                    to="/" 
                    className="block py-2 text-lg font-medium"
                    onClick={toggleMenu}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/products" 
                    className="block py-2 text-lg font-medium"
                    onClick={toggleMenu}
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/categories" 
                    className="block py-2 text-lg font-medium"
                    onClick={toggleMenu}
                  >
                    Categories
                  </Link>
                </li>
              </ul>

              {!isAuthenticated ? (
                <div className="flex flex-col gap-2 pt-4">
                  <Link to="/login" onClick={toggleMenu}>
                    <Button variant="outline" className="w-full" size="lg">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={toggleMenu}>
                    <Button variant="default" className="w-full" size="lg">
                      Register
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="border-t border-border pt-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-primary text-white flex items-center justify-center">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-2">
                    {user?.role === 'admin' && (
                      <li>
                        <Link 
                          to="/admin/dashboard" 
                          className="flex items-center gap-2 py-2"
                          onClick={toggleMenu}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </li>
                    )}
                    
                    {user?.role === 'seller' && (
                      <li>
                        <Link 
                          to="/seller/dashboard" 
                          className="flex items-center gap-2 py-2"
                          onClick={toggleMenu}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Seller Dashboard
                        </Link>
                      </li>
                    )}
                    
                    {user?.role === 'buyer' && (
                      <li>
                        <Link 
                          to="/profile/orders" 
                          className="flex items-center gap-2 py-2"
                          onClick={toggleMenu}
                        >
                          <Package className="h-4 w-4" />
                          My Orders
                        </Link>
                      </li>
                    )}
                    
                    <li>
                      <button
                        onClick={() => {
                          logout();
                          toggleMenu();
                        }}
                        className="flex items-center gap-2 py-2 text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
