import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to proceed to checkout.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      console.log('Session:', session ? 'exists' : 'null');
      console.log('Session error:', sessionError);

      if (!session) {
        throw new Error('No active session');
      }

      console.log('Calling Edge Function for user:', user.id);

      // Get the current session to get the access token
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Current session:', sessionData.session ? 'exists' : 'missing');

      if (!sessionData.session) {
        throw new Error('No active session');
      }

      const accessToken = sessionData.session.access_token;
      console.log('Access token:', accessToken ? 'present' : 'missing');

      // Call the Edge Function using Supabase SDK with explicit Authorization header
      const { data, error } = await supabase.functions.invoke('send-checkout-email', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          userId: user.id,
          items: items.map(item => ({
            product: {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
            },
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          totalPrice,
        },
      });

      console.log('Edge Function response:', { data, error });

      if (error) {
        console.error('Edge Function error details:', {
          name: error.name,
          message: error.message,
          context: error.context,
        });

        // Try to get the error response body
        if (error.context && error.context.body) {
          try {
            const errorBody = await error.context.json();
            console.error('Error response body:', errorBody);
          } catch (e) {
            console.error('Could not parse error body:', e);
          }
        }
      }

      if (error) {
        throw error;
      }

      // Success!
      toast({
        title: 'Order Confirmed! 🎉',
        description: 'Thank you for your order! Check your email for confirmation.',
      });

      // Clear the cart
      await clearCart();

      // Redirect to home
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: 'There was an error processing your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="font-serif text-2xl mb-4">Your bag is empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
          <Button asChild>
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-serif text-4xl font-semibold mb-8">Shopping Bag</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div 
                key={`${item.product.id}-${item.size}-${item.color}`}
                className="flex gap-6 pb-6 border-b"
              >
                <div className="w-24 h-32 bg-secondary/50 flex-shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.size} / {item.color}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                        className="p-1 border hover:bg-secondary transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                        className="p-1 border hover:bg-secondary transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="font-medium">${item.product.price * item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-secondary/30 p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
              <Button
                className="w-full mb-3"
                onClick={handleCheckout}
                disabled={!user || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : !user ? (
                  'Sign In to Checkout'
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
              <Button variant="outline" className="w-full" onClick={clearCart} disabled={isProcessing}>
                Clear Bag
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
