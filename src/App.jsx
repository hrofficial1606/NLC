import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";
import SectionDivider from "./components/SectionDivider";
import Events from "./components/Events";
import Membership from "./components/Membership";
import Creator from "./components/Creator";
import Feedback from "./components/Feedback";
import Sponsors from "./components/Sponsors";
import Footer from "./components/Footer";
import {
  getEvents,
  getMemberships,
  getSponsors,
  getTestimonials,
} from "./api/placeholders";

export default function App() {
  const [content, setContent] = useState({
    events: [],
    memberships: [],
    testimonials: [],
    sponsors: [],
  });

  useEffect(() => {
    async function loadContent() {
      const [events, memberships, testimonials, sponsors] = await Promise.all([
        getEvents(),
        getMemberships(),
        getTestimonials(),
        getSponsors(),
      ]);

      setContent({ events, memberships, testimonials, sponsors });
    }

    loadContent();
  }, []);

  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <Hero />
        <FeatureCards />
        <SectionDivider />
        <Events event={content.events[0]} />
        <Membership membership={content.memberships[0]} />
        <Creator />
        <Feedback testimonials={content.testimonials} />
        <Sponsors sponsors={content.sponsors} />
      </main>
      <Footer />
    </div>
  );
}
