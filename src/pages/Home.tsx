import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/contexts/ProductContext';

export default function Home() {
  const { products } = useProducts();
  const featuredProducts = products.slice(0, 4);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  console.log(SUPABASE_URL)
  console.log(SUPABASE_PUBLISHABLE_KEY)
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-background/40" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-xl">
            <h1 className="font-serif text-5xl md:text-7xl font-semibold leading-tight mb-6">
              The New
              <br />
              Collection
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Timeless pieces crafted with intention. Discover our curated selection of modern essentials.
            </p>
            <Button asChild size="lg" className="group">
              <Link to="/products">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-2">Featured</h2>
            <p className="text-muted-foreground">Our most coveted pieces this season</p>
          </div>
          <Link 
            to="/products" 
            className="text-sm font-medium tracking-wide hover:underline underline-offset-4 hidden md:block"
          >
            VIEW ALL
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline">
            <Link to="/products">View All Products</Link>
          </Button>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-secondary/30 py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"
                alt="Our Story"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold">Our Philosophy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We believe in quality over quantity. Each piece in our collection is thoughtfully designed 
                to transcend seasons and trends, becoming a lasting part of your wardrobe.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From the finest natural fabrics to meticulous construction, we partner with artisans 
                who share our commitment to excellence and sustainability.
              </p>
              <Button variant="outline" className="mt-4">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
