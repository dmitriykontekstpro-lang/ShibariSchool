
import React, { useState } from 'react';
import { X, ShoppingBag, Info, ChevronDown, ChevronUp, Image as ImageIcon, Video, ArrowRight, ShoppingCart } from 'lucide-react';
import { Product, CartItem } from '../types';
import VideoPlayer from './VideoPlayer';

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  openCart: () => void;
  lang: 'ru' | 'en';
  t: any;
  getData: (item: any, field: string) => string;
}

const MarketplaceModal: React.FC<MarketplaceModalProps> = ({ 
    isOpen, onClose, products, cart, addToCart, openCart, lang, t, getData
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (!isOpen) return null;

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10 bg-black shrink-0">
         <div className="flex items-center gap-3">
             <button 
                onClick={openCart}
                className="p-2 bg-black rounded-lg border border-red-600 relative hover:bg-red-900/40 transition-colors group"
             >
                <ShoppingBag className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                        {cartCount}
                    </span>
                )}
             </button>
             <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">{t.shop}</h2>
                <p className="text-[10px] md:text-xs text-neutral-400">{t.shop_subtitle}</p>
             </div>
        </div>
        <button 
          onClick={onClose}
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-black border border-white/20 text-white hover:border-red-600 hover:bg-red-600 transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-black">
         <div className="max-w-7xl mx-auto pb-20">
             {products.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                     <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                     <p>Empty.</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                     {products.map(product => (
                         <div 
                            key={product.id} 
                            onClick={() => setSelectedProduct(product)}
                            className="group flex flex-col bg-black border border-white/10 rounded-xl overflow-hidden hover:border-red-600 transition-all duration-300 cursor-pointer"
                         >
                             {/* Image Section - Classic Vertical */}
                             <div className="aspect-[3/4] w-full relative bg-black overflow-hidden border-b border-white/5">
                                 {product.images?.[0] ? (
                                     <img 
                                        src={product.images[0]} 
                                        alt={getData(product, 'title')} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                     />
                                 ) : (
                                     <div className="w-full h-full flex items-center justify-center text-neutral-700 bg-neutral-950">
                                        <ImageIcon className="w-8 h-8"/>
                                     </div>
                                 )}
                                 {/* Quick Add Overlay (Desktop) */}
                                 <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/90 to-transparent hidden md:flex justify-center">
                                     <span className="text-xs text-white font-medium">{t.details}</span>
                                 </div>
                             </div>
                             
                             {/* Content Section */}
                             <div className="p-3 md:p-4 flex flex-col flex-1 gap-2">
                                 <div className="flex-1 min-w-0">
                                    <h3 className="text-xs md:text-sm font-bold text-white leading-tight line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
                                        {getData(product, 'title')}
                                    </h3>
                                    <p className="text-[10px] text-neutral-400 line-clamp-1">
                                        {getData(product, 'description_short')}
                                    </p>
                                 </div>
                                 
                                 <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/10">
                                     {product.price ? (
                                         <span className="text-sm md:text-base font-bold text-white font-mono">
                                             ${product.price}
                                         </span>
                                     ) : (
                                         <span className="text-[10px] text-neutral-600 uppercase font-bold">Info</span>
                                     )}
                                     <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product);
                                        }}
                                        className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-black border border-white/20 hover:bg-red-600 hover:border-red-600 flex items-center justify-center text-white transition-colors z-10"
                                     >
                                         <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
                                     </button>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
         </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
          <ProductDetailOverlay product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={() => addToCart(selectedProduct)} t={t} getData={getData} />
      )}
    </div>
  );
};

