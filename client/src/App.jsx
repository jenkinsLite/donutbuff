import React, { useState, useEffect, useRef } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import Header from './components/Header';
import HomeSection from './components/HomeSection';
import MenuSection from './components/MenuSection';
import OrderSection from './components/OrderSection';
import CheckoutFab from './components/CheckoutFab';
import ConfirmationModal from './components/ConfirmationModal';
import Footer from './components/Footer';

function AppInner() {
  const { getCartTotals, clearCart } = useCart();

  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);

  const orderSectionRef = useRef(null);

  const { totalQty } = getCartTotals();

  const showCheckout = () => {
    setCheckoutVisible(true);
    setTimeout(() => {
      orderSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const hideCheckout = () => setCheckoutVisible(false);

  const openModal = (data) => {
    setModalData(data);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalData(null);
    clearCart();
    setCheckoutVisible(false);
    setCurrentCategory('All');
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Header />
      <main id="main-content">
        <HomeSection totalQty={totalQty} />
        <MenuSection
          currentCategory={currentCategory}
          setCurrentCategory={setCurrentCategory}
          onCheckout={showCheckout}
        />
        <OrderSection
          ref={orderSectionRef}
          checkoutVisible={checkoutVisible}
          onShowCheckout={showCheckout}
          onHideCheckout={hideCheckout}
          onOrderSubmitted={openModal}
        />
      </main>
      <Footer />
      <CheckoutFab totalQty={totalQty} onCheckout={showCheckout} />
      {modalVisible && (
        <ConfirmationModal data={modalData} onClose={closeModal} />
      )}
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppInner />
    </CartProvider>
  );
}
