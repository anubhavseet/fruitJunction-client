import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductCategories from '../components/ProductCategories';
import Products from '../components/Products';
import Menu from '../components/Menu';
import Services from '../components/Services';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

export default function HomePage() {
  return (
    <>
      <AnimatedBackground />
      <Header />
      <main>
        <Hero />
        <ProductCategories />
        <Products />
        <Menu />
        <Services />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
