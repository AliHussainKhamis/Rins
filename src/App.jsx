import About from "./components/About";
import Locations from "./components/Locations";
import Hero from "./components/Hero";
import NavBar from "./components/Navbar";
import Features from "./components/Features";
import Story from "./components/Story";
import Reviews from "./components/Reviews";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Products from "./pages/Products";
import useSmoothScroll from "./utils/useSmoothScroll";

// Minimal path-based routing: /products shows the products page, anything else the home page
const isProductsPage = window.location.pathname.replace(/\/+$/, "") === "/products";

function App() {
  useSmoothScroll();

  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden">
      <NavBar />
      {isProductsPage ? (
        <Products />
      ) : (
        <>
          <Hero />
          <About />
          <Locations />
          <Features />
          <Story />
          <Reviews limit={3} className="bg-navy-900" />
          <Contact />
        </>
      )}
      <Footer />
    </main>
  );
}

export default App;
