import { AboutSection } from "@/components/sections/about-section";
import { ContactSection } from "@/components/sections/contact-section";
import { HomeSection } from "@/components/sections/home-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { SplashOverlay } from "@/components/splash-overlay";

export default function Home() {
  return (
    <>
      <SplashOverlay />
      <HomeSection />
      <ProjectsSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
