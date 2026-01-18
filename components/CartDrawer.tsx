import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { CartItem, UserProfile, Order, OrderItem } from '../types';
import { supabase } from '../supabaseClient';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  userProfile: UserProfile | null;
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemove: (productId: number) => void;
  onClear: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, onClose, cart, userProfile, onUpdateQuantity, onRemove, onClear 
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);

  const handleCheckout = async () => {
    if (!userProfile) {
        setError("Для оформления заказа необходимо авторизоваться.");
        return;
    }

    setIsSending(true);
    setError(null);

    try {
        if (!supabase) throw new Error("Нет соединения с базой данных");

        // 1. Получаем актуальные данные пользователя, чтобы не перезатереть историю при гонке запросов
        const { data: userData, error: fetchError } = await supabase
            .from('user_shibari')
            .select('orders_history, rope_purchases_count, total_revenue_usd')
            .eq('id', userProfile.id)
            .single();

        if (fetchError) throw fetchError;

        // 2. Формируем новый заказ
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
                name: userProfile.full_name,
                email: userProfile.email
            }
        };

        // 3. Обновляем статистику пользователя
        const currentHistory = userData.orders_history || [];
        const historyArray = Array.isArray(currentHistory) ? currentHistory : [];
        
        // Добавляем новый заказ в начало списка
        const updatedHistory = [newOrder, ...historyArray];
        const updatedCount = (userData.rope_purchases_count || 0) + 1;
        const updatedRevenue = (userData.total_revenue_usd || 0) + totalAmount;

        const { error: updateError } = await supabase
            .from('user_shibari')
            .update({
                orders_history: updatedHistory,
                rope_purchases_count: updatedCount,
                total_revenue_usd: updatedRevenue
            })
            .eq('id', userProfile.id);

        if (updateError) throw updateError;

        // 4. Очистка и успех
        onClear();
        setIsSuccess(true);

    } catch (err: any) {
        console.error(err);
        setError("Ошибка при оформлении заказа: " + err.message);
    } finally {
        setIsSending(false);
    }
  };

  const closeDrawer = () => {
      onClose();
      // Reset state after close animation
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
            <ShoppingBag className="w-5 h-5" /> Корзина
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
              <h3 className="text-2xl font-bold text-white mb-2">Заказ оформлен!</h3>
              <p className="text-neutral-400 mb-8 max-w-xs">
                  Мы сохранили ваш заказ в профиле. Менеджер свяжется с вами для уточнения деталей доставки.
              </p>
              <button onClick={closeDrawer} className="bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-3 rounded-lg font-medium transition-colors w-full">
                  Продолжить покупки
              </button>
          </div>
      ) : (
          /* Cart Content */
          <div className="flex flex-col h-[calc(100%-80px)]">
              {cart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-8">
                      <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                      <p>Ваша корзина пуста</p>
                      <button onClick={closeDrawer} className="mt-4 text-red-500 hover:text-red-400 text-sm font-medium">Перейти в магазин</button>
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
                                              <h4 className="text-white font-medium text-sm line-clamp-2">{item.product.title}</h4>
                                              <button onClick={() => onRemove(item.product.id)} className="text-neutral-600 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"><Trash2 className="w-4 h-4" /></button>
                                          </div>
                                          <p className="text-xs text-neutral-500 mt-1">{item.product.color}</p>
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
                          
                          <div className="space-y-2">
                              <div className="flex justify-between text-neutral-400 text-sm">
                                  <span>Товары ({cart.reduce((a,b)=>a+b.quantity,0)})</span>
                                  <span>${totalAmount}</span>
                              </div>
                              <div className="flex justify-between text-white text-xl font-bold pt-2 border-t border-neutral-800">
                                  <span>Итого</span>
                                  <span>${totalAmount}</span>
                              </div>
                          </div>
                          
                          <button 
                              onClick={handleCheckout} 
                              disabled={isSending}
                              className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-all"
                          >
                              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Оформить заказ <ArrowRight className="w-5 h-5" /></>}
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