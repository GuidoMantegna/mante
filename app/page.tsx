import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { HomeSection } from "@/components/home-section";
import { ProjectsSection } from "@/components/projects-section";
import { SplashSection } from "@/components/splash-section";

export default function Home() {
  return (
    <>
      <SplashSection />
      <HomeSection />
      <ProjectsSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
