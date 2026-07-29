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
import EventPage from "./components/EventPage";
import AboutPage from "./components/AboutPage";
import MembershipPage from "./components/MembershipPage";
import RegisterPage from "./components/RegisterPage";
import {
  getCreatorProfile,
  getEvents,
  getMemberships,
  getSponsors,
  getTestimonials,
} from "./api/placeholders";

function getRouteFromLocation() {
  const { pathname, search } = window.location;
  const normalized = pathname.toLowerCase();
  const params = new URLSearchParams(search);

  if (normalized === "/events") {
    return { page: "events", plan: "" };
  }

  if (normalized === "/about-us") {
    return { page: "about", plan: "" };
  }

  if (normalized === "/membership") {
    return { page: "membership", plan: "" };
  }

  if (normalized === "/register") {
    return { page: "register", plan: params.get("plan") ?? "elite" };
  }

  return { page: "home", plan: "" };
}

export default function App() {
  const [content, setContent] = useState({
    events: [],
    memberships: [],
    testimonials: [],
    sponsors: [],
    creator: null,
  });
  const [route, setRoute] = useState(() => getRouteFromLocation());

  useEffect(() => {
    async function loadContent() {
      const [events, memberships, testimonials, sponsors, creator] = await Promise.all([
        getEvents(),
        getMemberships(),
        getTestimonials(),
        getSponsors(),
        getCreatorProfile(),
      ]);

      setContent({ events, memberships, testimonials, sponsors, creator });
    }

    loadContent();
  }, []);

  useEffect(() => {
    function handlePopState() {
      setRoute(getRouteFromLocation());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleNavigate(target, options = {}) {
    let nextPath = "/";

    if (target === "events") {
      nextPath = "/events";
    } else if (target === "about") {
      nextPath = "/about-us";
    } else if (target === "membership") {
      nextPath = "/membership";
    } else if (target === "register") {
      const planQuery = options.plan ? `?plan=${options.plan}` : "";
      nextPath = `/register${planQuery}`;
    }

    window.history.pushState({}, "", nextPath);
    setRoute(getRouteFromLocation());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="page-shell">
      <Navbar currentPage={route.page} onNavigate={handleNavigate} />

      {route.page === "events" ? (
        <>
          <main>
            <EventPage />
          </main>
          <Footer variant="rich" currentPage={route.page} onNavigate={handleNavigate} />
        </>
      ) : null}

      {route.page === "about" ? (
        <>
          <main>
            <AboutPage />
          </main>
          <Footer variant="rich" currentPage={route.page} onNavigate={handleNavigate} />
        </>
      ) : null}

      {route.page === "membership" ? (
        <>
          <main>
            <MembershipPage onNavigate={handleNavigate} />
          </main>
          <Footer variant="rich" currentPage={route.page} onNavigate={handleNavigate} />
        </>
      ) : null}

      {route.page === "register" ? (
        <>
          <main>
            <RegisterPage selectedPlan={route.plan} onNavigate={handleNavigate} />
          </main>
          <Footer variant="rich" currentPage="membership" onNavigate={handleNavigate} />
        </>
      ) : null}

      {route.page === "home" ? (
        <>
          <main>
            <Hero onNavigate={handleNavigate} />
            <FeatureCards />
            <SectionDivider />
            <Events event={content.events[0]} />
            <Membership membership={content.memberships[0]} onNavigate={handleNavigate} />
            <Creator creator={content.creator} />
            <Feedback testimonials={content.testimonials} />
            <Sponsors sponsors={content.sponsors} />
          </main>
          <Footer currentPage={route.page} onNavigate={handleNavigate} />
        </>
      ) : null}
    </div>
  );
}
