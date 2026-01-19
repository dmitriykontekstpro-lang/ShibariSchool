import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, CheckCircle, Loader2, AlertCircle, Mail } from 'lucide-react';
import { CartItem, UserProfile, Order, OrderItem } from '../types';
import { supabase } from '../supabaseClient';
import emailjs from '@emailjs/browser';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  userProfile: UserProfile | null;
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemove: (productId: number) => void;
  onClear: () => void;
  t?: any;
  getData?: any;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, onClose, cart, userProfile, onUpdateQuantity, onRemove, onClear, t, getData 
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState('');

  const _getData = getData || ((i: any, f: string) => i[f]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);

  const handleCheckout = async () => {
    // If not logged in, Email is required
    if (!userProfile && !guestEmail) {
        setError(t ? "Please enter email" : "Введите email");
        return;
    }

    if (!userProfile && guestEmail && !guestEmail.includes('@')) {
        setError("Invalid email");
        return;
    }

    setIsSending(true);
    setError(null);

    try {
        if (!supabase) throw new Error("No database connection");

        let userData = null;
        
        // If user is logged in, fetch their current data to update it
        if (userProfile) {
            const { data, error: fetchError } = await supabase
                .from('user_shibari')
                .select('orders_history, rope_purchases_count, total_revenue_usd, ordered_courses_list')
                .eq('id', userProfile.id)
                .single();
            if (!fetchError) userData = data;
        }

        const orderId = `ORD-${Date.now().toString().slice(-6)}`;
        const orderDate = new Date().toISOString();

        const orderItems: OrderItem[] = cart.map(item => ({
            productId: item.product.id,
            title: item.product.title,
            quantity: item.quantity,
            price: item.product.price || 0
        }));

        const newOrder: Order = {
            id: orderId,
            date: orderDate,
            total_amount: totalAmount,
            status: 'new',
            items: orderItems,
            customer_details: {
                name: userProfile?.full_name || 'Guest',
                email: userProfile?.email || guestEmail
            }
        };

        // If user exists, update CRM
        if (userProfile && userData) {
            const currentHistory = userData.orders_history || [];
            const historyArray = Array.isArray(currentHistory) ? currentHistory : [];
            const updatedHistory = [newOrder, ...historyArray];
            const updatedCount = (userData.rope_purchases_count || 0) + 1;
            const updatedRevenue = (userData.total_revenue_usd || 0) + totalAmount;

            // Check for Courses in Cart
            const courseItems = cart.filter(item => item.product.color === 'Video Course' || item.product.is_course);
            let hasOrderedCourse = courseItems.length > 0;
            
            // Update List of ordered courses
            let courseList = userData.ordered_courses_list || [];
            courseItems.forEach(c => {
                if (!courseList.includes(c.product.title)) {
                    courseList.push(c.product.title);
                }
            });

            const updatePayload: any = {
                orders_history: updatedHistory,
                rope_purchases_count: updatedCount,
                total_revenue_usd: updatedRevenue,
                ordered_courses_list: courseList
            };

            if (hasOrderedCourse) {
                updatePayload.has_ordered_course = true;
            }

            const { error: updateError } = await supabase
                .from('user_shibari')
                .update(updatePayload)
                .eq('id', userProfile.id);

            if (updateError) throw updateError;
        } 
        
        // --- SEND EMAIL VIA EMAILJS (DYNAMIC CONFIG) ---
        try {
            // Fetch configuration from DB first
            const { data: settings } = await supabase.from('app_settings').select('*').single();
            
            const serviceId = settings?.emailjs_service_id;
            const templateId = settings?.emailjs_template_id;
            const publicKey = settings?.emailjs_public_key;

            if (serviceId && templateId && publicKey) {
                const emailParams = {
                    to_email: userProfile?.email || guestEmail,
                    to_name: userProfile?.full_name || 'Guest',
                    order_id: orderId,
                    order_summary: cart.map(item => `${item.product.title} (x${item.quantity}) - $${(item.product.price || 0) * item.quantity}`).join('\n'),
                    total_amount: totalAmount,
                    order_date: new Date().toLocaleDateString()
                };

                await emailjs.send(serviceId, templateId, emailParams, publicKey);
            } else {
                console.warn("EmailJS not configured in Settings. Skipping email.");
            }
        } catch (emailError) {
            console.error("Email send failed:", emailError);
            // Non-blocking error
        }

        onClear();
        setIsSuccess(true);
        setGuestEmail('');

    } catch (err: any) {
        console.error(err);
        setError("Error: " + err.message);
    } finally {
        setIsSending(false);
    }
  };

  const closeDrawer = () => {
      onClose();
      setTimeout(() => {
          setIsSuccess(false);
          setError(null);
      }, 300);
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-neutral-900 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out border-l border-neutral-800 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-black/20">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <ShoppingBag className="w-5 h-5" /> {t ? t.cart : 'Корзина'}
            {cart.length > 0 && <span className="bg-red-700 text-white text-xs px-2 py-0.5 rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
        </h2>
        <button onClick={closeDrawer} className="text-neutral-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
        </button>
      </div>

      {/* Success View */}
      {isSuccess ? (
          <div className="flex flex-col items-center justify-center h-[calc(100%-80px)] p-8 text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mb-6 border border-green-900/50">
                  <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {t ? t.order_success_title : "Мы получили ваш заказ!"}
              </h3>
              <p className="text-neutral-400 mb-8 max-w-xs text-sm">
                  {t ? t.order_success_message : "Ссылка на курс отправлена на вашу почту."}
              </p>
              <button onClick={closeDrawer} className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-3 rounded-lg font-medium transition-colors w-full">
                  {t ? t.continue_shopping : "Продолжить покупки"}
              </button>
          </div>
      ) : (
          /* Cart Content */
          <div className="flex flex-col h-[calc(100%-80px)]">
              {cart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-8">
                      <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                      <p>{t ? t.empty_cart : 'Empty'}</p>
                      <button onClick={closeDrawer} className="mt-4 text-red-500 hover:text-red-400 text-sm font-medium">Go to Shop</button>
                  </div>
              ) : (
                  <>
                      {/* Items List */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                          {cart.map(item => (
                              <div key={item.product.id} className="flex gap-4">
                                  <div className="w-20 h-20 bg-black rounded-lg border border-neutral-800 shrink-0 overflow-hidden">
                                      {item.product.images?.[0] ? (
                                          <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center text-neutral-700"><ShoppingBag className="w-6 h-6"/></div>
                                      )}
                                  </div>
                                  <div className="flex-1 flex flex-col justify-between py-1">
                                      <div>
                                          <div className="flex justify-between items-start">
                                              <h4 className="text-white font-medium text-sm line-clamp-2">{_getData(item.product, 'title')}</h4>
                                              <button onClick={() => onRemove(item.product.id)} className="text-neutral-600 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"><Trash2 className="w-4 h-4" /></button>
                                          </div>
                                          <p className="text-xs text-neutral-500 mt-1">{_getData(item.product, 'color')}</p>
                                      </div>
                                      <div className="flex justify-between items-center mt-2">
                                          <div className="font-mono text-white font-bold">${(item.product.price || 0) * item.quantity}</div>
                                          <div className="flex items-center gap-3 bg-neutral-800 rounded-md px-2 py-1">
                                              <button onClick={() => onUpdateQuantity(item.product.id, -1)} className="text-neutral-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                                              <span className="text-xs text-white w-4 text-center">{item.quantity}</span>
                                              <button onClick={() => onUpdateQuantity(item.product.id, 1)} className="text-neutral-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>

                      {/* Footer */}
                      <div className="p-6 bg-neutral-900 border-t border-neutral-800 space-y-4">
                          {error && (
                              <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                  <p className="text-xs text-red-200">{error}</p>
                              </div>
                          )}

                          {/* Guest Email Input */}
                          {!userProfile && (
                              <div className="space-y-1 animate-in fade-in">
                                   <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                                       <Mail className="w-3 h-3" /> {t ? t.guest_email_label : "Ваш Email для отправки заказа"} *
                                   </label>
                                   <input 
                                     type="email" 
                                     value={guestEmail}
                                     onChange={(e) => setGuestEmail(e.target.value)}
                                     placeholder="example@mail.com"
                                     className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-red-600 outline-none"
                                   />
                              </div>
                          )}
                          
                          <div className="space-y-2">
                              <div className="flex justify-between text-neutral-400 text-sm">
                                  <span>Items ({cart.reduce((a,b)=>a+b.quantity,0)})</span>
                                  <span>${totalAmount}</span>
                              </div>
                              <div className="flex justify-between text-white text-xl font-bold pt-2 border-t border-neutral-800">
                                  <span>{t ? t.total : 'Total'}</span>
                                  <span>${totalAmount}</span>
                              </div>
                          </div>
                          
                          <button 
                              onClick={handleCheckout} 
                              disabled={isSending}
                              className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-all"
                          >
                              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t ? t.checkout : 'Checkout'} <ArrowRight className="w-5 h-5" /></>}
                          </button>
                      </div>
                  </>
              )}
          </div>
      )}
    </div>
  );
};

export default CartDrawer;