const ProductDetailOverlay: React.FC<{ product: Product, onClose: () => void, onAdd: () => void, t: any, getData: any }> = ({ product, onClose, onAdd, t, getData }) => {
    const [activeImage, setActiveImage] = useState(product.images?.[0] || '');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-0 md:p-8 animate-in fade-in duration-200">
            <div className="bg-black w-full h-full md:h-auto md:max-h-[90vh] md:max-w-6xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative border-2 border-red-600">
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black text-white rounded-full hover:bg-red-600 border border-white/20 transition-colors">
                    <X className="w-5 h-5" />
                </button>

                {/* Left: Gallery */}
                <div className="w-full md:w-1/2 bg-black flex flex-col h-[40vh] md:h-auto overflow-y-auto scrollbar-hide border-r border-white/10">
                     <div className="flex-1 min-h-[300px] relative bg-neutral-950 flex items-center justify-center group">
                         {activeImage ? (
                             <img src={activeImage} className="w-full h-full object-contain" alt="" />
                         ) : (
                             <ImageIcon className="w-12 h-12 text-neutral-700" />
                         )}
                     </div>
                     {/* Thumbnails */}
                     {(product.images?.length || 0) > 1 && (
                         <div className="p-4 flex gap-2 overflow-x-auto bg-black border-t border-white/10 shrink-0">
                             {product.images.map((img, idx) => (
                                 <button 
                                    key={idx} 
                                    onClick={() => setActiveImage(img)}
                                    className={`w-16 h-16 shrink-0 rounded-lg border overflow-hidden transition-all ${activeImage === img ? 'border-red-600 opacity-100 ring-1 ring-red-600/50' : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white'}`}
                                 >
                                     <img src={img} className="w-full h-full object-cover" alt="" />
                                 </button>
                             ))}
                         </div>
                     )}
                     {/* Video Section if exists */}
                     {product.video_url && (
                         <div className="p-4 border-t border-white/10 bg-black">
                             <p className="text-xs font-bold text-neutral-500 uppercase mb-2 flex items-center gap-2"><Video className="w-3 h-3"/> Review</p>
                             <div className="rounded-lg overflow-hidden border border-neutral-800">
                                <VideoPlayer url={product.video_url} />
                             </div>
                         </div>
                     )}
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto bg-black h-full">
                    <div className="mb-8">
                        {/* Header Section with Badges */}
                        <div className="flex items-center gap-3 mb-6">
                             {product.color && (
                                 <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-neutral-200 px-3 py-1 rounded border border-white/10">
                                     {getData(product, 'color')}
                                 </span>
                             )}
                             <span className="text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-3 py-1 rounded border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                                 {t.in_stock}
                             </span>
                        </div>
                        
                        {/* Title & Price */}
                        <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3 tracking-tight">{getData(product, 'title')}</h2>
                        {product.price && <div className="text-2xl font-mono font-bold text-red-600 mb-6">${product.price}</div>}
                        
                        {/* Short Description */}
                        <p className="text-neutral-400 text-base leading-relaxed border-l-2 border-neutral-800 pl-4">
                            {getData(product, 'description_short')}
                        </p>
                    </div>

                    <button 
                        onClick={() => { onAdd(); onClose(); }}
                        className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-4 rounded-xl shadow-lg mb-10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-sm tracking-wide uppercase"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        {t.add_to_cart}
                    </button>

                    <div className="space-y-10">
                        <div>
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4">{t.description}</h3>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-neutral-300 text-base leading-8 whitespace-pre-line font-normal opacity-90">
                                    {getData(product, 'description_long') || "No description."}
                                </p>
                            </div>
                        </div>

                        {product.faq && product.faq.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4">{t.faq}</h3>
                                <div className="space-y-3">
                                    {product.faq.map((item, idx) => (
                                        <div key={idx} className="bg-black rounded-lg border border-white/10 overflow-hidden hover:border-white/30 transition-colors">
                                            <button 
                                                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                                className="w-full flex items-center justify-between p-4 text-left group"
                                            >
                                                <span className="text-sm font-bold text-white group-hover:text-red-500 transition-colors">{item.question}</span>
                                                {openFaqIndex === idx ? <ChevronUp className="w-4 h-4 text-red-600"/> : <ChevronDown className="w-4 h-4 text-neutral-500"/>}
                                            </button>
                                            {openFaqIndex === idx && (
                                                <div className="p-5 pt-0 text-sm text-neutral-400 leading-7 border-t border-white/5">
                                                    {item.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MarketplaceModal;
