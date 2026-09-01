import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { HomeSection } from "@/components/home-section";
import { ProjectsSection } from "@/components/projects-section";
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
