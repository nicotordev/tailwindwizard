import FeaturedCategories from "@/components/featured-categories";
import HeroSection from "@/components/hero-section";
import HomeCta from "@/components/home-cta";
import HowItWorks from "@/components/how-it-works";
import HomeFooter from "@/components/layout/home-footer";
import HomeHeader from "@/components/layout/home-header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <HomeHeader />
      <div className="flex flex-col">
        <HeroSection />
        <HowItWorks />
        <FeaturedCategories />
        <div className="max-w-7xl mx-auto px-6 mb-32 w-full">
          <HomeCta />
        </div>
      </div>
      <HomeFooter />
    </main>
  );
}
